import React from "react";
import styles from "./CreatePersonalChat.module.sass";
import Button from "../FormComponents/Button/Button";
import UserFinder from "../UserFinder/UserFinder";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    createPersonalChat: ICallback1<string>;
    createPersonalChatLoading: boolean;
    createPersonalChatError: string | null;
}

interface IState {
    userId?: string;
}

class CreatePersonalChat extends React.Component<IOwnProps, IState> {

    state = {} as IState;

    handleCreate = async () => {
        const userId = this.state.userId;
        if (!userId) {
            return;
        }

        this.props.createPersonalChat(userId);
    }

    render() {
        const {userId} = this.state;
        const {createPersonalChatLoading, createPersonalChatError} = this.props;

        return (
            <div>
                {createPersonalChatError && (
                    <ErrorMessage text={createPersonalChatError} />
                )}
                <UserFinder setUserId={userId => this.setState({userId})} />
                <div className={styles.buttonWrapper}>
                    <Button
                        text="Create personal chat"
                        disabled={!userId}
                        onClick={this.handleCreate}
                        loading={createPersonalChatLoading}
                    />
                </div>
            </div>
        );
    }
}

export default CreatePersonalChat;
