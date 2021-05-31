// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { all, call, put, takeEvery } from 'redux-saga/effects';
import {loginRoutine, registerRoutine} from "./routines";
import authService from "../../api/auth/authService";
import {ILoginRequest, IRegisterRequest} from "../../api/auth/authModels";
import {PayloadAction} from "@reduxjs/toolkit";
import {toastr} from "react-redux-toastr";
import {history} from "../../helpers/history.helper";

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

export default function* authPageSaga() {
    yield all([
        yield takeEvery(loginRoutine.TRIGGER, loginSaga),
        yield takeEvery(registerRoutine.TRIGGER, registerSaga)
    ]);
}
