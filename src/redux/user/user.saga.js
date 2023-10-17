import { takeLatest, put, all, call } from "redux-saga/effects";
import { toast } from "react-toastify";
import { USER_ACTION_TYPES } from "./user.action.types";

import {
  signInSuccess,
  signInFailed,
  signOutSuccess,
  signOutFailed,
  registerUserSuccess,
  fetchAllUsersFailure,
  fetchAllUsersSuccess,
} from "./user.action";

// import { fetchCurrentUserScoreService, loginUser, registerUserService } from "../../utils/api/api.utils";
import {
  getCurrentUser,
  getCurrentUserToken,
  signOutUser,
} from "../../utils/firebase.utils";
import {
  createAuthUserWithEmailAndPassword,
  signInAuthUserWithEmailAndPassword,
} from "../../utils/firebase.utils";
import {
  fetchAllUsersService,
  loginUser,
  registerUserService,
} from "../../utils/api.utils";

export function* getUserInfoFromAPI(userAuth) {
  try {
    const idToken = yield call(getCurrentUserToken);
    const userSnapshot = yield call(loginUser, {
      idToken: idToken,
    });
    yield put(signInSuccess({ ...userSnapshot }));
  } catch (error) {
    toast.error(error.message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    yield put(signInFailed(error));
  }
}

export function* registerUser({ payload: { email, password, ...payload } }) {
  try {
    yield call(createAuthUserWithEmailAndPassword, email, password);
    const idToken = yield call(getCurrentUserToken);
    const registeredUser = yield call(registerUserService, {
      idToken,
      payload,
    });
    yield put(registerUserSuccess(registeredUser));
    toast.success("Successfully registered user", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } catch (error) {
    yield put(signInFailed(error));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
}

export function* signInUser({ payload: { email, password } }) {
  try {
    const { user } = yield call(
      signInAuthUserWithEmailAndPassword,
      email,
      password
    );
    yield call(getUserInfoFromAPI, user);
    toast.success("Successfully signed in", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } catch (error) {
    yield put(signInFailed(error));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
}

export function* isUserAuthenticated() {
  try {
    const userAuth = yield call(getCurrentUser);
    if (!userAuth) return;

    yield call(getUserInfoFromAPI, userAuth);
  } catch (error) {
    yield put(signInFailed(error));
  }
}

export function* signOut() {
  try {
    yield call(signOutUser);
    yield put(signOutSuccess());
  } catch (error) {
    yield put(signOutFailed(error));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
}

export function* fetchAllActiveUsers() {
  try {
    const idToken = yield call(getCurrentUserToken);
    const users = yield call(fetchAllUsersService, { idToken });
    yield put(fetchAllUsersSuccess(users));
  } catch (error) {
    yield put(fetchAllUsersFailure(error));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
}
export function* onRegisterUserStart() {
  yield takeLatest(USER_ACTION_TYPES.REGISTER_USER_START, registerUser);
}

export function* onSignInStart() {
  yield takeLatest(USER_ACTION_TYPES.SIGN_IN_START, signInUser);
}

export function* onCheckUserSession() {
  yield takeLatest(USER_ACTION_TYPES.CHECK_USER_SESSION, isUserAuthenticated);
}

export function* onSignOutStart() {
  yield takeLatest(USER_ACTION_TYPES.SIGN_OUT_START, signOut);
}

export function* onfetchAllUsersStart() {
  yield takeLatest(
    USER_ACTION_TYPES.FETCH_ALL_ACTIVE_USERS_START,
    fetchAllActiveUsers
  );
}

export function* userSagas() {
  yield all([
    call(onCheckUserSession),
    call(onSignInStart),
    call(onSignOutStart),
    call(onRegisterUserStart),
    call(onfetchAllUsersStart),
  ]);
}
