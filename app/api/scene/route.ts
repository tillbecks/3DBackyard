import { NextRequest, NextResponse } from 'next/server';
import { createHouseCameraConfig } from '@/app/lib/house/houseExport';
import { scenarios } from '@/app/lib/config/routeConfig';
import {createShowcaseCameraConfig, createBirdShowcaseCameraConfig} from '@/app/lib/showcase/showcase';

interface sceneConfig {
    cameraConfig: {
        position: number[],
        aim: number[]
    }
}

export async function GET(request: NextRequest) {
    try {        
        // Scene mit Häusern, Lichtern etc. erstellen
        const scenario = request.nextUrl.searchParams.get('scenario');

        const cameraConfig = scenario == scenarios.showcase ? createShowcaseCameraConfig() : scenario == scenarios.birdShowcase ? createBirdShowcaseCameraConfig() : createHouseCameraConfig();

        const returnSceneConfig: sceneConfig = {
            cameraConfig: cameraConfig
        };
        
        return NextResponse.json(returnSceneConfig, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Scene generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate scene', details: String(error) },
            { status: 500 }
        );
    }
}
