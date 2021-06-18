// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, call, put, takeEvery, select} from 'redux-saga/effects';
import {PayloadAction} from "@reduxjs/toolkit";
import {
    appendDetailsCachedRoutine,
    appendLoadingMessageRoutine,
    deleteMessageRoutine, editMessageInChatRoutine, editMessageRoutine,
    IEditMessageRoutinePayload,
    IRemoveMessageFromChatRoutinePayload,
    ISendMessageRoutinePayload,
    loadFullChatRoutine,
    removeMessageFromChatRoutine,
    sendMessageRoutine,
    setChatMessagesRoutine,
    setDeletingMessageInChatRoutine, setEditingMessageInChatRoutine, setEditingMessageRoutine,
    setMessageLoadedRoutine
} from "./routines";
import {IAppState} from "../../reducers";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import messageService from "../../api/message/messageService";
import generalChatService from "../../api/chat/general/generalChatService";
import {toastr} from "react-redux-toastr";
import {
    setFirstChatInListRoutine,
    setSeenChatRoutine, sortChatListRoutine,
    updateChatLastMessageAndReadRoutine, updateChatLastMessageRoutine
} from "../ChatsList/routines";
import {v4 as uuid} from "uuid";
import {IDeleteMessageResponse, IMessage, IUpdateMessageResponse} from "../../api/message/messageModels";

function* loadFullChatSaga({payload}: PayloadAction<string>) {
    try {
        const cachedChats = yield select((state: IAppState) => state.chat.data.chatsDetailsCached);
        if (!cachedChats.find(c => c.details.id === payload)) {
            const list: IChatDetails[] = yield select((state: IAppState) => state.chatsList.data.chatsList);
            const details = list.find(c => c.id === payload);
            yield put(appendDetailsCachedRoutine.fulfill(details));
            const messages = yield call(messageService.getMessagesByChatId, payload);
            yield put(setChatMessagesRoutine.fulfill({chatId: payload, messages}));
        }
        const seenAt = yield call(generalChatService.readChat, payload);
        yield put(setSeenChatRoutine.fulfill({chatId: payload, seenAt}));
        yield put(loadFullChatRoutine.success());
    } catch (e) {
        toastr.error("Unexpected error", "Couldn't load chat details");
        yield put(loadFullChatRoutine.failure(e?.message));
    }
}

function* sendMessageSaga({payload}: PayloadAction<ISendMessageRoutinePayload>) {
    try {
        const id = uuid();
        yield put(appendLoadingMessageRoutine.fulfill({
            chatId: payload.chatId,
            message: {id, text: payload.text}
        }));
        const message: IMessage = yield call(messageService.sendMessage, payload.chatId, payload.text, id);
        yield put(setMessageLoadedRoutine.fulfill({
            chatId: payload.chatId,
            loadingId: id,
            message
        }));
        yield put(setFirstChatInListRoutine.fulfill(payload.chatId));
        yield put(updateChatLastMessageAndReadRoutine.fulfill({
            chatId: payload.chatId,
            lastMessage: {text: payload.text, createdAt: message.createdAt}
        }));
        const seenAt = yield call(generalChatService.readChat, payload.chatId);
        yield put(setSeenChatRoutine.fulfill({chatId: payload, seenAt}));
        yield put(sendMessageRoutine.success());
    } catch (e) {
        yield put(sendMessageRoutine.failure(e?.message));
    }
}

function* deleteMessageSaga({payload}: PayloadAction<IRemoveMessageFromChatRoutinePayload>) {
    const {messageId, chatId} = payload;
    try {
        yield put(setDeletingMessageInChatRoutine.fulfill({chatId, messageId, value: true}));
        const response: IDeleteMessageResponse = yield call(messageService.deleteMessage, messageId);
        yield removeMessageByResponse(response);
        yield put(deleteMessageRoutine.success());
    } catch (e) {
        yield put(setDeletingMessageInChatRoutine.fulfill({chatId, messageId, value: false}));
        toastr.error('Error', e?.message);
        yield put(deleteMessageRoutine.failure(e?.message));
    }
}

function* updateMessageSaga({payload}: PayloadAction<IEditMessageRoutinePayload>) {
    const {messageId, chatId, newText} = payload;
    try {
        yield put(setEditingMessageInChatRoutine.fulfill({chatId, messageId, value: true}));
        const response: IUpdateMessageResponse = yield call(messageService.updateMessage, messageId, newText);
        yield put(editMessageInChatRoutine.fulfill(response.message));
        yield put(updateChatLastMessageRoutine.fulfill({
            lastMessage: response.lastMessage, chatId: response.message.chatId
        }));
        yield put(setEditingMessageRoutine.fulfill(undefined));
        yield put(editMessageRoutine.success());
    } catch (e) {
        toastr.error('Error', e?.message);
        yield put(editMessageRoutine.failure(e?.message));
    }
    yield put(setEditingMessageInChatRoutine.fulfill({chatId, messageId, value: false}));
}

export function* removeMessageByResponse(response: IDeleteMessageResponse) {
    const {chatId, messageId} = response;
    yield put(removeMessageFromChatRoutine.fulfill({chatId, messageId}));
    yield put(updateChatLastMessageRoutine.fulfill(response));
    yield put(sortChatListRoutine.fulfill());
}

export default function* chatSaga() {
    yield all([
        takeEvery(loadFullChatRoutine.TRIGGER, loadFullChatSaga),
        takeEvery(sendMessageRoutine.TRIGGER, sendMessageSaga),
        takeEvery(deleteMessageRoutine.TRIGGER, deleteMessageSaga),
        takeEvery(editMessageRoutine.TRIGGER, updateMessageSaga),
    ]);
}
