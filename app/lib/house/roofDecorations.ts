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

    calculateYPosition(roofPitchAreaDepth: number, roofAngle: number){
        const roofSlope = Math.tan(roofAngle);
        //this.y = - roofSlope * (roofPitchAreaDepth / 2 - this.z);
        this.y = - roofSlope * this.z;
    }
}

export function randomRoofDecorationPosition(roofPitchAreaWidth: number, roofPitchAreaDepth: number, roofAngle: number, existingDecorations: RoofDecorations[], newDecoration: RoofDecorations): RoofDecorations[] {
    let positionValid = false;

    while(!positionValid){
        const tempPos = UTILS.randomPointOnPlane(roofPitchAreaWidth-newDecoration.diameter*2, roofPitchAreaDepth-newDecoration.diameter*2);
        newDecoration.x = tempPos.x;
        newDecoration.z = tempPos.z + roofPitchAreaDepth / 2;
        newDecoration.calculateYPosition(roofPitchAreaDepth, roofAngle);
        positionValid = true;
        for(const existing of existingDecorations){
            positionValid = !UTILS.collision({x: newDecoration.x, z: newDecoration.z}, newDecoration.diameter/2, {x: existing.x, z: existing.z}, existing.diameter/2, EXTRA_DIST_ROOF_ELEMENTS);
            if(!positionValid) break;
        }
    }
    existingDecorations.push(newDecoration);
    return existingDecorations;
}

export function positionRoofDecorations(decorations: RoofDecorations[], offset: THREE.Vector3): THREE.Group{
    const group = new THREE.Group();
    for(const d of decorations){
        const obj = d.get3DObject();
        obj.position.x += d.x;
        obj.position.y += d.y;
        obj.position.z += d.z;
        group.add(obj);
    }
    group.position.add(offset);
    return group;
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