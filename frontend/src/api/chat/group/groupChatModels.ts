import {IUserShortDto} from "../../user/userModels";

export enum RoleEnum {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
}

export interface IGroupChatInfo {
    id: string;
    title: string;
    members: IUserShortDto[];
    permissionLevel: RoleEnum;
    picture: string;
}
