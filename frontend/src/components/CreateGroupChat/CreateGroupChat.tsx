import React from "react";
import styles from "./CreateGroupChat.module.sass";
import Button from "../FormComponents/Button/Button";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../FormComponents/Input/Input";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    createGroupChat: ICallback1<string>;
    createGroupChatLoading: boolean;
    createGroupChatError: string | null;
}

const validationSchema = Yup.object().shape({
    title: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(32, 'Too Long! Need to be 4-32 digits.')
        .required('This field is required'),

});

class CreateGroupChat extends React.Component<IOwnProps> {

    render() {
        const {createGroupChatLoading, createGroupChatError, createGroupChat} = this.props;

        return (
            <div>
                <Formik
                    onSubmit={v => createGroupChat(v.title)}
                    initialValues={{title: ''}}
                    validationSchema={validationSchema}
                    render={({
                                 errors,
                                 touched,
                                 handleChange,
                                 handleBlur,
                                 values
                             }) => {
                        const valid = !errors.title;
                        return (
                            <Form>
                                {createGroupChatError && (
                                    <ErrorMessage text={createGroupChatError} />
                                )}
                                <Input
                                    label="Title"
                                    value={values.title}
                                    name="title"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.title}
                                    touched={touched.title}
                                />
                                <div className={styles.buttonWrapper}>
                                    <Button
                                        text="Create group chat"
                                        disabled={!valid}
                                        submit
                                        loading={createGroupChatLoading}
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

export default CreateGroupChat;
