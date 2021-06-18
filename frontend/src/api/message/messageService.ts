import {IDeleteMessageResponse, IMessage, IUpdateMessageResponse} from "./messageModels";
import apiClient from "../apiClient";

const messageService = {

    getMessagesByChatId: async (chatId: string): Promise<IMessage[]> => {
        const response = await apiClient.get(`/api/messages/chat/${chatId}`);
        return response.data.data;
    },

    sendMessage: async (chatId: string, text: string, loadingId: string): Promise<IMessage> => {
        const response = await apiClient.post(`/api/messages/chat`, {chatId, text, loadingId});
        return response.data.data;
    },

    deleteMessage: async (messageId: string): Promise<IDeleteMessageResponse> => {
        const response = await apiClient.post(`/api/messages/delete`, {messageId});
        return response.data.data;
    },

    updateMessage: async (messageId: string, newText: string): Promise<IUpdateMessageResponse> => {
        const response = await apiClient.post(`/api/messages/update`, {messageId, newText});
        return response.data.data;
    },

};

export default messageService;
