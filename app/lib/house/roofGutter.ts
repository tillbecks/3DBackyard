import * as THREE from 'three';
import { GUTTER_TUBE_DISTANCE_SIDES, ROOF_OVERHANG_SIDES } from '../config/houseConfig';
import { randomFromObject } from '../config/utils';


const GUTTER_POS: { LEFT: string; RIGHT: string } = {
    LEFT : "left",
    RIGHT: "right"
}

class RoofGutter{

    leftOrRight: string;
    constructor(leftOrRight: string){
        this.leftOrRight = leftOrRight;
    }
    
    get3DObject(roofWidth: number, houseWidth: number, houseHeight: number, leftHouse: number, rightHouse: number): THREE.Group{
        const gutterGroup: THREE.Group = new THREE.Group();

        const geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(1, 1, roofWidth, 32, 1, false,0,Math.PI);
        //material with a grey color like a roof gutter
        const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x7a7a7a});
        material.side = THREE.DoubleSide;
        const gutter: THREE.Mesh = new THREE.Mesh(geometry, material);
        gutter.castShadow = true;
        gutter.receiveShadow = true;
        gutterGroup.add(gutter);
        gutterGroup.rotateZ(-0.5*Math.PI)


        let posX: number = 0;
        if(this.leftOrRight == GUTTER_POS.LEFT){
            posX = - (houseWidth/2 - GUTTER_TUBE_DISTANCE_SIDES);
        }
        else{
            posX = (houseWidth/2 - GUTTER_TUBE_DISTANCE_SIDES);
        }

        if(leftHouse == 1){
            posX -= ROOF_OVERHANG_SIDES;
        }
        if(rightHouse == 1){
            posX += ROOF_OVERHANG_SIDES;
        }

        const gutterCurve: CustomFloorGutterCurve = new CustomFloorGutterCurve({
            height: houseHeight,
            offsetZ: 2,
            bendStart: 5,
            bendEnd: 8,});
        const curveGeometry: THREE.TubeGeometry = new THREE.TubeGeometry(gutterCurve, houseHeight, 0.7, 8, false);
        const curve: THREE.Mesh = new THREE.Mesh(curveGeometry, material);
        curve.castShadow = true;
        curve.receiveShadow = true;
        curve.rotateZ(0.5*Math.PI);
        curve.translateX(-posX);
        gutterGroup.add(curve);
        
        return gutterGroup;
    }
}

export function roofGutterGenerator(roofWidth: number, houseWidth: number, houseHeight: number, leftHouse: number, rightHouse: number): THREE.Group{ 
    const leftOrRight: string = randomFromObject(GUTTER_POS);
    const gutter: RoofGutter = new RoofGutter(leftOrRight);
    return gutter.get3DObject(roofWidth, houseWidth, houseHeight, leftHouse, rightHouse);
}

class CustomFloorGutterCurve extends THREE.Curve<THREE.Vector3> {
    height: number;
    offsetZ: number;
    bendStart: number;
    bendEnd: number;

    constructor({
        height = 10,          // Gesamthöhe nach unten
        offsetZ = 2,          // Wie weit zur Wand
        bendStart = 2,      // Start der Krümmung
        bendEnd = 3         // Ende der Krümmung
    } = {}) {
        super();
        this.height = height;
        this.offsetZ = offsetZ;
        this.bendStart = bendStart/height;
        this.bendEnd = bendEnd/height;
    }

	getPoint( t: number, optionalTarget: THREE.Vector3 = new THREE.Vector3() ): THREE.Vector3 {
		const tx: number = 0;
        const ty: number = -this.height * t;
		let tz: number;
        if(t < this.bendStart){
            tz = 0;
        }
        else if (t >= this.bendEnd){
            tz = -this.offsetZ;
        }
        else{ 
            const localT: number = (t - this.bendStart) / (this.bendEnd - this.bendStart);
            //Wir wollen cos(0) bis cos(pi/2)
            //also cos(localT * pi/2) * this.offsetZ
            tz = this.offsetZ * (Math.cos(localT * (Math.PI / 2)) - 1);
        }
		return optionalTarget.set( tx, ty, tz );
	}
}