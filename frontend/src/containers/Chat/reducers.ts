import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    appendDetailsCachedRoutine, appendLoadingMessageRoutine, IAppendLoadingMessageRoutinePayload,
    ISetChatMessagesRoutinePayload, ISetMessageLoadedRoutinePayload,
    loadFullChatRoutine,
    setChatMessagesRoutine, setMessageLoadedRoutine
} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";
import {IChatCache} from "../../reducers/chatsList/reducer";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {
    ISetSeenChatRoutinePayload, IUpdateChatLastMessageRoutinePayload, removeChatsListRoutine,
    setSeenChatRoutine,
    updateChatInListRoutine,
    updateChatLastMessageRoutine
} from "../ChatsList/routines";

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
    [removeChatsListRoutine.FULFILL]: state => {
        state.chatsDetailsCached = [];
    },
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
    [updateChatInListRoutine.FULFILL]: (state, {payload}: PayloadAction<IChatDetails>) => {
        state.chatsDetailsCached = state.chatsDetailsCached?.map(c => c.details.id === payload.id
            ? {
                ...c,
                details: {
                    ...payload,
                    seenAt: c.details.seenAt
                }
            }
            : c
        );
    },
    [updateChatLastMessageRoutine.FULFILL]: (state, {payload}: PayloadAction<IUpdateChatLastMessageRoutinePayload>) => {
        state.chatsDetailsCached = state.chatsDetailsCached?.map(c => c.details.id === payload.chatId
            ? {
                ...c,
                details: {
                    ...c.details,
                    seenAt: payload.lastMessage.createdAt,
                    lastMessage: payload.lastMessage
                }
            }
            : c
        );
    },
    [appendLoadingMessageRoutine.FULFILL]: (state, {payload}: PayloadAction<IAppendLoadingMessageRoutinePayload>) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            chat.messages?.push({loading: payload.message});
        }
    },
    [setMessageLoadedRoutine.FULFILL]: (state, {payload}: PayloadAction<ISetMessageLoadedRoutinePayload>) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            const message = chat.messages?.find(m => m.loading?.id === payload.loadingId);
            if (message) {
                message.info = payload.message;
                message.loading = undefined;
            }
        }
    },
});

const chatReducer = combineReducers({
    requests,
    data
});

export default chatReducer;
