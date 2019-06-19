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
        if(win){
            win.show();
            win.focus();
        }
    });

    app.on('open-url', (event, url) => {
        throw new Error(url);
    });

    win = new BrowserWindow({
        width: 850,
        height: 500,
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

    win.show();
    win.focus();
    // win.setOpacity(0.2)
    // app.dock.show();
}

app.on('ready', init);