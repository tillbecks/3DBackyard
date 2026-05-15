import * as HC from '../config/houseConfig';
import { randomInRangeInt, randomFromObject, randomBoolean } from "../config/utils";
import * as THREE from "three";
import {Brush, Evaluator, ADDITION } from 'three-bvh-csg';
import { balconyGenerator } from "./balcony";
import { PANE_MATERIAL } from '../textures/materials';
import * as TYPES from '../../types/typeIndex';

class Windows{
    windowCntPerStory: number;
    windowWidth: number;
    windowBreakingScheme: string;
    hasBalcony: boolean;
    balconyWindow: number;

    constructor(windowCntPerStory: number, windowWidth: number, windowBreakingScheme: string, hasBalcony: boolean, balconyWindow: number){
        this.windowCntPerStory = windowCntPerStory;
        this.windowWidth = windowWidth;
        this.windowBreakingScheme = windowBreakingScheme;        
        this.hasBalcony = hasBalcony;
        this.balconyWindow = balconyWindow;
    }

    get3DObject(storyCnt: number, storyHeight: number, houseWidth: number, houseDepth: number, getID: () => string): TYPES.WindowReturn{
        const windowPositionsX = [];
        const windowPositionsRightX = [];
        let stairPositionX = 0;
        const windowHoleGeometries: THREE.Group = new THREE.Group();
        const stairWindowHoles: THREE.Group = new THREE.Group();
        const windowPaneGeometries: THREE.Group = new THREE.Group();
        const stairWindowPaneGeometries: THREE.Group = new THREE.Group();
        const halfHouseHeight: number = storyHeight * storyCnt / 2;
        let balconySpace: {left: number, right: number} = {left: 0, right: 0};

        const windowsSplitHorizontal = randomBoolean(HC.WINDOW_SPLIT_HORIZONTAL_PROBABILITY);
        const windowsSplitVertical = this.windowWidth >= HC.WINDOW_SPLIT_VERTICAL_MIN_WIDTH && randomBoolean(HC.WINDOW_SPLIT_VERTICAL_PROBABILITY);

        let balconyPositionX: number = 0;

        const leftRightMoreWindows = randomInRangeInt(0,2);

        for(let story=0; story<storyCnt; ++story){
            const windowHoleStoryGroup: THREE.Group = new THREE.Group();
            const windowPaneStoryGeometries: THREE.Group = new THREE.Group();
            if (this.windowBreakingScheme == HC.WINDOW_SPACING_SCHEME.EQUALLY_SPACED){
                //let distBetween = houseWidth/(this.windowCntPerStory+1);
                //distBetween -= this.windowWidth;
                const widthDivided: number = houseWidth/(this.windowCntPerStory+1);
                const startDistance: number = widthDivided ;
                const addOn: number = widthDivided;

                for(let window=0; window<this.windowCntPerStory; ++window){
                    let translateY: number;
                    const translateX: number = -houseWidth/2 + startDistance + window * addOn;
                    windowPositionsX.push(translateX);
                    let windowHeight: number;
                    let isBalcony = false;
                    if(this.hasBalcony && window == this.balconyWindow){
                        windowHeight = HC.BALCONY_DOOR_HEIGHT_PERCENTAGE * storyHeight;
                        translateY = story * storyHeight + storyHeight * HC.BALCONY_DOOR_START_BOTTOM - halfHouseHeight + windowHeight/2;
                        balconyPositionX = translateX;
                        const balconySpaceLeft = (window == 0 ? startDistance : addOn)  - HC.BALCONY_DIST_OTHER_WINDOWS - this.windowWidth/2;
                        const balconySpaceRight = (window == this.windowCntPerStory - 1 ? startDistance : addOn) - HC.BALCONY_DIST_OTHER_WINDOWS - this.windowWidth/2;
                        balconySpace = {left: balconySpaceLeft, right: balconySpaceRight};
                        isBalcony = true;
                    }
                    else{
                        windowHeight = HC.WINDOW_HEIGHT_PERCENTAGE * storyHeight;
                        translateY = story * storyHeight + storyHeight * HC.WINDOW_START_BOTTOM - halfHouseHeight + windowHeight/2;
                    }
                    const windowGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.windowWidth, windowHeight, HC.WALL_THICKNESS + 2);
                    windowGeometry.translate(translateX, translateY, houseDepth/2);
                    //windowPaneGeometry.translate(translateX, translateY, houseDepth/2 - 1);
                    windowHoleStoryGroup.add(new THREE.Mesh(windowGeometry));
                    //windowPaneStoryGeometries.push(new THREE.Mesh(windowPaneGeometry, windowMaterial));
                    const windowFrame = new WindowFrame(this.windowWidth, windowHeight, !isBalcony && windowsSplitVertical, !isBalcony && windowsSplitHorizontal);
                    const frame3D = windowFrame.get3DObject(getID);
                    frame3D.position.set(translateX, translateY, houseDepth/2 - 1);
                    windowPaneStoryGeometries.add(frame3D);
                }
            }
            else{
                const spaceHalfHouse: number = (houseWidth - houseWidth * HC.WINDOW_BREAK_SCHEME_DIST_PERCENTAGE)/2;
                let distLeftEqual: number = spaceHalfHouse;
                let distRightEqual: number = spaceHalfHouse;
                let windowCntRight: number = 0;
                let windowCntLeft: number = 0;

                if(this.windowCntPerStory%2 == 0){
                    windowCntRight = this.windowCntPerStory / 2;
                    windowCntLeft = windowCntRight
                }
                else{
                    const windowsHalfMo: number = Math.floor(this.windowCntPerStory/2);
                    if(leftRightMoreWindows==1){ //Dann left mehr fenster
                        windowCntRight = windowsHalfMo;
                        windowCntLeft = windowsHalfMo + 1;
                    }
                    else{
                        windowCntRight = windowsHalfMo + 1;
                        windowCntLeft = windowsHalfMo;
                    }
                }
                distRightEqual /= windowCntRight + 1;
                const distRightStart: number = distRightEqual + this.windowWidth/2;
                const topOnRight: number = distRightEqual
                distLeftEqual /= windowCntLeft + 1;
                const distLeftStart: number = distLeftEqual - this.windowWidth/2;
                const topOnLeft: number =  distLeftEqual

                for(let windowL=0; windowL < windowCntLeft; ++windowL){
                    let translateY: number;
                    const translateX: number = (-houseWidth/2) + distLeftStart + topOnLeft * windowL;
                    windowPositionsX.push(translateX);
                    let windowHeight: number;
                    let isBalcony = false;
                    if(this.hasBalcony && windowL == this.balconyWindow){
                        windowHeight = HC.BALCONY_DOOR_HEIGHT_PERCENTAGE * storyHeight;
                        translateY = story * storyHeight + storyHeight * HC.BALCONY_DOOR_START_BOTTOM - halfHouseHeight + windowHeight/2;
                        balconyPositionX = translateX;
                        const balconySpaceLeft = (windowL == 0 ? distLeftStart : topOnLeft) - HC.BALCONY_DIST_OTHER_WINDOWS - this.windowWidth/2;
                        const balconySpaceRight = (windowL == windowCntLeft - 1 ? distRightStart : topOnLeft) - HC.BALCONY_DIST_OTHER_WINDOWS - this.windowWidth/2;
                        balconySpace = {left: balconySpaceLeft , right: balconySpaceRight};
                        isBalcony = true;
                    }
                    else{
                        windowHeight = HC.WINDOW_HEIGHT_PERCENTAGE * storyHeight;
                        translateY = story * storyHeight + storyHeight * HC.WINDOW_START_BOTTOM - halfHouseHeight + windowHeight/2;
                    }
                    const windowGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.windowWidth, windowHeight, HC.WALL_THICKNESS);
                    windowGeometry.translate(translateX, translateY, houseDepth/2 - HC.WALL_THICKNESS / 2);
                    windowHoleStoryGroup.add(new THREE.Mesh(windowGeometry));
                    const windowFrame = new WindowFrame(this.windowWidth, windowHeight, !isBalcony && windowsSplitVertical, !isBalcony && windowsSplitHorizontal);
                    const frame3D = windowFrame.get3DObject(getID);
                    frame3D.position.set(translateX, translateY, houseDepth/2 - 1);
                    windowPaneStoryGeometries.add(frame3D);
                }
                for(let windowR=0; windowR < windowCntRight; ++windowR){
                    let translateY: number;
                    let windowHeight: number;
                    const translateX: number = (houseWidth * HC.WINDOW_BREAK_SCHEME_DIST_PERCENTAGE)/2 + distRightStart + topOnRight * windowR;
                    windowPositionsRightX.push(translateX);
                    let isBalcony = false;
                    if(this.hasBalcony && (windowR + windowCntLeft) == this.balconyWindow){
                        windowHeight = HC.BALCONY_DOOR_HEIGHT_PERCENTAGE * storyHeight;
                        translateY = story * storyHeight + storyHeight * HC.BALCONY_DOOR_START_BOTTOM - halfHouseHeight + windowHeight/2;
                        balconyPositionX = translateX;
                        const balconySpaceLeft = (windowR == 0 ? distRightStart : topOnRight) - HC.BALCONY_DIST_OTHER_WINDOWS - this.windowWidth/2;
                        const balconySpaceRight = (windowR == windowCntRight - 1 ? distLeftStart : topOnRight) - HC.BALCONY_DIST_OTHER_WINDOWS - this.windowWidth/2;
                        balconySpace = {left: balconySpaceLeft, right: balconySpaceRight};
                        isBalcony = true;
                    }
                    else{
                        windowHeight = HC.WINDOW_HEIGHT_PERCENTAGE * storyHeight;
                        translateY = story * storyHeight + storyHeight * HC.WINDOW_START_BOTTOM - halfHouseHeight + windowHeight/2;
                    }
                    const windowGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.windowWidth, windowHeight, HC.WALL_THICKNESS);
                    windowGeometry.translate(translateX, translateY,  houseDepth/2 - HC.WALL_THICKNESS / 2);
                    windowHoleStoryGroup.add(new THREE.Mesh(windowGeometry));
                    const windowFrame = new WindowFrame(this.windowWidth, windowHeight, !isBalcony && windowsSplitVertical, !isBalcony && windowsSplitHorizontal);
                    const frame3D = windowFrame.get3DObject(getID);
                    frame3D.position.set(translateX, translateY, houseDepth/2 - 1);
                    windowPaneStoryGeometries.add(frame3D);
                }
                if (story > 0){
                    const stairWindowGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.windowWidth, storyHeight * HC.WINDOW_HEIGHT_PERCENTAGE, HC.WALL_THICKNESS);
                    const xPosition: number = (-(distLeftEqual) + (distRightEqual))/2;
                    stairPositionX = xPosition;
                    const yPosition: number = story * storyHeight + storyHeight * HC.WINDOW_START_BOTTOM - halfHouseHeight - storyHeight/2;
                    stairWindowGeometry.translate(xPosition, yPosition, houseDepth/2 - HC.WALL_THICKNESS / 2);
                    const stairWindowPaneGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.windowWidth, storyHeight * HC.WINDOW_HEIGHT_PERCENTAGE, 1);
                    stairWindowPaneGeometry.translate(xPosition, yPosition, houseDepth/2 - 1);
                    stairWindowHoles.add(new THREE.Mesh(stairWindowGeometry));
                    const windowFrame = new WindowFrame(this.windowWidth, storyHeight * HC.WINDOW_HEIGHT_PERCENTAGE);
                    const frame3D = windowFrame.get3DObject(getID);
                    frame3D.position.set(xPosition, yPosition, houseDepth/2 - 1);
                    stairWindowPaneGeometries.add(frame3D);
                }

            }
            windowHoleGeometries.add(windowHoleStoryGroup);
            windowPaneGeometries.add(windowPaneStoryGeometries);
        }

        const windowPositions = {type: this.windowBreakingScheme, windowsX: windowPositionsX, windowsRightX: windowPositionsRightX, windowWidth: this.windowWidth, stairX: stairPositionX};
        return {"windowHoles": windowHoleGeometries, "windowPanes": windowPaneGeometries, "stairWindowHoles": stairWindowHoles, "stairWindowPanes": stairWindowPaneGeometries, "balconyPosition": balconyPositionX, "windowPositions": windowPositions, "balconySpace": balconySpace};
    }

}

export function windowGenerator(houseWidth: number, storyCnt: number, storyHeight: number, houseDepth: number, getID: () => string): TYPES.WindowBalconiesReturn{
    const windowCntPerStory: number = randomInRangeInt(HC.WINDOW_MIN_PER_STORY, HC.WINDOW_MAX_PER_STORY);
    
    const windowWidth: number = randomInRangeInt(HC.WINDOW_MIN_WIDTH, HC.WINDOW_MAX_WIDTH);

    const windowBreakingScheme: string = randomFromObject(HC.WINDOW_SPACING_SCHEME);

    const hasBalcony = Math.random() < 0.5;
    const balconyWindow = randomInRangeInt(0, windowCntPerStory-1);

    const windows: Windows = new Windows(windowCntPerStory, windowWidth, windowBreakingScheme, hasBalcony, balconyWindow);
    const windowsGeometries = windows.get3DObject(storyCnt, storyHeight, houseWidth, houseDepth, getID);
    let balconies: THREE.Group | undefined = undefined;
    if (hasBalcony)
        balconies = balconyGenerator(windowsGeometries["balconyPosition"], storyCnt, storyHeight, houseDepth, windowsGeometries["balconySpace"]);
    
    return {"windows": windowsGeometries, "balconies": balconies};
}

class WindowFrame{
    windowWidth: number;
    windowHeight: number;
    verticalSplit: boolean;
    horizontalSplit: boolean;

    constructor(windowWidth: number, windowHeight: number, verticalSplit: boolean = false, horizontalSplit: boolean = false){
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.verticalSplit = verticalSplit;
        this.horizontalSplit = horizontalSplit;
    }

    get3DObject(getID: () => string): THREE.Group{
        const frameMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color:HC.WINDOW_FRAME_COLOR_HEX});
        const paneMaterial = PANE_MATERIAL;
        
        const frameGroup = new THREE.Group();

        if(this.horizontalSplit){
            const upperWindowHeight = this.windowHeight * HC.WINDOW_SPLIT_HORIZONTAL_PERCENTAGE;
            const upperWindow = new THREE.Group();
            const b1Geo = new THREE.BoxGeometry(this.windowWidth, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            const b1 = new THREE.Mesh(b1Geo, frameMaterial);
            b1.translateY(upperWindowHeight/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const b2 = new THREE.Mesh(b1Geo, frameMaterial);
            b2.translateY(- upperWindowHeight/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b3Geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, upperWindowHeight - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            const b3 = new THREE.Mesh(b3Geo, frameMaterial);
            b3.translateX(- this.windowWidth/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b4 = new THREE.Mesh(b3Geo, frameMaterial);
            b4.translateX(this.windowWidth/2 - HC.WINDOW_FRAME_THICKNESS/2);

            const paneGeo = new THREE.BoxGeometry(this.windowWidth - 2 * HC.WINDOW_FRAME_THICKNESS, upperWindowHeight - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const pane = new THREE.Mesh(paneGeo, paneMaterial);
            
            upperWindow.add(b1, b2, b3, b4, pane);
            upperWindow.translateY(this.windowHeight/2 - upperWindowHeight/2);
            frameGroup.add(upperWindow);
        }

        const lowerWindowHeight = this.horizontalSplit ? this.windowHeight * (1 - HC.WINDOW_SPLIT_HORIZONTAL_PERCENTAGE) : this.windowHeight;
        const lowerWindow = new THREE.Group();
        
        if(this.verticalSplit){
            const halfWidth = this.windowWidth/2;
            const leftWindow = new THREE.Group();
            const b1Geo = new THREE.BoxGeometry(halfWidth, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            const b1 = new THREE.Mesh(b1Geo, frameMaterial);
            b1.translateY(lowerWindowHeight/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const b2 = new THREE.Mesh(b1Geo, frameMaterial);
            b2.translateY(- lowerWindowHeight/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b3Geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            const b3 = new THREE.Mesh(b3Geo, frameMaterial);
            b3.translateX(- halfWidth/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b4 = new THREE.Mesh(b3Geo, frameMaterial);
            b4.translateX(halfWidth/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const paneGeo = new THREE.BoxGeometry(halfWidth - 2 * HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const paneLeft = new THREE.Mesh(paneGeo, paneMaterial);
            paneLeft.name = HC.WINDOW_PANE_ID;

            leftWindow.add(b1,b2,b3,b4,paneLeft);
            const rightWindow = new THREE.Group();
            rightWindow.add(b1.clone(), b2.clone(), b3.clone(), b4.clone(), paneLeft.clone());
            leftWindow.children.forEach(child => child.translateX(halfWidth/2));
            rightWindow.children.forEach(child => child.translateX(-halfWidth/2));

            const id = getID();

            leftWindow.name = HC.DOUBLE_WINDOW_LEFT_ID + "_" + id;
            rightWindow.name = HC.DOUBLE_WINDOW_RIGHT_ID + "_" + id;

            leftWindow.translateX(-halfWidth);
            rightWindow.translateX(halfWidth);

            lowerWindow.add(leftWindow, rightWindow);
        }
        else{
            const b1Geo = new THREE.BoxGeometry(this.windowWidth, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            const b1 = new THREE.Mesh(b1Geo, frameMaterial);
            b1.translateY(lowerWindowHeight/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const b2 = new THREE.Mesh(b1Geo, frameMaterial);
            b2.translateY(- lowerWindowHeight/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b3Geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            const b3 = new THREE.Mesh(b3Geo, frameMaterial);
            b3.translateX(- this.windowWidth/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b4 = new THREE.Mesh(b3Geo, frameMaterial);
            b4.translateX(this.windowWidth/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const paneGeo = new THREE.BoxGeometry(this.windowWidth - 2 * HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const pane = new THREE.Mesh(paneGeo, paneMaterial);
            pane.name = HC.WINDOW_PANE_ID;

            lowerWindow.add(b1, b2, b3, b4, pane);
            lowerWindow.children.forEach(child => child.translateX(- this.windowWidth/2));
            lowerWindow.translateX(this.windowWidth/2);
            lowerWindow.name = HC.SINGLE_WINDOW_ID + "_" + getID();
        }

        lowerWindow.translateY(- this.windowHeight/2 + lowerWindowHeight/2);
        frameGroup.add(lowerWindow);

        return frameGroup;
    }

}