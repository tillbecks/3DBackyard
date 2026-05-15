import * as TYPES from '../../types/typeIndex';
import * as HC from '../config/houseConfig';
import * as THREE from 'three';
import { randomInRangeInt } from '../config/utils';

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

    get3DObject(): THREE.Group {
        const rooms: THREE.Group = new THREE.Group();

        const windowSeparatorsX = this.wallInfo.wallsX;
        const wallPositioning = randomInRangeInt(0, Math.pow(2, windowSeparatorsX.length));
        const roomHeight = this.storyHeight - HC.FLOOR_THICKNESS;
        const roomDepth = this.houseDepth - 2 * HC.WALL_THICKNESS;

        const storyRooms: THREE.Group = new THREE.Group();
        let leftX = -this.houseWidth/2 + HC.WALL_THICKNESS;
        let rightX = 0;

        for(let i = 0; i < windowSeparatorsX.length; i++){
            if((wallPositioning & (1 << i)) == 1){
                rightX = windowSeparatorsX[i] - HC.WALL_THICKNESS/2;
                const roomWidth = rightX - leftX;
                const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
                roomGeometry.translate(leftX + roomWidth/2, 0, 0);
                storyRooms.add(new THREE.Mesh(roomGeometry));
                leftX = windowSeparatorsX[i] + HC.WALL_THICKNESS/2;
            }
            if(i == windowSeparatorsX.length - 1){
                if(this.wallInfo.type == HC.WINDOW_SPACING_SCHEME.BREAK_MIDDLE){
                    rightX = - (HC.WALL_THICKNESS + this.gapMiddle/2 - this.stairPosition);
                }else{
                    rightX = this.houseWidth/2 - HC.WALL_THICKNESS;
                }
                const roomWidth = rightX - leftX;
                const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
                roomGeometry.translate(leftX + roomWidth/2, 0, 0);
                storyRooms.add(new THREE.Mesh(roomGeometry));
            }
        }

        if(this.wallInfo.type == HC.WINDOW_SPACING_SCHEME.BREAK_MIDDLE){
            leftX = HC.WALL_THICKNESS + this.gapMiddle/2 + this.stairPosition;

            for(let i = 0; i < this.wallInfo.wallsRightX.length; i++){
                if((wallPositioning & (1 << (i + windowSeparatorsX.length))) == 1){
                    rightX = this.wallInfo.wallsRightX[i] - HC.WALL_THICKNESS/2;
                    const roomWidth = rightX - leftX;
                    const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
                    roomGeometry.translate(leftX + roomWidth/2, 0, 0);
                    storyRooms.add(new THREE.Mesh(roomGeometry));
                    leftX = this.wallInfo.wallsRightX[i] + HC.WALL_THICKNESS/2;
                }
                if(i == this.wallInfo.wallsRightX.length - 1){
                    rightX = this.houseWidth/2 - HC.WALL_THICKNESS;
                    const roomWidth = rightX - leftX;
                    const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
                    roomGeometry.translate(leftX + roomWidth/2, 0, 0);
                    storyRooms.add(new THREE.Mesh(roomGeometry));
                }
            }        
        }    

        const generalYTranslation =  - this.storyHeight/2 - HC.FLOOR_THICKNESS + this.storyCount * this.storyHeight/2;
        for(let i = 0; i < this.storyCount; i++){
            const story: THREE.Group = new THREE.Group();
            for(const child of storyRooms.children){
                if(child instanceof THREE.Mesh){
                    const geom = child.geometry.clone();
                    geom.translate(0, i * this.storyHeight - generalYTranslation , 0);
                    const mesh = new THREE.Mesh(geom);
                    story.add(mesh);
                }
            }
            rooms.add(story);
        } 

        if(this.wallInfo.type == HC.WINDOW_SPACING_SCHEME.BREAK_MIDDLE){
            const stairRoomWidth = this.gapMiddle;
            const stairRoomGeometry = new THREE.BoxGeometry(stairRoomWidth, this.storyCount * this.storyHeight - HC.FLOOR_THICKNESS * 2, roomDepth);
            stairRoomGeometry.translate(this.stairPosition, 0, 0);
            rooms.add(new THREE.Mesh(stairRoomGeometry));
        }

        return rooms;
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