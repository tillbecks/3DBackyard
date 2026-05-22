import { NextRequest, NextResponse } from 'next/server';

import { generateHousesWithLawn } from '@/app/lib/house/houseExport';
import { scenarios } from '@/app/lib/config/routeConfig';
import { objectToGLBBase64 } from '@/app/lib/config/importExportUtils';
import {generateBirdShowcaseContent, generateShowcaseContent} from '@/app/lib/showcase/showcase';
import { generateStdLSystemTree } from '@/app/lib/backyard/lsystems';
import * as TYPES from '@/app/types/typeIndex';

import * as THREE from 'three';

export async function GET(request: NextRequest) {
    try {        
        // Scene mit Häusern, Lichtern etc. erstellen
        const scenario = request.nextUrl.searchParams.get('scenario');
        let object: THREE.Group  | null = null;
        let lights: TYPES.LightConfig[]= [];

        if(scenario == scenarios.showcase.sub){
            object = generateShowcaseContent();
        }else if(scenario == scenarios.birdShowcase.sub){
            object = generateBirdShowcaseContent();
        }else if(scenario == scenarios.tree.sub){
            object = generateStdLSystemTree();
        }
        else {
            const objectLight = generateHousesWithLawn();
            object = objectLight.object;
            lights = objectLight.lights;
        }

        const glbBufferString = await objectToGLBBase64(object);
        const sendJson = {
            object: glbBufferString,
            lights: lights
        }
        
        return NextResponse.json(sendJson);
    } catch (error) {
        console.error('Scene generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate scene', details: String(error) },
            { status: 500 }
        );
    }
}
