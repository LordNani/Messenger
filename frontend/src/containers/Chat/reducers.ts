import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {loadFullChatRoutine} from "./routines";
import {createReducer} from "@reduxjs/toolkit";

export interface IChatState {
    requests: any;
    data: IChatStateData;
}

export interface IChatStateData {
}

const initialStateData: IChatStateData = {};

const requests = combineReducers({
    loadFullChat: reducerCreator([loadFullChatRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
});

const chatReducer = combineReducers({
    requests,
    data
});

export default chatReducer;
