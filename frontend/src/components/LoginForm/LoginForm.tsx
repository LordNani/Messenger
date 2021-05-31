import React from "react";
import {Link} from "react-router-dom";
import FormWrapper from "../FormComponents/FormWrapper/FormWrapper";
import Input from "../FormComponents/Input/Input";
import Button from "../FormComponents/Button/Button";
import {ILoginRequest} from "../../api/auth/authModels";
import {Form, Formik} from "formik";
import styles from "./LoginForm.module.sass";
import * as Yup from 'yup';
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    login: ICallback1<ILoginRequest>;
    loginError: string | null;
    loginLoading: boolean;
}

const validationSchema = Yup.object().shape({
    username: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(16, 'Too Long! Need to be 4-16 digits.')
        .required('This field is required'),
    password: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(16, 'Too Long! Need to be 4-16 digits.')
        .required('This field is required'),

});

class LoginForm extends React.Component<IOwnProps> {

    render() {
        const {loginLoading, loginError, login} = this.props;

        return (
            <div>
                <Formik
                    onSubmit={login}
                    initialValues={{username: '', password: ''}}
                    validationSchema={validationSchema}
                    render={({
                                 errors,
                                 touched,
                                 handleChange,
                                 handleBlur,
                                 values
                             }) => {
                        const valid = !errors.username && !errors.password;
                        return (
                            <Form>
                                <FormWrapper>
                                    {loginError && (
                                        <ErrorMessage text={loginError} />
                                    )}
                                    <Input
                                        label="Username"
                                        value={values.username}
                                        name="username"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.username}
                                        touched={touched.username}
                                    />
                                    <Input
                                        label="Password"
                                        value={values.password}
                                        name="password"
                                        type="password"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.password}
                                        touched={touched.password}
                                    />
                                    <Button
                                        text="Log in"
                                        loading={loginLoading}
                                        disabled={!valid}
                                        submit
                                    />
                                </FormWrapper>
                            </Form>
                        );
                    }}
                />
                <div className="center">
                    Not registered yet?
                    <br/>
                    <Link className={styles.link} to="/auth/register">Sign up</Link>
                </div>
            </div>
        );
    }
}

export default LoginForm;
