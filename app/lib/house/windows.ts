import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import { balconyGenerator } from "./balcony";

import * as HC from '@/app/lib/config/houseConfig';
import * as TYPES from '@/app/types/typeIndex';
import { randomInRangeInt, randomFromObject, randomBoolean, randomFromArray } from "@/app/lib/config/utils";
import { materialShaderConfigs } from '@/app/lib/materials/materials';
import { makeUnmergeable } from "../config/meshMaterialMerger";
import { array } from "three/tsl";

class Windows{
    windowCntPerStory: number;
    windowWidth: number;
    windowBreakingScheme: string;
    hasBalcony: boolean;
    balconyWindow: number;
    unmergeableWindow: {story: number, window: number};

    constructor(windowCntPerStory: number, windowWidth: number, windowBreakingScheme: string, hasBalcony: boolean, balconyWindow: number, unmergeableWindow: {story: number, window: number} = {story: -1, window: -1}){
        this.windowCntPerStory = windowCntPerStory;
        this.windowWidth = windowWidth;
        this.windowBreakingScheme = windowBreakingScheme;        
        this.hasBalcony = hasBalcony;
        this.balconyWindow = balconyWindow;
        this.unmergeableWindow = unmergeableWindow;
    }

    get3DObject(storyCnt: number, storyHeight: number, houseWidth: number, houseDepth: number, getID: () => string): TYPES.WindowReturn{
        const windowPositionsX = [];
        const windowPositionsRightX = [];
        let stairPositionX = 0;
        //const windowHolesMesh: THREE.Group = new THREE.Group();
        const windowHoles = [];
        //const stairWindowHolesGeometries: THREE.Group = new THREE.Group();
        const stairWindowHoles = [];
        const windowPaneGeometries: THREE.Group = new THREE.Group();
        const stairWindowPaneGeometries: THREE.Group = new THREE.Group();
        const halfHouseHeight: number = storyHeight * storyCnt / 2;
        let balconySpace: {left: number, right: number} = {left: 0, right: 0};

        const windowsSplitHorizontal = randomBoolean(HC.WINDOW_SPLIT_HORIZONTAL_PROBABILITY);
        const windowsSplitVertical = this.windowWidth >= HC.WINDOW_SPLIT_VERTICAL_MIN_WIDTH && randomBoolean(HC.WINDOW_SPLIT_VERTICAL_PROBABILITY);

        let balconyPositionX: number = 0;

        const leftRightMoreWindows = randomInRangeInt(0,2);

        for(let story=0; story<storyCnt; ++story){
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
                    if(story == 0) windowPositionsX.push(translateX);
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

                    windowHoles.push(windowGeometry);
                    const windowFrame = new WindowFrame(this.windowWidth, windowHeight, !isBalcony && windowsSplitVertical, !isBalcony && windowsSplitHorizontal, !(this.unmergeableWindow.story == story && this.unmergeableWindow.window == window));
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
                    if(story == 0) windowPositionsX.push(translateX);
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
                    //windowHoleStoryGroup.add(new THREE.Mesh(windowGeometry));
                    windowHoles.push(windowGeometry);
                    const windowFrame = new WindowFrame(this.windowWidth, windowHeight, !isBalcony && windowsSplitVertical, !isBalcony && windowsSplitHorizontal, !(this.unmergeableWindow.story == story && this.unmergeableWindow.window == windowL));
                    const frame3D = windowFrame.get3DObject(getID);
                    frame3D.position.set(translateX, translateY, houseDepth/2 - 1);
                    windowPaneStoryGeometries.add(frame3D);
                }
                for(let windowR=0; windowR < windowCntRight; ++windowR){
                    let translateY: number;
                    let windowHeight: number;
                    const translateX: number = (houseWidth * HC.WINDOW_BREAK_SCHEME_DIST_PERCENTAGE)/2 + distRightStart + topOnRight * windowR;
                    if(story == 0)  windowPositionsRightX.push(translateX);
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
                    windowHoles.push(windowGeometry);
                    const windowFrame = new WindowFrame(this.windowWidth, windowHeight, !isBalcony && windowsSplitVertical, !isBalcony && windowsSplitHorizontal, !(this.unmergeableWindow.story == story && this.unmergeableWindow.window == windowR + windowCntLeft));
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
                    //stairWindowHolesGeometries.add(new THREE.Mesh(stairWindowGeometry));
                    stairWindowHoles.push(stairWindowGeometry);
                    const windowFrame = new WindowFrame(this.windowWidth, storyHeight * HC.WINDOW_HEIGHT_PERCENTAGE);
                    const frame3D = windowFrame.get3DObject(getID);
                    frame3D.position.set(xPosition, yPosition, houseDepth/2 - 1);
                    stairWindowPaneGeometries.add(frame3D);
                }

            }
            //windowHoleGeometries.add(windowHoleStoryGroup);
           windowPaneGeometries.add(windowPaneStoryGeometries);
        }

        const windowHolesGeometrie = BufferGeometryUtils.mergeGeometries(windowHoles);
        const windowHolesMesh = new THREE.Mesh(windowHolesGeometrie);
        let stairWindowHolesMesh = null;
        if(stairWindowHoles.length > 0){
            const stairWindowHolesGeometrie = BufferGeometryUtils.mergeGeometries(stairWindowHoles);
            stairWindowHolesMesh = new THREE.Mesh(stairWindowHolesGeometrie);
        }

        const windowPositions = {type: this.windowBreakingScheme, windowsX: windowPositionsX, windowsRightX: windowPositionsRightX, windowWidth: this.windowWidth, stairX: stairPositionX, balconyPositionX: balconyPositionX};
        return {"windowHoles": windowHolesMesh, "windowPanes": windowPaneGeometries, "stairWindowHoles": stairWindowHolesMesh, "stairWindowPanes": stairWindowPaneGeometries, "windowPositions": windowPositions};
    }

}

export function windowGenerator(houseWidth: number, storyCnt: number, storyHeight: number, houseDepth: number, getID: () => string, mergeable: boolean): TYPES.WindowBalconiesReturn{
    const windowCntPerStory: number = randomInRangeInt(HC.WINDOW_MIN_PER_STORY, HC.WINDOW_MAX_PER_STORY);
    
    const windowWidth: number = randomInRangeInt(HC.WINDOW_MIN_WIDTH, HC.WINDOW_MAX_WIDTH);

    const windowBreakingScheme: string = randomFromObject(HC.WINDOW_SPACING_SCHEME);

    const hasBalcony = Math.random() < 0.5;
    const balconyWindow = randomInRangeInt(0, windowCntPerStory-1);

    const unmergeableStory = mergeable ? -1 : randomInRangeInt(HC.UNMERGEABLE_WINDOW_MIN_STORY, storyCnt-1);
    const unmergeableWindow = mergeable ? -1 : randomFromArray([...Array(windowCntPerStory).keys()].filter(i => i != balconyWindow));

    const windows: Windows = new Windows(windowCntPerStory, windowWidth, windowBreakingScheme, hasBalcony, balconyWindow, {story: unmergeableStory, window: unmergeableWindow});
    const windowsGeometries = windows.get3DObject(storyCnt, storyHeight, houseWidth, houseDepth, getID);
    let balconies: THREE.Group | undefined = undefined;
    if (hasBalcony)
        balconies = balconyGenerator(windowsGeometries.windowPositions, storyCnt, storyHeight, houseDepth, houseWidth);
    
    return {"windows": windowsGeometries, "balconies": balconies};
}

class WindowFrame{
    windowWidth: number;
    windowHeight: number;
    verticalSplit: boolean;
    horizontalSplit: boolean;
    mergable: boolean;

    constructor(windowWidth: number, windowHeight: number, verticalSplit: boolean = false, horizontalSplit: boolean = false, mergable: boolean = true){
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.verticalSplit = verticalSplit;
        this.horizontalSplit = horizontalSplit;
        this.mergable = mergable;
    }

    get3DObject(getID: () => string): THREE.Group{
        const frameMaterial= materialShaderConfigs.WINDOW_FRAME_MATERIAL();
        const paneMaterial = materialShaderConfigs.WINDOW_PANE_MATERIAL();
        
        const frameGroup = new THREE.Group();

        if(this.horizontalSplit){
            const upperWindowHeight = this.windowHeight * HC.WINDOW_SPLIT_HORIZONTAL_PERCENTAGE;
            const upperWindow = new THREE.Group();
            const b1Geo = new THREE.BoxGeometry(this.windowWidth, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            b1Geo.translate(0,upperWindowHeight/2 - HC.WINDOW_FRAME_THICKNESS/2, 0);
            const b2Geo = b1Geo.clone();
            b2Geo.translate(0, - upperWindowHeight + HC.WINDOW_FRAME_THICKNESS, 0);
            const b3Geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, upperWindowHeight - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            b3Geo.translate(- this.windowWidth/2 + HC.WINDOW_FRAME_THICKNESS/2, 0, 0);
            const b4Geo = b3Geo.clone();
            b4Geo.translate(this.windowWidth - HC.WINDOW_FRAME_THICKNESS, 0, 0);

            const paneGeo = new THREE.BoxGeometry(this.windowWidth - 2 * HC.WINDOW_FRAME_THICKNESS, upperWindowHeight - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const pane = new THREE.Mesh(paneGeo);
            pane.userData.materialConfig = paneMaterial;

            const frameGeometry = BufferGeometryUtils.mergeGeometries([b1Geo, b2Geo, b3Geo, b4Geo]);
            const frameMesh = new THREE.Mesh(frameGeometry);
            frameMesh.userData.materialConfig = frameMaterial;
            upperWindow.add(frameMesh, pane);

            upperWindow.translateY(this.windowHeight/2 - upperWindowHeight/2);
            frameGroup.add(upperWindow);
        }

        const lowerWindowHeight = this.horizontalSplit ? this.windowHeight * (1 - HC.WINDOW_SPLIT_HORIZONTAL_PERCENTAGE) : this.windowHeight;
        const lowerWindow = new THREE.Group();
        
        if(this.verticalSplit){
            const halfWidth = this.windowWidth/2;
            const leftWindow = new THREE.Group();
            const leftWindowGeometries = [];
            const b1Geo = new THREE.BoxGeometry(halfWidth, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            b1Geo.translate(0,lowerWindowHeight/2 - HC.WINDOW_FRAME_THICKNESS/2, 0);
            leftWindowGeometries.push(b1Geo);
            const b2Geo = b1Geo.clone();
            b2Geo.translate(0,- lowerWindowHeight + HC.WINDOW_FRAME_THICKNESS, 0);
            leftWindowGeometries.push(b2Geo);
            const b3Geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            b3Geo.translate(- halfWidth/2 + HC.WINDOW_FRAME_THICKNESS/2, 0, 0);
            leftWindowGeometries.push(b3Geo);
            const b4Geo = b3Geo.clone();
            b4Geo.translate(halfWidth - HC.WINDOW_FRAME_THICKNESS, 0, 0);
            leftWindowGeometries.push(b4Geo);

            const paneGeo = new THREE.BoxGeometry(halfWidth - 2 * HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const paneLeft = new THREE.Mesh(paneGeo);
            paneLeft.userData.materialConfig = paneMaterial;
            paneLeft.name = HC.WINDOW_PANE_ID;
            const leftWindowGeometry = BufferGeometryUtils.mergeGeometries(leftWindowGeometries);
            const leftWindowMesh = new THREE.Mesh(leftWindowGeometry);
            leftWindowMesh.userData.materialConfig = frameMaterial;
            leftWindow.add(leftWindowMesh, paneLeft);

            const rightWindow = new THREE.Group();
            const rightWindowMesh = new THREE.Mesh(leftWindowGeometry);
            rightWindowMesh.userData.materialConfig = frameMaterial;
            const rightPaneMesh = new THREE.Mesh(paneGeo);
            rightPaneMesh.userData.materialConfig = paneMaterial;
            rightWindow.add(rightWindowMesh, rightPaneMesh);
            leftWindow.children.forEach(child => child.translateX(halfWidth/2));
            rightWindow.children.forEach(child => child.translateX(-halfWidth/2));

            const id = getID();

            leftWindow.name = HC.DOUBLE_WINDOW_LEFT_ID + "_" + id;
            rightWindow.name = HC.DOUBLE_WINDOW_RIGHT_ID + "_" + id;

            leftWindow.translateX(-halfWidth);
            rightWindow.translateX(halfWidth);
            if(!this.mergable){
                makeUnmergeable(leftWindow);
                makeUnmergeable(rightWindow);
            }

            lowerWindow.add(leftWindow, rightWindow);
        }
        else{
            const b1Geo = new THREE.BoxGeometry(this.windowWidth, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            b1Geo.translate(0, lowerWindowHeight/2 - HC.WINDOW_FRAME_THICKNESS/2, 0);
            const b2Geo = b1Geo.clone();
            b2Geo.translate(0, - lowerWindowHeight + HC.WINDOW_FRAME_THICKNESS, 0);
            const b3Geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            b3Geo.translate(- this.windowWidth/2 + HC.WINDOW_FRAME_THICKNESS/2, 0, 0);
            const b4Geo = b3Geo.clone();
            b4Geo.translate(this.windowWidth - HC.WINDOW_FRAME_THICKNESS, 0, 0);
            const paneGeo = new THREE.BoxGeometry(this.windowWidth - 2 * HC.WINDOW_FRAME_THICKNESS, lowerWindowHeight - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const pane = new THREE.Mesh(paneGeo);
            pane.userData.materialConfig = paneMaterial;
            pane.name = HC.WINDOW_PANE_ID;

            const frameGeo = BufferGeometryUtils.mergeGeometries([b1Geo, b2Geo, b3Geo, b4Geo]);
            const frameMesh = new THREE.Mesh(frameGeo);
            frameMesh.userData.materialConfig = frameMaterial;

            lowerWindow.add(frameMesh, pane);
            lowerWindow.children.forEach(child => child.translateX(- this.windowWidth/2));
            lowerWindow.translateX(this.windowWidth/2);
            lowerWindow.name = HC.SINGLE_WINDOW_ID + "_" + getID();
            if(!this.mergable){
                makeUnmergeable(lowerWindow);
            }
        }

        lowerWindow.translateY(- this.windowHeight/2 + lowerWindowHeight/2);
        frameGroup.add(lowerWindow);

        return frameGroup;
    }

}