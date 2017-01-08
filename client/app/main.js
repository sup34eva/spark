const path = require('path');
const {
    app, BrowserWindow, Menu,
} = require('electron');

const __DEV__ = process.env.NODE_ENV !== 'production';
if (__DEV__) {
    require('electron-debug')();
    const path = require('path');
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

function installExtensions(then) {
    if (__DEV__) {
        const {
            default: installer,
            REACT_DEVELOPER_TOOLS,
            REDUX_DEVTOOLS,
            REACT_PERF,
        } = require('electron-devtools-installer');

        return () => {
            Promise.all(
                [
                    REACT_DEVELOPER_TOOLS,
                    REDUX_DEVTOOLS,
                    REACT_PERF,
                ]
                    .map(installer)
                    .map(prom => prom.catch(
                        console.warn.bind(console)
                    ))
            ).then(then);
        };
    } else {
        return then;
    }
}

let mainWindow = null;
app.on('ready', installExtensions(() => {
    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
    });

    if (__DEV__) {
        const exec = require('child_process').exec;
        const webpack = exec('npm run serve', {
            cwd: path.join(__dirname, '..'),
        }, error => {
            if (error) {
                console.error(error);
            }
        });

        webpack.stdout.pipe(process.stdout);
        webpack.stderr.pipe(process.stderr);

        mainWindow.openDevTools();
        mainWindow.webContents.on('context-menu', (e, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([{
                label: 'Inspect element',
                click() {
                    mainWindow.inspectElement(x, y);
                },
            }]).popup(mainWindow);
        });
    }

    mainWindow.loadURL(path.resolve(__dirname, 'index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}));
