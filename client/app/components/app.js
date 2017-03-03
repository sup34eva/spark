// @flow
import React from 'react';
import { connect } from 'react-redux';
import { remote, shell } from 'electron';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationMinimize from 'material-ui/svg-icons/navigation/expand-more';
import NavigationMaximize from 'material-ui/svg-icons/navigation/fullscreen';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';

import ChannelList from './list/channels';
import Chat from './chat';

import styles from './app.css';

type Props = {
    channel: ?string,
};

const MenuBar = () => (
    <div className={styles.menuBar}>
        <IconMenu iconButtonElement={(
            <FlatButton label="Edit" style={{
                color: '#fff',
            }} />
        )}>
            <MenuItem primaryText="Undo" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.undo();
            }} />
            <MenuItem primaryText="Redo" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.redo();
            }} />
            <Divider />
            <MenuItem primaryText="Cut" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.cut();
            }} />
            <MenuItem primaryText="Copy" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.copy();
            }} />
            <MenuItem primaryText="Paste" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.paste();
            }} />
            <MenuItem primaryText="Paste and Match Style" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.pasteAndMatchStyle();
            }} />
            <MenuItem primaryText="Delete" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.delete();
            }} />
            <MenuItem primaryText="Select All" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.selectAll();
            }} />
        </IconMenu>
        <IconMenu iconButtonElement={(
            <FlatButton label="View" style={{
                color: '#fff',
            }} />
        )}>
            <MenuItem primaryText="Reload" onTouchTap={() => {
                const win = remote.getCurrentWindow();
                win.reload();
            }} />
            <MenuItem primaryText="Force Reload" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.reloadIgnoringCache();
            }} />
            <MenuItem primaryText="Toggle Developer Tools" onTouchTap={() => {
                const win = remote.getCurrentWindow();
                win.toggleDevTools();
            }} />
            <Divider />
            <MenuItem primaryText="Reset Zoom" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.setZoomLevel(0);
            }} />
            <MenuItem primaryText="Zoom In" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.getZoomLevel(zoomLevel => {
                    webContents.setZoomLevel(zoomLevel + 0.5);
                });
            }} />
            <MenuItem primaryText="Zoom Out" onTouchTap={() => {
                const webContents = remote.getCurrentWebContents();
                webContents.getZoomLevel(zoomLevel => {
                    webContents.setZoomLevel(zoomLevel - 0.5);
                });
            }} />
            <Divider />
            <MenuItem primaryText="Toggle Full Screen" onTouchTap={() => {
                const win = remote.getCurrentWindow();
                win.setFullScreen(!win.isFullScreen());
            }} />
        </IconMenu>
        <IconMenu iconButtonElement={(
            <FlatButton label="Window" style={{
                color: '#fff',
            }} />
        )}>
            <MenuItem primaryText="Minimize" onTouchTap={() => {
                const win = remote.getCurrentWindow();
                win.minimize();
            }} />
            <MenuItem primaryText="Close" onTouchTap={() => {
                const win = remote.getCurrentWindow();
                win.close();
            }} />
        </IconMenu>
        <IconMenu iconButtonElement={(
            <FlatButton label="Help" style={{
                color: '#fff',
            }} />
        )}>
            <MenuItem primaryText="Learn More" onTouchTap={() => {
                shell.openExternal('http://electron.atom.io');
            }} />
            <MenuItem primaryText="Documentation" onTouchTap={() => {
                // eslint-disable-next-line flowtype-errors/show-errors
                shell.openExternal(`https://github.com/electron/electron/tree/v${process.versions.electron}/docs#readme`);
            }} />
            <MenuItem primaryText="Community Discussions" onTouchTap={() => {
                shell.openExternal('https://discuss.atom.io/c/electron');
            }} />
            <MenuItem primaryText="Search Issues" onTouchTap={() => {
                shell.openExternal('https://github.com/electron/electron/issues');
            }} />
        </IconMenu>
    </div>
);

const ButtonBar = ({ iconStyle }: { iconStyle?: any }) => (
    <span>
        {[
            [NavigationMinimize, 'minimize'],
            [NavigationMaximize, 'maximize'],
            [NavigationClose, 'close'],
        ].map(([Icon, action]) => (
            <IconButton key={action} iconStyle={iconStyle} onTouchTap={() => {
                const win = remote.getCurrentWindow();
                if (action === 'maximize' && win.isMaximized()) {
                    win.unmaximize();
                } else {
                    win[action]();
                }
            }}>
                <Icon />
            </IconButton>
        ))}
    </span>
);

ButtonBar.muiName = 'IconButton';

const App = (props: Props) => (
    <div className={styles.app}>
        <AppBar
            className={styles.appBar}
            showMenuIconButton={false}
            title="Spark"
            titleStyle={{
                flex: 'unset',
                order: 0,
            }}
            iconElementRight={<ButtonBar />}
            iconStyleRight={{ order: 2 }}>
            <MenuBar />
        </AppBar>
        <div className={styles.body}>
            <ChannelList />
            {props.channel && <Chat channel={props.channel} />}
        </div>
    </div>
);

export default connect(
    ({ chat }) => ({
        channel: chat.channel,
    }),
)(App);
