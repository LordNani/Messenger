// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, call, put, takeEvery, select} from 'redux-saga/effects';
import {PayloadAction} from "@reduxjs/toolkit";
import {appendDetailsCachedRoutine, loadFullChatRoutine, setChatMessagesRoutine} from "./routines";
import {IAppState} from "../../reducers";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import messageService from "../../api/message/messageService";
import generalChatService from "../../api/chat/general/generalChatService";
import {toastr} from "react-redux-toastr";
import {setSeenChatRoutine} from "../ChatsList/routines";

function* loadFullChatSaga({payload}: PayloadAction<string>) {
    try {
        const cachedChats = yield select((state: IAppState) => state.chat.data.chatsDetailsCached);
        if (!cachedChats.find(c => c.details.id === payload)) {
            const list: IChatDetails[] = yield select((state: IAppState) => state.chatsListNew.data.chatsList);
            const details = list.find(c => c.id === payload);
            yield put(appendDetailsCachedRoutine.fulfill(details));
            const messages = yield call(messageService.getMessagesByChatId, payload);
            yield put(setChatMessagesRoutine.fulfill({chatId: payload, messages}));
        }
        const seen = yield call(generalChatService.readChat, payload);
        yield put(setSeenChatRoutine.fulfill({chatId: payload, seen}));
        yield put(loadFullChatRoutine.success());
    } catch (e) {
        toastr.error("Unexpected error", "Couldn't load chat details");
        yield put(loadFullChatRoutine.failure(e?.message));
    }
}

export default function* chatSaga() {
    yield all([
        takeEvery(loadFullChatRoutine.TRIGGER, loadFullChatSaga)
    ]);
}
