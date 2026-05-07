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

    calculate_y_position(roof_pitch_area_depth: number, roof_angle: number){
        const roofSlope = Math.tan(roof_angle);
        //this.y = - roofSlope * (roof_pitch_area_depth / 2 - this.z);
        this.y = - roofSlope * this.z;
    }
}

export function randomRoofDecorationPosition(roof_pitch_area_width: number, roof_pitch_area_depth: number, roof_angle: number, existing_decorations: RoofDecorations[], new_decoration: RoofDecorations): RoofDecorations[] {
    let positionValid = false;

    while(!positionValid){
        const tempPos = UTILS.randomPointOnPlane(roof_pitch_area_width-new_decoration.diameter*2, roof_pitch_area_depth-new_decoration.diameter*2);
        new_decoration.x = tempPos.x;
        new_decoration.z = tempPos.z + roof_pitch_area_depth / 2;
        new_decoration.calculate_y_position(roof_pitch_area_depth, roof_angle);
        positionValid = true;
        for(const existing of existing_decorations){
            positionValid = !UTILS.collision({x: new_decoration.x, z: new_decoration.z}, new_decoration.diameter/2, {x: existing.x, z: existing.z}, existing.diameter/2, EXTRA_DIST_ROOF_ELEMENTS);
            if(!positionValid) break;
        }
    }
    existing_decorations.push(new_decoration);
    return existing_decorations;
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