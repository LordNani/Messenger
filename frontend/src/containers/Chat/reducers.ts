import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    appendDetailsCachedRoutine,
    ISetChatMessagesRoutinePayload, ISetSeenChatRoutinePayload,
    loadFullChatRoutine,
    setChatMessagesRoutine, setSeenChatRoutine
} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";
import {IChatCache} from "../../reducers/chatsList/reducer";
import {IChatDetails} from "../../api/chat/general/generalChatModels";

export interface IChatState {
    requests: any;
    data: IChatStateData;
}

export interface IChatStateData {
    chatsDetailsCached: IChatCache[];
}

const initialStateData: IChatStateData = {
    chatsDetailsCached: []
};

const requests = combineReducers({
    loadFullChat: reducerCreator([loadFullChatRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
    [appendDetailsCachedRoutine.FULFILL]: (state, {payload}: PayloadAction<IChatDetails>) => {
        state.chatsDetailsCached.push({details: payload});
    },
    [setChatMessagesRoutine.FULFILL]: (state, {payload}: PayloadAction<ISetChatMessagesRoutinePayload>) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            chat.messages = payload.messages.map(m => ({info: m}));
        }
    },
    [setSeenChatRoutine.FULFILL]: (state, {payload}: PayloadAction<ISetSeenChatRoutinePayload>) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            chat.details.seenAt = payload.seen;
        }
    },
});

const chatReducer = combineReducers({
    requests,
    data
});

export default chatReducer;
