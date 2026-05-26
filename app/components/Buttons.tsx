'use client';

import { useState, useRef, useEffect } from 'react';
import * as TYPES from "@/app/types/typeIndex";

import {FlexContainer} from "@/app/components/Utils";

export function Button({onClick, children}: {onClick: () => void, children: React.ReactNode}) {
    return (
        <button onClick={onClick} style={{
            position: 'relative',
            backgroundColor: 'transparent',
            border: 'none',
        }}>
            {children}
        </button>
    );
}

export function ToggleButton({onToggle, toggled, childrenToggleOn, childrenToggleOff}: {onToggle: () => void, toggled: boolean, childrenToggleOn: React.ReactNode, childrenToggleOff: React.ReactNode}) {
    const [phase, setPhase] = useState<'idle'|'shrinking'|'growing'>('idle');
    const timers = useRef<number[]>([]);
    const DURATION = 120; // ms

    useEffect(() => {
        return () => { timers.current.forEach(t => clearTimeout(t)); };
    }, []);

    const handleClick = () => {
        if (phase !== 'idle') return; // avoid double clicks during animation
        setPhase('shrinking');
        const t1 = window.setTimeout(() => {
            // switch state
            try { onToggle(); } catch {}
            setPhase('growing');
            const t2 = window.setTimeout(() => setPhase('idle'), DURATION);
            timers.current.push(t2);
        }, DURATION);
        timers.current.push(t1);
    };

    const scale = phase === 'idle' ? 1 : phase === 'shrinking' ? 0.85 : 1;

    return (
        <button onClick={handleClick} style={{
            position: 'relative',
            backgroundColor: 'transparent',
            border: 'none',
            transform: `scale(${scale})`,
            transition: `transform ${DURATION}ms ease`,
            willChange: 'transform',
        }}>
            {toggled ? childrenToggleOn : childrenToggleOff}
        </button>
    );
}


export function ButtonMenu({ buttonConfigs }: { buttonConfigs: (TYPES.ToggleButtonConfig | TYPES.ButtonConfig)[] }) {
    return (
        <div style={{position: 'absolute', zIndex: 1000, top: '20px', right: '20px'}}>
            <FlexContainer
                childrenDistance={10}
                direction='vertical'>
                {buttonConfigs.map((config, index) => {
                    if (config.type === 'toggle') {
                        const toggleConfig = config as TYPES.ToggleButtonConfig;
                        return (
                            <ToggleButton
                                key={index}
                                onToggle={toggleConfig.onToggle}
                                toggled={toggleConfig.toggled}
                                childrenToggleOn={toggleConfig.childrenToggleOn}
                                childrenToggleOff={toggleConfig.childrenToggleOff}
                            />
                        );
                    } else {
                        const buttonConfig = config as TYPES.ButtonConfig;
                        return (
                            <Button
                                key={index}
                                onClick={buttonConfig.onClick}
                                children={buttonConfig.children}
                            />
                        );
                    }
                })}
            </FlexContainer>
        </div>
    );
}