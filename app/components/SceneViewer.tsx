'use client';

import { useEffect, useRef, useState } from 'react';

import * as TYPES from '@/app/types/typeIndex';
import * as INFOS from '@/app/lib/infos/infos';

import { SceneController } from '@/app/lib/scene/sceneController'
import { ButtonMenu } from '@/app/components/Buttons';
import { ButtonIcon } from '@/app/components/Icons';
import { InformationNote } from './InformationNote';

export default function SceneViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneControllerRef = useRef<SceneController | null>(null);

    const websiteInfos: TYPES.Info = INFOS.websiteInfos;

    const [audioEnabled, setAudioEnabled] = useState(false);
    const [birdsEnabled, setBirdsEnabled] = useState(true);
    const [controllerLoaded, setControllerLoaded] = useState(false);
    const [informationNoteVisible, setInformationNoteVisible] = useState(true);
    const [currentInfo, setCurrentInfo] = useState(websiteInfos);

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
            className = "relative w-screen h-screen m-0 p-0 overflow-hidden "
        >
            {/*!informationNoteVisible && <InformationNote info={currentInfo} size={{width:40, height: 30}}/>*/}
            {controllerLoaded && <ButtonMenu buttonConfigs={toggleList} />}
        </div>
    );
}
