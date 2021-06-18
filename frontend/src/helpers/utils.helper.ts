import {IChatDetails} from "../api/chat/general/generalChatModels";

export const sortChatsList = (list: IChatDetails[]) => {
    list.sort((a, b) => {
        if (!a.lastMessage) {
            return -1;
        }
        if (!b.lastMessage) {
            return 1;
        }
        return b.lastMessage.createdAt - a.lastMessage.createdAt;
    });
};
