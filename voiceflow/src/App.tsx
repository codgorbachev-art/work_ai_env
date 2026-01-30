import { useState, useEffect, useCallback } from 'react';
import { Capsule } from './components/Capsule';
import { getSpeechService } from './services/speech';

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);

    // API Key берется сервером из .env или resources, на клиенте не нужен
    const speechService = getSpeechService();

    const startRecording = useCallback(async () => {
        setTranscription('');
        setError(null);

        try {
            await speechService.startRecording((result) => {
                // Сервер присылает и промежуточные (interim), и финальные результаты
                // Мы просто отображаем то, что пришло, в реальном времени
                setTranscription(result.transcript);
            });
            setIsRecording(true);

            // Сообщаем main процессу, что запись идет (для tray и кнопок)
            window.electronAPI?.setRecording(true);
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Ошибка запуска записи');
            setIsRecording(false);
            window.electronAPI?.setRecording(false);
        }
    }, [speechService]);

    const stopRecording = useCallback(async () => {
        try {
            await speechService.stopRecording();
            setIsRecording(false);
            window.electronAPI?.setRecording(false);

            // Копируем результат в буфер (опционально, или это делает main process?)
            // В текущей архитектуре main process делает paste-text
            if (transcription) {
                window.electronAPI?.pasteText(transcription);
            }
        } catch (err) {
            console.error('Failed to stop recording:', err);
            setError('Ошибка остановки');
        }
    }, [speechService, transcription]);

    const handleToggle = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    // Слушаем глобальные хоткеи из Main process
    useEffect(() => {
        const removeListener = window.electronAPI?.onToggleRecording((state) => {
            if (state !== isRecording) {
                if (state) startRecording();
                else stopRecording();
            }
        });
        return () => removeListener && removeListener();
    }, [isRecording, startRecording, stopRecording]);

    return (
        <>
            <Capsule
                isRecording={isRecording}
                onToggle={handleToggle}
                transcription={transcription}
                onSettings={() => window.electronAPI?.openSettings()}
                onClose={() => window.electronAPI?.hideOverlay()}
            />
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ff4d4d',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                }}>
                    {error}
                </div>
            )}
        </>
    );
}

export default App;
