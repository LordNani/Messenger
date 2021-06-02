import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {changePasswordRoutine, editProfileRoutine} from "./routines";

export interface IHeaderState {
    requests: any;
    data: IHeaderStateData;
}

export interface IHeaderStateData {}

const requests = combineReducers({
    editProfile: reducerCreator([editProfileRoutine.TRIGGER]),
    changePassword: reducerCreator([changePasswordRoutine.TRIGGER]),
});

const headerReducer = combineReducers({
    requests
});

export default headerReducer;
