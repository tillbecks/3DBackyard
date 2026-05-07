import { NextRequest, NextResponse } from 'next/server';
import { generateHouses } from '@/app/lib/house/houseExport';
import { scenarios } from '@/app/lib/config/routeConfig';
import { objectToGLB } from '@/app/lib/config/importExportUtils';
import {generateShowcaseContent} from '@/app/lib/showcase/showcase';
import * as THREE from 'three';

export async function GET(request: NextRequest) {
    try {        
        // Scene mit Häusern, Lichtern etc. erstellen
        const scenario = request.nextUrl.searchParams.get('scenario');
        let object: THREE.Group | null = null;

        if(scenario == scenarios.showcase){
            object = generateShowcaseContent();
        }else{
            object = generateHouses();
        }

        const glbBuffer = await objectToGLB(object);
        
        return new NextResponse(glbBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename="houses.glb"',
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
