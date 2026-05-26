'use client';

import { useState } from 'react';

import { BUTTON_SIZE, BUTTON_COLOR } from '@/app/lib/config/uiConfig';

export function Icon({path, size = 24, color = "currentColor", style}: {path: string, size?: number, color?: string, style?: React.CSSProperties}) {
    return (
        <div
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                maskImage: `url(${path})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                
                // Für WebKit Browser (Chrome, Safari)
                WebkitMaskImage: `url(${path})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                ...style,
            }}
        />
    );
}

export function ButtonIcon({path}: {path: string}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Icon
                path={path}
                size={BUTTON_SIZE}
                color={BUTTON_COLOR}
                style={{
                    filter: isHovered ? 'brightness(1.2)' : 'none',
                }}
            />
        </div>
    
    );
}