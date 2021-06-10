import {RoleEnum} from "../chat/group/groupChatModels";

export interface IUserShortDto {
    id: string;
    username: string;
    fullName: string;
    bio: string | null;
    picture: string | null;
    permissionLevel: RoleEnum;
}

export interface IProfileEdit {
    fullName: string;
    bio: string | null;
    picture: string | null;
}

export interface IPasswordChange {
    oldPassword: string;
    newPassword: string;
}

export interface IUserSearchDto {
    id: string;
    username: string;
    fullName: string;
    picture: string | null;

}
