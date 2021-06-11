import React from "react";
import {Link} from "react-router-dom";
import FormWrapper from "../FormComponents/FormWrapper/FormWrapper";
import {IRegisterRequest} from "../../api/auth/authModels";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../FormComponents/Input/Input";
import Button from "../FormComponents/Button/Button";
import styles from "../LoginForm/LoginForm.module.sass";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    register: ICallback1<IRegisterRequest>;
    registerError: string | null;
    registerLoading: boolean;
}

const validationSchema = Yup.object().shape({
    username: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(16, 'Too Long! Need to be 4-16 digits.')
        .required('This field is required'),
    fullName: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(32, 'Too Long! Need to be 4-32 digits.')
        .required('This field is required'),
    password: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(16, 'Too Long! Need to be 4-16 digits.')
        .required('This field is required'),

});

class RegistrationForm extends React.Component<IOwnProps> {

    render() {
        const {registerLoading, registerError, register} = this.props;
        return (
            <div>
                <Formik
                    onSubmit={register}
                    initialValues={{username: '', password: '', fullName: ''}}
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
                                    {registerError && (
                                        <ErrorMessage text={registerError} />
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
                                        label="Full Name"
                                        value={values.fullName}
                                        name="fullName"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.fullName}
                                        touched={touched.fullName}
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
                                        text="Sign up"
                                        loading={registerLoading}
                                        disabled={!valid}
                                        submit
                                    />
                                </FormWrapper>
                            </Form>
                        );
                    }}
                />
                <div className="center">
                    Already registered?
                    <br/>
                    <Link className={styles.link} to="/auth/login">Log in</Link>
                </div>
            </div>
        );
    }
}

export default RegistrationForm;
