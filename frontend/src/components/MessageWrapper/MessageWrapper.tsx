import React from "react";
import styles from "./MessageWrapper.module.sass";
import Message from "../Message/Message";
import {ICurrentUser} from "../../api/auth/authModels";
import classnames from "classnames";
import {IMessageWrapper} from "../../containers/Chat/models";
import Icon from "../Icon/Icon";
import {ICallback1} from "../../helpers/types.helper";
import {OnlineUsersObject} from "../../containers/SocketHome/reducers";

interface IOwnProps {
    message: IMessageWrapper;
    currentUser?: ICurrentUser;
    isVisibleName?: boolean;
    deleteMessage: ICallback1<string>;
    setEditingMessage: ICallback1<IMessageWrapper>;
    onlineUsers: OnlineUsersObject;
}

class MessageWrapper extends React.Component<IOwnProps> {
    render() {
        const {message, currentUser, isVisibleName, deleteMessage, setEditingMessage, onlineUsers} = this.props;
        const inactive = !!message.loading || !!message.deleting || !!message.updating;
        const ownMessage = message.info?.senderId === currentUser?.id || message.loading;
        const online = message.info?.senderId && onlineUsers[message.info.senderId];
        const classes = classnames(
            styles.messageWrapper,
            ownMessage ? styles.messageWrapperRight : styles.messageWrapperLeft
        );

        return (
            <div className={classes}>
                {ownMessage && !inactive && (
                    <div className={styles.iconsWrapper}>
                        <Icon
                            iconName="fas fa-trash"
                            onClick={() => deleteMessage(message.info?.id as string)}
                            className={styles.icon}
                        />
                        <Icon
                            iconName="fas fa-edit"
                            onClick={() => setEditingMessage(message)}
                            className={styles.icon}
                        />
                    </div>
                )}
                <Message
                    message={message}
                    isVisibleName={isVisibleName}
                    ownMessage={!!ownMessage}
                    inactive={inactive}
                    online={online}
                />
            </div>
        );
    }
}

export default MessageWrapper;
