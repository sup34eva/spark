// @flow
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import CircularProgress from 'material-ui/CircularProgress';

import connectFirebase from 'utils/firebase/enhancer';
import CreateChannelDialog from 'components/dialog/createChannel';
import ChannelItem from 'components/item/channel';
import Profile from 'components/item/profile';

type Props = {
    routeName: string,
    navigation: {
        navigate: (string) => void,
        dispatch: (Object) => void,
        state: {
            routeName: string,
            params: ?{ // eslint-disable-line
                channel: string,
            },
        },
    },

    channels: ?Array<{
        name: string,
        subtext: ?string,
        type: 'CHANNEL' | 'GROUP' | 'PERSON',
        users: ?{
            [key: string]: 'user' | 'moderator',
        },
    }>,
};

const PAPER_STYLE = {
    position: 'relative',
    width: 256,
    zIndex: 1,
};
const BTN_STYLE = {
    position: 'absolute',
    top: 48,
    right: 0,
    zIndex: 5,
};

class Conversations extends PureComponent {
    static contextTypes = {
        muiTheme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    state: {
        showModal: boolean,
    };

    componentWillMount() {
        this.selectChannel = channel => {
            this.props.navigation.navigate('ConvOpen');
            this.props.navigation.dispatch({
                type: 'Navigation/SET_PARAMS',
                key: 'ConvOpen',
                params: { channel },
            });
        };
        this.openModal = () => {
            this.setState({ showModal: true });
        };
        this.closeModal = () => {
            this.setState({ showModal: false });
        };
    }

    props: Props;

    category(type) {
        const { channels, navigation } = this.props;
        const { params } = navigation.state;
        const channel = params && params.channel;

        if (channels) {
            const filtered = channels.filter(node => node.type === type);
            if (filtered.length) {
                return filtered.map(node => (
                    // $FlowIssue
                    <ChannelItem
                        onTouchTap={() => this.selectChannel(node.name)}
                        selected={channel === node.name}
                        key={node.name} value={node.name}
                        channel={node} />
                ));
            }

            return <ListItem primaryText="Empty" disabled />;
        }

        return <ListItem leftAvatar={<CircularProgress />} primaryText="Loading ..." disabled />;
    }

    render() {
        let title;
        let category;
        // eslint-disable-next-line default-case
        switch (this.props.routeName) {
            case 'Channels':
                title = 'Channels';
                category = 'CHANNEL';
                break;

            case 'Groups':
                title = 'Groups';
                category = 'GROUP';
                break;

            case 'Friends':
                title = 'Friends';
                category = 'PERSON';
                break;
        }

        const { primary3Color } = this.context.muiTheme.palette;
        return (
            <Paper style={{ ...PAPER_STYLE, backgroundColor: primary3Color }} rounded={false}>
                <IconButton onTouchTap={this.openModal} style={BTN_STYLE}>
                    <ContentAdd />
                </IconButton>

                <List>
                    <Subheader>{title}</Subheader>
                    {this.category(category)}
                </List>

                <Profile />

                <CreateChannelDialog
                    type={category}
                    open={this.state.showModal}
                    onRequestClose={this.closeModal} />
            </Paper>
        );
    }
}

const enhance = connectFirebase(
    () => '/channels',
    value => do {
        /* eslint-disable semi, no-unused-expressions */
        if (value) {
            ({
                channels: Object.entries(value).map(([name, val]) => ({ name, ...val })),
            })
        } else {
            null
        }
        /* eslint-enable semi, no-unused-expressions */
    },
);

export default enhance(Conversations);
