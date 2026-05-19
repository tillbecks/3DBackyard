import { MAX_STORY_COUNT, MIN_STORY_COUNT, MAX_STORY_HEIGHT, MIN_STORY_HEIGHT, MAX_HOUSE_WIDTH, MIN_HOUSE_WIDTH, HOUSE_DEPTH } from "../config/houseConfig";
import * as THREE from 'three';
import { randomInRangeInt, randomInRangeIntDividableTwo, adjustColor, randomFromObject } from "../config/utils";
import { roofGenerator } from "./roof";
import { windowGenerator } from "./windows";
import { getHouseMaterials } from "../textures/materials";
import { calcUVS, subtractGeometry } from "../config/3dUtils";
import {Rooms} from "./rooms";
import * as TYPES from "../../types/typeIndex";
import { translateLightConfigs, translateXLightConfigs } from "./lights";


class HouseBody{
    houseGroup: THREE.Group;
    id: number;
    childId: number;
    storyCount: number;
    storyHeight: number;
    houseWidth: number;
    leftSize: number;
    rightSize: number;

    constructor(id: number, storyCount: number, storyHeight: number, houseWidth: number, leftSize: number, rightSize: number){
        this.houseGroup = new THREE.Group();

        this.id = id;
        this.storyCount = storyCount;
        this.storyHeight = storyHeight;
        this.houseWidth = houseWidth;
        this.leftSize = leftSize;
        this.rightSize = rightSize;
        this.childId = 0;
    }

    getNewChildId(): string{
        return `${this.id}_${this.childId++}`;
    }

    get3DContent(): TYPES.ObjectLightReturn {
        const houseHeight: number = this.storyCount * this.storyHeight;
        const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.houseWidth, houseHeight, HOUSE_DEPTH);
        const mixedMaterial = randomFromObject(getHouseMaterials());

        const material = mixedMaterial.standardMaterial;
        const shaderMaterial = mixedMaterial.shaderMaterial;

        const roof: THREE.Group = roofGenerator(HOUSE_DEPTH, this.houseWidth, mixedMaterial, this.leftSize, this.rightSize, houseHeight);
        roof.position.setY(houseHeight/2);

        const windowsBalconies = windowGenerator(this.houseWidth, this.storyCount, this.storyHeight, HOUSE_DEPTH, () => this.getNewChildId());
        const balconies: THREE.Group | undefined = windowsBalconies["balconies"];
        if(balconies)
            this.houseGroup.add(balconies);

        let houseWithoutWindows = subtractGeometry(new THREE.Mesh(geometry), windowsBalconies["windows"]["windowHoles"]);
        houseWithoutWindows = subtractGeometry(houseWithoutWindows, windowsBalconies["windows"]["stairWindowHoles"]);

        const rooms = new Rooms(this.storyCount, this.storyHeight, this.houseWidth, HOUSE_DEPTH, windowsBalconies["windows"]["windowPositions"]);
        const roomsObject = rooms.get3DObject();
        houseWithoutWindows = subtractGeometry(houseWithoutWindows, roomsObject.object);
        const lights = roomsObject.lights;

        // Generate UVs nach der CSG-Operation
        calcUVS(houseWithoutWindows.geometry);

        houseWithoutWindows.castShadow = true;
        houseWithoutWindows.receiveShadow = true;
        houseWithoutWindows.material = material;
        houseWithoutWindows.userData = {shader: shaderMaterial};
        houseWithoutWindows.name = "house";

        this.houseGroup.add(houseWithoutWindows);
        this.houseGroup.add(roof);
        this.houseGroup.add(windowsBalconies["windows"]["windowPanes"]);
        this.houseGroup.add(windowsBalconies["windows"]["stairWindowPanes"]);

        return {object: this.houseGroup, lights: lights};
    } 
};

//x rechts-links, z vorne-hinten, y oben-unten
export function houseGroupGenerator(houseCnt: number, centerPoint: [number, number, number]): TYPES.ObjectLightReturn {
    const houseGroup = new THREE.Group();
    const lights = [];
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
        const houseHeight = storyCnt != null && storyHeight != null ? storyCnt * storyHeight : 0;
        const leftHouse = lastStoryCnt == null || lastStoryHeight == null ? 1 : lastStoryCnt * lastStoryHeight < houseHeight ? 1 : 0;
        const rightHouse = nextStoryCnt == null || nextStoryHeight == null ? 1 : nextStoryCnt * nextStoryHeight < houseHeight ? 1 : 0;
        const house = new HouseBody(i,  storyCnt != null ? storyCnt : 0, storyHeight != null ? storyHeight : 0, houseWidth, leftHouse, rightHouse);
        const objectLight = house.get3DContent();
        const houseMesh = objectLight.object;
        const positionY = Math.floor(houseHeight/2);
        const positionX = housesWidth - Math.floor(houseWidth/2);
        translateLightConfigs(objectLight.lights, new THREE.Vector3(positionX, positionY, 0));
        houseMesh.position.set(positionX, positionY, 0);
        houseGroup.add(houseMesh);
        lights.push(...objectLight.lights);
    }

    for(const child of houseGroup.children){
        if(child instanceof THREE.Group){
            child.position.x -= housesWidth/2;
        }
    }
    translateXLightConfigs(lights, -housesWidth/2);
    return {object: houseGroup, lights: lights};
};
