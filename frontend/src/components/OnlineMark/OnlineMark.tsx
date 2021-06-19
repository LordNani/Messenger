import React from "react";
import styles from "./OnlineMark.module.sass";
import Icon from "../Icon/Icon";

class OnlineMark extends React.Component {
    render() {
        return (
            <Icon iconName="fa fa-circle" className={styles.container} />
        );
    }
}

export default OnlineMark;
