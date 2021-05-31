import { all, call, put, takeEvery } from 'redux-saga/effects';
import {loginRoutine} from "./routines";
import authService from "../../api/auth/authService";
import {ILoginRequest} from "../../api/auth/authModels";
import {PayloadAction} from "@reduxjs/toolkit";

function* loginSaga({ payload }: PayloadAction<ILoginRequest>) {
    try {
        yield call(authService.login, payload);
        yield put(loginRoutine.success());
    } catch (e) {
        yield put(loginRoutine.failure(e?.message));
    }
}

export default function* authPageSaga() {
    yield all([
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        yield takeEvery(loginRoutine.TRIGGER, loginSaga)
    ]);
}
