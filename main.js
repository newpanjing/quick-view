const electron = require('electron')
const {app, Menu, Tray, Notification, ipcMain, shell, ipcRenderer, BrowserWindow, TouchBar, dialog, remote} = electron
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar
var fs = require('fs'), os = require('os');
var win;
var client = null;

var temp = null;

function init() {

    ipcMain.on('register', (event, args) => {
        client = event.sender;
        //注册后，如果temp不为空 就通知
        if (temp) {
            client.send('openFile', temp);
        }
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
        icon: `${__dirname}/src/icons/left.png`
    });
    let right_btn = new TouchBarButton({
        icon: `${__dirname}/src/icons/right.png`
    });
    let zoomin = new TouchBarButton({
        icon: `${__dirname}/src/icons/Zoomin.png`
    });

    let zoomout = new TouchBarButton({
        icon: `${__dirname}/src/icons/Zoomout.png`
    });
    let zoomLabel = new TouchBarButton({label: '100%'});
    let rotateLeft = new TouchBarButton({icon: `${__dirname}/src/icons/rotate-left.png`})
    let rotateRight = new TouchBarButton({icon: `${__dirname}/src/icons/rotate-right.png`})

    const touchBar = new TouchBar({
        items: [
            left_btn,
            right_btn,
            zoomin,
            zoomLabel,
            zoomout,
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