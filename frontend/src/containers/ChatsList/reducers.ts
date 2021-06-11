import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    addChatToListIfAbsentRoutine,
    createGroupChatRoutine,
    createPersonalChatRoutine,
    deleteChatInListRoutine,
    ISetSeenChatRoutinePayload, IUpdateChatLastMessageRoutinePayload,
    loadChatsListRoutine,
    removeChatsListRoutine,
    removeSelectedChatIdRoutine,
    selectChatIdRoutine,
    setAllSeenAtRoutine,
    setChatsListRoutine,
    setCreateChatModalShownRoutine,
    setFirstChatInListRoutine,
    setSeenChatRoutine,
    updateChatInListRoutine, updateChatLastMessageRoutine
} from "./routines";
import {IChatDetails, ILastSeen} from "../../api/chat/general/generalChatModels";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";
import {ILastMessage} from "../../api/message/messageModels";

export interface IChatsListNewState {
    requests: any;
    data: IChatsListStateData;
}

export interface IChatsListStateData {
    chatsList?: IChatDetails[];
    createModalShown?: boolean;
    selectedChatId?: string;
}

const initialStateData: IChatsListStateData = {};

const requests = combineReducers({
    createPersonalChat: reducerCreator([createPersonalChatRoutine.TRIGGER]),
    createGroupChat: reducerCreator([createGroupChatRoutine.TRIGGER]),
    loadChatsList: reducerCreator([loadChatsListRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
    [removeChatsListRoutine.FULFILL]: state => {
        state.chatsList = undefined;
        state.selectedChatId = undefined;
    },
    [setChatsListRoutine.FULFILL]: (state, {payload}: PayloadAction<IChatDetails[]>) => {
        state.chatsList = payload;
    },
    [setAllSeenAtRoutine.FULFILL]: (state, {payload}: PayloadAction<ILastSeen[]>) => {
        state.chatsList = state.chatsList?.map(
            chat => ({
                ...chat,
                seenAt: payload.find(s => s.chatId === chat.id)?.seenAt
            })
        );
    },
    [addChatToListIfAbsentRoutine.FULFILL]: (state, {payload}: PayloadAction<IChatDetails>) => {
        if (!state.chatsList?.find(c => c.id === payload.id)) {
            state.chatsList = [payload, ...(state.chatsList || [])];
        }
    },
    [setCreateChatModalShownRoutine.FULFILL]: (state, {payload}: PayloadAction<boolean>) => {
        state.createModalShown = payload;
    },
    [selectChatIdRoutine.FULFILL]: (state, {payload}: PayloadAction<string>) => {
        state.selectedChatId = payload;
    },
    [removeSelectedChatIdRoutine.FULFILL]: state => {
        state.selectedChatId = undefined;
    },
    [setSeenChatRoutine.FULFILL]: (state, {payload}: PayloadAction<ISetSeenChatRoutinePayload>) => {
        const chat = state.chatsList?.find(c => c.id === payload.chatId);
        if (chat) {
            chat.seenAt = payload.seenAt;
        }
    },
    [updateChatInListRoutine.FULFILL]: (state, {payload}: PayloadAction<IChatDetails>) => {
        state.chatsList = state.chatsList?.map(c => c.id === payload.id
            ? {...payload, seenAt: c.seenAt}
            : c
        );
    },
    [updateChatLastMessageRoutine.FULFILL]: (state, {payload}: PayloadAction<IUpdateChatLastMessageRoutinePayload>) => {
        state.chatsList = state.chatsList?.map(c => c.id === payload.chatId
            ? {...c, seenAt: payload.lastMessage.createdAt, lastMessage: payload.lastMessage}
            : c
        );
    },
    [deleteChatInListRoutine.FULFILL]: (state, {payload}: PayloadAction<string>) => {
        state.chatsList = state.chatsList?.filter(c => c.id !== payload);
        if (state.selectedChatId === payload) {
            state.selectedChatId = undefined;
        }
    },
    [setFirstChatInListRoutine.FULFILL]: (state, {payload}: PayloadAction<string>) => {
        state.chatsList = [
            ...([state.chatsList?.find(c => c.id === payload)] || []),
            ...(state.chatsList?.filter(c => c.id !== payload) || [])
        ] as IChatDetails[];
    }
});

const chatsListNewReducer = combineReducers({
    requests,
    data
});

export default chatsListNewReducer;
