import React from "react";
import styles from "./ErrorMessage.module.sass";

interface IOwnProps {
    text: string;
}

class ErrorMessage extends React.Component<IOwnProps> {
    render() {
        const {text} = this.props;

        return (
            <div className={styles.wrapper}>
                {text}
            </div>
        );
    }
}

export default ErrorMessage;
