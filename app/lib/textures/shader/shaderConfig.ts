import { brickFragmentShader } from "./brickTextures";
import * as THREE from 'three';
import * as TCONFIG from '../textureConfig';
import { hexNumberToVec3 } from "../colors";
import * as TYPE from "../../../types/typeIndex";
import { roofTileShader, flatTileShader, norfolkTileShader } from "./roofTextures";
import { grassShader } from "./grassTextures";


export const BRICK_SHADER = {id: "brick", getShaderMaterialConfig: (color: number) => {
    return {
        id: "brick",
        uniforms: {
            brickSize: { value: new THREE.Vector2(TCONFIG.BRICK_WIDTH, TCONFIG.BRICK_HEIGHT) }, // Set brick width and height in world units
            mortarThickness: { value: 0 },
            randomNr: { value: Math.random()*10 },
            brickColor: { value: hexNumberToVec3(color) },
          }
    }
}};

export const ROOF_TILE_SHADER = {id: "roof_tile", getShaderMaterialConfig: (color: number) => {
    return {
        id: "roof_tile",
        uniforms: {
            tileSize : { value: TCONFIG.TILE_SIZE }, // Set tile width and height in world units
            gapThickness: { value: TCONFIG.TILE_GAP },
            randomNr: { value: Math.random()*10 },
            roofTileColor: { value: hexNumberToVec3(color) },
        }
    }
}};

export const ROOF_FLAT_TILE_SHADER = {id: "roof_flat_tile", getShaderMaterialConfig: (color: number) => {
    return {
        id: "roof_flat_tile",
        uniforms: {
            tileSize : { value: TCONFIG.FLAT_TILE_SIZE }, // Set tile width and height in world units
            randomNr: { value: Math.random()*10 },
            roofTileColor: { value: hexNumberToVec3(color) },
        }
    }
}};

export const ROOF_NORFOLK_TILE_SHADER = {id: "roof_norfolk_tile", getShaderMaterialConfig: (color: number) => {
    return {
        id: "roof_norfolk_tile",
        uniforms: {
            tileSize : { value: TCONFIG.NORFOLK_TILE_SIZE }, // Set tile width and height in world units
            randomNr: { value: Math.random()*10 },
            roofTileColor: { value: hexNumberToVec3(color) },
        }
    }
}};

export const GRASS_SHADER = {id: "grass", getShaderMaterialConfig: (color: number) => {
    return {
        id: "grass",
        uniforms: {
            grassColor: { value: hexNumberToVec3(color) },
            randomNr: { value: Math.random()*10 },
        }
    }
}};

export function getShader(id: string, uniforms: Record<string, { value: unknown }>, material: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
    try{
    let fragmentShader: TYPE.fragmentShaderType;
    switch(id) {
        case BRICK_SHADER.id:
            fragmentShader = brickFragmentShader; break;
        case ROOF_TILE_SHADER.id:
            fragmentShader = roofTileShader; break;
        case ROOF_FLAT_TILE_SHADER.id:
            fragmentShader = flatTileShader; break;
        case ROOF_NORFOLK_TILE_SHADER.id:
            fragmentShader = norfolkTileShader; break;
        case GRASS_SHADER.id:
            fragmentShader = grassShader; break;
        default: throw new Error(`Shader ${id} not found`);
    }
    const materialClone = material.clone();
    materialClone.defines = materialClone.defines || {};
    materialClone.defines.USE_UV = '';
    materialClone.customProgramCacheKey = () => id;
    materialClone.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        injectShader(shader, fragmentShader);
    };
    return materialClone;

    } catch (error) {
        console.error(`Error creating shader material for shader ${id}:`, error);
        return material;
    }
}

export function loadShader(scene: THREE.Scene | THREE.Group): void {
    console.log("Loading shaders...");
    for (const child of scene.children) {
        child.traverse((mesh) => {
            if(mesh instanceof THREE.Mesh && mesh.userData.shader){
                console.log(`Found mesh with shader config:`, mesh.name, mesh.userData.shader);
                try {
                    const shaderMaterial = getShader(mesh.userData.shader.id, mesh.userData.shader.uniforms, mesh.material);
                    console.log(`Created shader material:`, shaderMaterial);
                    mesh.material = shaderMaterial;
                    console.log(`Applied shader to ${mesh.name}`);
                } catch (error) {
                    console.error(`Error loading shader for ${mesh.name}:`, error);
                }
            }
        });
    }

    for(const child of scene.children) {
        child.traverse((mesh) => {
            if(mesh instanceof THREE.Mesh && mesh.userData.shader){
                console.log(`Final check - mesh: ${mesh.name}, material:`, mesh.material);
            }
        });
    }
}

export function injectShader(shader: THREE.WebGLProgramParametersWithUniforms, fragmentShader: TYPE.fragmentShaderType){
    shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {', fragmentShader.functions + 'void main() {'
    );

    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>', '#include <color_fragment>' + fragmentShader.main
    );
}