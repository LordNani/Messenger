import React from "react";
import styles from "./ChatSender.module.sass";
import Textarea from "../FormComponents/Texarea/Textarea";
import Icon from "../Icon/Icon";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    sendMessage: ICallback1<string>;
}

interface IState {
    text: string;
}

class ChatSender extends React.Component<IOwnProps, IState> {
    state = {
        text: ''
    } as IState;

    isValid = () => {
        const {text} = this.state;
        return !!text.trim();
    }

    handleSend = () => {
        const {text} = this.state;
        this.props.sendMessage(text);
        this.setState({text: ''});

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
        let val = e.target.value;
        if (val.length > 1024) {
            val = val.substring(0, 1024);
        }
        this.setState({text: val});
    }

    render() {
        const {text} = this.state;

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
                <div className={styles.buttonsWrapper}>

                    <Icon iconName={"fas fa-paper-plane fa-2x"}
                          className={this.isValid() ? styles.sendIcon : styles.disabledSend}
                          onClick={this.isValid() ? this.handleSend : undefined} />
                </div>
            </div>
        );
    }
}

export default ChatSender;
