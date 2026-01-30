import { useState, useEffect, useRef, useCallback } from 'react';
import './Capsule.css';

interface CapsuleProps {
    isRecording: boolean;
    transcription: string;
    onToggle: () => void;
    onSettings: () => void;
    onClose: () => void;
}

export function Capsule({ isRecording, transcription: _transcription, onToggle, onSettings: _onSettings, onClose: _onClose }: CapsuleProps) {
    const [time, setTime] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRecording) {
            setTime(0);
            interval = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

    // Smooth waveform animation
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        if (!isRecording) {
            // Статичная линия когда не записываем
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            return;
        }

        // Анимированная волна
        const time = Date.now() / 1000;

        // Градиент
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        gradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.8)');
        gradient.addColorStop(0.5, 'rgba(167, 139, 250, 1)');
        gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');

        ctx.beginPath();
        ctx.moveTo(0, centerY);

        for (let x = 0; x < width; x++) {
            const frequency1 = 0.02;
            const frequency2 = 0.04;
            const frequency3 = 0.01;

            const amplitude = 15 + Math.sin(time * 2) * 5;

            const y = centerY +
                Math.sin(x * frequency1 + time * 3) * amplitude * 0.5 +
                Math.sin(x * frequency2 + time * 2) * amplitude * 0.3 +
                Math.sin(x * frequency3 + time * 4) * amplitude * 0.2;

            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        animationRef.current = requestAnimationFrame(drawWaveform);
    }, [isRecording]);

    useEffect(() => {
        if (isRecording) {
            drawWaveform();
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            drawWaveform(); // Draw static line
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRecording, drawWaveform]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="capsule-wrapper">
            <div className={`capsule ${isRecording ? 'recording' : ''}`}>
                {/* Mic button with rings */}
                <div className="mic-container">
                    <div className={`mic-ring ${isRecording ? 'active' : ''}`}>
                        <div className={`mic-ring-inner ${isRecording ? 'active' : ''}`}>
                            <button
                                className={`mic-button ${isRecording ? 'active' : ''}`}
                                onClick={onToggle}
                                title={isRecording ? 'Остановить' : 'Начать запись'}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {isRecording && <span className="recording-text">Recording...</span>}
                </div>

                {/* Waveform */}
                <div className="waveform-container">
                    <canvas
                        ref={canvasRef}
                        width={180}
                        height={50}
                        className="waveform-canvas"
                    />
                </div>

                {/* Timer */}
                <div className="timer">
                    {formatTime(time)}
                </div>
            </div>
        </div>
    );
}
