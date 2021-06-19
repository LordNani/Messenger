import React from "react";
import styles from "./ChatSender.module.sass";
import Textarea from "../FormComponents/Texarea/Textarea";
import Icon from "../Icon/Icon";
import {ICallback1} from "../../helpers/types.helper";
import {IMessageWrapper} from "../../containers/Chat/models";
import {IMessage} from "../../api/message/messageModels";
import {IEditMessageRoutinePayload} from "../../containers/Chat/routines";
import userService from "../../api/user/userService";

interface IOwnProps {
    sendMessage: ICallback1<string>;
    editingMessage?: IMessageWrapper;
    setEditingMessage: ICallback1<IMessageWrapper | undefined>;
    editMessage: ICallback1<IEditMessageRoutinePayload>;
    chatId: string;
}

interface IState {
    text: string;
    oldText?: string;
    lastTyped?: Date;
}

export const typingInterval = 5 * 1000;

class ChatSender extends React.Component<IOwnProps, IState> {
    state = {
        text: ''
    } as IState;

    componentDidUpdate(
        prevProps: Readonly<IOwnProps>,
        prevState: Readonly<{}>,
        snapshot?: any
    ) {
        const {editingMessage, chatId, setEditingMessage} = this.props;
        if (
            editingMessage?.info &&
            prevProps.editingMessage?.info?.id !== editingMessage.info.id
        ) {
            this.setState(prev => ({
                text: (editingMessage.info as IMessage).text,
                oldText: prev.oldText === undefined ? prev.text : prev.oldText
            }));
        }
        if (
            !editingMessage &&
            prevProps.editingMessage
        ) {
            this.setState(prev => ({
                text: prev.oldText || '',
                oldText: undefined
            }));
        }
        if (
            chatId !== prevProps.chatId
        ) {
            setEditingMessage(undefined);
            this.setState(prev => ({
                text: prev.oldText || '',
                oldText: undefined,
                lastTyped: undefined,
            }));
        }
    }

    isValid = () => {
        const {text} = this.state;
        return !!text.trim();
    }

    handleSend = () => {
        const {text} = this.state;
        this.setState({text: ''});
        const {sendMessage, editMessage, editingMessage} = this.props;
        if (editingMessage?.info) {
            editMessage({
                messageId: editingMessage.info.id,
                newText: text,
                chatId: editingMessage.info.chatId,
            });
        } else {
            sendMessage(text);
        }
    }

    handleCancel = () => {
        this.props.setEditingMessage(undefined);
    }

    handleTextAreaKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.isValid()) {
                this.handleSend();
            }
        }
    };

    handleChange = (e: any) => {
        const {lastTyped} = this.state;
        const {chatId} = this.props;

        let val = e.target.value;
        if (val.length > 1024) {
            val = val.substring(0, 1024);
        }
        this.setState({text: val});

        const now = new Date();
        if (!lastTyped || (now.getTime() - lastTyped.getTime()) > typingInterval) {
            userService.sendTyping(chatId).then();
            this.setState({lastTyped: now});
        }
    }

    render() {
        const {text} = this.state;
        const {editingMessage} = this.props;

        return (
            <div className={styles.wrapper}>
                <div className={styles.textAreaWrapper}>
                    <Textarea
                        value={text}
                        onChange={this.handleChange}
                        name="text"
                        className={styles.textarea}
                        onKeyDown={this.handleTextAreaKeyPress}
                    />
                </div>
                <div className={editingMessage ? styles.editButtonsWrapper : styles.buttonsWrapper}>

                    <Icon iconName={"fas fa-paper-plane fa-2x"}
                          className={this.isValid() ? styles.sendIcon : styles.disabledSend}
                          onClick={this.isValid() ? this.handleSend : undefined}
                    />

                    {editingMessage && (
                        <Icon iconName="fas fa-times fa-2x"
                          className={styles.sendIcon}
                          onClick={this.handleCancel}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default ChatSender;
