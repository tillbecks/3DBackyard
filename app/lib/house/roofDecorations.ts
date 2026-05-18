import * as UTILS from '../config/utils';
import * as THREE from 'three';
import { HouseElement } from './houseElement';
import { EXTRA_DIST_ROOF_ELEMENTS } from '../config/houseConfig';
import * as TDUTILS from '../config/3dUtils';

export abstract class RoofDecorations extends HouseElement{
    diameter: number;
    x: number;
    y: number;
    z: number;


    constructor(diameter: number){
        super();
        this.diameter = diameter;
        this.x = 0;
        this.z = 0;
        this.y = 0;
    }

    calculateYPosition(roofDepth: number, roofAngle: number){
        const roofSlope = Math.tan(roofAngle);
        const maxYSub = - roofSlope * roofDepth / 2;
        this.y = maxYSub * Math.abs(this.z) / (roofDepth/2);
    }
}

export class roofDecorationsPlacer{
    areaWidth: number;
    areaDepth: number;
    roofAngle: number;
    decorations: {deco: RoofDecorations, freeDiameter: number}[];

    constructor(areaWidth: number, areaDepth: number, roofAngle: number){
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        this.roofAngle = roofAngle;
        this.decorations = [];
    }

    //allowedMin/MaxX/Z in percentage of the area
    //The extraDistance describes the area around the object that should be free
    //
    addRoofDecorationPosition(newDecoration: RoofDecorations, allowedMinX: number, allowedMaxX: number, allowedMinZ: number, allowedMaxZ: number, extraDiameter: number = EXTRA_DIST_ROOF_ELEMENTS): void {
        let positionValid = false;

        const baseWidth = (allowedMaxX - allowedMinX) * this.areaWidth; 
        const baseDepth = (allowedMaxZ - allowedMinZ) * this.areaDepth;
        const ignoreDiameterX = baseWidth < newDecoration.diameter;
        const ignoreDiameterZ = baseDepth < newDecoration.diameter;
        const effectiveAreaWidth = ignoreDiameterX ? baseWidth : baseWidth - newDecoration.diameter;
        const effectiveAreaDepth = ignoreDiameterZ ? baseDepth : baseDepth - newDecoration.diameter;

        while(!positionValid){
            //If the allowed area is smaller than the decoration, we ignore the diameter of the decoration
            const tempPos = UTILS.randomPointOnPlane(effectiveAreaWidth, effectiveAreaDepth);
            newDecoration.x = -this.areaWidth / 2 +allowedMinX * this.areaWidth + tempPos.x + (ignoreDiameterX ? 0 : newDecoration.diameter / 2);
            newDecoration.z = -this.areaDepth / 2 + allowedMinZ * this.areaDepth + tempPos.z + (ignoreDiameterZ ? 0 : newDecoration.diameter / 2);
            //newDecoration.calculateYPosition(this.areaDepth, this.roofAngle);
            //positionValid = true;
            positionValid = true;
            for(const existing of this.decorations){
                positionValid = !UTILS.collision({x: newDecoration.x, z: newDecoration.z}, newDecoration.diameter/2 + extraDiameter/2, {x: existing.deco.x, z: existing.deco.z}, existing.freeDiameter/2, 0);
                if(!positionValid) break;
            }
        }
        newDecoration.calculateYPosition(this.areaDepth, this.roofAngle);
        this.decorations.push({deco: newDecoration, freeDiameter: extraDiameter + newDecoration.diameter});   
    }

    positionRoofDecorations(offset: THREE.Vector3): THREE.Group{
        const group = new THREE.Group();
        for(const d of this.decorations){
            const obj = d.deco.get3DObject();
            obj.position.x = d.deco.x;
            obj.position.y = d.deco.y;
            obj.position.z = d.deco.z;
            group.add(obj);
        }
        group.position.add(offset);
        return group;
    }
}

export class testDot extends RoofDecorations{
    constructor(diameter: number, x: number = 0, z: number = 0){
        super(diameter);
        this.x = x;
        this.z = z;
    }

    get3DObject(){
        const group = new THREE.Group();
        const geometry = new THREE.SphereGeometry(this.diameter/2, 16, 16);
        const material = new THREE.MeshStandardMaterial({color: 0xff0000});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return group;
    }
}