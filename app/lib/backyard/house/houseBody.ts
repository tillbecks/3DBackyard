import * as THREE from 'three';

import { roofGenerator } from "./roof";
import { windowGenerator } from "./windows";
import {Rooms} from "./rooms";

import { MAX_STORY_COUNT, MIN_STORY_COUNT, MAX_STORY_HEIGHT, MIN_STORY_HEIGHT, MAX_HOUSE_WIDTH, MIN_HOUSE_WIDTH, HOUSE_DEPTH } from "@/app/lib/config/houseConfig";
import { randomInRangeInt, randomInRangeIntDividableTwo } from "@/app/lib/config/utils";
import { materialShaderConfigs } from "@/app/lib/materials/materials";
import { calcUVS, subtractGeometry } from "@/app/lib/config/3dUtils";
import * as TYPES from "@/app/types/typeIndex";


class HouseBody{
    houseGroup: THREE.Group;
    static globalId: number = 0;
    id: number;
    childId: number;
    storyCount: number;
    storyHeight: number;
    houseWidth: number;
    leftSize: number;
    rightSize: number;
    mergeableWindows: boolean;

    constructor(storyCount: number, storyHeight: number, houseWidth: number, leftSize: number, rightSize: number, mergeableWindows: boolean = true){
        this.houseGroup = new THREE.Group();

        this.id = HouseBody.globalId++;
        this.storyCount = storyCount;
        this.storyHeight = storyHeight;
        this.houseWidth = houseWidth;
        this.leftSize = leftSize;
        this.rightSize = rightSize;
        this.childId = 0;
        this.mergeableWindows = mergeableWindows;
    }

    getNewChildId(): string{
        return `${this.id}_${this.childId++}`;
    }

    get3DContent(): TYPES.ObjectLightReturn {
        const houseHeight: number = this.storyCount * this.storyHeight;
        const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.houseWidth, houseHeight, HOUSE_DEPTH);
        const mixedMaterial = materialShaderConfigs.HOUSE_MATERIAL();

        const roof: THREE.Group = roofGenerator(HOUSE_DEPTH, this.houseWidth, mixedMaterial, this.leftSize, this.rightSize, houseHeight);
        roof.position.setY(houseHeight/2);

        const windowsBalconies = windowGenerator(this.houseWidth, this.storyCount, this.storyHeight, HOUSE_DEPTH, () => this.getNewChildId(), this.mergeableWindows);
        const balconies: THREE.Group | undefined = windowsBalconies["balconies"];
        if(balconies)
            this.houseGroup.add(balconies);

        let houseWithoutWindows = subtractGeometry(new THREE.Mesh(geometry), windowsBalconies["windows"]["windowHoles"]);
        houseWithoutWindows = subtractGeometry(houseWithoutWindows, windowsBalconies["windows"]["stairWindowHoles"]);

        const rooms = new Rooms(this.storyCount, this.storyHeight, this.houseWidth, HOUSE_DEPTH, windowsBalconies["windows"]["windowPositions"]);
        const roomsObject = rooms.get3DObject(() => this.getNewChildId());
        houseWithoutWindows = subtractGeometry(houseWithoutWindows, roomsObject.object);
        const lights = roomsObject.lightConfigs;

        // Generate UVs nach der CSG-Operation
        calcUVS(houseWithoutWindows.geometry);

        houseWithoutWindows.userData.materialConfig = mixedMaterial;
        houseWithoutWindows.name = "house";

        this.houseGroup.add(houseWithoutWindows);
        for(const wallLight of roomsObject.wallLights){
            this.houseGroup.add(wallLight);
        };
        this.houseGroup.add(roof);
        this.houseGroup.add(windowsBalconies["windows"]["windowPanes"]);
        this.houseGroup.add(windowsBalconies["windows"]["stairWindowPanes"]);

        return {object: this.houseGroup, lightConfigs: lights};
    } 
};

//x rechts-links, z vorne-hinten, y oben-unten
export function houseGroupGenerator(houseCnt: number, centerPoint: [number, number, number], mergeableWindows: boolean = true): TYPES.HouseReturn {
    const houseGroup = new THREE.Group();
    const lightConfigs = [];
    const housesWidths: number[] = [];
    let housesWidth: number = 0;

    //const most_left_x_coordinate = centerPoint[0] - Math.floor(houseCnt / 2 * HOUSE_WIDTH);
    let lastStoryCnt: number | null = null;
    let lastStoryHeight: number | null = null;
    let storyCnt: number | null = null;
    let storyHeight: number | null = null;
    let nextStoryCnt: number | null = randomInRangeInt(MIN_STORY_COUNT, MAX_STORY_COUNT);
    let nextStoryHeight: number | null = randomInRangeIntDividableTwo(MIN_STORY_HEIGHT, MAX_STORY_HEIGHT);

    for(let i=0; i< houseCnt; ++i){
        lastStoryCnt = storyCnt;
        lastStoryHeight = storyHeight;
        storyCnt = nextStoryCnt;
        storyHeight = nextStoryHeight;
        nextStoryCnt = i == houseCnt - 1 ? null : randomInRangeInt(MIN_STORY_COUNT, MAX_STORY_COUNT);
        nextStoryHeight = i == houseCnt - 1 ? null : randomInRangeIntDividableTwo(MIN_STORY_HEIGHT, MAX_STORY_HEIGHT);
        const houseWidth = randomInRangeIntDividableTwo(MIN_HOUSE_WIDTH, MAX_HOUSE_WIDTH);
        housesWidth += houseWidth;
        housesWidths.push(houseWidth);
        const houseHeight = storyCnt != null && storyHeight != null ? storyCnt * storyHeight : 0;
        const leftHouse = lastStoryCnt == null || lastStoryHeight == null ? 1 : lastStoryCnt * lastStoryHeight < houseHeight ? 1 : 0;
        const rightHouse = nextStoryCnt == null || nextStoryHeight == null ? 1 : nextStoryCnt * nextStoryHeight < houseHeight ? 1 : 0;
        const house = new HouseBody( storyCnt != null ? storyCnt : 0, storyHeight != null ? storyHeight : 0, houseWidth, leftHouse, rightHouse, mergeableWindows);
        const objectLight = house.get3DContent();
        const houseMesh = objectLight.object;
        const positionY = Math.floor(houseHeight/2);
        const positionX = housesWidth - Math.floor(houseWidth/2);
        //translateLightConfigs(objectLight.lightConfigs, new THREE.Vector3(positionX, positionY, 0));
        houseMesh.position.set(positionX, positionY, 0);
        houseGroup.add(houseMesh);
        lightConfigs.push(...objectLight.lightConfigs);
    }

    for(const child of houseGroup.children){
        if(child instanceof THREE.Group){
            child.position.x -= housesWidth/2;
        }
    }
    //translateXLightConfigs(lightConfigs, -housesWidth/2);
    return {object: houseGroup, lightConfigs: lightConfigs, housesWidths: housesWidths};
};
