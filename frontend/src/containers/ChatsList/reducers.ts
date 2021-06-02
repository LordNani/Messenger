import { combineReducers } from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {createPersonalChatRoutine} from "./routines";

export interface IChatsListNewState {
    requests: any;
    data: IChatsListStateData;
}

export interface IChatsListStateData {}

const requests = combineReducers({
    createPersonalChat: reducerCreator([createPersonalChatRoutine.TRIGGER]),
});

const chatsListNewReducer = combineReducers({
    requests
});

export default chatsListNewReducer;
