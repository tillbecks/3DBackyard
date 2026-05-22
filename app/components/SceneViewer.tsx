'use client';

import { useEffect, useRef } from 'react';

import { SceneController } from '@/app/lib/scene/sceneController';

export default function SceneViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneControllerRef = useRef<SceneController | null>(null);

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
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
            }}
        />
    );
}
