import React from "react";
import styles from "./ProfileEdit.module.sass";
import Button from "../FormComponents/Button/Button";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../FormComponents/Input/Input";
import {IProfileEdit} from "../../api/user/userModels";
import {ICurrentUser} from "../../api/auth/authModels";

interface IOwnProps {
    editProfile: (request: IProfileEdit) => Promise<void>;
    currentUser: ICurrentUser;
}

interface IState {
    loading: boolean;
    error?: string;
}

const validationSchema = Yup.object().shape({
    fullName: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(32, 'Too Long! Need to be 4-32 digits.')
        .required('This field is required'),
    bio: Yup.string()
        .max(100, 'Too Long! Need to be 4-16 digits.'),

});

class ProfileEdit extends React.Component<IOwnProps, IState> {

    state = {
        loading: false,
    } as IState;

    handleEdit = async (values: any) => {
        try {
            this.setState({error: undefined});
            this.setState({loading: true});
            const {fullName, bio} = values;
            await this.props.editProfile({fullName, bio});
        } catch (e) {
            this.setState({error: e.message});
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        const {loading, error} = this.state;
        const {currentUser} = this.props;

        return (
            <div>
                <Formik
                    onSubmit={this.handleEdit}
                    initialValues={{
                        fullName: currentUser.fullName,
                        bio: currentUser.bio || '',
                    }}
                    validationSchema={validationSchema}
                    render={({
                                 errors,
                                 touched,
                                 handleChange,
                                 handleBlur,
                                 values
                             }) => {
                        const valid = !errors.fullName && !errors.bio;
                        return (
                            <Form>
                                {error && (
                                    <ErrorMessage text={error} />
                                )}
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
                                    label="Bio"
                                    value={values.bio}
                                    name="bio"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.bio}
                                    touched={touched.bio}
                                />
                                <div className={styles.buttonWrapper}>
                                    <Button
                                        text="Update"
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

export default ProfileEdit;
