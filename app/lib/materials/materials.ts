import * as THREE from 'three';

import * as COLORS from './colors';
import { BRICK_SHADER, ROOF_TILE_SHADER, ROOF_FLAT_TILE_SHADER, ROOF_NORFOLK_TILE_SHADER, GRASS_SHADER } from './shader/shaderConfig';

import * as TYPES from '@/app/types/typeIndex';
import { randomFromArray } from '../config/utils';
import { color } from 'three/tsl';

function createToonMaterial(color: THREE.Color | string | number): THREE.MeshStandardMaterial {
    const threeColor = typeof color === "string" ? new THREE.Color(color) : color;
    return new THREE.MeshStandardMaterial({
        color: threeColor,
        side: THREE.DoubleSide,
        roughness: 0.95
    });
}

export const PANE_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: COLORS.PANE_COLOR,
  transmission: 0.95, // High transmission for clarity
  opacity: 1,
  metalness: 0,
  roughness: 0, // Perfectly smooth
  envMapIntensity: 1 // Crucial for looking like glass
});

export const PANE_HIGHLIGHT_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: COLORS.PANE_HIGHLIGHT_COLOR,
  transmission: 0.8,
  opacity: 1,
  metalness: 0,
  roughness: 0, // Perfectly smooth
  envMapIntensity: 1 // Crucial for looking like glass
});

export const WINDOW_FRAME_NORMAL_MATERIAL = createToonMaterial(COLORS.WINDOW_FRAME_COLOR);


const BRICK_MATERIAL_RED = createToonMaterial(COLORS.BRICK_COLOR_RED);
const BRICK_MATERIAL_SANDSTONE = createToonMaterial(COLORS.BRICK_COLOR_SANDSTONE);
const BRICK_MATERIAL_PLASTER = COLORS.HOUSE_PLASTER_COLOR.map(color => createToonMaterial(color));

export function getHouseMaterials(): Record<string, TYPES.MaterialMix> {
  const materials: Record<string, TYPES.MaterialMix> = {
    brickMaterialRed: {standardMaterial: BRICK_MATERIAL_RED, shaderMaterial: BRICK_SHADER.getShaderMaterialConfig( COLORS.BRICK_COLOR_RED)},
    brickMaterialSandstone: {standardMaterial: BRICK_MATERIAL_SANDSTONE, shaderMaterial: BRICK_SHADER.getShaderMaterialConfig(COLORS.BRICK_COLOR_SANDSTONE)},
  };

  BRICK_MATERIAL_PLASTER.forEach((material, index) => {
    const key = `plasterMaterial${index}`;
    materials[key] = {standardMaterial: material, shaderMaterial: null};
  });
  return materials;
}

const ROOF_TILE_MATERIAL = createToonMaterial(COLORS.ROOF_TILE_COLOR);
const ROOF_FLAT_TILE_MATERIAL = createToonMaterial(COLORS.ROOF_FLAT_TILE_COLOR);
const ROOF_NORFOLK_TILE_MATERIAL = createToonMaterial(COLORS.ROOF_NORFOLK_TILE_COLOR);

export function getRoofMaterials(): Record<string, TYPES.MaterialMix> {
    return {
        roofTileMaterial: {standardMaterial: ROOF_TILE_MATERIAL, shaderMaterial: ROOF_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_TILE_COLOR)},
        roofFlatTileMaterial: {standardMaterial: ROOF_FLAT_TILE_MATERIAL, shaderMaterial: ROOF_FLAT_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_FLAT_TILE_COLOR)},
        roofNorfolkTileMaterial: {standardMaterial: ROOF_NORFOLK_TILE_MATERIAL, shaderMaterial: ROOF_NORFOLK_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_NORFOLK_TILE_COLOR)},
    }
}

const LAWN_MATERIAL = createToonMaterial(COLORS.GRASS_COLOR_FRESH);

export const LAWN_MIX_MATERIAL = {standardMaterial: LAWN_MATERIAL, shaderMaterial: GRASS_SHADER.getShaderMaterialConfig(COLORS.GRASS_COLOR_FRESH)};

const FLAT_METAL_MATERIAL = createToonMaterial(COLORS.METAL_MATERIAL_COLOR);
const SHINY_METAL_MATERIAL = new THREE.MeshStandardMaterial({color: COLORS.METAL_MATERIAL_COLOR, roughness: 0.2, metalness: 0.9, side: THREE.DoubleSide});

const SMALL_CHIMNEY_BRICK_MATERIAL = createToonMaterial(COLORS.BRICK_COLOR_RED);

const CHIMNEY_ROOF_MATERIAL = createToonMaterial(COLORS.ROOF_TILE_COLOR);

const BETON_MATERIAL = createToonMaterial(COLORS.BETON_COLOR);

export function getAntennaMaterial(): TYPES.MaterialMix{
    return {standardMaterial: FLAT_METAL_MATERIAL, shaderMaterial: null}
}

export function getChimneyMaterials(): Record<string, TYPES.MaterialMix> {
    return {
        brickChimney : {standardMaterial: SMALL_CHIMNEY_BRICK_MATERIAL, shaderMaterial: null},
        metalChimneyFlat : {standardMaterial: FLAT_METAL_MATERIAL, shaderMaterial: null},
        metalChimneyShiny : {standardMaterial: SHINY_METAL_MATERIAL, shaderMaterial: null},
    }
}

export function getChimneyRoofMaterial(): Record<string, TYPES.MaterialMix> {
    return {
      greyMaterial: { standardMaterial: CHIMNEY_ROOF_MATERIAL, shaderMaterial: null},
      shinyMaterial: { standardMaterial: SHINY_METAL_MATERIAL, shaderMaterial: null},
      flatMetal: { standardMaterial: FLAT_METAL_MATERIAL, shaderMaterial: null},
    }
}

export function getBetonMaterial(): TYPES.MaterialMix {
    return {standardMaterial: BETON_MATERIAL, shaderMaterial: null};
}

export function getFlatMetalMaterial(): TYPES.MaterialMix {
    return {standardMaterial: FLAT_METAL_MATERIAL, shaderMaterial: null};
}

const TREE_BARK_MATERIAL = createToonMaterial(COLORS.TREE_BARK_COLOR);

export function getTreeBarkMaterial(): TYPES.MaterialMix {
    return {standardMaterial: TREE_BARK_MATERIAL, shaderMaterial: null};
}

const TREE_LEAF_MATERIAL = createToonMaterial(new THREE.Color(COLORS.TREE_LEAF_COLOR));

export function getTreeLeafMaterial(): TYPES.MaterialMix {
    return {standardMaterial: TREE_LEAF_MATERIAL, shaderMaterial: null};
}

export function getWallLightMaterialCommon(ligthness: number): THREE.MeshBasicMaterial{
    const color = COLORS.changeColorLightness(new THREE.Color(randomFromArray(COLORS.LIGHT_COLORS_COMMON)), ligthness);
    return new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
}

export function getWallLightMaterialRare(ligthness: number): THREE.MeshBasicMaterial{
    const color = COLORS.getRandomHueColor(ligthness);
    return new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
}

export function getWallMaterial(): TYPES.MaterialMix {
    return {standardMaterial: new THREE.MeshToonMaterial({color: COLORS.BRICK_COLOR_GARDEN_WALL, side: THREE.DoubleSide}), shaderMaterial: BRICK_SHADER.getShaderMaterialConfig(COLORS.BRICK_COLOR_GARDEN_WALL)};
}

export function getBalconyRailingMaterial(): TYPES.MaterialMix {
    return {standardMaterial: FLAT_METAL_MATERIAL, shaderMaterial: null};
}

export function getBalconyFloorMaterial(): TYPES.MaterialMix {
    return {standardMaterial: BETON_MATERIAL, shaderMaterial: null};
}

export function getRoofGutterMaterial(): TYPES.MaterialMix {
    return {standardMaterial: FLAT_METAL_MATERIAL, shaderMaterial: null};
}