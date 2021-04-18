import React from "react";
import styles from "./CreateGroupChat.module.sass";
import Button from "../FormComponents/Button/Button";
import ErrorMessage from "../FormComponents/ErrorMessage/ErrorMessage";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../FormComponents/Input/Input";

interface IOwnProps {
    createGroupChat: (title: string) => Promise<void>;
}

interface IState {
    loading: boolean;
    error?: string;
}

const validationSchema = Yup.object().shape({
    title: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(32, 'Too Long! Need to be 4-32 digits.')
        .required('This field is required'),

});

class CreateGroupChat extends React.Component<IOwnProps, IState> {

    state = {
        loading: false,
    } as IState;

    handleCreate = async (values: any) => {
        try {
            this.setState({error: undefined});
            this.setState({loading: true});
            await this.props.createGroupChat(values.title);
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
                    onSubmit={this.handleCreate}
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
                                {error && (
                                    <ErrorMessage text={error} />
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

export default CreateGroupChat;
