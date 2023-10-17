import { createAction } from "../../utils/reducer.utils";
import { USER_ACTION_TYPES } from "./user.action.types";

export const setCurrentUser = (user) =>
  createAction(USER_ACTION_TYPES.SET_CURRENT_USER, user);

/*
CHECK_USER_SESSION: 'user/CHECK_USER_SESSION',
  GOOGLE_SIGN_IN_START: 'user/GOOGLE_SIGN_IN_START',
  EMAIL_SIGN_IN_START: 'user/EMAIL_SIGN_IN_START',
  SIGN_IN_SUCCESS: 'user/SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE: 'user/SIGN_IN_FAILURE'

*/

export const checkUserSession = () =>
  createAction(USER_ACTION_TYPES.CHECK_USER_SESSION);

export const signInStart = (payload) =>
  createAction(USER_ACTION_TYPES.SIGN_IN_START, payload);

export const signInSuccess = (user) =>
  createAction(USER_ACTION_TYPES.SIGN_IN_SUCCESS, user);

export const signInFailed = (error) =>
  createAction(USER_ACTION_TYPES.SIGN_IN_FAILED, error);

export const signOutStart = () =>
  createAction(USER_ACTION_TYPES.SIGN_OUT_START);

export const fetchAllUsersStart = () => createAction(USER_ACTION_TYPES.FETCH_ALL_ACTIVE_USERS_START);

export const fetchAllUsersSuccess = (payload) => createAction(USER_ACTION_TYPES.FETCH_ALL_ACTIVE_USERS_SUCCESS,payload);

export const fetchAllUsersFailure = (error) => createAction(USER_ACTION_TYPES.FETCH_ALL_ACTIVE_USERS_FAILURE,error);

export const signOutSuccess = () =>
  createAction(USER_ACTION_TYPES.SIGN_OUT_SUCCESS);

export const signOutFailed = (error) =>
  createAction(USER_ACTION_TYPES.SIGN_OUT_FAILED, error);

export const  registerUserStart = (payload) =>
createAction(USER_ACTION_TYPES.REGISTER_USER_START, payload);

export const registerUserSuccess = (user) =>
  createAction(USER_ACTION_TYPES.REGISTER_USER_SUCCESS, user);

export const registerUserFailure = (error) =>
  createAction(USER_ACTION_TYPES.REGISTER_USER_FAILURE, error);
