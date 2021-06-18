// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, put, takeEvery, select, call} from 'redux-saga/effects';
import {
    IReceiveMessageFromSocketRoutinePayload,
    IRemoveChatFromSocketRoutinePayload,
    receiveMessageFromSocketRoutine,
    removeChatFromSocketRoutine
} from "./routines";
import {PayloadAction} from "@reduxjs/toolkit";
import {IAppState} from "../../reducers";
import {selectPersonalChatIdRoutine} from "../PersonalChatDetails/routines";
import {selectGroupChatIdRoutine} from "../GroupChatDetails/routines";
import {
    deleteChatInListRoutine,
    selectChatIdRoutine,
    setFirstChatInListRoutine,
    setSeenChatRoutine, updateChatLastMessageRoutine
} from "../ChatsList/routines";
import {toastr} from "react-redux-toastr";
import generalChatService from "../../api/chat/general/generalChatService";
import {appendReadyMessageIfAbsentRoutine} from "../Chat/routines";

function* removeChatFromSocketSaga({payload}: PayloadAction<IRemoveChatFromSocketRoutinePayload>) {
    const {chatId} = payload;
    const selectedPersonalId = yield select((state: IAppState) => state.personalChat.data.selectedId);
    const selectedGroupId = yield select((state: IAppState) => state.groupChat.data.selectedId);
    const selectedChat = yield select((state: IAppState) => state.chatsList.data.selectedChatId);

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

function* receiveMessageFromSocketSaga({payload}: PayloadAction<IReceiveMessageFromSocketRoutinePayload>) {
    try {
        const { loadingId, message } = payload;
        yield put(appendReadyMessageIfAbsentRoutine.fulfill({loadingId, chatId: message.chatId, message}));
        const selectedChatId = yield select((state: IAppState) => state.chatsList.data.selectedChatId);
        const currentUser = yield select((state: IAppState) => state.auth.data.currentUser);
        if (selectedChatId !== message.chatId && message.senderId !== currentUser?.id) {
            toastr.success('New message', 'You have received a new message');
        }
        if (selectedChatId === message.chatId) {
            const seenAt = yield call(generalChatService.readChat, message.chatId);
            yield put(setSeenChatRoutine.fulfill({chatId: payload.message.chatId, seenAt}));
        }
        yield put(setFirstChatInListRoutine.fulfill(message.chatId));
        yield put(updateChatLastMessageRoutine.fulfill({
            chatId: message.chatId,
            lastMessage: { text: message.text, createdAt: message.createdAt }
        }));
        yield put(removeChatFromSocketRoutine.success());
    } catch (e) {
        yield put(removeChatFromSocketRoutine.failure(e?.message));
    }
}

export default function* socketHomeSaga() {
    yield all([
        takeEvery(removeChatFromSocketRoutine.FULFILL, removeChatFromSocketSaga),
        takeEvery(receiveMessageFromSocketRoutine.TRIGGER, receiveMessageFromSocketSaga),
    ]);
}
