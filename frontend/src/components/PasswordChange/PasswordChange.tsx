import React from "react";
import styles from "./PasswordChange.module.sass";
import Button from "../FormComponents/Button/Button";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../FormComponents/Input/Input";
import {IPasswordChange} from "../../api/user/userModels";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    changePassword: ICallback1<IPasswordChange>;
    changePasswordLoading: boolean;
    changePasswordError: string | null;
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

class PasswordChange extends React.Component<IOwnProps> {
    render() {
        const {changePassword, changePasswordError, changePasswordLoading} = this.props;

        return (
            <div>
                <Formik
                    onSubmit={changePassword}
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
                                {changePasswordError && (
                                    <ErrorMessage text={changePasswordError} />
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
                                        loading={changePasswordLoading}
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
