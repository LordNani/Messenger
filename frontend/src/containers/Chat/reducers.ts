import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    appendDetailsCachedRoutine,
    appendLoadingMessageRoutine,
    appendReadyMessageIfAbsentRoutine,
    changeMessagesUsernameRoutine, editMessageInChatRoutine,
    IAppendLoadingMessageRoutinePayload,
    IChangeMessagesUsernameRoutinePayload,
    IChatMessageBooleanValueRoutinePayload, IEditMessageRoutinePayload,
    IRemoveMessageFromChatRoutinePayload,
    ISetChatMessagesRoutinePayload,
    ISetMessageLoadedRoutinePayload,
    loadFullChatRoutine,
    removeMessageFromChatRoutine,
    setChatMessagesRoutine,
    setDeletingMessageInChatRoutine, setEditingMessageInChatRoutine, setEditingMessageRoutine,
    setMessageLoadedRoutine
} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {
    ISetSeenChatRoutinePayload, IUpdateChatLastMessageRoutinePayload, removeChatsListRoutine,
    setSeenChatRoutine,
    updateChatInListRoutine,
    updateChatLastMessageAndReadRoutine, updateChatLastMessageRoutine
} from "../ChatsList/routines";
import {IChatCache, IMessageWrapper} from "./models";
import {IMessage} from "../../api/message/messageModels";

export interface IChatState {
    requests: any;
    data: IChatStateData;
}

export interface IChatStateData {
    chatsDetailsCached: IChatCache[];
    editingMessage?: IMessageWrapper;
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
        if (chat && (!chat.details.seenAt || chat.details.seenAt < payload.seenAt)) {
            chat.details.seenAt = payload.seenAt;
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
    [updateChatLastMessageAndReadRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IUpdateChatLastMessageRoutinePayload>
    ) => {
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
    [updateChatLastMessageRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IUpdateChatLastMessageRoutinePayload>
    ) => {
        state.chatsDetailsCached = state.chatsDetailsCached?.map(c => c.details.id === payload.chatId
            ? {
                ...c,
                details: {
                    ...c.details,
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
    [changeMessagesUsernameRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IChangeMessagesUsernameRoutinePayload>
    ) => {
        for (const chat of state.chatsDetailsCached) {
            if (chat.messages) {
                for (const message of chat.messages) {
                    if (message?.info?.senderId === payload.userId) {
                        message.info.senderName = payload.newUsername;
                    }
                }
            }
        }
    },
    [appendReadyMessageIfAbsentRoutine.FULFILL]: (
        state, {payload}: PayloadAction<ISetMessageLoadedRoutinePayload>
    ) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            const present = chat.messages?.find(
                mw => mw.info?.id === payload.message.id ||
                mw.loading?.id === payload.loadingId
            );
            if (!present) {
                chat.messages?.push({info: payload.message});
            }
        }
    },
    [removeMessageFromChatRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IRemoveMessageFromChatRoutinePayload>
    ) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            chat.messages = chat.messages?.filter(m => m.info?.id !== payload.messageId);
        }
    },
    [setDeletingMessageInChatRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IChatMessageBooleanValueRoutinePayload>
    ) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            chat.messages = chat.messages?.map(m => m.info?.id === payload.messageId
                ? {...m, deleting: payload.value}
                : m
            );
        }
    },
    [setEditingMessageRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IMessageWrapper | undefined>
    ) => {
        state.editingMessage = payload;
    },
    [editMessageInChatRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IMessage>
    ) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            chat.messages = chat.messages?.map(m => m.info?.id === payload.id
                ? {...m, info: payload}
                : m
            );
        }
    },
    [setEditingMessageInChatRoutine.FULFILL]: (
        state, {payload}: PayloadAction<IChatMessageBooleanValueRoutinePayload>
    ) => {
        const chat = state.chatsDetailsCached.find(c => c.details.id === payload.chatId);
        if (chat) {
            chat.messages = chat.messages?.map(m => m.info?.id === payload.messageId
                ? {...m, updating: payload.value}
                : m
            );
        }
    },
});

const chatReducer = combineReducers({
    requests,
    data
});

export default chatReducer;
