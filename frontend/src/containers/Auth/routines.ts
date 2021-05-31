import {createRoutine} from "redux-saga-routines";
import {ILoginRequest} from "../../api/auth/authModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`AUTH_PAGE:${actionName}`);

export const loginRoutine = createLocalRoutine<ILoginRequest>('LOGIN');
