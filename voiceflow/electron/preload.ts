import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Recording
    onToggleRecording: (callback: (isRecording: boolean) => void) => {
        ipcRenderer.on('toggle-recording', (_event, isRecording) => callback(isRecording));
    },
    setRecording: (state: boolean) => ipcRenderer.send('set-recording', state),
    getRecordingState: () => ipcRenderer.invoke('get-recording-state'),

    // Actions
    pasteText: (text: string) => ipcRenderer.send('paste-text', text),
    hideOverlay: () => ipcRenderer.send('hide-overlay'),
    openSettings: () => ipcRenderer.send('open-settings'),

    // Window dragging
    startDrag: () => ipcRenderer.send('start-drag'),
});
