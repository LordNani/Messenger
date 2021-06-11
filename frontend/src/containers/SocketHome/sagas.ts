// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { all, put, takeEvery, select } from 'redux-saga/effects';
import {IRemoveChatFromSocketRoutinePayload, removeChatFromSocketRoutine} from "./routines";
import {PayloadAction} from "@reduxjs/toolkit";
import {IAppState} from "../../reducers";
import {selectPersonalChatIdRoutine} from "../PersonalChatDetails/routines";
import {selectGroupChatIdRoutine} from "../GroupChatDetails/routines";
import {deleteChatInListRoutine, selectChatIdRoutine} from "../ChatsList/routines";

function* removeChatFromSocketSaga({payload}: PayloadAction<IRemoveChatFromSocketRoutinePayload>) {
    const {chatId} = payload;
    const selectedPersonalId = yield select((state: IAppState) => state.personalChat.data.selectedId);
    const selectedGroupId = yield select((state: IAppState) => state.groupChat.data.selectedId);
    const selectedChat = yield select((state: IAppState) => state.chatsListNew.data.selectedChatId);

    if (selectedPersonalId === chatId) {
        yield put(selectPersonalChatIdRoutine.fulfill(undefined));
    }
    if (selectedGroupId === chatId) {
        yield put(selectGroupChatIdRoutine.fulfill(undefined));
    }
    if (selectedChat === chatId) {
        yield put(selectChatIdRoutine.fulfill(undefined));
    }

    yield put(deleteChatInListRoutine.fulfill(chatId));
}

export default function* socketHomeSaga() {
    yield all([
        takeEvery(removeChatFromSocketRoutine.FULFILL, removeChatFromSocketSaga),
    ]);
}
