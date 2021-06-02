import {AuthActions} from "./actions";
import {SET_CURRENT_USER} from "./actionTypes";
import {ICurrentUser} from "../../api/auth/authModels";
import {editProfileRoutine} from "../../containers/Header/routines";
import {PayloadAction} from "@reduxjs/toolkit";

export interface IAuthState {
    currentUser?: ICurrentUser;
}

export const authReducer = (state: IAuthState = {}, action: PayloadAction<any>): IAuthState => {
    switch (action.type) {
        case editProfileRoutine.SUCCESS:
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    ...action.payload
                }
            };
        case SET_CURRENT_USER:
            return {
                ...state,
                currentUser: action.payload,
            };
        default:
            return state;
    }
};

export default authReducer;

