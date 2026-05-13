import * as THREE from 'three';

export const PANE_COLOR = 0xffffff;
export const PANE_HIGHLIGHT_COLOR = 0xffff99;

export const WINDOW_FRAME_COLOR = 0xffffff;

export const BRICK_COLOR_RED = 0x7e3729; //"#7e3729"
export const BRICK_COLOR_SANDSTONE = 0xb6a37b; //"#b6a37b"

export const ROOF_TILE_COLOR = 0x4d4d4d; //"#4d4d4d"
export const ROOF_FLAT_TILE_COLOR = 0x814034; //"#814034"
export const ROOF_NORFOLK_TILE_COLOR = 0x815328; //"#815328"

export function hexNumberToVec3(hex: number): THREE.Vector3 {
    const r = ((hex >> 16) & 0xFF) / 255;
    const g = ((hex >> 8) & 0xFF) / 255;
    const b = (hex & 0xFF) / 255;
    return new THREE.Vector3(r, g, b);
}   