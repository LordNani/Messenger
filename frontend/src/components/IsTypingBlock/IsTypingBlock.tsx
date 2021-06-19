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

    render() {
        const {typingUsers, chatId} = this.props;
        const fullNames = typingUsersToList(typingUsers, chatId);

        if (fullNames.length === 0) {
            return null;
        }

        return (
            <div className={styles.container}>
                {fullNames}
                {` ${fullNames.length === 1 ? 'is' : 'are'} typing...`}
            </div>
        );
    }
}

export default IsTypingBlock;
