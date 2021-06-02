import {createRoutine} from "redux-saga-routines";
import {ICurrentUser, ILoginRequest} from "../../api/auth/authModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`AUTH_PAGE:${actionName}`);

export const loginRoutine = createLocalRoutine<ILoginRequest>('LOGIN');
export const registerRoutine = createLocalRoutine<ILoginRequest>('REGISTER');
export const logoutRoutine = createLocalRoutine('LOGOUT');
export const setCurrentUserRoutine = createLocalRoutine<ICurrentUser>('SET_CURRENT_USER');
export const removeCurrentUserRoutine = createLocalRoutine('REMOVE_CURRENT_USER');
