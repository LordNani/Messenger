import React from "react";
import classnames from "classnames";

interface IOwnProps {
    iconName: string
    className?: string
    onClick?: () => void
}

class Icon extends React.Component<IOwnProps> {
    render() {
        const {iconName, className, onClick} = this.props;

        return (
            <i className={classnames(iconName, className)}
            onClick={onClick} />
        );
    }
}

export default Icon;
