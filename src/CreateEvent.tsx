import { Box, Button, TextField, useTheme } from "@mui/material";
import { FC, useState } from "react";
// import VideoThumbnailGenerator from 'video-thumbnail-generator';
import { DialogActions } from "@mui/material";
import { FaUpload } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
// import firebase from '../../newfirebaseConfig';

import { Chip } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MdHowToVote } from "react-icons/md";
import { useDispatch } from "react-redux";
import CustomDialog from "./components/Dialog/CustomDialog";
import { commonAction } from "./redux/root_actions";
import { useGetUserId } from "./utils/customHooks";

interface Props {
  handlePopupClose: (isConfirm?: any, mode?: any, rowData?: any) => void;
}

const CreateEvent: FC<Props> = (props: Props) => {
  const dispatch = useDispatch();
  const theme: any = useTheme();
  const username = useGetUserId();

  let initState = {
    name: "",
    imageUrl: "",
  };
  const [state, setState] = useState<any>(initState);
  const [selectedDates, setSelectedDates] = useState<any>([]);
  const [currentDate, setCurrentDate] = useState(null);

  const handleAddEvent = () => {
    const selectedDatesOnly = selectedDates?.map((date: any) => {
      const dValue = date?.$d || null;
      const selDateString = new Date(dValue).toISOString().slice(0, 10);
      return selDateString;
    });
    dispatch(
      commonAction({
        data: {
          url: `/api/v1/event/create`,
          options: {
            method: "POST",
            body: {
              event: {
                name: state.name,
                dates: selectedDatesOnly,
                imageUrl: state.imageUrl,
              },
            },
          },
        },
        callback: (resp: any) => {
          props.handlePopupClose(true);
        },
      })
    );
  };

  const footer = () => {
    return (
      <DialogActions style={{ height: "30px" }}>
        <Button
          onClick={() => props.handlePopupClose(false)}
          variant="outlined"
          startIcon={<MdOutlineCancel />}
        >
          {"Cancel"}
        </Button>

        <Button
          variant="contained"
          startIcon={<FaUpload />}
          onClick={() => handleAddEvent()}
          disabled={selectedDates?.length === 0 || state.name === ""}
          style={{
            height: "32px",
            marginRight: "8px",
          }}
        >
          {"Create Event"}
        </Button>
      </DialogActions>
    );
  };

  const handleDateChange = (newDate: any) => {
    const boolVal = selectedDates.some((date: any) => {
      return date?.$d?.toDateString() === newDate?.$d?.toDateString();
    });
    if (newDate && !boolVal) {
      setSelectedDates([...selectedDates, newDate]);
    }
    setCurrentDate(null); // Reset the current date picker value
  };

  const handleDelete = (dateToDelete: any) => () => {
    setSelectedDates(
      selectedDates.filter((date: any) => date !== dateToDelete)
    );
  };

  const body = () => {
    return (
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(2, 1fr)`,
          gap: "20px",
          padding: "20px",
        }}
      >
        <TextField
          id="outlined-desc"
          label="Event Name"
          variant="standard"
          type="text"
          placeholder="Enter Event Name..."
          name="name"
          value={state?.name}
          onChange={(e) => {
            let val = e?.target?.value;
            setState({
              ...state,
              name: val,
            });
          }}
        />
        <TextField
          id="imageUrl"
          label="Image Url"
          variant="standard"
          type="text"
          name="name"
          placeholder="Enter Image Url..."
          value={state?.imageUrl}
          onChange={(e) => {
            let val = e?.target?.value;
            setState({
              ...state,
              imageUrl: val,
            });
          }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Dates"
            value={currentDate}
            onChange={handleDateChange}
          />
          <Box mt={2}>
            {selectedDates.map((date: any, index: number) => (
              <Chip
                key={index}
                label={date?.$d?.toDateString()}
                onDelete={handleDelete(date)}
                style={{ margin: "4px" }}
              />
            ))}
          </Box>
        </LocalizationProvider>
      </Box>
    );
  };
  return (
    <CustomDialog
      icon={MdHowToVote}
      title={"Create Event"}
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
        maxHeight: "355px",
        height: "auto",
      }}
      handleClose={() => props.handlePopupClose(false)}
    />
  );
};
export default CreateEvent;
