/*
Event shuffle
*/
import { Cookies } from "react-cookie";

export const isUserAuthenticated = (): boolean => {
  let cookies = new Cookies();
  const session = cookies.get("eventShuffle");
  if (session) {
    return true;
  }
  return false;
};

export const removeSession = () => {
  let cookies = new Cookies();
  cookies.remove("eventShuffle", {
    path: "/",
  });
};
