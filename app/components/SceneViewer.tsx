'use client';

import { useEffect, useRef, useState } from 'react';

import * as TYPES from '@/app/types/typeIndex';

import { SceneController } from '@/app/lib/scene/sceneController'
import { ButtonMenu } from '@/app/components/Buttons';
import { ButtonIcon } from '@/app/components/Icons';

export default function SceneViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneControllerRef = useRef<SceneController | null>(null);


    const [audioEnabled, setAudioEnabled] = useState(false);
    const [birdsEnabled, setBirdsEnabled] = useState(true);
    const [controllerLoaded, setControllerLoaded] = useState(false);

    const handleBirdToggle = () => {setBirdsEnabled(sceneControllerRef.current?.toggleBirds() ?? !birdsEnabled);};

    const handleAudioToggle = () => {setAudioEnabled(sceneControllerRef.current?.toggleAudio() ?? !audioEnabled);};

    const birdToggleConfig: TYPES.ToggleButtonConfig = {
        type: 'toggle' as const,
        toggled: birdsEnabled,
        onToggle: handleBirdToggle,
        childrenToggleOn: <ButtonIcon path='/icons/BirdsOn.png' />,
        childrenToggleOff: <ButtonIcon path='/icons/BirdsOff.png' />,
    };

    const audioToggleConfig: TYPES.ToggleButtonConfig = {
        type: 'toggle' as const,
        toggled: audioEnabled,
        onToggle: handleAudioToggle,
        childrenToggleOn: <ButtonIcon path='/icons/SoundOn.png' />,
        childrenToggleOff: <ButtonIcon path='/icons/SoundOff.png' />,
    };

    const toggleList = [birdToggleConfig, audioToggleConfig];

    useEffect(() => {
        const sceneController = new SceneController(containerRef, document, audioEnabled, birdsEnabled);
        sceneControllerRef.current = sceneController;
        sceneController.start().then(() => {
            setControllerLoaded(true);
        });

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
            {controllerLoaded && <ButtonMenu buttonConfigs={toggleList} />}
        </div>
    );
}
