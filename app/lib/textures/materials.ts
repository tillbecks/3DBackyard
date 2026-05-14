import * as THREE from 'three';
import * as COLORS from './colors';
import * as CONFIG from './textureConfig';
import * as TYPES from '../../types/typeIndex';
import { BRICK_SHADER, ROOF_TILE_SHADER, ROOF_FLAT_TILE_SHADER, ROOF_NORFOLK_TILE_SHADER, GRASS_SHADER } from './shader/shaderConfig';


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

export const WINDOW_FRAME_NORMAL_MATERIAL = new THREE.MeshBasicMaterial({
    color: COLORS.WINDOW_FRAME_COLOR,
});


const BRICK_MATERIAL_RED = new THREE.MeshStandardMaterial({color: COLORS.BRICK_COLOR_RED, roughness: 0.9}); 
const BRICK_MATERIAL_SANDSTONE = new THREE.MeshStandardMaterial({color: COLORS.BRICK_COLOR_SANDSTONE, roughness: 0.9}); 
const BRICK_MATERIAL_PLASTER = COLORS.HOUSE_PLASTER_COLOR.map(color => new THREE.MeshStandardMaterial({color: color, roughness: 0.9}));

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

const ROOF_TILE_MATERIAL = new THREE.MeshStandardMaterial({color: COLORS.ROOF_TILE_COLOR, roughness: 0.9, side: THREE.DoubleSide});
const ROOF_FLAT_TILE_MATERIAL = new THREE.MeshStandardMaterial({color: COLORS.ROOF_FLAT_TILE_COLOR, roughness: 0.9, side: THREE.DoubleSide}); 
const ROOF_NORFOLK_TILE_MATERIAL = new THREE.MeshStandardMaterial({color: COLORS.ROOF_NORFOLK_TILE_COLOR, roughness: 0.9, side: THREE.DoubleSide});

export function getRoofMaterials(): Record<string, TYPES.MaterialMix> {
    return {
        roofTileMaterial: {standardMaterial: ROOF_TILE_MATERIAL, shaderMaterial: ROOF_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_TILE_COLOR)},
        roofFlatTileMaterial: {standardMaterial: ROOF_FLAT_TILE_MATERIAL, shaderMaterial: ROOF_FLAT_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_FLAT_TILE_COLOR)},
        roofNorfolkTileMaterial: {standardMaterial: ROOF_NORFOLK_TILE_MATERIAL, shaderMaterial: ROOF_NORFOLK_TILE_SHADER.getShaderMaterialConfig(COLORS.ROOF_NORFOLK_TILE_COLOR)},
    }
}

const LAWN_MATERIAL = new THREE.MeshStandardMaterial({color: COLORS.GRASS_COLOR_FRESH, roughness: 1, side: THREE.DoubleSide});

export const LAWN_MIX_MATERIAL = {standardMaterial: LAWN_MATERIAL, shaderMaterial: GRASS_SHADER.getShaderMaterialConfig(COLORS.GRASS_COLOR_FRESH)};