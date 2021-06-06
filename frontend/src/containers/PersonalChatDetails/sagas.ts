// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, takeEvery, put, call} from 'redux-saga/effects';
import {PayloadAction} from "@reduxjs/toolkit";
import {
    deletePersonalChatRoutine,
    loadPersonalChatInfoRoutine,
    selectPersonalChatIdRoutine,
    setPersonalChatInfoRoutine
} from "./routines";
import {toastr} from "react-redux-toastr";
import personalChatService from "../../api/chat/personal/personalChatService";
import {deleteChatInListRoutine} from "../ChatsList/routines";

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

function* deletePersonalChatSaga({payload}: PayloadAction<string>) {
    try {
        yield call(personalChatService.deleteById, payload);
        yield put(deleteChatInListRoutine.fulfill(payload));
        yield put(selectPersonalChatIdRoutine.fulfill(undefined));
        yield put(deletePersonalChatRoutine.success());
    } catch (e) {
        yield put(deletePersonalChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", "Couldn't delete personal chat");
    }
}

export default function* personalChatSaga() {
    yield all([
        yield takeEvery(loadPersonalChatInfoRoutine.TRIGGER, loadPersonalChatInfoSaga),
        yield takeEvery(deletePersonalChatRoutine.TRIGGER, deletePersonalChatSaga),
    ]);
}
