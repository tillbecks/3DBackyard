import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import * as HC from '@/app/lib/config/houseConfig';
import * as UTILS from '@/app/lib/config/utils';
import { RoofDecorations } from '@/app/lib/backyard/house/roofDecorations';
import { materialShaderConfigs } from '@/app/lib/materials/materials';

class TerrestrialAntenna{
    height: number;
    direction: number;
    diameter: number;

    constructor(height: number, direction: number, diameter: number = 1){
        this.diameter = diameter;
        this.height = height;
        this.direction = direction;
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
        const geometries: THREE.BufferGeometry[] = [];
        const material = materialShaderConfigs.ANTENNA_MATERIAL();

        const antennaBlockConfig = {
            size: 0.3,
            height: this.height}

        const antennaBlock = new THREE.BoxGeometry(antennaBlockConfig.size, antennaBlockConfig.height, antennaBlockConfig.size);
        geometries.push(antennaBlock);

        const stickGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.width, 8);
        stickGeometry.rotateX(0.5*Math.PI);
        geometries.push(stickGeometry);

        if(this.type == HC.AMFMANTENNA_TYPES.CROSS){
            const stickGeometry2 = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.width, 8);
            stickGeometry2.rotateX(0.5*Math.PI);
            stickGeometry2.rotateZ(0.5*Math.PI);
            geometries.push(stickGeometry2);
        }

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false) || new THREE.BufferGeometry();
        const antennaGroup = new THREE.Group();
        
        const mesh = new THREE.Mesh(mergedGeometry);
        mesh.userData.materialConfig = material;
        antennaGroup.add(mesh);

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
        super(HC.TVANTENNA_HEIGHT, direction, hasReflector ? length * 2: length);
        this.length = length;
        this.elementDist = elementDist;
        this.elementLength = elementLength;
        this.hasReflector = hasReflector;
    }

    get3DObject(): THREE.Group{
        const geometries: THREE.BufferGeometry[] = [];
        const material = materialShaderConfigs.ANTENNA_MATERIAL();

        if(!this.hasReflector){
            const antennaBlockConfig = {
                size: 0.3,
                height: this.height}

            const antennaBlock = new THREE.BoxGeometry(antennaBlockConfig.size, antennaBlockConfig.height, antennaBlockConfig.size);
            geometries.push(antennaBlock);
        }

        const antennaMainRodGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.length, 8);
        antennaMainRodGeometry.rotateX(0.5*Math.PI);
        geometries.push(antennaMainRodGeometry);

        const elementAmount = Math.floor(this.length / this.elementDist);
        const extraOffsetY = (this.length - (elementAmount - 1) * this.elementDist) / 2;
        
        for(let i = 0; i < elementAmount; i++){
            const elementGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.elementLength, 8);
            elementGeometry.rotateZ(0.5*Math.PI);
            elementGeometry.translate(0, -this.length/2 + i*this.elementDist + extraOffsetY, 0);
            elementGeometry.rotateX(0.5*Math.PI);
            geometries.push(elementGeometry);
        }

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false) || new THREE.BufferGeometry();
        const antennaGroup = new THREE.Group();
        
        const mesh = new THREE.Mesh(mergedGeometry);
        mesh.userData.materialConfig = material;
        antennaGroup.add(mesh);

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

    get3DObject(): THREE.Group {
        const reflectorAntennaGroup = new THREE.Group();
        const material = materialShaderConfigs.ANTENNA_MATERIAL();
        const geometries: THREE.BufferGeometry[] = [];

        // Antennenteil von super — bereits gemergte Geometrie extrahieren
        const antennaPart = super.get3DObject();
        const antennaMesh = antennaPart.children[0] as THREE.Mesh;
        const antennaGeo = antennaMesh.geometry.clone();
        // super verschiebt mit translateZ(length/2) — das übernehmen wir:
        antennaGeo.translate(0, 0, this.length / 2);
        geometries.push(antennaGeo);

        // Connector (liegt horizontal, rotateZ 90°)
        const connectorGeometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorWidth, 8);
        connectorGeometry.rotateZ(0.5 * Math.PI);
        geometries.push(connectorGeometry);

        const buildWing = (isSecond: boolean): THREE.BufferGeometry => {
            const wingGeos: THREE.BufferGeometry[] = [];

            // Frame pieces — vertikal entlang Z verteilt
            for (let i = 0; i < HC.REFLECTOR_FRAME_PIECES; ++i) {
                const geo = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorLength, 8);
                // Z-Position vor der Rotation setzen
                const zPos = -this.reflectorWidth / 2 + i * (this.reflectorWidth / (HC.REFLECTOR_FRAME_PIECES - 1));
                geo.translate(0, 0, zPos);
                wingGeos.push(geo);
            }

            const reflectorElementCount = Math.floor(this.reflectorLength / HC.REFLECTOR_ELEMENT_DIST);
            const reflectorElementDst = this.reflectorLength / reflectorElementCount;
            for (let i = 0; i < reflectorElementCount; ++i) {
                const geo = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorWidth, 8);
                const yPos = -this.reflectorLength / 2 + i * reflectorElementDst + reflectorElementDst;
                geo.rotateX(0.5 * Math.PI); // liegt horizontal in Z-Richtung
                geo.translate(0, yPos, 0);
                wingGeos.push(geo);
            }

            const merged = BufferGeometryUtils.mergeGeometries(wingGeos, false) 
                || new THREE.BufferGeometry();

            // Schritt 1: rotateY(90°) — Streben zeigen jetzt in X-Richtung
            merged.rotateY(0.5 * Math.PI );

            merged.translate(0, this.reflectorLength / 2, 0);
            
            // Schritt 2: Wing kippen
            // Wing 1: rotateZ(+reflectorAngle) — kippt nach einer Seite
            // Wing 2: rotateZ(-reflectorAngle) — kippt nach anderer Seite (Spiegelung)
            merged.rotateX(isSecond ?  Math.PI - this.reflectorAngle : this.reflectorAngle);

            return merged;
        };

        // Erste Wing-Seite
        geometries.push(buildWing(false));
        // Zweite Wing-Seite — zusätzlich rotateZ(reflectorAngle * 2)
        geometries.push(buildWing(true));

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false) || new THREE.BufferGeometry();
        const mesh = new THREE.Mesh(mergedGeometry);
        mesh.userData.materialConfig = material;
        reflectorAntennaGroup.add(mesh);

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

export class AntennaPole extends RoofDecorations{
    antennas: TerrestrialAntenna[];

    constructor(antennas: TerrestrialAntenna[]){
        super(antennas.reduce((max, ant) => Math.max(max, ant.diameter), 0));
        this.antennas = antennas;
    }

    get3DObject(){
        const poleGroup = new THREE.Group();
        const material = materialShaderConfigs.ANTENNA_MATERIAL();

        let poleLength = HC.ANTENNA_POLE_SPACE_BOTTOM + (this.antennas.length -1) * HC.ANTENNA_POLE_DISTANCE_ANTENNAS + this.antennas.reduce((sum, ant) => sum + ant.height, 0) + UTILS.randomInRangeFloat(0, HC.ANTENNA_POLE_RANDOM_EXTRA_HEIGHT);
        if(poleLength < HC.ANTENNA_POLE_MIN_HEIGHT + HC.ANTENNA_POLE_SPACE_BOTTOM) poleLength = HC.ANTENNA_POLE_MIN_HEIGHT + HC.ANTENNA_POLE_SPACE_BOTTOM;

        const clearanceBetweenOverall = poleLength - this.antennas.reduce((sum, ant) => sum + ant.height, 0) - (this.antennas.length - 1) * HC.ANTENNA_POLE_DISTANCE_ANTENNAS - HC.ANTENNA_POLE_SPACE_BOTTOM;
        const clearanceBetween = clearanceBetweenOverall / this.antennas.length;

        const poleGeometry = new THREE.CylinderGeometry(HC.ANTENNA_POLE_RADIUS, HC.ANTENNA_POLE_RADIUS, poleLength, 8);
        poleGeometry.translate(0, poleLength / 2 - HC.ANTENNA_POLE_SPACE_BOTTOM / 2, 0);
        const poleMesh = new THREE.Mesh(poleGeometry);
        poleMesh.userData.materialConfig = material;
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

export function terrestrialAntennaGenerator(): RoofDecorations{

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
