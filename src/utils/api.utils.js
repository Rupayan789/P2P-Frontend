import axios from "axios";
import { BASEURL } from "./baseurl";
export const loginUser = async ({ idToken }) => {
  try {
    const response = await axios.post(
      `${BASEURL}/api/auth/login`,
      {},
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return response.data.data;
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const registerUserService = async ({ idToken , payload }) => {
  try {
    const response = await axios.post(
      `${BASEURL}/api/auth/signup`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return response.data.data;
  }
  catch(error) {
    throw new Error(error.response.data.message);
  }
}


export const fetchAllUsersService = async ({ idToken }) => {
  try {
    const response = await axios.get(
      `${BASEURL}/api/auth/users`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return response.data.data;
  }
  catch(error) {
    throw new Error(error.response.data.message);
  }
}