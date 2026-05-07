import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function objectToGLB(object: THREE.Object3D | THREE.Group) {
    const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
            const exporter = new GLTFExporter();
            exporter.parse(
                object,
                (gltf) => {
                    if (gltf instanceof ArrayBuffer) {
                        resolve(gltf);
                    } else {
                        reject(new Error('Export invalid'));
                    }
                },
                reject,
                { binary: true }
            );
        });
    return glb;
}

export async function glbToObject(glb: ArrayBuffer): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.parse(
            glb,
            '',
            (gltf) => {
                resolve(gltf.scene);
            },
            reject
        );
    });
}

export async function objectToGLBBase64(object: THREE.Object3D | THREE.Group): Promise<string> {
    const glb = await objectToGLB(object);
    return Buffer.from(glb).toString('base64');
}

export async function objectFromGLBBase64(base64: string): Promise<THREE.Object3D | THREE.Group> {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return glbToObject(bytes.buffer);
}

export function createCameraConfig(position: THREE.Vector3, aim: THREE.Vector3) {
    return {
        position: position.toArray(),
        aim: aim.toArray()
    };
}