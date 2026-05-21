import * as THREE from 'three';
import { mx_bilerp_0 } from 'three/src/nodes/materialx/lib/mx_noise.js';

export const PANE_COLOR = 0xffffff;
export const PANE_HIGHLIGHT_COLOR = 0xffff99;

export const WINDOW_FRAME_COLOR = 0xffffff;

export const BRICK_COLOR_RED = 0x7e3729; //"#7e3729"
export const BRICK_COLOR_SANDSTONE = 0xb6a37b; //"#b6a37b"

export const HOUSE_PLASTER_COLOR = [0xd9d9d9, 0xca7514, 0xdfa917]; //["#d9d9d9", "#ccac88", "#e2d09f"]

export const ROOF_TILE_COLOR = 0x4d4d4d; //"#4d4d4d"
export const ROOF_FLAT_TILE_COLOR = 0x814034; //"#814034"
export const ROOF_NORFOLK_TILE_COLOR = 0x815328; //"#815328"

export function hexNumberToVec3(hex: number): THREE.Vector3 {
    const r = ((hex >> 16) & 0xFF) / 255;
    const g = ((hex >> 8) & 0xFF) / 255;
    const b = (hex & 0xFF) / 255;
    return new THREE.Vector3(r, g, b);
}   

export const GRASS_COLOR_FRESH = 0x043605; //"#043605"

export const METAL_MATERIAL_COLOR = 0x999999; //"#999999"

export const BETON_COLOR = 0x797878; //"#797878"

export const TREE_BARK_COLOR = 0x5a3e1b; //"#5a3e1b"

export const TREE_LEAF_COLOR = 0x228B22; //"#228B22"

export const LIGHT_COLORS_COMMON = [0xffffff, 0xffee88, 0xffdd55, 0xffffaa]; //[ "#ffffff", "#fff3ae", "#fada59", "#ffffaa"]