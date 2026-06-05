import * as THREE from 'three';
import * as TYPES from '@/app/types/typeIndex';
import { getShader } from './shader/shaderConfig';
import { getMaterialFromId } from './materials';

export function addGradientToScene(object: THREE.Object3D){
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            addGradientToToonMaterial(child);
        }
    });
}

const sharedGradient = createToonGradient();

function addGradientToToonMaterial(object: THREE.Mesh) {
    const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

    object.material = materials.map(mat => {
        const stdMat = mat as THREE.MeshStandardMaterial;
        return new THREE.MeshToonMaterial({
            color: stdMat.color ?? new THREE.Color(0xffffff),
            map: stdMat.map ?? null,
            side: stdMat.side ?? THREE.DoubleSide,
            gradientMap: sharedGradient,
            vertexColors: stdMat.vertexColors,
            userData: {
                shader: stdMat.userData.shader ?? null
            }
        });
    });
}

function createToonGradient(): THREE.DataTexture {
    const pixelsPerStep = 64;
    const steps = [50, 120, 200, 255];
    const width = steps.length * pixelsPerStep;
    const data = new Uint8Array(width);

    steps.forEach((brightness, i) => {
        for (let j = 0; j < pixelsPerStep; j++) {
            data[i * pixelsPerStep + j] = brightness;
        }
    });

    const texture = new THREE.DataTexture(data, width, 1, THREE.RedFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
}

export function loadMaterials(scene: THREE.Scene | THREE.Group): void {
    for (const child of scene.children) {
        child.traverse((mesh) => {
            if(mesh instanceof THREE.Mesh){
                if (mesh.userData.materialConfig) {
                    try {
                        const materialConfig: TYPES.MaterialShaderConfig = mesh.userData.materialConfig;
                        let material = getMaterialFromId(materialConfig.materialId);
                        const shaderConfig = materialConfig.shaderConfig;
                        if(shaderConfig !== null && shaderConfig !== undefined){
                            material = getShader(shaderConfig.id, shaderConfig.uniforms, material);
                        }
                        mesh.material = material;
                    } catch (error) {
                        mesh.material = getMaterialFromId();
                    }
                }
            }
        });
    }
}