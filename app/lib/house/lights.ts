import * as THREE from 'three';

import * as HC from "@/app/lib/config/houseConfig";

import { LIGHT_COLORS_COMMON } from "@/app/lib/textures/colors";
import { LightConfig } from "@/app/types/houseTypes";
import { randomBoolean, randomFromArray, randomInRangeFloat, randomInRangeInt } from "@/app/lib/config/utils";

export function generateLightConfig(roomPosition: THREE.Vector3, roomSize: THREE.Vector3): LightConfig[] {
    const cubicUnits = roomSize.x * roomSize.y * roomSize.z;
    const count = Math.max(Math.floor(randomInRangeFloat(cubicUnits * HC.LIGHTS_PER_CUBIC_UNIT_MIN, cubicUnits * HC.LIGHTS_PER_CUBIC_UNIT_MAX)), HC.LIGHTS_PER_ROOM_MIN);

    const lights: LightConfig[] = [];
    for (let i = 0; i < count; i++) {
        lights.push({
            color: randomBoolean(HC.LIGHT_UNUSUAL_COLOR_PROBABILITY) ? unusualColorGenerator() : randomFromArray(LIGHT_COLORS_COMMON),
            intensity: randomInRangeFloat(HC.LIGHT_INTENSITY_MIN, HC.LIGHT_INTENSITY_MAX),
            position: randomRoomPosition(roomSize).add(roomPosition),
            initTurnedOn: randomBoolean(HC.LIGHT_TURNED_ON_PROBABILITY),
            timer: 0
        });
    }
    return lights;
}

export function generateStairLightConfig(roomPosition: THREE.Vector3, roomSize: THREE.Vector3, floors: number): LightConfig[] {
    const stairLights: LightConfig[] = [];
    const floorHeight = roomSize.y / floors;
    for (let i = 0; i < floors; i++) {
        stairLights.push({
            color: randomFromArray(LIGHT_COLORS_COMMON),
            intensity: HC.STAIR_LIGHT_INTENSITY,
            position: new THREE.Vector3(roomPosition.x + roomSize.x / 3, roomPosition.y - roomSize.y / 2 + (i * floorHeight) + floorHeight / 2, roomPosition.z),
            initTurnedOn: false,
            timer: randomInRangeInt(HC.STAIR_LIGHT_TIMER_MIN, HC.STAIR_LIGHT_TIMER_MAX)
        })
    }
    return stairLights;
}

export function translateLightConfigs(lights: LightConfig[] | LightConfig, translation: THREE.Vector3) {
    (Array.isArray(lights) ? lights : [lights]).forEach(light => light.position.add(translation));
}

export function translateXLightConfigs(lights: LightConfig[] | LightConfig, xTranslation: number) {
    (Array.isArray(lights) ? lights : [lights]).forEach(light => light.position.x += xTranslation);
}

export function translateYLightConfigs(lights: LightConfig[] | LightConfig, yTranslation: number) {
    (Array.isArray(lights) ? lights : [lights]).forEach(light => light.position.y += yTranslation);
}

export function translateZLightConfigs(lights: LightConfig[] | LightConfig, zTranslation: number) {
    (Array.isArray(lights) ? lights : [lights]).forEach(light => light.position.z += zTranslation);
}

function unusualColorGenerator(): number {
    const color = new THREE.Color();
    color.setHSL(Math.random(), 1, 1);
    return color.getHex();
}

function randomRoomPosition(roomSize: THREE.Vector3): THREE.Vector3 {
    const size = new THREE.Vector3();
    roomSize.copy(size);
    size.sub(new THREE.Vector3(HC.LIGHT_DISTANCE_TO_WALL * 2, HC.LIGHT_DISTANCE_TO_WALL * 2, HC.LIGHT_DISTANCE_TO_WALL * 2));
    return new THREE.Vector3(
        randomInRangeFloat(-size.x / 2, size.x / 2),
        randomInRangeFloat(-size.y / 2, size.y / 2),
        randomInRangeFloat(-size.z / 2, size.z / 2)
    );
}