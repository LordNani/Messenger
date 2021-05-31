import React from "react";
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from "react-router-dom";
import authService from "../../api/auth/authService";
import styles from "./Auth.module.sass";
import LoginForm from "../../components/LoginForm/LoginForm";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";
import {ILoginRequest, IRegisterRequest} from "../../api/auth/authModels";
import {toastr} from 'react-redux-toastr';
import {ICallback1} from "../../helpers/types.helper";
import {loginRoutine} from "./routines";
import {connect} from "react-redux";
import {IAppState} from "../../reducers";

interface IPropsFromState {
    loginLoading: boolean;
    loginError: string | null;
}

interface IActions {
    login: ICallback1<ILoginRequest>;
}

class Auth extends React.Component<RouteComponentProps & IPropsFromState & IActions> {
    register = async (registerDto: IRegisterRequest) => {
        await authService.register(registerDto);
        this.props.history.push("/auth/login");
        toastr.success('Success!', 'You have successfully registered');
    }

    render() {
        const {login, loginError, loginLoading} = this.props;

        if (authService.isLoggedIn()) {
            return <Redirect to="/home" />;
        }

        return (
            <div className={styles.wrapper}>
                <h1 className={styles.header}>Welcome to Ch@t</h1>
                <div className={styles.authForm}>
                    <Switch>
                        <Route exact path="/auth/login" render={() => (
                            <LoginForm
                                login={login}
                                loginLoading={loginLoading}
                                loginError={loginError}
                            />
                        )} />
                        <Route exact path="/auth/register" render={() =>
                            <RegistrationForm register={this.register}/>} />
                        <Route path="/auth" render={() => <Redirect to="/auth/login" />} />
                    </Switch>
                </div>
            </div>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    loginLoading: state.authPage.requests.login.loading,
    loginError: state.authPage.requests.login.error,
});

const mapDispatchToProps: IActions = {
    login: loginRoutine,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Auth));
