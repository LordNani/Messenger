import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {loginRoutine, registerRoutine} from "./routines";

export interface IAuthPageState {
    requests: any;
    data: IAuthPageStateData;
}

export interface IAuthPageStateData {}

const requests = combineReducers({
    login: reducerCreator([loginRoutine.TRIGGER]),
    register: reducerCreator([registerRoutine.TRIGGER]),
});

const authPageReducer = combineReducers({
    requests
});

export default authPageReducer;
