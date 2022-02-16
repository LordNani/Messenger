import React from "react";
import styles from "./IsTypingBlock.module.sass";
import {TypingUsersObject, typingUsersToList} from "../../containers/SocketHome/reducers";
import {TYPING_RERENDER_INTERVAL} from "../../containers/SocketHome/config";

interface IOwnProps {
    typingUsers: TypingUsersObject;
    chatId: string;
}

class IsTypingBlock extends React.Component<IOwnProps> {
    interval: any = undefined;

    componentDidMount() {
        this.interval = setInterval(() => this.setState({ time: Date.now() }), TYPING_RERENDER_INTERVAL);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getMessage = (fullNames: string[]): string => {
        const numberTyping = fullNames.length;
        if (numberTyping === 0) {
            return '';
        }
        if (numberTyping === 1) {
            return `${fullNames[0]} is typing...`;
        }
        if (numberTyping === 2) {
            return `${fullNames.join(" and ")} are typing...`;
        }
        return `${numberTyping} users are typing...`;
    }

    render() {
        const {typingUsers, chatId} = this.props;
        const fullNames = typingUsersToList(typingUsers, chatId);

        const message = this.getMessage(fullNames);

        if (!message) {
            return null;
        }

        return (
            <div className={styles.container}>
                {message}
            </div>
        );
    }
}

export default IsTypingBlock;
