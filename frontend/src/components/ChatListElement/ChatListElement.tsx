import React from "react";
import styles from "./ChatListElement.module.sass";
import {ChatTypeEnum, IChatDetails} from "../../api/chat/general/generalChatModels";
import classNames from "classnames";
import Icon from "../Icon/Icon";

interface IOwnProps {
    elementData: IChatDetails;
    onClick: () => void;
    selected: boolean;
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
                return elementData.picture;
        }
    }

    render() {
        const {elementData, onClick, selected} = this.props;
        const classes = classNames(styles.wrapper, selected && styles.selected);
        const iconName = this.iconOfChat(elementData);
        const pictureStyle = {
            maxWidth: '60px',
            maxHeight : '60px',
            borderRadius:'50%',
            margin:'5px 20px 5px 0px',
        };
        const wrapperStyle = {
            display: 'flex',
            justifyContent:'start',
            padding:'20px 20px',
        };
        const defaultUserPicture = 
            'https://www.pngkey.com/png/full/282-2820067_taste-testing-at-baskin-robbins-empty-profile-picture.png';
        return (
            <div className={classes} onClick={onClick} style={wrapperStyle}>
                <span>
                    <img src={elementData.picture || defaultUserPicture} style={pictureStyle} />
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
            </div>
        );
    }
}

export default ChatListElement;
