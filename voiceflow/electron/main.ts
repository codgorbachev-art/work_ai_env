import { app, BrowserWindow, ipcMain, globalShortcut, clipboard, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { fork, ChildProcess } from 'child_process';

let serverProcess: ChildProcess | null = null;
let overlayWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isRecording = false;

// WebSocket Server Management
function startServer() {
    if (serverProcess) return;

    const serverPath = app.isPackaged
        ? path.join(process.resourcesPath, 'server/index.js')
        : path.join(__dirname, '../../server/index.ts');

    const devServerPath = path.join(__dirname, '../server/index.js');
    const finalPath = app.isPackaged ? serverPath : devServerPath;

    console.log('Starting server at:', finalPath);

    serverProcess = fork(finalPath, [], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
    });

    serverProcess.on('message', (msg) => console.log('[Server]:', msg));
    serverProcess.on('error', (err) => console.error('[Server Error]:', err));
}

function stopServer() {
    if (serverProcess) {
        console.log('Stopping server...');
        serverProcess.kill();
        serverProcess = null;
    }
}

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        width: 500,
        height: 120,
        x: Math.floor((require('electron').screen.getPrimaryDisplay().workAreaSize.width - 500) / 2),
        y: 30,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1);

    if (isDev) {
        overlayWindow.loadURL('http://localhost:5173');
    } else {
        overlayWindow.loadFile(path.join(__dirname, '../index.html'));
    }

    // Делаем окно перетаскиваемым
    overlayWindow.setIgnoreMouseEvents(false);
}

function createSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 500,
        height: 600,
        frame: true,
        transparent: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (isDev) {
        settingsWindow.loadURL('http://localhost:5173/#/settings');
    } else {
        settingsWindow.loadFile(path.join(__dirname, '../index.html'), { hash: 'settings' });
    }

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

function createTray() {
    const iconPath = path.join(__dirname, '../resources/icon.png');
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Показать', click: () => overlayWindow?.show() },
        { label: 'Настройки', click: () => createSettingsWindow() },
        { type: 'separator' },
        { label: 'Выход', click: () => app.quit() },
    ]);

    tray.setToolTip('VoiceFlow');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (overlayWindow?.isVisible()) {
            overlayWindow.hide();
        } else {
            overlayWindow?.show();
        }
    });
}

function registerGlobalShortcuts() {
    // Ctrl+Shift+Space — начать/остановить запись
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
        isRecording = !isRecording;
        overlayWindow?.webContents.send('toggle-recording', isRecording);

        if (!overlayWindow?.isVisible()) {
            overlayWindow?.show();
        }
    });
}

// IPC handlers
ipcMain.handle('get-recording-state', () => isRecording);

ipcMain.on('set-recording', (_event, state: boolean) => {
    isRecording = state;
});

ipcMain.on('paste-text', (_event, text: string) => {
    clipboard.writeText(text);
    // Текст скопирован в буфер обмена
    // Пользователь может вставить его через Ctrl+V
});

ipcMain.on('hide-overlay', () => {
    overlayWindow?.hide();
});

ipcMain.on('open-settings', () => {
    createSettingsWindow();
});

// App lifecycle
app.whenReady().then(() => {
    startServer(); // Запускаем сервер
    createOverlayWindow();
    createTray();
    registerGlobalShortcuts();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createOverlayWindow();
        }
    });
});

app.on('window-all-closed', () => {
    stopServer(); // Останавливаем сервер
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
