import React from "react";
import styles from "./ChatListElement.module.sass";
import {ChatTypeEnum, IChatDetails} from "../../api/chat/general/generalChatModels";
import classNames from "classnames";
import Icon from "../Icon/Icon";

interface IOwnProps {
    elementData: IChatDetails;
    onClick: () => void;
    selected: boolean;
    online?: boolean;
}

class ChatListElement extends React.Component<IOwnProps> {

    lastMessageMapper = (lastMessage?: string) => {
        if (!lastMessage) {
            return "-";
        }

        const maxMessageLength = 30;
        return lastMessage.length > maxMessageLength
            ? `${lastMessage.substring(0, maxMessageLength - 3)}...`
            : lastMessage;
    }

    isRead = (elementData: IChatDetails): boolean => {
        if (!elementData.lastMessage) {
            return true;
        }
        if (!elementData.seenAt) {
            return false;
        }
        return elementData.seenAt >= elementData.lastMessage.createdAt;
    }

    iconOfChat = (elementData: IChatDetails): string => {
        switch (elementData.type) {
            case ChatTypeEnum.GROUP:
                return "fas fa-users";
            default:
                return "";
        }
    }

    render() {
        const {elementData, onClick, selected, online} = this.props;
        const classes = classNames(styles.wrapper, selected && styles.selected);
        const iconName = this.iconOfChat(elementData);
        const defaultUserPicture =
            'https://www.pngkey.com/png/full/282-2820067_taste-testing-at-baskin-robbins-empty-profile-picture.png';
        return (
            <div className={classes} onClick={onClick} >
                <span>
                    <img src={elementData.picture || defaultUserPicture} className={styles.pictureStyle} />
                </span>

                <div>
                <div className={styles.header}>
                    {iconName && (
                        <Icon
                            iconName={iconName}
                            className={styles.icon}
                        />
                    )}
                    {elementData.title}
                </div>
                <div className={styles.message}>
                    {this.lastMessageMapper(elementData.lastMessage?.text)}
                </div>
                </div>

                {!this.isRead(elementData) && (
                    <div className={styles.unread} />
                )}
                {online && (
                    <div className={styles.online} />
                )}
            </div>
        );
    }
}

export default ChatListElement;
