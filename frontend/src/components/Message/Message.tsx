import React from "react";
import styles from "./Message.module.sass";
import classnames from "classnames";
import moment from "moment";
import {IMessageWrapper} from "../../containers/Chat/models";

interface IOwnProps {
    message: IMessageWrapper;
    isVisibleName?: boolean;
    ownMessage: boolean;
}

class Message extends React.Component<IOwnProps> {
    render() {
        const {message, isVisibleName, ownMessage} = this.props;
        const classes = classnames(styles.message, message.loading && styles.loading);
        const text = message.info?.text || message.loading?.text;
        const momentCreatedAt = moment(message.info?.createdAt);

        return (
            <div className={classes}>
                {isVisibleName && !ownMessage && (
                    <div className={styles.name}>
                        {message.info?.senderName}
                    </div>
                )}
                <div className={styles.content}>
                    <div className={styles.text}>
                        {text}
                    </div>
                    <div className={styles.datetime}>
                        {momentCreatedAt.format("DD MMM HH:mm")}
                    </div>
                </div>
            </div>
        );
    }
}

export default Message;
