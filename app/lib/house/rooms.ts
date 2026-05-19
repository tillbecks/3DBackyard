import * as TYPES from '../../types/typeIndex';
import * as HC from '../config/houseConfig';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { randomInRangeInt } from '../config/utils';
import { generateLightConfig, generateStairLightConfig } from './lights';

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

    get3DObject(): TYPES.ObjectLightReturn {
        const roomGeometries = [];
        const windowSeparatorsX = this.wallInfo.wallsX;
        const windowSeperatorsXRight = this.wallInfo.wallsRightX;
        const wallPositioning = randomInRangeInt(0, Math.pow(2, windowSeparatorsX.length));
        const wallPositioningRight = randomInRangeInt(0, Math.pow(2, windowSeperatorsXRight.length));
        const roomHeight = this.storyHeight - HC.FLOOR_THICKNESS;
        const roomDepth = this.houseDepth - 2 * HC.WALL_THICKNESS;

        const storyRoomGeometries = [];
        let leftX = -this.houseWidth/2 + HC.WALL_THICKNESS;
        let rightX = 0;
        
        const lights = [];
        
        for(let i = 0; i < windowSeparatorsX.length; i++){
            if((wallPositioning & (1 << i)) != 0){
                rightX = windowSeparatorsX[i] - HC.WALL_THICKNESS/2;
                const roomWidth = rightX - leftX;
                const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
                const translationX =leftX + roomWidth/2;
                roomGeometry.translate(translationX, 0, 0);
                //storyRooms.add(new THREE.Mesh(roomGeometry));
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
                    //storyRooms.add(new THREE.Mesh(roomGeometry));
                    storyRoomGeometries.push(roomGeometry);
                    leftX = windowSeperatorsXRight[i] + HC.WALL_THICKNESS/2;
                }
            }        
            
            rightX = this.houseWidth/2 - HC.WALL_THICKNESS;
            const roomWidth = rightX - leftX;
            const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
            roomGeometry.translate(leftX + roomWidth/2, 0, 0);
            //storyRooms.add(new THREE.Mesh(roomGeometry));
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
                const roomLights = generateLightConfig(position, geom.boundingBox?.getSize(new THREE.Vector3()) ?? new THREE.Vector3());
                //const mesh = new THREE.Mesh(geom);
                story.push(geom);
                lights.push(...roomLights);
                
            }
            roomGeometries.push(...story);
        } 

        if(this.wallInfo.type == HC.WINDOW_SPACING_SCHEME.BREAK_MIDDLE){
            const stairRoomWidth = this.gapMiddle;
            const stairRoomHeight = this.storyCount * this.storyHeight - HC.FLOOR_THICKNESS * 2;
            const stairRoomGeometry = new THREE.BoxGeometry(stairRoomWidth, stairRoomHeight, roomDepth);
            stairRoomGeometry.translate(this.stairPosition, 0, 0);
            const stairLights = generateStairLightConfig(new THREE.Vector3(this.stairPosition, 0, 0), new THREE.Vector3(stairRoomWidth, stairRoomHeight, roomDepth), this.storyCount);
            lights.push(...stairLights);
            roomGeometries.push(stairRoomGeometry);
        }

        const mergedRoomGeometry = BufferGeometryUtils.mergeGeometries(roomGeometries);
        const roomsGroup = new THREE.Group();
        roomsGroup.add(new THREE.Mesh(mergedRoomGeometry));
        return {object: roomsGroup, lights: lights};
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