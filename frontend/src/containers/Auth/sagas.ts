// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { all, call, put, takeEvery } from 'redux-saga/effects';
import {
    loadCurrentUserRoutine,
    loginRoutine,
    logoutRoutine,
    registerRoutine,
    removeCurrentUserRoutine,
    setCurrentUserRoutine
} from "./routines";
import authService from "../../api/auth/authService";
import {ICurrentUser, ILoginRequest, IRegisterRequest} from "../../api/auth/authModels";
import {PayloadAction} from "@reduxjs/toolkit";
import {toastr} from "react-redux-toastr";
import {history} from "../../helpers/history.helper";

function* loadCurrentUserSaga() {
    try {
        const user: ICurrentUser = yield call(authService.me);
        yield put(setCurrentUserRoutine.fulfill(user));
        yield put(loadCurrentUserRoutine.success());
    } catch (e) {
        yield put(loadCurrentUserRoutine.failure(e?.message));
    }
}

function* loginSaga({ payload }: PayloadAction<ILoginRequest>) {
    try {
        yield call(authService.login, payload);
        yield put(loginRoutine.success());
    } catch (e) {
        yield put(loginRoutine.failure(e?.message));
    }
}

function* registerSaga({ payload }: PayloadAction<IRegisterRequest>) {
    try {
        yield call(authService.register, payload);
        yield put(registerRoutine.success());
        toastr.success('Success', 'You have successfully registered');
        history.push('/auth/login');
    } catch (e) {
        yield put(registerRoutine.failure(e?.message));
    }
}

function* logoutSaga() {
    try {
        yield call(authService.logout);
        yield put(logoutRoutine.success());
        yield put(removeCurrentUserRoutine.fulfill());
        history.push('/auth');
    } catch (e) {
        yield put(logoutRoutine.failure(e?.message));
        toastr.success('Error', 'Unexpected error');
    }
}

export default function* authPageSaga() {
    yield all([
        yield takeEvery(loadCurrentUserRoutine.TRIGGER, loadCurrentUserSaga),
        yield takeEvery(loginRoutine.TRIGGER, loginSaga),
        yield takeEvery(registerRoutine.TRIGGER, registerSaga),
        yield takeEvery(logoutRoutine.TRIGGER, logoutSaga)
    ]);
}
