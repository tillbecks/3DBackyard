import * as THREE from 'three';
import { MAX_ROOF_HEIGHT, MAX_ROOF_OVERHANG, MIN_ROOF_HEIGHT, MIN_ROOF_OVERHANG, ROOF_WALL_THICKNESS , ROOF_OVERHANG_SIDES, ANTENNA_PROBABILITY, SATELLITE_RECEIVER_PROBABILITY, MAX_SATELLITE_RECEIVERS, ANTENNA_ROOF_POSITION_FROM_TOP} from '../config/houseConfig';
import { adjustColor, randomInRangeInt, angleToRad, randomBoolean, randomPointOnPlane, collision, randomFromObject } from '../config/utils';
/*import { brickFragmentShader } from '../../procedural_textures/brick_texture';
import { vertexShader } from '../../procedural_textures/general_texture';
import { roofTileShader } from '../../procedural_textures/roof_texture';*/
import { roof_gutter_generator } from './roofGutter';
import { terrestrialAntenna_generator } from './antennas/terrestrial_antenna';
import * as TDUTILS from '../config/3dUtils';
import { antenna_generator } from './antennas/satellite_antenna';
import { HouseElement } from './houseElement';
import { positionRoofDecorations, randomRoofDecorationPosition, RoofDecorations, testDot } from './roofDecorations';
import * as TYPES from '../../types/typeIndex';
import { calcUVS } from '../config/3dUtils';
import { getRoofMaterials } from '../textures/materials';



class Roof extends HouseElement{
    roof_height: number;
    overhang: number;

    constructor(roof_height: number, overhang: number){
        super();
        this.roof_height = roof_height;
        this.overhang = overhang;
    }

    get3DObject(house_depth: number, house_width: number, house_material: TYPES.MaterialMix, left_house: number, right_house: number, house_height: number): THREE.Group{
        const roof_material_mix: TYPES.MaterialMix = randomFromObject(getRoofMaterials());
        const roof_material = roof_material_mix.standardMaterial;
        const roof_pitch_length: number = Math.sqrt(Math.pow(this.roof_height, 2) + Math.pow(house_depth/2, 2));
        //const roof_angle = Math.asin(this.roof_height/roof_pitch_length);
        const roof_angle: number = angleToRad(90)-Math.atan(this.roof_height/(house_depth/2));

        const pitch_front_height: number = roof_pitch_length + ROOF_WALL_THICKNESS + this.overhang;
        const roof_house_material = house_material.standardMaterial;
        roof_house_material.side = THREE.DoubleSide;
        const roof_group: THREE.Group = new THREE.Group();
        
        const roof_side_a_geometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        roof_side_a_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            -house_width / 2, this.roof_height, 0,       // Top point
            -house_width / 2, 0, -house_depth / 2,      // Bottom back
            -house_width / 2, 0, house_depth / 2        // Bottom front
        ]), 3));
        roof_side_a_geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            0.5, 1,
            0, 0,
            1, 0
        ]), 2));
        roof_side_a_geometry.setIndex([0, 1, 2]);
        roof_side_a_geometry.computeVertexNormals();    
        const roof_side_a: THREE.Mesh = new THREE.Mesh(roof_side_a_geometry, roof_house_material);
        roof_side_a.castShadow = true;
        roof_side_a.receiveShadow = true;
        roof_side_a.userData.shader = house_material.shaderMaterial;
        calcUVS(roof_side_a.geometry);
        roof_group.add(roof_side_a);

        const roof_side_b_geometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        roof_side_b_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            house_width / 2, this.roof_height, 0,       // Top point
            house_width / 2, 0, -house_depth / 2,      // Bottom back
            house_width / 2, 0, house_depth / 2        // Bottom front
        ]), 3));
        roof_side_b_geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            0.5, 1,
            0, 0,
            1, 0
        ]), 2));
        roof_side_b_geometry.setIndex([0, 1, 2]);
        roof_side_b_geometry.computeVertexNormals();  
        const roof_side_b: THREE.Mesh = new THREE.Mesh(roof_side_b_geometry, roof_house_material);
        roof_side_b.castShadow = true;
        roof_side_b.receiveShadow = true;
        roof_side_b.userData.shader = house_material.shaderMaterial;
        calcUVS(roof_side_b.geometry);
        roof_group.add(roof_side_b);

        const roof_width: number = house_width + (left_house+right_house)*ROOF_OVERHANG_SIDES;

        const move_y_front: number = (pitch_front_height / 2) - this.overhang;
        const roof_pitch_front: THREE.BoxGeometry = new THREE.BoxGeometry(roof_width, pitch_front_height, ROOF_WALL_THICKNESS);
        const roof_pitch_front_mesh: THREE.Mesh = new THREE.Mesh(roof_pitch_front, roof_material);
        roof_pitch_front_mesh.castShadow = true;
        roof_pitch_front_mesh.receiveShadow = true; 
        roof_pitch_front_mesh.userData.shader = roof_material_mix.shaderMaterial;
        if(left_house + right_house == 1){
            roof_pitch_front_mesh.translateX((right_house - left_house)*(ROOF_OVERHANG_SIDES/2));
        }
        roof_pitch_front_mesh.translateZ(house_depth/2);
        roof_pitch_front_mesh.rotateX(-roof_angle);
        roof_pitch_front_mesh.translateY(move_y_front);
        roof_pitch_front_mesh.translateZ(ROOF_WALL_THICKNESS/2);

        const pitch_back_height: number = roof_pitch_length + this.overhang;
        const move_y_back: number = (pitch_back_height / 2) - this.overhang;
        const roof_pitch_back: THREE.BoxGeometry = new THREE.BoxGeometry(roof_width, pitch_front_height, ROOF_WALL_THICKNESS);
        const roof_pitch_back_mesh: THREE.Mesh = new THREE.Mesh(roof_pitch_back, roof_material);
        roof_pitch_back_mesh.castShadow = true;
        roof_pitch_back_mesh.receiveShadow = true;
        roof_pitch_back_mesh.userData.shader = roof_material_mix.shaderMaterial;
        if(left_house + right_house == 1){
            roof_pitch_back_mesh.translateX((right_house - left_house)*(ROOF_OVERHANG_SIDES/2));
        }
        roof_pitch_back_mesh.translateZ(-house_depth/2);
        roof_pitch_back_mesh.rotateX(roof_angle);
        roof_pitch_back_mesh.translateY(move_y_back);
        roof_pitch_back_mesh.translateZ(-ROOF_WALL_THICKNESS/2);

        calcUVS(roof_pitch_front_mesh.geometry);
        calcUVS(roof_pitch_back_mesh.geometry);
        roof_group.add(roof_pitch_front_mesh);
        roof_group.add(roof_pitch_back_mesh);

        const roof_gutter: THREE.Group = roof_gutter_generator(roof_width, house_width, house_height, left_house, right_house);
        
        roof_gutter.translateZ(house_depth/2);
        roof_gutter.rotateY(-roof_angle);
        roof_gutter.translateX(this.overhang);
        roof_gutter.translateZ(ROOF_WALL_THICKNESS);
        roof_gutter.rotateY(roof_angle);
        roof_gutter.translateZ(1);
        if(left_house + right_house == 1){
            roof_gutter.translateY((right_house - left_house)*(ROOF_OVERHANG_SIDES/2));
        }
        roof_group.add(roof_gutter);

        if(randomBoolean(ANTENNA_PROBABILITY)){
            const antenna = terrestrialAntenna_generator();
            const antenna_object = antenna.get3DObject();
            antenna_object.position.y += this.roof_height;

            const max_antenna_offset = roof_width - antenna.radius * 2;
            const antenna_offset = max_antenna_offset / 2 - randomInRangeInt(0, max_antenna_offset);
            antenna_object.position.x = antenna_offset;
            roof_group.add(antenna_object);
        }

        let roof_decoration: RoofDecorations[] = [];

        if(randomBoolean(SATELLITE_RECEIVER_PROBABILITY)){
            const amnt = randomInRangeInt(1, MAX_SATELLITE_RECEIVERS);

            for(let i = 0; i < amnt; i++){
                const bowl = antenna_generator();
                //house_depth/4 makes the antennas only spawn on the upper half of the front roof pitch
                roof_decoration = randomRoofDecorationPosition(roof_width, house_depth/2 * ANTENNA_ROOF_POSITION_FROM_TOP, angleToRad(90) - roof_angle, roof_decoration, bowl);
            }
        }

        const roof_decorations_group = positionRoofDecorations(roof_decoration, new THREE.Vector3(0, this.roof_height + ROOF_WALL_THICKNESS, 0));
        
        roof_group.add(roof_decorations_group);
        return roof_group;
    }
}

export function roof_generator(house_depth: number, house_width: number, house_material: TYPES.MaterialMix, left_house: number, right_house: number, house_height: number): THREE.Group {
    const roof_height: number =  randomInRangeInt(MAX_ROOF_HEIGHT, MIN_ROOF_HEIGHT);
    const roof_overhang: number = randomInRangeInt(MAX_ROOF_OVERHANG, MIN_ROOF_OVERHANG);
    //const roof_color: string =  adjustColor("#8e8e8e", 20);

    const roof = new Roof(roof_height, roof_overhang);
    
    return roof.get3DObject(house_depth, house_width, house_material, left_house, right_house, house_height);
}