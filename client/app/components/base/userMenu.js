// @flow
import React, { PureComponent } from 'react';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

type Props = {
    uid: string,
    // eslint-disable-next-line no-undef
    children: ReactElement<*>,
};

class UserCard extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            anchor: null,
        };
    }

    componentWillMount() {
        this.handleOpen = evt => {
            evt.preventDefault();
            this.setState({
                open: true,
                anchor: evt.currentTarget,
            });
        };
        this.handleClose = () => {
            this.setState({
                open: false,
                anchor: null,
            });
        };
    }

    props: Props;

    render() {
        const {
            uid, // eslint-disable-line no-unused-vars
            children,
            ...props
        } = this.props;

        return (
            <div {...props}>
                {React.cloneElement(this.props.children, {
                    onTouchTap: this.handleOpen,
                })}
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchor}
                    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                    onRequestClose={this.handleClose}>
                    <Menu>
                        <MenuItem primaryText="Add a contact" />
                    </Menu>
                </Popover>
            </div>
        );
    }
}

export default UserCard;
