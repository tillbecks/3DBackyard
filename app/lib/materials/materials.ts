import * as THREE from 'three';

import * as COLORS from './colors';
import { BRICK_SHADER, ROOF_TILE_SHADER, ROOF_FLAT_TILE_SHADER, ROOF_NORFOLK_TILE_SHADER, GRASS_SHADER } from './shader/shaderConfig';

import * as TYPES from '@/app/types/typeIndex';
import { randomFromArray } from '../config/utils';

function buildID(material: string, color: THREE.Color | string | number | null): string {
    const threeColor = color ? new THREE.Color(color) : null;
    if(!threeColor) return material;
    else return `${material}_${threeColor.getHexString()}`;
}

function parseID(id: string): { material: string | null; color: THREE.Color | null } | null {
    const parts = id.split('_');
    if (parts.length === 0) return null;
    else if (parts.length === 1) return { material: parts[0], color: null };
    else{
        const material = parts[0];
        const colorHex = parts[1];
        const color = new THREE.Color(`#${colorHex}`);
        return { material, color };
    }
}

const getMaterialId = (material: string, color: THREE.Color | string | number | null) => {
    const threeColor = color ? new THREE.Color(color) : null;
    return buildID(material, threeColor);
}

const flatMetalMaterialConfig: TYPES.MaterialShaderConfig = {
    materialId: getMaterialId('standard', COLORS.METAL_MATERIAL_COLOR),
    shaderConfig: null
};

const shinyMetalMaterialConfig: TYPES.MaterialShaderConfig = {
    materialId: getMaterialId('shinyMetal', COLORS.METAL_MATERIAL_COLOR),
    shaderConfig: null
};

const brickMaterialRedConfig: TYPES.MaterialShaderConfig = {
        materialId: getMaterialId('standard', COLORS.BRICK_COLOR_RED),
        shaderConfig: BRICK_SHADER.getShaderMaterialConfig(COLORS.BRICK_COLOR_RED),
};

const brickMaterialSandstoneConfig: TYPES.MaterialShaderConfig = {
        materialId: getMaterialId('standard', COLORS.BRICK_COLOR_SANDSTONE),
        shaderConfig: BRICK_SHADER.getShaderMaterialConfig(COLORS.BRICK_COLOR_SANDSTONE),
};

const housePlasterMaterialConfigs: TYPES.MaterialShaderConfig[] = COLORS.HOUSE_PLASTER_COLOR.map(color => ({
    materialId: getMaterialId('standard', color),
    shaderConfig: null
}));

const houseMaterialConfigs = [...housePlasterMaterialConfigs, brickMaterialRedConfig, brickMaterialSandstoneConfig];

const roofTileMaterialConfig: TYPES.MaterialShaderConfig = {
        materialId: getMaterialId('standard', COLORS.ROOF_TILE_COLOR),
        shaderConfig: ROOF_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_TILE_COLOR),
};

const roofFlatTileMaterialConfig: TYPES.MaterialShaderConfig = {
        materialId: getMaterialId('standard', COLORS.ROOF_FLAT_TILE_COLOR),
        shaderConfig: ROOF_FLAT_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_FLAT_TILE_COLOR),
};

const roofNorfolkTileMaterialConfig: TYPES.MaterialShaderConfig = {
        materialId: getMaterialId('standard', COLORS.ROOF_NORFOLK_TILE_COLOR),
        shaderConfig: ROOF_NORFOLK_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_NORFOLK_TILE_COLOR),
};

const roofMaterialConfigs = [roofTileMaterialConfig, roofFlatTileMaterialConfig, roofNorfolkTileMaterialConfig];

const chimneyRoofMaterialConfig = {
    materialId: getMaterialId('standard', COLORS.ROOF_TILE_COLOR),
    shaderConfig: null,
};

const brickChimneyMaterialConfig: TYPES.MaterialShaderConfig = {
    materialId: getMaterialId('standard', COLORS.BRICK_COLOR_RED),
    shaderConfig: null,
};

const smallChimneyMaterialConfigs: TYPES.MaterialShaderConfig[] = [
    brickChimneyMaterialConfig,
    flatMetalMaterialConfig,
    shinyMetalMaterialConfig
];

const betonMaterialConfig: TYPES.MaterialShaderConfig = {
    materialId: getMaterialId('standard', COLORS.BETON_COLOR),
    shaderConfig: null,
};

const chimneyRoofMaterialConfis = [chimneyRoofMaterialConfig, flatMetalMaterialConfig, shinyMetalMaterialConfig];

export const materialShaderConfigs: Record<string, () => TYPES.MaterialShaderConfig> = {
    ROOF_MATERIAL: () => randomFromArray(roofMaterialConfigs),
    HOUSE_MATERIAL: () => randomFromArray(houseMaterialConfigs),
    WINDOW_FRAME_MATERIAL: () => ({
        materialId: getMaterialId('standard', COLORS.WINDOW_FRAME_COLOR),
        shaderConfig: null,
    }),
    LAWN_MATERIAL: () => ({
        materialId: getMaterialId('standard', COLORS.GRASS_COLOR_FRESH),
        shaderConfig: GRASS_SHADER.getShaderMaterialConfig(COLORS.GRASS_COLOR_FRESH),
    }),
    FLAT_METAL_MATERIAL: () => flatMetalMaterialConfig,
    SHINY_METAL_MATERIAL: () => shinyMetalMaterialConfig,
    SMALL_CHIMNEY_MATERIAL: () => randomFromArray(smallChimneyMaterialConfigs),
    CHIMNEY_ROOF_MATERIAL: () => randomFromArray(chimneyRoofMaterialConfis), 
    BETON_MATERIAL: () => betonMaterialConfig,
    GARDEN_WALL_MATERIAL: () => ({
        materialId: getMaterialId('standard', COLORS.BRICK_COLOR_GARDEN_WALL),
        shaderConfig: BRICK_SHADER.getShaderMaterialConfig(COLORS.BRICK_COLOR_GARDEN_WALL),
    }),
    BALCONY_RAILING_MATERIAL: () => flatMetalMaterialConfig,
    BALCONY_FLOOR_MATERIAL: () => betonMaterialConfig,
    ROOF_GUTTER_MATERIAL: () => flatMetalMaterialConfig,
    PLASTIC_MATERIAL: () => ({
        materialId: getMaterialId('standard', COLORS.PLASTIC_COLOR),
        shaderConfig: null,
    }),
    WALLPAPER_MATERIAL: () => ({
        materialId: getMaterialId('standard', COLORS.WALLPAPER_COLOR),
        shaderConfig: null,
    }),
    ANTENNA_MATERIAL: () => flatMetalMaterialConfig,
    WALL_LIGHT_MATERIAL_COMMON: () => ({
        materialId: getMaterialId('basic', randomFromArray(COLORS.LIGHT_COLORS_COMMON)),
        shaderConfig: null,
    }),
    WALL_LIGHT_MATERIAL_RARE: () => ({
        materialId: getMaterialId('basic', COLORS.getRandomHueColor(0.8)),
        shaderConfig: null,
    }),
    WINDOW_PANE_MATERIAL: () => ({
        materialId: getMaterialId('pane', COLORS.PANE_COLOR),
        shaderConfig: null,
    }),
    WINDOW_PANE_HIGHLIGHT_MATERIAL: () => ({
        materialId: getMaterialId('paneHighlight', COLORS.PANE_HIGHLIGHT_COLOR),
        shaderConfig: null,
    }),
    LEAF_MATERIAL: () => ({
        materialId: getMaterialId('vertex', COLORS.TREE_LEAF_COLOR),
        shaderConfig: null,
    }),
    BARK_MATERIAL: () => ({
        materialId: getMaterialId('standard', COLORS.TREE_BARK_COLOR),
        shaderConfig: null,
    }),

};

export const getMaterialFromId = (id: string = ""): THREE.Material => {
    const { material, color } = parseID(id) || { material: null, color: null };
    switch (material) {
        case 'standard':
            return standardMaterialRegistery(color !== null ? color : COLORS.MISSING_COLOR);
        case 'pane':
            return PANE_MATERIAL;
        case 'paneHighlight':
            return PANE_HIGHLIGHT_MATERIAL;
        case 'shinyMetal':
            return SHINY_METAL_MATERIAL;
        case 'basic':
            return basicMaterialRegistery(color !== null ? color : COLORS.MISSING_COLOR);
        case 'vertex':
            return VERTEX_MATERIAL;
        default:
            console.log("Unknown material ID:", id);
            return standardMaterialRegistery(color !== null ? color : COLORS.MISSING_COLOR);
    }
}

function createGradientMap(steps: number) {
    if (steps < 2) {throw new Error('steps must be at least 2');}

    const data = new Uint8Array(steps);

    for (let i = 0; i < steps; i++) {
        data[i] = Math.round((i / (steps - 1)) * 255);
    }

    const texture = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);

    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return texture;
}

const standardMaterials: Record<string, THREE.Material> = {};

function standardMaterialRegistery(color: THREE.Color | string | number): THREE.MeshStandardMaterial {
    const threeColor = new THREE.Color(color);
    const colorKey = threeColor.getHexString();
    if (!standardMaterials[colorKey]) {
        standardMaterials[colorKey] = new THREE.MeshPhongMaterial({
            color: threeColor,
            side: THREE.DoubleSide,
        });
    }
    return standardMaterials[colorKey] as THREE.MeshStandardMaterial;
}

const basicMaterials: Record<string, THREE.Material> = {};

function basicMaterialRegistery(color: THREE.Color | string | number): THREE.MeshBasicMaterial {
    const threeColor = new THREE.Color(color);
    const colorKey = threeColor.getHexString();
    if (!basicMaterials[colorKey]) {
        basicMaterials[colorKey] = new THREE.MeshBasicMaterial({
            color: threeColor,
            side: THREE.DoubleSide
        });
    }
    return basicMaterials[colorKey] as THREE.MeshBasicMaterial;
}

const PANE_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: COLORS.PANE_COLOR,
  transmission: 0.95, // High transmission for clarity
  opacity: 1,
  metalness: 0,
  roughness: 0, // Perfectly smooth
  envMapIntensity: 1 // Crucial for looking like glass
});

const PANE_HIGHLIGHT_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: COLORS.PANE_HIGHLIGHT_COLOR,
  transmission: 0.8,
  opacity: 1,
  metalness: 0,
  roughness: 0, // Perfectly smooth
  envMapIntensity: 1 // Crucial for looking like glass
});

const SHINY_METAL_MATERIAL = new THREE.MeshStandardMaterial({
    color: COLORS.METAL_MATERIAL_COLOR,
    metalness: 1,
    roughness: 0.2,
    side: THREE.DoubleSide
});

const VERTEX_MATERIAL = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide
});