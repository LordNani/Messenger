// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { all, call, put, takeEvery } from 'redux-saga/effects';
import {editProfileRoutine} from "./routines";
import {PayloadAction} from "@reduxjs/toolkit";
import {toastr} from "react-redux-toastr";
import {IProfileEdit} from "../../api/user/userModels";
import userService from "../../api/user/userService";

function* editProfileSaga({ payload }: PayloadAction<IProfileEdit>) {
    try {
        yield call(userService.editProfile, payload);
        yield put(editProfileRoutine.success(payload));
        toastr.success('Success', 'Profile successfully updated');
    } catch (e) {
        yield put(editProfileRoutine.failure(e?.message));
    }
}

export default function* headerSaga() {
    yield all([
        yield takeEvery(editProfileRoutine.TRIGGER, editProfileSaga)
    ]);
}
