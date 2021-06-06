// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, takeEvery, put, call} from 'redux-saga/effects';
import {PayloadAction} from "@reduxjs/toolkit";
import {loadPersonalChatInfoRoutine, setPersonalChatInfoRoutine} from "./routines";
import {toastr} from "react-redux-toastr";
import personalChatService from "../../api/chat/personal/personalChatService";

function* loadPersonalChatInfoSaga({payload}: PayloadAction<string>) {
    try {
        const info = yield call(personalChatService.getById, payload);
        yield put(setPersonalChatInfoRoutine.fulfill(info));
        yield put(loadPersonalChatInfoRoutine.success());
    } catch (e) {
        yield put(loadPersonalChatInfoRoutine.failure(e?.message));
        toastr.error("Unexpected error", "Couldn't load personal chat info");
    }
}

export default function* personalChatSaga() {
    yield all([
        yield takeEvery(loadPersonalChatInfoRoutine.TRIGGER, loadPersonalChatInfoSaga),
    ]);
}
