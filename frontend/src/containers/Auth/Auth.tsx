import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import authService from "../../api/auth/authService";
import styles from "./Auth.module.sass";
import LoginForm from "../../components/LoginForm/LoginForm";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";
import {ILoginRequest, IRegisterRequest} from "../../api/auth/authModels";
import {ICallback1} from "../../helpers/types.helper";
import {loginRoutine, registerRoutine} from "./routines";
import {connect} from "react-redux";
import {IAppState} from "../../reducers";

interface IPropsFromState {
    loginLoading: boolean;
    loginError: string | null;
    registerLoading: boolean;
    registerError: string | null;
}

interface IActions {
    login: ICallback1<ILoginRequest>;
    register: ICallback1<IRegisterRequest>;
}

class Auth extends React.Component<IPropsFromState & IActions> {

    render() {
        const {login, loginError, loginLoading, register, registerError, registerLoading} = this.props;

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
                        <Route exact path="/auth/register" render={() => (
                            <RegistrationForm
                                register={register}
                                registerLoading={registerLoading}
                                registerError={registerError}
                            />
                        )} />
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
    registerLoading: state.authPage.requests.register.loading,
    registerError: state.authPage.requests.register.error,
});

const mapDispatchToProps: IActions = {
    login: loginRoutine,
    register: registerRoutine,
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
