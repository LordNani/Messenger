import {RoleEnum} from "../chat/group/groupChatModels";

export interface IUserShortDto {
    id: string;
    username: string;
    fullName: string;
    bio: string;
    picture: string;
    permissionLevel: RoleEnum;
}

export interface IProfileEdit {
    fullName: string;
    bio: string;
    picture: string;
}

export interface IPasswordChange {
    oldPassword: string;
    newPassword: string;
}

export interface IUserSearchDto {
    id: string;
    username: string;
    fullName: string;
    picture: string;

}
