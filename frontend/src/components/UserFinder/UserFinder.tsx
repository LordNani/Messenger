import React from "react";
import Input from "../FormComponents/Input/Input";
import userService from "../../api/user/userService";

interface IOwnProps {
    setUserId: (id?: string) => void;
}

interface IState {
    text: string;
    done: boolean;
}

class UserFinder extends React.Component<IOwnProps, IState> {

    state = {
        text: '',
        done: false,
    } as IState;

    handleChange = async (input: string) => {
        this.setState({text: input});

        try {
            const user = await userService.search(input);
            this.props.setUserId(user.id);
            this.setState({done: true});
        } catch (e) {
            this.props.setUserId(undefined);
            this.setState({done: false});
        }
    };

    render() {
        const {text} = this.state;

        return (
            <div>
                <Input
                    value={text}
                    onChange={(e: any) => this.handleChange(e.target.value)}
                    label="Username"
                />
            </div>
        );
    }
}

export default UserFinder;
