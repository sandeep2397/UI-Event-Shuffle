import { cloneDeep, isEmpty } from "lodash";

export const callApi = (payload: any): Promise<any> => {
  let { url, options = {} } = payload;

  // //This will allow the server to send and receive cookies,
  // options.credentials = "include";
  url = `${process.env.REACT_APP_BACKEND_URL}${url}`;
  if (
    options.method === "POST" ||
    options.method === "PATCH" ||
    options.method === "PUT"
  ) {
    options.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (options.body && !isEmpty(options.body)) {
      let postBody = cloneDeep(options.body);
      options.input = postBody;
      options.body = JSON.stringify(postBody);
    }
  }

  return fetch(url, options)
    .then((response) => {
      return response.json().then((body) => {
        if (response.ok) {
          return body;
        } else {
          throw body;
        }
      });
    })
    .catch((error: any) => {
      throw error;
    });
};
