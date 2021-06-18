// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, call, put, takeEvery} from 'redux-saga/effects';
import {
    addChatToListIfAbsentRoutine,
    createGroupChatRoutine,
    createPersonalChatRoutine,
    loadChatsListRoutine,
    removeChatsListRoutine,
    setAllSeenAtRoutine,
    setChatsListRoutine, setCreateChatModalShownRoutine
} from "./routines";
import {toastr} from "react-redux-toastr";
import generalChatService from "../../api/chat/general/generalChatService";
import personalChatService from "../../api/chat/personal/personalChatService";
import {PayloadAction} from "@reduxjs/toolkit";
import groupChatService from "../../api/chat/group/groupChatService";
import {sortChatsList} from "../../helpers/utils.helper";

function* loadChatsListSaga() {
    try {
        yield put(removeChatsListRoutine.fulfill());
        const list = yield call(generalChatService.getChatsList);
        sortChatsList(list);
        yield put(setChatsListRoutine.fulfill(list));
        const seenAtList = yield call(generalChatService.getSeenAt);
        yield put(setAllSeenAtRoutine.fulfill(seenAtList));
        yield put(loadChatsListRoutine.success());
    } catch (e) {
        yield put(loadChatsListRoutine.failure(e?.message));
        toastr.error('Error', 'Unexpected error');
    }
}

function* createPersonalChatSaga({payload}: PayloadAction<string>) {
    try {
        const chat = yield call(personalChatService.create, payload);
        yield put(addChatToListIfAbsentRoutine.fulfill(chat));
        yield put(setCreateChatModalShownRoutine.fulfill(false));
        yield put(createPersonalChatRoutine.success());
    } catch (e) {
        yield put(createPersonalChatRoutine.failure(e?.message));
    }
}

function* createGroupChatSaga({payload}: PayloadAction<string>) {
    try {
        const chat = yield call(groupChatService.create, payload);
        yield put(addChatToListIfAbsentRoutine.fulfill(chat));
        yield put(setCreateChatModalShownRoutine.fulfill(false));
        yield put(createGroupChatRoutine.success());
    } catch (e) {
        yield put(createGroupChatRoutine.failure(e?.message));
    }
}

export default function* chatsListNewSaga() {
    yield all([
        yield takeEvery(loadChatsListRoutine.TRIGGER, loadChatsListSaga),
        yield takeEvery(createPersonalChatRoutine.TRIGGER, createPersonalChatSaga),
        yield takeEvery(createGroupChatRoutine.TRIGGER, createGroupChatSaga)
    ]);
}
