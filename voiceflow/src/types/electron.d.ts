export interface ElectronAPI {
    onToggleRecording: (callback: (state: boolean) => void) => () => void;
    setRecording: (state: boolean) => void;
    getRecordingState: () => Promise<boolean>;
    pasteText: (text: string) => void;
    hideOverlay: () => void;
    openSettings: () => void;
    startDrag: () => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
