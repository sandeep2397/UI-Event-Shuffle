import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  OutlinedInput,
  Snackbar,
  TextField,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { MdAttachFile } from "react-icons/md";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { v4 } from "uuid";
// import VideoThumbnailGenerator from 'video-thumbnail-generator';
import { DialogActions } from "@mui/material";
import "firebase/storage";
import {
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  updateMetadata,
  uploadBytesResumable,
} from "firebase/storage";
import { FaEdit, FaUpload } from "react-icons/fa";
import { MdCloudUpload, MdOutlineCancel } from "react-icons/md";
import "../../firebaseConfig";
import { mediaDb } from "../../firebaseConfig";
import CustomDialog from "../Dialog/CustomDialog";
import CountrySelect from "../select/Dropdown";
import StarRating from "../star-rating/StarRating";
// import firebase from '../../newfirebaseConfig';
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import firebase, { FirebaseApp } from "firebase/app";
import { FirebaseStorage } from "firebase/storage";
import { useGetUserId } from "../../utils/customHooks";

declare module "firebase/app" {
  interface FirebaseApp {
    storage?: () => FirebaseStorage;
  }
}

interface Props {
  handlePopupClose: (isConfirm?: any, mode?: any, rowData?: any) => void;
  mode: string;
  rowData?: any;
}

interface State {
  Description?: string;
  ImageId?: string;
  Author?: string;
  Location?: any;
  imageDimension?: any;
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#c3b4b4",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

function CustomDropzone(props: Props) {
  const theme: any = useTheme();
  const userId = useGetUserId();

  const [invalidFileType, setInvalidMediaType] = useState(false);

  const [loading, setLoading]: any = useState(false);
  const cachedEventsData =
    useSelector((state: any) => state.Common.cachedEventsData) || [];

  const dispatch = useDispatch();
  const { mode, rowData } = props;
  const [mediaFile, setMediaFile]: any = useState(null);
  const [uploadedToServer, setMediaUploadToServer]: any = useState(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState<any>(null);
  const [invalidMedia, setInvalidMedia] = useState(false);
  const [mediaDelete, setMediaDelete] = useState(false);
  const [editMedia, setMediaEdit] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(false);
  // setMediaLoading(true)

  const [progress, setProgress] = useState(0);
  // let sizeData = [
  //   { label: 'Small', value: 'S' },
  //   { label: 'Medium', value: 'M' },
  //   { label: 'Large', value: 'L' },
  // ];

  let initState = {
    Description: "",
    ImageId: "",
    Author: "",
    imageDimension: null,
    Location: { code: "IN", label: "India", phone: "91" },
  };

  let initImageUrl = "";

  //useState

  const [state, setState] = useState<State>(initState);
  const [mediaUrl, setMediaUrl]: any = useState(initImageUrl);

  const onDrop = useCallback((acceptedFiles: any) => {
    setInvalidMedia(false);

    setInvalidMediaType(false);
    const formData: any = new FormData();
    const fileUploaded = acceptedFiles?.[0] || {};
    const fileName = fileUploaded?.name;
    formData.append("form-data", fileUploaded, fileName);
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({ onDrop });

  const [rating, setRating] = useState(1);

  const handlePopupClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setMediaUploadToServer(false);
    setInvalidMedia(false);
    setMediaDelete(false);
    setMediaEdit(false);
    setInvalidMediaType(false);
  };

  useEffect(() => {
    if (acceptedFiles && acceptedFiles?.length > 0 && mode !== "edit") {
      let uploadedFiles: any = acceptedFiles || [];
      // setFiles(uploadedFiles);

      let mediaInfo = uploadedFiles?.[0] || null;

      let mediaName = mediaInfo?.name || "";
      let extension = mediaName?.split(".").pop();

      let supportedTypes: any = [
        "png",
        "jpg",
        "svg",
        "jpeg",
        "mp4",
        "avi",
        "mkv",
        "webm",
      ];
      let filePermisible: boolean = supportedTypes?.includes(extension);
      if (filePermisible) {
        const createMediaBlobUrl = URL.createObjectURL(mediaInfo);
        setMediaUrl(createMediaBlobUrl);
        setMediaFile(mediaInfo);
        setInvalidMedia(false);
        setState({
          ...state,
          ImageId: mediaName,
          Author: mediaName,
          imageDimension: mediaName?.size,
        });

        if (mediaInfo?.type?.includes("video")) {
          const video = document.createElement("video");
          video.preload = "metadata";

          video.onloadedmetadata = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbnailDataUrl = canvas.toDataURL("image/jpeg");
              setThumbnailUrl(thumbnailDataUrl);
            }
          };
        }
      } else {
        setInvalidMedia(true);
        setMediaUrl("");
        setInvalidMediaType(true);
        setMediaFile(null);
        toast.error("Invalid File type attached", {
          className: "toast-error",
        });
      }
    }
  }, [acceptedFiles]);

  useEffect(() => {
    if (mode === "edit") {
      setMediaUrl(rowData?.downloadUrl);
      setMediaFile({
        path:
          rowData?.metadata?.customMetadata?.mediaName ||
          rowData?.metadata?.name,
        lastModified: new Date(),
        type: rowData?.metadata?.contentType,
        size: rowData?.metadata?.size,
        name: rowData?.metadata?.name,
        webkitRelativePath: "",
      });
      setInvalidMedia(false);
      setState({
        ...state,
        Description: rowData?.metadata?.customMetadata?.description || "",
        Location: {
          code: rowData?.metadata?.customMetadata?.locationCode,
          label: rowData?.metadata?.customMetadata?.locationName,
          phone: "91",
        },
      });
      setRating(+rowData?.metadata?.customMetadata?.rating);
    }
  }, []);

  // useEffect(() => {
  //   const handleBeforeUnload = (event: any) => {
  //     dispatch(setCachedEventShuffleList([]));
  //   };
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, []); // Empty dependency array ensures the effect runs only once

  const handleUploadClick = async () => {
    let mediaRef = null;
    setLoading(true);
    setMediaLoading(true);

    // if (mediaFile?.type.includes('image')) {
    //   mediaRef = ref(mediaDb, `images/${mediaFile?.name + '_' + v4()}`);
    // } else {
    //   mediaRef = ref(mediaDb, `videos/${mediaFile?.name + '_' + v4()}`);
    // }
    if (props?.mode === "edit") {
      // Edit feature
      try {
        setMediaLoading(true);
        const filesList = await listAll(ref(mediaDb, "mediaFiles"));

        filesList?.items?.forEach(async (fileRef: any) => {
          const downloadUrl = await getDownloadURL(fileRef);
          if (downloadUrl === rowData?.downloadUrl) {
            try {
              // let metadata: any = await getMetadata(mediaFile);
              let metadata = {
                ...rowData,
                customMetadata: {
                  ...rowData?.customMetadata,
                  description: state?.Description,
                  locationName: state?.Location?.label,
                  locationCode: state?.Location?.code,
                  mediaName: mediaFile?.name,
                  rating,
                  // createdBy: userId,
                  modifiedBy: userId,
                },
              };
              try {
                const modifiedMetaData = await updateMetadata(
                  fileRef,
                  metadata
                );
                props?.handlePopupClose(true, "edit", rowData);
              } catch (err) {
                setInvalidMedia(true);
              }
            } catch (err) {
              setInvalidMedia(true);
            }
          }
        });
      } catch (error) {
        setInvalidMedia(true);
        console.error("Error deleting file:", error);
      }
    } else {
      mediaRef = ref(mediaDb, `mediaFiles/${mediaFile?.name + "_" + v4()}`);
      try {
        setUploadProgress(0.5);

        // const uploadTask = await uploadBytes(
        //   mediaRef,
        //   mediaFile,
        //   customMetadata
        // );
        const uploadTask = uploadBytesResumable(mediaRef, mediaFile);
        uploadTask.on(
          "state_changed",
          (snapshot: any) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error: any) => {
            console.error("Upload error " + error);
            // Handle unsuccessful uploads
          },
          async () => {
            const uploadedMediaRef = uploadTask?.snapshot?.ref;
            let metadata: any = await getMetadata(uploadedMediaRef);
            metadata = {
              ...uploadTask?.snapshot?.ref,
              customMetadata: {
                description: state?.Description,
                locationName: state?.Location?.label,
                locationCode: state?.Location?.code,
                mediaName: mediaFile?.name,
                createdBy: userId,
              },
            };
            try {
              await updateMetadata(uploadedMediaRef, metadata);
              setLoading(false);
              setMediaUploadToServer(true);
              props.handlePopupClose(true);
            } catch (error: any) {
              console.error("Upload error " + error);
              setInvalidMedia(true);
            }
          }
        );

        // const uploadedFile = await uploadBytes(mediaRef, mediaFile);
        // let metadata: any = await getMetadata(mediaRef);
        // metadata = {
        //   ...metadata,
        //   customMetadata: {
        //     description: state?.Description,
        //     locationName: state?.Location?.label,
        //     locationCode: state?.Location?.code,
        //     mediaName: mediaFile?.name,
        //     createdBy: userId,
        //   },
        // };

        // Object.assign(metadata.customMetadata, {
        //   description: 'Custom name',
        // });
        // try {
        //   const modifiedMetaData = await updateMetadata(mediaRef, metadata);
        // } catch (err) {
        //   setInvalidMedia(true);
        // }
      } catch (err) {
        setInvalidMedia(true);
      }
    }
    // uploadBytes(mediaRef, mediaFile)
    //   .then(() => {
    //     setLoading(false);
    //     fetchAllMediaApi();
    //   })
    //   .catch((err) => {
    //     setLoading(false);
    //     setMediaUploadToServer(false);
    //   });
  };

  let size = mediaFile?.size ? (mediaFile?.size / (1024 * 1024)).toFixed(2) : 0;

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setMediaUrl(blobUrl);
    }
  };

  const handleRatingChange = (value: any) => {
    setRating(value);
    // You can perform additional actions here, such as submitting the rating to a server
  };

  const footer = () => {
    return (
      <DialogActions style={{ height: "30px" }}>
        {uploadProgress > 0 && (
          <Box
            sx={{
              width: "40%",
              position: "relative",
              top: "6px",
              right: "8rem",
            }}
          >
            <BorderLinearProgress
              variant="determinate"
              value={Math.floor(uploadProgress)}
            />
            <Typography
              style={{ textAlign: "center", lineHeight: 1.5 }}
            >{`Upload In Progress...${Math.floor(
              uploadProgress
            )}%`}</Typography>
          </Box>
        )}
        <Button
          onClick={() => props.handlePopupClose(false)}
          variant="outlined"
          startIcon={<MdOutlineCancel />}
        >
          {"Cancel"}
        </Button>

        <Button
          variant="contained"
          startIcon={props.mode === "edit" ? <FaEdit /> : <FaUpload />}
          onClick={() => handleUploadClick()}
          disabled={mediaFile === null || invalidFileType}
          style={{
            height: "32px",
            marginRight: "8px",
          }}
        >
          {props.mode === "edit" ? "Modify" : "Upload"}
        </Button>
      </DialogActions>
    );
  };

  const body = () => {
    return (
      <>
        {mediaLoading && (
          <div
            style={{
              width: "200px",
              position: "relative",
              top: "150px",
              left: "350px",
              zIndex: 10,
              height: "10px",
            }}
          >
            {" "}
            {/* <CircularProgress color='primary' style={{ zIndex: 5 }} /> */}
            {/* {uploadProgress > 0 && (
              <LinearProgressWithLabel variant='determinate' value={progress} />
            )} */}
          </div>
        )}

        <Box
          style={{
            margin: "0px 16px",
            position: mode === "edit" ? "absolute" : "relative",
            bottom: mode === "edit" ? "135px" : "0px",
            opacity: mediaLoading ? 0.3 : 1,
            pointerEvents: mediaLoading ? "none" : "auto",
          }}
        >
          {/* {mediaLoading ? (
          <CircularProgress />
        ) : ( */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
            }}
          >
            {props?.mode !== "edit" && (
              <div
                style={{ width: "75%" }}
                {...getRootProps({ className: "dropzone" })}
              >
                <input className="input-zone" {...getInputProps()} />

                <OutlinedInput
                  id={"outlined"}
                  type={"text"}
                  value={""}
                  color="primary"
                  style={{
                    height: "65px",
                    fontSize: "12px",
                    width: "100%",
                    border: `solid 1px ${theme?.palette.primary.main}`,
                  }}
                  name="password"
                  onChange={handleFileChange}
                  placeholder={
                    isDragActive
                      ? "Release File"
                      : `Attach or Drag and drop image/video files here*`
                  }
                  endAdornment={
                    <Button
                      onClick={() => {}}
                      variant="contained"
                      type="submit"
                      color={"primary"}
                      startIcon={<MdAttachFile />}
                      style={{ fontSize: "11px", height: "28px" }}
                      // disabled={state?.username === '' || state?.password === ''}
                    >
                      <Typography
                        style={{ fontSize: "12px" }}
                        color={theme?.palette?.primary?.contrastText}
                      >
                        {"Attach"}
                      </Typography>
                    </Button>
                  }
                  label="Choose File"
                />
              </div>
            )}

            {/* {loading && <CircularProgress />} */}

            {/* {renderfiles} */}
          </div>
          {/* )} */}

          <Divider style={{ margin: "6px" }} />
          {/* <Scrollbars
            autoHide={true}
            hideTracksWhenNotNeeded={true}
            autoHeight={true}
            autoHeightMax={'275px'}
            autoHeightMin={'275px'}
          > */}
          <Grid container spacing={2}>
            <Grid item xs={6} md={5}>
              <Typography variant="h6">Additional Meta data : </Typography>
              <div
                className="card-container"
                style={{
                  padding: "0px 8px",
                  gridTemplateColumns: `repeat(2, 1fr)`,
                }}
              >
                <div className="card-item">
                  <TextField
                    id="outlined-desc"
                    label="Description"
                    variant="standard"
                    type="text"
                    name="Description"
                    value={state?.Description}
                    onChange={(e) => {
                      let val = e?.target?.value;
                      setState({
                        ...state,
                        Description: val,
                      });
                    }}
                  />
                </div>
                <div className="card-item">
                  <CountrySelect
                    defaultValue={state?.Location}
                    sendLocationBack={(selectedOption: any) => {
                      setState({
                        ...state,
                        Location: selectedOption,
                      });
                    }}
                  />
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "4px" }}
              >
                <h3>Rate this content:</h3>
                <StarRating
                  defaultValue={rating}
                  onChange={handleRatingChange}
                />
              </div>
            </Grid>
            <Grid item xs={6} md={7}>
              <Typography fontSize={"16px"} fontWeight={"bold"}>
                Preview
              </Typography>
              <div
                style={{
                  borderRadius: "4px",
                  boxShadow:
                    "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
                  maxHeight: "300px",
                  // transition
                  width: "320px!important",
                  maxWidth: "320px!important",
                  display: "flex",
                  flexDirection: "row",
                  gap: "2px",
                  // justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: "0 0 60%", maxWidth: "60%" }}>
                  {" "}
                  {mediaFile?.type.includes("video") ? (
                    <div>
                      <ReactPlayer
                        playing
                        controls
                        volume={0}
                        height="200px"
                        width={"260px"}
                        playsinline
                        pip
                        muted
                        style={{
                          position: "relative",
                          bottom: "10px",
                          padding: "4px",
                          minWidth: "200px",
                        }}
                        loop
                        // muted
                        url={mediaUrl}
                        light={thumbnailUrl}
                        // light={require('../../assets/noImage.png')}
                        // url='https://www.youtube.com/watch?v=5986IgwaVKE&t=667s'
                        // light='https://example.com/thumbnail.jpg'
                      />
                    </div>
                  ) : (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img
                      src={
                        mediaUrl
                          ? mediaUrl
                          : require("../../assets/noImage.png")
                      }
                      height="200px"
                      width={"260px"}
                      alt="Image/video"
                      style={{ padding: "8px" }}
                    />
                  )}
                </div>
                <div
                  style={{
                    flex: "0 0 40%",
                    maxWidth: "40%",
                    padding: "0px 8px",
                  }}
                >
                  {/* <CardContent
                    style={{ display: 'flex', flexDirection: 'column' }}
                  > */}
                  <Typography
                    gutterBottom
                    fontSize={"12px"}
                    color="#434343"
                    component="div"
                    fontWeight={"bold"}
                    style={{
                      display: "block",
                      maxWidth: "180px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {mediaFile?.name}
                  </Typography>
                  <Typography color="text.secondary">{`Size:  ${size} MB`}</Typography>
                  <Typography color="text.secondary">
                    {`Type:  ${mediaFile?.type || ""} `}
                  </Typography>
                  {/* </CardContent> */}
                </div>
              </div>
            </Grid>
          </Grid>
          {/* </Scrollbars> */}
          {invalidFileType && (
            <Snackbar
              open={invalidFileType}
              autoHideDuration={6000}
              onClose={handlePopupClose}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <Alert
                onClose={handlePopupClose}
                variant="filled"
                sx={{ width: "100%" }}
                severity="error"
              >
                {"Invalid File type attached"}
              </Alert>
            </Snackbar>
          )}
        </Box>
      </>
    );
  };

  return (
    <CustomDialog
      icon={MdCloudUpload}
      title={props.mode === "edit" ? "Edit Media Data" : "Create Media Data"}
      body={body()}
      customFooter={footer()}
      style={{
        transform: "translate(0px, -5%)",
        // ...style,
        // minWidth: '1050px',
        width: "1050px",
        height: "495px",
      }}
      bodyStyle={{
        minHeight: "355px",
        maxHeight: "345px",
        height: "auto",
      }}
      handleClose={() => props.handlePopupClose(false)}
    />
  );
}

export default CustomDropzone;
