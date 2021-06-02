import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    createPersonalChatRoutine,
    loadChatsListRoutine,
    removeChatsListRoutine,
    setAllSeenAtRoutine,
    setChatsListRoutine
} from "./routines";
import {IChatDetails, ILastSeen} from "../../api/chat/general/generalChatModels";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";

export interface IChatsListNewState {
    requests: any;
    data: IChatsListStateData;
}

export interface IChatsListStateData {
    chatsList?: IChatDetails[];
}

const initialStateData: IChatsListStateData = {};

const requests = combineReducers({
    createPersonalChat: reducerCreator([createPersonalChatRoutine.TRIGGER]),
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
    }
});

const chatsListNewReducer = combineReducers({
    requests,
    data
});

export default chatsListNewReducer;
