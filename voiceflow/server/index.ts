import { WebSocketServer, WebSocket } from 'ws';
import speech from '@google-cloud/speech';
import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения из корня проекта
dotenv.config({ path: path.join(__dirname, '../../.env') });

const port = 3001; // Используем порт 3001 для WebSocket сервера
const wss = new WebSocketServer({ port });

const client = new speech.SpeechClient({
    key: process.env.VITE_GOOGLE_SPEECH_API_KEY
});

console.log(`WebSocket Server started on port ${port}`);

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    let recognizeStream: any = null;

    ws.on('message', (message: Buffer, isBinary: boolean) => {
        if (!isBinary) {
            // Текстовое сообщение - команды управления
            const msg = message.toString();
            console.log('Received command:', msg);

            if (msg === 'START') {
                startStream(ws);
            } else if (msg === 'STOP') {
                stopStream();
            }
        } else {
            // Бинарное сообщение - аудио данные
            if (recognizeStream) {
                recognizeStream.write(message);
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        stopStream();
    });

    function startStream(clientWs: WebSocket) {
        stopStream(); // Ensure clean state

        const request = {
            config: {
                encoding: 'WEBM_OPUS' as const,
                sampleRateHertz: 48000, // Electron/Chrome usually records at 48k Opus
                languageCode: 'ru-RU',
                enableAutomaticPunctuation: true,
            },
            interimResults: true, // Включаем промежуточные результаты для real-time
        };

        recognizeStream = client
            .streamingRecognize(request)
            .on('error', (error: any) => {
                console.error('API Error:', error);
                if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ error: error.message }));
                }
            })
            .on('data', (data: any) => {
                const result = data.results[0];
                const isFinal = result && result.isFinal;
                const transcript = result ? result.alternatives[0].transcript : '';

                if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({
                        transcript,
                        isFinal,
                        isInterim: !isFinal
                    }));
                }
            });

        console.log('Google Speech Stream started');
    }

    function stopStream() {
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream.removeAllListeners();
            recognizeStream = null;
            console.log('Google Speech Stream stopped');
        }
    }
});
