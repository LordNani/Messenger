import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    addChatToListIfAbsentRoutine, createGroupChatRoutine,
    createPersonalChatRoutine,
    loadChatsListRoutine,
    removeChatsListRoutine,
    setAllSeenAtRoutine,
    setChatsListRoutine, setCreateChatModalShownRoutine
} from "./routines";
import {IChatDetails, ILastSeen} from "../../api/chat/general/generalChatModels";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";

export interface IChatsListNewState {
    requests: any;
    data: IChatsListStateData;
}

export interface IChatsListStateData {
    chatsList?: IChatDetails[];
    createModalShown?: boolean;
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
    }
});

const chatsListNewReducer = combineReducers({
    requests,
    data
});

export default chatsListNewReducer;
