import * as THREE from 'three';

export const PANE_COLOR = 0xffffff;
export const PANE_HIGHLIGHT_COLOR = 0xffff99;

export const WINDOW_FRAME_COLOR = 0xffffff;

export const BRICK_COLOR_RED = 0x7e3729; //"#7e3729"
export const BRICK_COLOR_GARDEN_WALL = 0x382121; //"#382121"
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

export const TREE_LEAF_COLOR = 0x228B22; //"#104610"

export const LIGHT_COLORS_COMMON = [0xffffff, 0xffee88, 0xfffdea, 0xffffc3]; //[ "#ffffff", "#fff3ae", "#fffdea", "#ffffc3"]

export const getRandomHueColor = (lightness: number=1) => new THREE.Color().setHSL(Math.random(), 1, lightness);

export const changeColorLightness = (color: THREE.Color, lightness: number): number => {
    const hsl = {} as THREE.HSL;
    color.getHSL(hsl);
    return new THREE.Color().setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(lightness, 0, 1)).getHex();
}