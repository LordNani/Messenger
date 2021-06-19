import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    fetchInitialOnlineRoutine,
    setInitialOnlineRoutine, switchOfflineRoutine, switchOnlineRoutine,
} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";

export interface ISocketHomeState {
    requests: any;
    data: ISocketHomeStateData;
}

export type OnlineUsersObject = any;
export type TypingUsersObject = any;

export interface ISocketHomeStateData {
    online: OnlineUsersObject;
    typing: TypingUsersObject;
}

const initialStateData: ISocketHomeStateData = {
    online: {},
    typing: {},
};

const requests = combineReducers({
    fetchInitialOnline: reducerCreator([fetchInitialOnlineRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
    [setInitialOnlineRoutine.FULFILL]: (state, {payload}: PayloadAction<string[]>) => {
        for (const user of payload) {
            state.online[user] = true;
        }
    },
    [switchOnlineRoutine.FULFILL]: (state, {payload}: PayloadAction<string>) => {
        state.online[payload] = true;
    },
    [switchOfflineRoutine.FULFILL]: (state, {payload}: PayloadAction<string>) => {
        state.online[payload] = false;
    },
});

const socketHomeReducer = combineReducers({
    requests,
    data
});

export default socketHomeReducer;
