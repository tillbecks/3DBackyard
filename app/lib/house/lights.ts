import { LIGHT_COLORS_COMMON } from "../textures/colors";
import * as THREE from 'three';
import { LightConfig } from "../../types/houseTypes";
import * as HC from "../config/houseConfig";
import { randomBoolean, randomFromArray, randomInRangeFloat, randomInRangeInt } from "../config/utils";

export function generateLightConfig(roomPosition: THREE.Vector3, roomSize: THREE.Vector3): LightConfig[] {
    const cubicUnits = roomSize.x * roomSize.y * roomSize.z;
    const count = Math.max(Math.floor(randomInRangeFloat(cubicUnits * HC.LIGHTS_PER_CUBIC_UNIT_MIN, cubicUnits * HC.LIGHTS_PER_CUBIC_UNIT_MAX)), HC.LIGHTS_PER_ROOM_MIN);

    const lights: LightConfig[] = [];
    for (let i = 0; i < count; i++) {
        lights.push({
            color: randomBoolean(HC.LIGHT_UNUSUAL_COLOR_PROBABILITY) ? unusualColorGenerator() : randomFromArray(LIGHT_COLORS_COMMON),
            intensity: randomInRangeFloat(HC.LIGHT_INTENSITY_MIN, HC.LIGHT_INTENSITY_MAX),
            position: randomRoomPosition(roomSize).add(roomPosition),
            initTurnedOn: randomBoolean(),
            timer: 0,
            translate: function(position: THREE.Vector3) {
                this.position.add(position);
            }
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
            timer: randomInRangeInt(HC.STAIR_LIGHT_TIMER_MIN, HC.STAIR_LIGHT_TIMER_MAX),
            translate: function(position: THREE.Vector3) {
                this.position.add(position);
            }
        })
    }
    return stairLights;
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