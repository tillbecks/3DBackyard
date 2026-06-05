'use client';

import { useState } from 'react';

import { BUTTON_SIZE, BUTTON_COLOR } from '@/app/lib/config/uiConfig';

export function Icon({path, size = 24, color = "currentColor", style}: {path: string, size?: number, color?: string, style?: React.CSSProperties}) {
    return (
        <div
            className='brightness-100 hover:brightness-120'
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

    return (
        <div>
            <Icon
                path={path}
                size={BUTTON_SIZE}
                color={BUTTON_COLOR}
            />
        </div>
    
    );
}