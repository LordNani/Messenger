import React from "react";
import styles from "./CreatePersonalChat.module.sass";
import Button from "../FormComponents/Button/Button";
import UserFinder from "../UserFinder/UserFinder";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    createPersonalChat: ICallback1<string>;
}

interface IState {
    userId?: string;
    loading: boolean;
    error?: string;
}

class CreatePersonalChat extends React.Component<IOwnProps, IState> {

    state = {
        loading: false,
    } as IState;

    handleCreate = async () => {
        const userId = this.state.userId;
        if (!userId) {
            return;
        }

        try {
            this.setState({error: undefined});
            this.setState({loading: true});
            await this.props.createPersonalChat(userId);
        } catch (e) {
            this.setState({error: e.message});
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        const {userId, loading, error} = this.state;

        return (
            <div>
                {error && (
                    <ErrorMessage text={error} />
                )}
                <UserFinder setUserId={userId => this.setState({userId})} />
                <div className={styles.buttonWrapper}>
                    <Button
                        text="Create personal chat"
                        disabled={!userId}
                        onClick={this.handleCreate}
                        loading={loading}
                    />
                </div>
            </div>
        );
    }
}

export default CreatePersonalChat;
