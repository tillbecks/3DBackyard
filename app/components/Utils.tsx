'use client';
export function FlexContainer({children, childrenDistance, direction, padding}: {children: React.ReactNode[], childrenDistance: number, direction: 'vertical' | 'horizontal', padding?: number}) {
    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: direction === 'vertical' ? 'column' : 'row',
            gap: `${childrenDistance}px`,
            padding: padding ? `${padding}px` : undefined,
        }}>
            {children}
        </div>
    );
}

import { BUTTON_SIZE, BUTTON_COLOR } from '@/app/lib/config/uiConfig';

export function Icon({path, size = 24, color = "currentColor"}: {path: string, size?: number, color?: string}) {
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
            }}
        />
    );
}

export function ButtonIcon({path}: {path: string}) {
    return (
        <Icon path={path} size={BUTTON_SIZE} color={BUTTON_COLOR} />
    );
}

