import React from "react";
import styles from "./ProfileEdit.module.sass";
import Button from "../FormComponents/Button/Button";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../FormComponents/Input/Input";
import {IProfileEdit} from "../../api/user/userModels";
import {ICurrentUser} from "../../api/auth/authModels";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    editProfile: ICallback1<IProfileEdit>;
    currentUser: ICurrentUser;
    editProfileLoading: boolean;
    editProfileError: string | null;
}

const validationSchema = Yup.object().shape({
    fullName: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(32, 'Too Long! Need to be 4-32 digits.')
        .required('This field is required'),
    bio: Yup.string()
        .max(100, 'Too Long! Need to be 4-16 digits.'),
    picture: Yup.string()
        .max(256, 'Too Long! Need to be less than 256 characters.'),
});

class ProfileEdit extends React.Component<IOwnProps> {
    render() {
        const {currentUser, editProfileLoading, editProfileError, editProfile} = this.props;

        return (
            <div>
                <Formik
                    onSubmit={editProfile}
                    initialValues={{
                        fullName: currentUser.fullName,
                        bio: currentUser.bio || '',
                        picture: currentUser.picture || '',
                    }}
                    validationSchema={validationSchema}
                    render={({
                                 errors,
                                 touched,
                                 handleChange,
                                 handleBlur,
                                 values
                             }) => {
                        const valid = !errors.fullName && !errors.bio && !errors.picture;
                        return (
                            <Form>
                                <div className={styles.wrapperPicture}>
                                    <img className={styles.pictureStyle} src={values.picture} />
                                </div>
                                {editProfileError && (
                                    <ErrorMessage text={editProfileError} />
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
                                <Input
                                    label="Profile picture"
                                    value={values.picture}
                                    name="picture"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.picture}
                                    touched={touched.picture}
                                />
                                <div className={styles.buttonWrapper}>
                                    <Button
                                        text="Update"
                                        disabled={!valid}
                                        submit
                                        loading={editProfileLoading}
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
