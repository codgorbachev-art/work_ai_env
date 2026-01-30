/**
 * Google Cloud Speech-to-Text Service (WebSocket Client)
 * Connects to local Node.js server for streaming transcription
 */

interface TranscriptionResult {
    transcript: string;
    isFinal: boolean;
    isInterim: boolean;
}

export class SpeechService {
    private ws: WebSocket | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private onResult: ((result: TranscriptionResult) => void) | null = null;

    constructor() {
        // No config needed client-side, connection goes to localhost:3001
    }

    async startRecording(onResult: (result: TranscriptionResult) => void): Promise<void> {
        this.onResult = onResult;

        try {
            // 1. Get Microphone Access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 48000,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });

            // 2. Setup MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            });

            // 3. Connect to WebSocket Server
            this.ws = new WebSocket('ws://localhost:3001');

            this.ws.onopen = () => {
                console.log('WS Connected');
                this.ws?.send('START');
                this.mediaRecorder?.start(100); // 100ms chunks for low latency
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.error) {
                        console.error('Server Error:', data.error);
                        return;
                    }
                    if (data.transcript && this.onResult) {
                        this.onResult({
                            transcript: data.transcript,
                            isFinal: data.isFinal,
                            isInterim: data.isInterim
                        });
                    }
                } catch (e) {
                    console.error('WS Message Parse Error', e);
                }
            };

            this.ws.onerror = (e) => console.error('WS Error', e);

            this.ws.onclose = () => {
                console.log('WS Closed');
            };

            // 4. Send Audio Data
            this.mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
                    // Send blob directly
                    this.ws.send(event.data);
                }
            };

        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    async stopRecording(): Promise<string> {
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }

            if (this.ws) {
                if (this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send('STOP');
                    // Give a small delay for final results?
                    // Typically Google sends final result quickly.
                    // We just close the connection after a short while or immediately?
                    // Better to close immediately for now.
                    this.ws.close();
                }
                this.ws = null;
            }

            this.mediaRecorder = null;
            resolve(''); // Streaming returns results via callback, not here
        });
    }

    isRecording(): boolean {
        return this.mediaRecorder?.state === 'recording';
    }
}

// Singleton instance
let speechService: SpeechService | null = null;

// Removed apiKey param as it is not used in WS implementation
export function getSpeechService(_apiKey?: string): SpeechService {
    if (!speechService) {
        speechService = new SpeechService();
    }
    return speechService;
}
