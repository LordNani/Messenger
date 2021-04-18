import apiClient from "../../apiClient";
import {IChatDetails} from "../general/generalChatModels";
import {IGroupChatInfo} from "./groupChatModels";

const groupChatService = {

    getById: async (chatId: string): Promise<IGroupChatInfo> => {
        const response = await apiClient.get(`/api/chat/group/${chatId}`);
        return response.data.data;
    },

    create: async (chatName: string): Promise<IChatDetails> => {
        const response = await apiClient.post(`/api/chat/group/create`, {chatName});
        return response.data.data;
    },

    changeInfo: async (chatId: string, newChatName: string, picture: string): Promise<void> => {
        // picture = 'https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png';
        const response = await apiClient.post(`/api/chat/group/change-info`, {chatId, newChatName,picture });
        return response.data.data;
    },

    addMember: async (chatId: string, targetUserId: string): Promise<void> => {
        await apiClient.post(`/api/chat/group/users/add`, {chatId, targetUserId});
    },

    upgradeMember: async (chatId: string, targetUserId: string): Promise<void> => {
        await apiClient.post(`/api/chat/group/users/upgrade-to-admin`, {chatId, targetUserId});
    },

    downgradeMember: async (chatId: string, targetUserId: string): Promise<void> => {
        await apiClient.post(`/api/chat/group/users/downgrade-to-member`, {chatId, targetUserId});
    },

    deleteMember: async (chatId: string, targetUserId: string): Promise<void> => {
        await apiClient.post(`/api/chat/group/users/remove`, {chatId, targetUserId});
    },

    deleteById: async (chatId: string): Promise<void> => {
        await apiClient.post(`/api/chat/group/delete`, {chatId});
    },

    leaveChatById: async (chatId: string): Promise<void> => {
        await apiClient.post(`/api/chat/group/leave/${chatId}`);
    },
};

export default groupChatService;
