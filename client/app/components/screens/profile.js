// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import ProfilePic from 'components/base/profilePic';
import connectFirebase from 'utils/firebase/enhancer';

import styles from './profile.css';

async function signOut() {
    const firebase = await import(/* webpackChunkName: "firebase" */ '../../utils/firebase');
    await firebase.signOut();
}

const enhanceField = connectFirebase(
    ({ uid, name }) => `/users/${uid}/${name}`,
    value => ({ value }),
);

const ProfileField = enhanceField(
    class extends PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                value: null,
            };
        }

        componentWillMount() {
            this.onChange = (evt, value) => {
                this.setState({ value });
            };

            this.onSave = async () => {
                const { value } = this.state;
                const { uid, name, value: propsValue } = this.props;
                if (value !== null && value !== propsValue) {
                    const { database } = await import(/* webpackChunkName: "firebase" */ '../../utils/firebase');
                    database.ref(`/users/${uid}/${name}`).set(value);
                }
            };
        }

        componentWillReceiveProps({ value: nextValue }) {
            const { value: propsValue } = this.props;
            const { value: stateValue } = this.state;
            if (propsValue !== nextValue && (stateValue === null || stateValue === nextValue)) {
                this.setState({ value: null });
            }
        }

        props: {
            uid: string,
            name: string,
            children: (any, Function, Function) => any,
            value: any,
        };

        render() {
            return this.props.children(
                this.state.value || this.props.value || '',
                this.onChange, this.onSave,
            );
        }
    }
);

type Props = {
    uid: string,
};

const Profile = (props: Props) => (
    <div className={styles.profile}>
        <ProfilePic uid={props.uid} className={styles.avatar} height="96" width="96" />
        <ProfileField uid={props.uid} name="displayName">
            {(value, onChange, onSave) => (
                <TextField
                    floatingLabelText="Username" name="username"
                    value={value} onChange={onChange} onBlur={onSave} />
            )}
        </ProfileField>
        <ProfileField uid={props.uid} name="birthDate">
            {(value, onChange, onSave) => (
                <TextField
                    floatingLabelText="Birthdate" type="date" name="birthDate"
                    value={value} onChange={onChange} onBlur={onSave} />
            )}
        </ProfileField>
        <ProfileField uid={props.uid} name="biography">
            {(value, onChange, onSave) => (
                <TextField
                    floatingLabelText="Biography" multiLine name="biography"
                    value={value} onChange={onChange} onBlur={onSave} />
            )}
        </ProfileField>
        <FlatButton label="Sign Out" onTouchTap={signOut} />
    </div>
);

const enhance = connect(
    ({ auth }) => ({
        uid: auth.user.uid,
    }),
);

export default enhance(Profile);
