import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

//import { generateLightConfig, generateStairLightConfig } from './lights';

import * as TYPES from '@/app/types/typeIndex';
import * as HC from '@/app/lib/config/houseConfig';
import {turnOnOffProbs} from '@/app/lib/config/lightConfig';
import { randomBoolean, randomInRangeFloat, randomInRangeInt } from '@/app/lib/config/utils';
import { getWallLightMaterialCommon, getWallLightMaterialRare } from '@/app/lib/materials/materials';
import { makeUnmergeable } from '../config/meshMaterialMerger';

export class Rooms{
    storyCount: number;
    storyHeight: number;
    houseWidth: number;
    houseDepth: number;
    gapMiddle: number;
    stairPosition: number;
    wallInfo: TYPES.WallPositions;

    constructor(storyCount: number, storyHeight: number, houseWidth: number, houseDepth: number, windowInfo: TYPES.WindowPositions){
        this.storyCount = storyCount;
        this.storyHeight = storyHeight;
        this.houseWidth = houseWidth;
        this.houseDepth = houseDepth;
        this.gapMiddle = houseWidth * HC.WINDOW_BREAK_SCHEME_DIST_PERCENTAGE + windowInfo.windowWidth;
        this.stairPosition = windowInfo.stairX;
        this.wallInfo = windowToWallPositions(windowInfo);
    }

    get3DObject(getId: () => string): TYPES.RoomLightReturn {
        const roomGeometries = [];
        const windowSeparatorsX = this.wallInfo.wallsX;
        const windowSeperatorsXRight = this.wallInfo.wallsRightX;
        const wallPositioning = randomInRangeInt(0, Math.pow(2, windowSeparatorsX.length));
        const wallPositioningRight = randomInRangeInt(0, Math.pow(2, windowSeperatorsXRight.length));
        const roomHeight = this.storyHeight - HC.FLOOR_THICKNESS - this.storyHeight * HC.BALCONY_DOOR_START_BOTTOM;
        const roomDepth = this.houseDepth - 2 * HC.WALL_THICKNESS;

        const storyRoomGeometries = [];
        let leftX = -this.houseWidth/2 + HC.WALL_THICKNESS;
        let rightX = 0;
        
        //const lights = [];
        const wallLights: THREE.Mesh []= [];
        const wallLightConfigs: TYPES.LightConfig[] = [];
        
        for(let i = 0; i < windowSeparatorsX.length; i++){
            if((wallPositioning & (1 << i)) != 0){
                rightX = windowSeparatorsX[i] - HC.WALL_THICKNESS/2;
                const roomWidth = rightX - leftX;
                const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
                const translationX =leftX + roomWidth/2;
                roomGeometry.translate(translationX, 0, 0);
                storyRoomGeometries.push(roomGeometry);
                leftX = windowSeparatorsX[i] + HC.WALL_THICKNESS/2;
            }
        }

        if(this.wallInfo.type == HC.WINDOW_SPACING_SCHEME.BREAK_MIDDLE){
            rightX = - (HC.WALL_THICKNESS + this.gapMiddle/2 - this.stairPosition);
        }else{
            rightX = this.houseWidth/2 - HC.WALL_THICKNESS;
        }
        const roomWidth = rightX - leftX;
        const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
        roomGeometry.translate(leftX + roomWidth/2, 0, 0);
        //storyRooms.add(new THREE.Mesh(roomGeometry));
        storyRoomGeometries.push(roomGeometry);
        if(this.wallInfo.type == HC.WINDOW_SPACING_SCHEME.BREAK_MIDDLE){
            leftX = HC.WALL_THICKNESS + this.gapMiddle/2 + this.stairPosition;

            for(let i = 0; i < windowSeperatorsXRight.length; i++){
                if((wallPositioningRight & (1 << (i + windowSeperatorsXRight.length))) != 0){
                    rightX = windowSeperatorsXRight[i] - HC.WALL_THICKNESS/2;
                    const roomWidth = rightX - leftX;
                    const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
                    roomGeometry.translate(leftX + roomWidth/2, 0, 0);
                    storyRoomGeometries.push(roomGeometry);
                    leftX = windowSeperatorsXRight[i] + HC.WALL_THICKNESS/2;
                }
            }        
            
            rightX = this.houseWidth/2 - HC.WALL_THICKNESS;
            const roomWidth = rightX - leftX;
            const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
            roomGeometry.translate(leftX + roomWidth/2, 0, 0);
            storyRoomGeometries.push(roomGeometry);
        }    

        const generalYTranslation =  - this.storyHeight/2 + this.storyCount * this.storyHeight/2 - this.storyHeight * HC.BALCONY_DOOR_START_BOTTOM;
        for(let i = 0; i < this.storyCount; i++){
            const story = [];
            for(const room of storyRoomGeometries){
                const geom = room.clone();
                const yTransition = i * this.storyHeight - generalYTranslation;
                geom.translate(0, yTransition , 0);
                geom.computeBoundingBox();
                const position = new THREE.Vector3();
                geom.boundingBox!.getCenter(position);

                story.push(geom);
                const wallLight = createLightWalls(geom, getId);
                wallLights.push(wallLight.wallLight);
                wallLightConfigs.push(wallLight.lightConfig);
                
            }
            roomGeometries.push(...story);
        } 

        if(this.wallInfo.type == HC.WINDOW_SPACING_SCHEME.BREAK_MIDDLE){
            const stairRoomWidth = this.gapMiddle;
            const stairRoomHeight = this.storyCount * this.storyHeight - HC.FLOOR_THICKNESS * 2;
            const stairRoomGeometry = new THREE.BoxGeometry(stairRoomWidth, stairRoomHeight, roomDepth);
            stairRoomGeometry.computeBoundingBox();
            stairRoomGeometry.translate(this.stairPosition, 0, 0);
            
            const wallLight = createLightWalls(stairRoomGeometry, getId, true);
            wallLights.push(wallLight.wallLight);
            wallLightConfigs.push(wallLight.lightConfig);
            roomGeometries.push(stairRoomGeometry);
        }

        const mergedRoomGeometry = BufferGeometryUtils.mergeGeometries(roomGeometries);
        const roomsGroup = new THREE.Group();
        roomsGroup.add(new THREE.Mesh(mergedRoomGeometry));
        return {object: roomsGroup, lightConfigs: wallLightConfigs, wallLights: wallLights};
    }
}

function windowToWallPositions(windowPositions: TYPES.WindowPositions){
    const wallPositionsX = [];
    const wallPositionsRightX = [];

    for(let i = 0; i < windowPositions.windowsX.length - 1; i++){
        wallPositionsX.push((windowPositions.windowsX[i] + windowPositions.windowsX[i+1])/2);
    }

    for(let i = 0; i < windowPositions.windowsRightX.length - 1; i++){
        wallPositionsRightX.push((windowPositions.windowsRightX[i] + windowPositions.windowsRightX[i+1])/2);
    }

    return {type: windowPositions.type, wallsX: wallPositionsX, wallsRightX: wallPositionsRightX};
}

function createRoomWallGeometries(geom: THREE.BoxGeometry): THREE.BufferGeometry {
    if(!geom.boundingBox) geom.computeBoundingBox();
    const walls = [];
    const size = geom.boundingBox?.getSize(new THREE.Vector3()) ?? new THREE.Vector3();
    const center = new THREE.Vector3();
    geom.boundingBox?.getCenter(center);
    const wallThickness = 0.1;

    // Floor
    const floorGeom = new THREE.BoxGeometry(size.x, wallThickness, size.z);
    floorGeom.translate(center.x, center.y - size.y/2 + wallThickness, center.z);
    walls.push(floorGeom);

    // Ceiling
    const ceilingGeom = new THREE.BoxGeometry(size.x, wallThickness, size.z);
    ceilingGeom.translate(center.x, center.y + size.y/2 - wallThickness, center.z);
    walls.push(ceilingGeom);

    // Left Wall
    const leftWallGeom = new THREE.BoxGeometry(wallThickness, size.y, size.z);
    leftWallGeom.translate(center.x - size.x/2 + wallThickness, center.y, center.z);
    walls.push(leftWallGeom);

    // Right Wall
    const rightWallGeom = new THREE.BoxGeometry(wallThickness, size.y, size.z);
    rightWallGeom.translate(center.x + size.x/2 - wallThickness, center.y, center.z);
    walls.push(rightWallGeom);

    // Back Wall
    const backWallGeom = new THREE.BoxGeometry(size.x, size.y, wallThickness);
    backWallGeom.translate(center.x, center.y, center.z - size.z/2 + wallThickness);
    walls.push(backWallGeom);

    return BufferGeometryUtils.mergeGeometries(walls) || new THREE.BufferGeometry();
}

function createLightWalls(geom: THREE.BoxGeometry, getId: () => string, isStair?: boolean): TYPES.WallLightReturn{
    const wallsGeom = createRoomWallGeometries(geom);
    const wallsMesh = new THREE.Mesh(wallsGeom);

    const ligthness = randomInRangeFloat(HC.LIGHT_INTENSITY_MIN, HC.LIGHT_INTENSITY_MAX);
    if(randomBoolean(HC.LIGHT_UNUSUAL_COLOR_PROBABILITY)){
        const material = getWallLightMaterialRare(ligthness);
        wallsMesh.material = material;
    }else{
        const material = getWallLightMaterialCommon(ligthness);
        wallsMesh.material = material;
    }

    wallsMesh.name = HC.LIGHT_ID_PREFIX + getId();
    makeUnmergeable(wallsMesh);

    const timer = isStair ? randomInRangeInt(HC.STAIR_LIGHT_TIMER_MIN, HC.STAIR_LIGHT_TIMER_MAX) : 0;

    const turnedOn = isStair ? false : randomBoolean(turnOnOffProbs[new Date().getHours()].on);

    const lightConfig: TYPES.LightConfig = {
        name: wallsMesh.name,
        initTurnedOn: turnedOn,
        timer: timer
    };

    return {wallLight: wallsMesh, lightConfig: lightConfig};
}
