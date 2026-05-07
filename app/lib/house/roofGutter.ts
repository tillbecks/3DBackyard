import * as THREE from 'three';
import { GUTTER_TUBE_DISTANCE_SIDES, ROOF_OVERHANG_SIDES } from '../config/houseConfig';
import { randomFromObject } from '../config/utils';


const Gutter_Pos: { LEFT: string; RIGHT: string } = {
    LEFT : "left",
    RIGHT: "right"
}

class Roof_Gutter{

    left_or_right: string;
    constructor(left_or_right: string){
        this.left_or_right = left_or_right;
    }
    
    get3DObject(roof_width: number, house_width: number, house_height: number, left_house: number, right_house: number): THREE.Group{
        const gutter_group: THREE.Group = new THREE.Group();

        const geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(1, 1, roof_width, 32, 1, false,0,Math.PI);
        //material with a grey color like a roof gutter
        const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x7a7a7a});
        material.side = THREE.DoubleSide;
        const gutter: THREE.Mesh = new THREE.Mesh(geometry, material);
        gutter.castShadow = true;
        gutter.receiveShadow = true;
        gutter_group.add(gutter);
        gutter_group.rotateZ(-0.5*Math.PI)


        let pos_x: number = 0;
        if(this.left_or_right == Gutter_Pos.LEFT){
            pos_x = - (house_width/2 - GUTTER_TUBE_DISTANCE_SIDES);
        }
        else{
            pos_x = (house_width/2 - GUTTER_TUBE_DISTANCE_SIDES);
        }

        if(left_house == 1){
            pos_x -= ROOF_OVERHANG_SIDES;
        }
        if(right_house == 1){
            pos_x += ROOF_OVERHANG_SIDES;
        }

        const gutter_curve: CustomFloorGutterCurve = new CustomFloorGutterCurve({
            height: house_height,
            offsetZ: 2,
            bendStart: 5,
            bendEnd: 8,});
        const curve_geometry: THREE.TubeGeometry = new THREE.TubeGeometry(gutter_curve, house_height, 0.7, 8, false);
        const curve: THREE.Mesh = new THREE.Mesh(curve_geometry, material);
        curve.castShadow = true;
        curve.receiveShadow = true;
        curve.rotateZ(0.5*Math.PI);
        curve.translateX(-pos_x);
        gutter_group.add(curve);
        
        return gutter_group;
    }
}

export function roof_gutter_generator(roof_width: number, house_width: number, house_height: number, left_house: number, right_house: number): THREE.Group{ 
    const left_or_right: string = randomFromObject(Gutter_Pos);
    const gutter: Roof_Gutter = new Roof_Gutter(left_or_right);
    return gutter.get3DObject(roof_width, house_width, house_height, left_house, right_house);
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