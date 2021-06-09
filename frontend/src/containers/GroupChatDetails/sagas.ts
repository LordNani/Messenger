// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, takeEvery, put, call} from 'redux-saga/effects';
import {PayloadAction} from "@reduxjs/toolkit";
import {
    deleteGroupChatRoutine,
    deletePersonalChatRoutine, leaveGroupChatRoutine, loadGroupChatInfoRoutine,
    loadPersonalChatInfoRoutine, selectGroupChatIdRoutine,
    selectPersonalChatIdRoutine, setGroupChatInfoRoutine,
    setPersonalChatInfoRoutine
} from "./routines";
import {toastr} from "react-redux-toastr";
import personalChatService from "../../api/chat/personal/personalChatService";
import {deleteChatInListRoutine} from "../ChatsList/routines";
import groupChatService from "../../api/chat/group/groupChatService";

function* loadGroupChatInfoSaga({payload}: PayloadAction<string>) {
    try {
        const info = yield call(groupChatService.getById, payload);
        yield put(setGroupChatInfoRoutine.fulfill(info));
        yield put(loadGroupChatInfoRoutine.success());
    } catch (e) {
        yield put(loadGroupChatInfoRoutine.failure(e?.message));
        toastr.error("Unexpected error", "Couldn't load group chat info");
    }
}

function* deleteGroupChatSaga({payload}: PayloadAction<string>) {
    try {
        yield call(groupChatService.deleteById, payload);
        yield put(deleteChatInListRoutine.fulfill(payload));
        yield put(selectGroupChatIdRoutine.fulfill(undefined));
        yield put(deleteGroupChatRoutine.success());
    } catch (e) {
        yield put(deleteGroupChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", "Couldn't delete group chat");
    }
}

function* leaveGroupChatSaga({payload}: PayloadAction<string>) {
    try {
        yield call(groupChatService.leaveChatById, payload);
        yield put(deleteChatInListRoutine.fulfill(payload));
        yield put(selectGroupChatIdRoutine.fulfill(undefined));
        yield put(leaveGroupChatRoutine.success());
    } catch (e) {
        yield put(leaveGroupChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", "Couldn't leave group chat");
    }
}

export default function* groupChatSaga() {
    yield all([
        yield takeEvery(loadGroupChatInfoRoutine.TRIGGER, loadGroupChatInfoSaga),
        yield takeEvery(deleteGroupChatRoutine.TRIGGER, deleteGroupChatSaga),
        yield takeEvery(leaveGroupChatRoutine.TRIGGER, leaveGroupChatSaga),
    ]);
}
