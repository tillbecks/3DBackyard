import { NextResponse } from 'next/server';
import { objectToGLB } from '@/app/lib/config/importExportUtils';
import BirdModel from '@/app/lib/birds/birdModel';
export async function GET() {
    try {        
        const model = new BirdModel();

        const glbBuffer = await objectToGLB(model.get3DObject());
        
        return new NextResponse(glbBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename="bird.glb"',
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
