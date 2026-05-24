'use client';

import { useEffect, useRef, useState } from 'react';

import { SceneController } from '@/app/lib/scene/sceneController';
import Button from '@/app/components/Button';

export default function SceneViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneControllerRef = useRef<SceneController | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(false);

    useEffect(() => {
        const sceneController = new SceneController(containerRef, document);
        sceneControllerRef.current = sceneController;
        sceneController.start();

        // Window Resize Handler
        const handleResize = () => {
            sceneController.handleResize(containerRef);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            sceneController.close();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
            }}
        >
            <Button
                onClick={() => {
                    const nextAudioState = sceneControllerRef.current?.toggleAudio() ?? false;
                    setAudioEnabled(nextAudioState);
                }}
                position={{ top: '20px', right: '20px' }}
            >
                {audioEnabled ? 'Disable Bird Audio' : 'Enable Bird Audio'}
            </Button>
        </div>
    );
}
