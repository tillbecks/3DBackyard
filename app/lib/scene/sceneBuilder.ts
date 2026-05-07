import * as THREE from 'three';
import { initHouseScene } from './scene';
import * as TDUTILS from '../config/3dUtils';

interface sceneReturn {
    sceneGLB: string;
    cameraPosition: number[];
    cameraAim: number[];
}

/*export async function createExport(): Promise<sceneReturn> {
    const scene = initHouseScene();

    try {
        const glb = await TDUTILS.objectToGLBBase64(scene.scene.scene);
        return {
            sceneGLB: glb,
            cameraPosition: scene.content.camera.position.toArray(),
            cameraAim: scene.content.cameraAim.toArray()
        };
    } catch (error) {
        console.error('GLB export error:', error);
        throw new Error('Failed to export scene to GLB');
    }
}*/
