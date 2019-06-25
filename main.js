const electron = require('electron')
const {app, Menu, Tray, Notification, ipcMain, shell, ipcRenderer, BrowserWindow, TouchBar, dialog, remote} = electron
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar
var fs = require('fs'), os = require('os');
var win;
var client = null;

var temp = null;

var appIcon = null;

function createAppIcon() {
    appIcon = new Tray(`${__dirname}/src/icons/tray.png`)
    appIcon.setToolTip('Quick View');
    appIcon.on('double-click', () => {
        win.isVisible() ? win.focus() : win.show()
    });
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Choose an image',
            click: () => {
                var rs = dialog.showOpenDialog(win, {
                    properties: ['openFile', 'showHiddenFiles', 'treatPackageAsDirectory'],
                    filters: [{name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico']}]
                });
                if (rs) {
                    client.send('openFile', rs);
                }
            }
        },
        {
            label: 'Display Window', click: () => {
                win.show();
                win.focus();
            }
        },
        {label: 'Check for Updates',},
        {label: 'About', role: 'about'},
        {type: 'separator'},
        {label: 'Quit', role: 'quit'}
    ])

    appIcon.setContextMenu(contextMenu);

    appIcon.on('drop-files', (event, files) => {
        console.log(files);
        if (files.length != 0) {
            client.send('openFile', files[0]);
        }
    })
}

function init() {

    createAppIcon();
    ipcMain.on('openFile', (event, args) => {
        //event.returnValue=
        var rs = dialog.showOpenDialog(win, {
            properties: ['openFile', 'showHiddenFiles', 'treatPackageAsDirectory'],
            filters: [{name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico']}]
        });
        event.returnValue = rs;

    });
    ipcMain.on('register', (event, args) => {
        client = event.sender;
        //注册后，如果temp不为空 就通知
        if (temp) {
            client.send('openFile', temp);
        }
    });
    ipcMain.on('zoom', (event, args) => {
        zoomLabel.label = args + '%';
    });
    ipcMain.on('maximize', (event, args) => {
        if (win.isMaximized()) {
            win.unmaximize()
        } else {
            win.maximize()
        }
    });

    ipcMain.on('top', (event, val) => {
        win.setAlwaysOnTop(val);
    });

    app.on('open-file', function (event, url) {
        //如果窗口还没打开需要等待
        console.log('打开文件')
        console.log(arguments)
        temp = url;
        if (!client) {
            throw new Error(url);
        } else {
            client.send('openFile', url);
        }
        if (win) {
            win.show();
            win.focus();
        }
    });

    app.on('open-url', (event, url) => {
        throw new Error(url);
    });

    win = new BrowserWindow({
        width: 950,
        height: 600,
        // maximizable: false,
        webPreferences: {
            nodeIntegration: true
        },
        titleBarStyle: 'hiddenInset',
        transparent: true
    })
    // win.setAlwaysOnTop(true);
    // win.setResizable(false);
    win.loadFile(`${__dirname}/src/index.html`)
    win.on('close', event => {
        // event.preventDefault();
        // win.hide()
        // app.dock.hide();
        app.quit();
    })

    //判断操作系统类型，如果是macOS 就创建触控板
    let left_btn = new TouchBarButton({
        icon: `${__dirname}/src/icons/left.png`,
        click: () => {
            client.send('touchbar', {
                type: 'prev'
            });
        }
    });
    let right_btn = new TouchBarButton({
        icon: `${__dirname}/src/icons/right.png`,
        click: () => {
            client.send('touchbar', {
                type: 'next'
            });
        }
    });
    let zoomin = new TouchBarButton({
        icon: `${__dirname}/src/icons/Zoomin.png`,
        click: () => {
            client.send('touchbar', {
                type: 'zoomin'
            });
        }
    });

    let zoomout = new TouchBarButton({
        icon: `${__dirname}/src/icons/Zoomout.png`,
        click: () => {
            client.send('touchbar', {
                type: 'zoomout'
            });
        }
    });
    let zoomLabel = new TouchBarButton({label: '100%'});
    let rotateLeft = new TouchBarButton({
        icon: `${__dirname}/src/icons/rotate-left.png`,
        click: () => {
            client.send('touchbar', {
                type: 'rotateLeft'
            });
        }
    })
    let rotateRight = new TouchBarButton({
        icon: `${__dirname}/src/icons/rotate-right.png`,
        click: () => {
            client.send('touchbar', {
                type: 'rotateRight'
            });
        }
    });

    const touchBar = new TouchBar({
        items: [
            left_btn,
            right_btn,
            zoomout,
            zoomLabel,
            zoomin,
            rotateLeft,
            rotateRight,
        ]
    })

    win.setTouchBar(touchBar);
    win.show();
    win.focus();
    // win.setOpacity(0.2)
    // app.dock.show();
}

app.on('ready', init);