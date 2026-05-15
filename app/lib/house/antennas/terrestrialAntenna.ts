import * as THREE from 'three';
import * as HC from '../../config/houseConfig';
import * as UTILS from '../../config/utils';
import * as TDUTILS from '../../config/3dUtils';
import { reflector } from 'three/tsl';

class TerrestrialAntenna{
    height: number;
    direction: number;
    radius: number;

    constructor(height: number, direction: number, radius: number = 0.5){
        this.height = height;
        this.direction = direction;
        this.radius = radius;
    }

    get3DObject(): THREE.Group{
        return new THREE.Group();
    }
}

class AmFmAntenna extends TerrestrialAntenna{
    type: string;
    width: number;

    constructor(direction: number, type: string, width: number){
        super(HC.AMFMANTENNA_HEIGHT, direction, width);

        this.type = type;
        this.width = width;
    }

    get3DObject(): THREE.Group{
        const antennaGroup = new THREE.Group();

        const antennaBlockConfig = {
            size: 0.3,
            height: this.height}

        const antennaBlock = new THREE.BoxGeometry(antennaBlockConfig.size, antennaBlockConfig.height, antennaBlockConfig.size);
        const antennaBlockMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const antennaBlockMesh = new THREE.Mesh(antennaBlock, antennaBlockMaterial);
        antennaBlockMesh.castShadow = true;
        antennaBlockMesh.receiveShadow = true;

        antennaGroup.add (antennaBlockMesh);

        const antennaStickGroup = new THREE.Group();

        const stickGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.width, 16);
        const stickMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const stickMesh = new THREE.Mesh(stickGeometry, stickMaterial);
        stickMesh.castShadow = true;
        stickMesh.receiveShadow = true;
        stickMesh.rotateX(0.5*Math.PI);
        antennaStickGroup.add(stickMesh);

        if(this.type == HC.AMFMANTENNA_TYPES.CROSS){
            const stickMesh2 = new THREE.Mesh(stickGeometry, stickMaterial);
            stickMesh2.castShadow = true;
            stickMesh2.receiveShadow = true;
            stickMesh2.rotateX(0.5*Math.PI);
            stickMesh2.rotateZ(0.5*Math.PI);
            antennaStickGroup.add(stickMesh2);
        }


        antennaGroup.add(antennaStickGroup);
        antennaGroup.rotateY(this.direction);

        return antennaGroup
    } 
}

function amFmAntennaGenerator(){
    const direction = UTILS.randomInRangeFloat(0, 2 * Math.PI);
    const width = UTILS.randomInRangeFloat(HC.AMFMANTENNA_WIDTH_MIN, HC.AMFMANTENNA_WIDTH_MAX);
    const type = UTILS.randomFromObject(HC.AMFMANTENNA_TYPES);

    const antenna = new AmFmAntenna(direction, type, width);

    return antenna;
}

class TVAntenna extends TerrestrialAntenna{
    length: number;
    elementDist: number;
    elementLength: number;
    hasReflector: boolean;

    constructor(direction: number, length: number, elementDist: number, elementLength: number, hasReflector: boolean = false){
        super(HC.TVANTENNA_HEIGHT, direction, hasReflector ? length: length/2);
        this.length = length;
        this.elementDist = elementDist;
        this.elementLength = elementLength;
        this.hasReflector = hasReflector;
    }

    get3DObject(): THREE.Group{
        const antennaGroup = new THREE.Group();

        if(!this.hasReflector){
            const antennaBlockConfig = {
                size: 0.3,
                height: this.height}

            const antennaBlock = new THREE.BoxGeometry(antennaBlockConfig.size, antennaBlockConfig.height, antennaBlockConfig.size);
            const antennaBlockMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
            const antennaBlockMesh = new THREE.Mesh(antennaBlock, antennaBlockMaterial);
            antennaBlockMesh.castShadow = true;
            antennaBlockMesh.receiveShadow = true;
            antennaGroup.add (antennaBlockMesh);
        }

        const antennaMainRodGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.length, 16);
        const antennaMainRodMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const antennaMainRodMesh = new THREE.Mesh(antennaMainRodGeometry, antennaMainRodMaterial);
        antennaMainRodMesh.castShadow = true;
        antennaMainRodMesh.receiveShadow = true;
        antennaMainRodMesh.rotateX(0.5*Math.PI);
        antennaGroup.add(antennaMainRodMesh);

        const elementGroup = new THREE.Group();

        const elementAmount = Math.floor(this.length / this.elementDist);
        const elementGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.elementLength, 16);
        const elementMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});

        const extraOffsetY = (this.length - (elementAmount - 1) * this.elementDist) / 2;
        for(let i = 0; i < elementAmount; i++){
            const elementMesh = new THREE.Mesh(elementGeometry, elementMaterial);
            elementMesh.castShadow = true;
            elementMesh.receiveShadow = true;
            elementMesh.position.y = -this.length/2 + i*this.elementDist + extraOffsetY;
            elementMesh.rotateZ(0.5*Math.PI);
            elementGroup.add(elementMesh);
        }

        elementGroup.rotateX(0.5*Math.PI);

        antennaGroup.add(elementGroup);

        if(this.hasReflector){
            antennaGroup.translateZ(this.length/2);
        }

        if(!this.hasReflector){
            antennaGroup.rotateY(this.direction);
        }

        return antennaGroup;
    }

}

function tvAntennaGenerator(){
    const direction = UTILS.randomInRangeFloat(0, 2 * Math.PI);
    const length = UTILS.randomInRangeFloat(HC.TVANTENNA_LENGTH_MIN, HC.TVANTENNA_LENGTH_MAX);
    const elementDist = UTILS.randomInRangeFloat(HC.TVANTENNA_ELEMENT_DIST_MIN, HC.TVANTENNA_ELEMENT_DIST_MAX);
    const elementLength = UTILS.randomInRangeFloat(HC.TVANTENNA_ELEMENT_LENGTH_MIN, HC.TVANTENNA_ELEMENT_LENGTH_MAX);

    const antenna = new TVAntenna(direction, length, elementDist, elementLength);

    return antenna;
}

class TVAntennaWithReflector extends TVAntenna{
    reflectorWidth: number;
    reflectorLength: number;
    reflectorAngle: number;

    constructor(direction: number, length: number, elementDist: number, elementLength: number, reflectorWidth: number, reflectorLength: number, reflectorAngle: number){
        super(direction, length, elementDist, elementLength, true);
        this.reflectorWidth = reflectorWidth;
        this.reflectorLength = reflectorLength;
        this.reflectorAngle = reflectorAngle;

        this.height = reflectorLength * Math.sin(reflectorAngle) * 2;
    }

    get3DObject(): THREE.Group{
        const reflectorAntennaGroup = new THREE.Group();
        const antennaPart = super.get3DObject();
        reflectorAntennaGroup.add(antennaPart);

        const connectorGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorWidth, 16);
        const connectorMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const connectorMesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
        connectorMesh.castShadow = true;
        connectorMesh.receiveShadow = true;
        connectorMesh.rotateZ(0.5*Math.PI);
        reflectorAntennaGroup.add(connectorMesh);

        const reflectorWingGroup = new THREE.Group();

        const framePieceGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorLength, 16);
        const framePieceMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});

        for(let i = 0; i<HC.REFLECTOR_FRAME_PIECES; ++i){
            const framePieceMesh = new THREE.Mesh(framePieceGeometry, framePieceMaterial);
            framePieceMesh.castShadow = true;
            framePieceMesh.receiveShadow = true;
            framePieceMesh.position.z = -this.reflectorWidth/2 + i*(this.reflectorWidth/(HC.REFLECTOR_FRAME_PIECES-1));
            reflectorWingGroup.add(framePieceMesh);
        }
        
        const reflectorElementCount = Math.floor(this.reflectorLength / HC.REFLECTOR_ELEMENT_DIST);
        const reflectorElementDst = this.reflectorLength / reflectorElementCount;

        const reflectorElementGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorWidth, 16);
        const reflectorElementMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});

        for(let i = 0; i < reflectorElementCount; ++i){
            const reflectorElementMesh = new THREE.Mesh(reflectorElementGeometry, reflectorElementMaterial);
            reflectorElementMesh.castShadow = true;
            reflectorElementMesh.receiveShadow = true;
            reflectorElementMesh.position.y = -this.reflectorLength/2 + (i)*reflectorElementDst + reflectorElementDst;
            reflectorElementMesh.rotateX(0.5*Math.PI);
            reflectorWingGroup.add(reflectorElementMesh);
        }

        reflectorWingGroup.rotateY(0.5*Math.PI);
        reflectorWingGroup.rotateZ(this.reflectorAngle);
        const reflectorWingGroupSec = reflectorWingGroup.clone();

        reflectorWingGroup.translateY(this.reflectorLength/2);

        reflectorWingGroupSec.rotateZ(this.reflectorAngle*2);
        reflectorWingGroupSec.translateY(this.reflectorLength/2);

        reflectorAntennaGroup.add(reflectorWingGroup);
        reflectorAntennaGroup.add(reflectorWingGroupSec);

        return reflectorAntennaGroup;
    }
}

function tvAntennaWithReflectorGenerator(){
    const direction = UTILS.randomInRangeFloat(0, 2 * Math.PI);
    const antennaLength = UTILS.randomInRangeFloat(HC.REFLECTOR_ANTENNA_LENGTH_MIN, HC.REFLECTOR_ANTENNA_LENGTH_MAX);
    const antennaElementLength = UTILS.randomInRangeFloat(HC.REFLECTOR_ANTENNA_ELEMENT_LENGTH_MIN, HC.REFLECTOR_ANTENNA_ELEMENT_LENGTH_MAX);
    const antennaElementDist = UTILS.randomInRangeFloat(HC.REFLECTOR_ANTENNA_DIST_MIN, HC.REFLECTOR_ANTENNA_DIST_MAX);
    const reflectorLength = UTILS.randomInRangeFloat(HC.REFLECTOR_ELEMENT_LENGTH_MIN, HC.REFLECTOR_ELEMENT_LENGTH_MAX);
    const reflectorWidth = UTILS.randomInRangeFloat(HC.REFLECTOR_ELEMENT_WIDTH_MIN, HC.REFLECTOR_ELEMENT_WIDTH_MAX);
    const reflectorAngle = HC.REFLECTOR_ANGLE;

    const antenna = new TVAntennaWithReflector(direction, antennaLength, antennaElementDist, antennaElementLength, reflectorWidth, reflectorLength, reflectorAngle);
    return antenna;
}

class AntennaPole {
    antennas: TerrestrialAntenna[];
    radius: number;

    constructor(antennas: TerrestrialAntenna[]){
        this.antennas = antennas;
        this.radius = antennas.reduce((max, ant) => Math.max(max, ant.radius), 0);
    }

    get3DObject(){
        const poleGroup = new THREE.Group();

        let poleLength = HC.ANTENNA_POLE_SPACE_BOTTOM + (this.antennas.length -1) * HC.ANTENNA_POLE_DISTANCE_ANTENNAS + this.antennas.reduce((sum, ant) => sum + ant.height, 0) + UTILS.randomInRangeFloat(0, HC.ANTENNA_POLE_RANDOM_EXTRA_HEIGHT);
        if(poleLength < HC.ANTENNA_POLE_MIN_HEIGHT + HC.ANTENNA_POLE_SPACE_BOTTOM) poleLength = HC.ANTENNA_POLE_MIN_HEIGHT + HC.ANTENNA_POLE_SPACE_BOTTOM;

        const clearanceBetweenOverall = poleLength - this.antennas.reduce((sum, ant) => sum + ant.height, 0) - (this.antennas.length - 1) * HC.ANTENNA_POLE_DISTANCE_ANTENNAS - HC.ANTENNA_POLE_SPACE_BOTTOM;
        const clearanceBetween = clearanceBetweenOverall / this.antennas.length;

        const poleGeometry = new THREE.CylinderGeometry(HC.ANTENNA_POLE_RADIUS, HC.ANTENNA_POLE_RADIUS, poleLength, 16);
        poleGeometry.translate(0, poleLength / 2 - HC.ANTENNA_POLE_SPACE_BOTTOM / 2, 0); // Move origin to bottom
        const poleMaterial = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
        poleMesh.castShadow = true;
        poleMesh.receiveShadow = true;

        poleGroup.add(poleMesh);

        let currentHeight = HC.ANTENNA_POLE_SPACE_BOTTOM/2;
        this.antennas.forEach(antenna => {
            const antenna3D = antenna.get3DObject();
            const clearance = UTILS.randomInRangeFloat(0,clearanceBetween);
            antenna3D.position.y = currentHeight + antenna.height/2 + clearance;
            antenna3D.rotateY(antenna.direction);
            poleGroup.add(antenna3D);
            currentHeight += antenna.height + HC.ANTENNA_POLE_DISTANCE_ANTENNAS + clearance;
        });


        return poleGroup;

    }
}

function antennaGeneratorFromType(type: string): TerrestrialAntenna{
    switch(type){
        case HC.ANTENNA_TYPES.AMFM:
            return amFmAntennaGenerator();
        case HC.ANTENNA_TYPES.TV:
            return tvAntennaGenerator();
        case HC.ANTENNA_TYPES.REFLECTOR:
            return tvAntennaWithReflectorGenerator();
        default:
            throw new Error("Invalid antenna type: " + type);
    }
}

export function terrestrialAntennaGenerator(){

    const antennaCount = UTILS.randomInRangeInt(HC.ANTENNA_COUNT_MIN, HC.ANTENNA_COUNT_MAX);
    const antennaTypeCounter = {...HC.antennaTypeCounter};

    const antennas: TerrestrialAntenna[] = [];

    for(let i = 0; i < antennaCount; ++i){
        const possibleAntennaTypes = Object.keys(HC.ANTENNA_TYPES_MAX_COUNT).filter(type => antennaTypeCounter[type] < HC.ANTENNA_TYPES_MAX_COUNT[type]);
        const antennaType = UTILS.randomFromArray(possibleAntennaTypes);
        antennaTypeCounter[antennaType]++;

        antennas.push(antennaGeneratorFromType(antennaType));
    }

    const antennaPole = new AntennaPole(antennas);
    
    return antennaPole;
}
