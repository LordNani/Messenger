import React from "react";
import styles from "./PasswordChange.module.sass";
import Button from "../FormComponents/Button/Button";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../FormComponents/Input/Input";
import {IPasswordChange} from "../../api/user/userModels";

interface IOwnProps {
    changePassword: (request: IPasswordChange) => Promise<void>;
}

interface IState {
    loading: boolean;
    error?: string;
}

const validationSchema = Yup.object().shape({
    oldPassword: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(16, 'Too Long! Need to be 4-16 digits.')
        .required('This field is required'),
    newPassword: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(16, 'Too Long! Need to be 4-16 digits.')
        .required('This field is required'),

});

class PasswordChange extends React.Component<IOwnProps, IState> {

    state = {
        loading: false,
    } as IState;

    handleChange = async (values: any) => {
        try {
            this.setState({error: undefined});
            this.setState({loading: true});
            const {oldPassword, newPassword} = values;
            await this.props.changePassword({oldPassword, newPassword});
        } catch (e) {
            this.setState({error: e.message});
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        const {loading, error} = this.state;

        return (
            <div>
                <Formik
                    onSubmit={this.handleChange}
                    initialValues={{
                        oldPassword: '',
                        newPassword: '',
                    }}
                    validationSchema={validationSchema}
                    render={({
                                 errors,
                                 touched,
                                 handleChange,
                                 handleBlur,
                                 values
                             }) => {
                        const valid =
                            !errors.oldPassword &&
                            !errors.newPassword;
                        return (
                            <Form>
                                {error && (
                                    <ErrorMessage text={error} />
                                )}
                                <Input
                                    label="Old password"
                                    value={values.oldPassword}
                                    name="oldPassword"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.oldPassword}
                                    touched={touched.oldPassword}
                                    type="password"
                                />
                                <Input
                                    label="New password"
                                    value={values.newPassword}
                                    name="newPassword"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.newPassword}
                                    touched={touched.newPassword}
                                    type="password"
                                />
                                <div className={styles.buttonWrapper}>
                                    <Button
                                        text="Change"
                                        disabled={!valid}
                                        submit
                                        loading={loading}
                                    />
                                </div>
                            </Form>
                            );
                        }
                    }
                />
            </div>
        );
    }
}

export default PasswordChange;
