import React from "react";
import styles from "./MessagesListWrapper.module.sass";
import LoaderWrapper from "../LoaderWrapper/LoaderWrapper";
import MessageWrapper from "../MessageWrapper/MessageWrapper";
import {ICurrentUser} from "../../api/auth/authModels";
import {IChatCache} from "../../reducers/chatsList/reducer";
import {ChatTypeEnum} from "../../api/chat/general/generalChatModels";

interface IOwnProps {
    chatInfo?: IChatCache;
    currentUser?: ICurrentUser;
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
        const {chatInfo, currentUser} = this.props;
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
                       />
                    ))}
                    <div className={styles.listBottom} ref={el => this.listBottom = el}/>
                </LoaderWrapper>
            </div>
        );
    }
}

export default MessagesListWrapper;
