import * as THREE from 'three';

import { EXTRA_DIST_ROOF_ELEMENTS } from '@/app/lib/config/houseConfig';
import {Decoration, DecorationsPlacer} from '@/app/lib/config/decorations';


export abstract class RoofDecorations extends Decoration{

    constructor(diameter: number){
        super(diameter);
    }

    calculateYPosition(roofDepth: number, roofAngle: number){
        const roofSlope = Math.tan(roofAngle);
        const maxYSub = - roofSlope * roofDepth / 2;
        this.y = maxYSub * Math.abs(this.z) / (roofDepth/2);
    }
}


export class roofDecorationsPlacer extends DecorationsPlacer{
    roofAngle: number;
    decorations: {deco: RoofDecorations, freeDiameter: number}[];

    constructor(areaWidth: number, areaDepth: number, roofAngle: number){
        super(areaWidth, areaDepth);
        this.roofAngle = roofAngle;
        this.decorations = [];
    }

    addDecorationPosition(newDecoration: RoofDecorations, allowedMinX: number, allowedMaxX: number, allowedMinZ: number, allowedMaxZ: number, extraDiameter: number = EXTRA_DIST_ROOF_ELEMENTS): void {
        super.addDecorationPosition(newDecoration, allowedMinX, allowedMaxX, allowedMinZ, allowedMaxZ, extraDiameter);
        newDecoration.calculateYPosition(this.areaDepth, this.roofAngle);
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