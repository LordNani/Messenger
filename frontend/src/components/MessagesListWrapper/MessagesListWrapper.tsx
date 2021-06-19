import React from "react";
import styles from "./MessagesListWrapper.module.sass";
import LoaderWrapper from "../LoaderWrapper/LoaderWrapper";
import MessageWrapper from "../MessageWrapper/MessageWrapper";
import {ICurrentUser} from "../../api/auth/authModels";
import {ChatTypeEnum} from "../../api/chat/general/generalChatModels";
import {IChatCache, IMessageWrapper} from "../../containers/Chat/models";
import {ICallback1} from "../../helpers/types.helper";
import {IRemoveMessageFromChatRoutinePayload} from "../../containers/Chat/routines";
import {OnlineUsersObject} from "../../containers/SocketHome/reducers";

interface IOwnProps {
    chatInfo?: IChatCache;
    currentUser?: ICurrentUser;
    deleteMessage: ICallback1<IRemoveMessageFromChatRoutinePayload>;
    setEditingMessage: ICallback1<IMessageWrapper>;
    onlineUsers: OnlineUsersObject;
}

class MessagesListWrapper extends React.Component<IOwnProps> {
    componentDidUpdate(prevProps: Readonly<IOwnProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.listBottom) {
            this.scrollToBottom();
        }
    }

    scrollToBottom = () => {
        this.listBottom.scrollIntoView({ behavior: "auto" });
    }

    listBottom = null as any;

    render() {
        const {chatInfo, currentUser, deleteMessage, setEditingMessage, onlineUsers} = this.props;
        const messages = chatInfo?.messages;
        const isVisibleName = chatInfo?.details.type !== ChatTypeEnum.PERSONAL;

        return (
            <div className={styles.wrapper}>
                <LoaderWrapper loading={!messages}>
                    {messages?.map((message, i) => (
                       <MessageWrapper
                           key={i}
                           message={message}
                           currentUser={currentUser}
                           isVisibleName={isVisibleName}
                           deleteMessage={messageId => deleteMessage({
                               messageId,
                               chatId: chatInfo?.details?.id as string
                           })}
                           setEditingMessage={setEditingMessage}
                           onlineUsers={onlineUsers}
                       />
                    ))}
                    <div className={styles.listBottom} ref={el => this.listBottom = el}/>
                </LoaderWrapper>
            </div>
        );
    }
}

export default MessagesListWrapper;
