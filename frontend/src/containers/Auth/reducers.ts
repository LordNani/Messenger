import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    loadCurrentUserRoutine,
    loginRoutine,
    logoutRoutine,
    registerRoutine,
    removeCurrentUserRoutine,
    setCurrentUserRoutine
} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";
import {ICurrentUser} from "../../api/auth/authModels";
import {editProfileRoutine} from "../Header/routines";

export interface IAuthState {
    requests: any;
    data: IAuthPageStateData;
}

export interface IAuthPageStateData {
    currentUser?: ICurrentUser;
}

const initialStateData: IAuthPageStateData = {};

const requests = combineReducers({
    load: reducerCreator([loadCurrentUserRoutine.TRIGGER]),
    login: reducerCreator([loginRoutine.TRIGGER]),
    register: reducerCreator([registerRoutine.TRIGGER]),
    logout: reducerCreator([logoutRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
    [setCurrentUserRoutine.FULFILL]: (state, {payload}: PayloadAction<ICurrentUser>) => {
        state.currentUser = payload;
    },
    [removeCurrentUserRoutine.FULFILL]: state => {
        state.currentUser = undefined;
    },
    [editProfileRoutine.SUCCESS]: (state, {payload}: PayloadAction<any>) => {
        state.currentUser = {
            ...state.currentUser,
            ...payload
        };
    },
});

const authPageReducer = combineReducers({
    requests,
    data
});

export default authPageReducer;
