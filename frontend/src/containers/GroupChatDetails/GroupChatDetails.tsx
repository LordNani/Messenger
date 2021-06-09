import React from "react";
import styles from "./GroupChatDetails.module.sass";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import Button from "../../components/FormComponents/Button/Button";
import {IGroupChatInfo, RoleEnum} from "../../api/chat/group/groupChatModels";
import groupChatService from "../../api/chat/group/groupChatService";
import UserManager from "../../components/UserManager/UserManager";
import UserFinder from "../../components/UserFinder/UserFinder";
import ErrorMessage from "../../components/FormComponents/ErrorMessage/ErrorMessage";
import {IUserShortDto} from "../../api/user/userModels";
import {Form, Formik} from "formik";
import Input from "../../components/FormComponents/Input/Input";
import * as Yup from "yup";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";
import {ICallback1} from "../../helpers/types.helper";
import {
    addMemberToGroupChatRoutine,
    deleteGroupChatRoutine,
    deleteMemberToGroupChatRoutine,
    IMemberToGroupChatRoutinePayload,
    IToggleMemberRoleGroupChatRoutinePayload,
    leaveGroupChatRoutine,
    loadGroupChatInfoRoutine,
    selectGroupChatIdRoutine, toggleMemberRoleGroupChatRoutine
} from "./routines";
import Modal from "../../components/Modal/Modal";

interface IPropsFromState {
    selectedId?: string;
    info?: IGroupChatInfo;
    loadInfoLoading: boolean;
    deleteChatLoading: boolean;
    leaveChatLoading: boolean;
    addMemberLoading: boolean;
}

interface IActions {
    loadInfo: ICallback1<string>;
    deleteChat: ICallback1<string>;
    leaveChat: ICallback1<string>;
    addMember: ICallback1<IMemberToGroupChatRoutinePayload>;
    deleteMember: ICallback1<IMemberToGroupChatRoutinePayload>;
    toggleMemberRole: ICallback1<IToggleMemberRoleGroupChatRoutinePayload>;
    setSelectedId: ICallback1<string | undefined>;
}

interface IOwnProps {
}

interface IState {
    changing: boolean;
    toAddUserId?: string;
    error?: string;
}

const validationSchema = Yup.object().shape({
    title: Yup.string()
        .min(4, 'Too Short! Need to be 4-16 digits.')
        .max(16, 'Too Long! Need to be 4-16 digits.')
        .required('This field is required'),
    picture: Yup.string()
        .max(256, 'Too Long! Need to be less than 256 characters.')

});

class GroupChatDetails extends React.Component<IOwnProps & IPropsFromState & IActions, IState> {

    state = {
        changing: false,
    } as IState;

    componentDidUpdate(
        prevProps: Readonly<IOwnProps & IPropsFromState & IActions>,
        prevState: Readonly<{}>,
        snapshot?: any
    ) {
        const {selectedId} = this.props;
        if (
            selectedId &&
            prevProps.selectedId !== selectedId
        ) {
            this.props.loadInfo(selectedId);
        }
    }

    handleChange = async (values: any) => {
        // const {updateChatInList, chatDetails} = this.props;
        // const {info} = this.state;
        // if(!info) {
        //     return;
        // }
        //
        // this.setState({error: undefined});
        // try {
        //     this.setState({changing: true});
        //     await groupChatService.changeInfo(info.id, values.title, values.picture);
        //     updateChatInList({...chatDetails, title: values.title, picture: values.picture});
        //     await this.loadData();
        // } catch (e) {
        //     this.setState({error: e.message});
        // } finally {
        //     this.setState({changing: false});
        // }
    }

    isAdminOrOwner = (permissionLevel: RoleEnum) => {
        return permissionLevel === RoleEnum.ADMIN || permissionLevel === RoleEnum.OWNER;
    }

    render() {
        const {changing, error, toAddUserId} = this.state;

        const {
            setSelectedId, selectedId, loadInfoLoading, info, deleteChatLoading, leaveChatLoading,
            deleteChat, leaveChat, addMemberLoading, addMember, deleteMember, toggleMemberRole
        } = this.props;

        if (!selectedId) {
            return null;
        }

        const defaultUserPicture =
            'https://www.pngkey.com/png/full/282-2820067_taste-testing-at-baskin-robbins-empty-profile-picture.png';
        return (
            <Modal close={() => setSelectedId(undefined)}>
                <LoaderWrapper loading={loadInfoLoading}>
                    {info && (
                        <div>
                            <div className={styles.wrapperPicture}>
                                <img className={styles.pictureStyle} src={info?.picture ||  defaultUserPicture} />
                            </div>
                            <div className={styles.title}>{info.title}</div>
                            <div className={styles.permission}>{info.permissionLevel}</div>
                        </div>
                    )}
                    {error && (
                        <ErrorMessage text={error} />
                    )}
                    {(info?.permissionLevel && this.isAdminOrOwner(info.permissionLevel)) && (
                        <Formik
                            onSubmit={this.handleChange}
                            initialValues={{title: info?.title, picture: info?.picture || ""}}
                            validationSchema={validationSchema}
                            render={({
                                         errors,
                                         touched,
                                         handleChange,
                                         handleBlur,
                                         values
                                     }) => {
                                const valid = !errors.title && !errors.picture;
                                return (
                                    <Form>
                                        <Input
                                            label="Title"
                                            value={values.title}
                                            name="title"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.title}
                                            touched={touched.title}
                                        />
                                        <Input
                                            label="Photo"
                                            value={values.picture}
                                            name="picture"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.picture}
                                            touched={touched.picture}
                                        />
                                        <div className={styles.buttonWrapper}>
                                            <Button
                                                text="Change chat info"
                                                disabled={!valid}
                                                submit
                                                loading={changing}
                                            />
                                        </div>
                                    </Form>
                                );
                            }
                            }
                        />
                    )}
                    {(info?.permissionLevel && this.isAdminOrOwner(info.permissionLevel)) && (
                        <div className={styles.finderWrapper}>
                            <UserFinder setUserId={id => this.setState({toAddUserId: id})} />
                            <div className={styles.buttonWrapper}>
                                <Button
                                    text="Add member"
                                    onClick={() => addMember({chatId: info.id, userId: toAddUserId as string})}
                                    loading={addMemberLoading}
                                    disabled={!toAddUserId}
                                />
                            </div>
                        </div>
                    )}
                    {info?.members.map(user => (
                        <UserManager
                            key={user.id}
                            user={user}
                            deletable={
                                (info?.permissionLevel !== RoleEnum.MEMBER && user.permissionLevel === RoleEnum.MEMBER)
                                ||
                                (info?.permissionLevel === RoleEnum.OWNER && user.permissionLevel === RoleEnum.ADMIN)
                            }
                            onDelete={() => deleteMember({chatId: info.id, userId: user.id})}
                            upgradable={info.permissionLevel === RoleEnum.OWNER}
                            upgraded={user.permissionLevel === RoleEnum.ADMIN}
                            onToggleUpgrade={() => toggleMemberRole({
                                userId: user.id, currentRole: user.permissionLevel, chatId: info.id
                            })}
                        />
                    ))}
                    {info?.permissionLevel === RoleEnum.OWNER && (
                        <div className={styles.buttonWrapper}>
                            <Button
                                text="Delete group chat"
                                onClick={() => deleteChat(info.id)}
                                loading={deleteChatLoading}
                            />
                        </div>
                    )}
                    {info && info?.permissionLevel !== RoleEnum.OWNER && (
                        <div className={styles.buttonWrapper}>
                            <Button
                                text="Leave group chat"
                                onClick={() => leaveChat(info.id)}
                                loading={leaveChatLoading}
                            />
                        </div>
                    )}
                </LoaderWrapper>
            </Modal>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    selectedId: state.groupChat.data.selectedId,
    info: state.groupChat.data.info,
    loadInfoLoading: state.groupChat.requests.loadInfo.loading,
    deleteChatLoading: state.groupChat.requests.deleteChat.loading,
    leaveChatLoading: state.groupChat.requests.leaveChat.loading,
    addMemberLoading: state.groupChat.requests.addMember.loading,
});

const mapDispatchToProps: IActions = {
    loadInfo: loadGroupChatInfoRoutine,
    setSelectedId: selectGroupChatIdRoutine.fulfill,
    deleteChat: deleteGroupChatRoutine,
    leaveChat: leaveGroupChatRoutine,
    addMember: addMemberToGroupChatRoutine,
    deleteMember: deleteMemberToGroupChatRoutine,
    toggleMemberRole: toggleMemberRoleGroupChatRoutine,
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupChatDetails);
