import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    fetchInitialOnlineRoutine,
    setInitialOnlineRoutine,
} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";

export interface ISocketHomeState {
    requests: any;
    data: ISocketHomeStateData;
}

export interface ISocketHomeStateData {
    users: any;
}

const initialStateData: ISocketHomeStateData = {
    users: {},
};

const requests = combineReducers({
    fetchInitialOnline: reducerCreator([fetchInitialOnlineRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
    [setInitialOnlineRoutine.FULFILL]: (state, {payload}: PayloadAction<string[]>) => {
        for (const user of payload) {
            state.users[user] = true;
        }
    },
});

const socketHomeReducer = combineReducers({
    requests,
    data
});

export default socketHomeReducer;
