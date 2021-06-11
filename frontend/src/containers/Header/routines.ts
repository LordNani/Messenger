import {createRoutine} from "redux-saga-routines";
import {IPasswordChange, IProfileEdit} from "../../api/user/userModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`HEADER:${actionName}`);

export const editProfileRoutine = createLocalRoutine<IProfileEdit>('EDIT_PROFILE');
export const changePasswordRoutine = createLocalRoutine<IPasswordChange>('CHANGE_PASSWORD');
