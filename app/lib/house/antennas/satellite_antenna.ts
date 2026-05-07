import * as HC from '../../config/houseConfig';
import * as TDUTILS from '../../config/3dUtils';
import * as UTILS from '../../config/utils';
import * as THREE from 'three';
import {RoofDecorations} from '../roofDecorations';

class SatelliteBowlReceiver extends RoofDecorations{
    height: number;
    bowl_angle_deviation: number;

    constructor(diameter: number, height: number, bowl_angle_deviation: number = 0){
        super(diameter);
        this.height = height;
        this.bowl_angle_deviation = bowl_angle_deviation;
    }

    get3DObject(){
        const bowl_group = new THREE.Group();

        const bowl_pole_config = {
            radius: HC.SATELLITE_RECEIVER_POLE_RADIUS,
        }

        const bowl_config = {
            radius: this.diameter/2,
            angle: Math.PI*0.1 + this.bowl_angle_deviation
        }

        const bowl_geometry = new THREE.SphereGeometry(bowl_config.radius, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.25);
        bowl_geometry.translate(0, -bowl_config.radius, 0);
        const bowl_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX, side: THREE.DoubleSide});
        const bowl_mesh = new THREE.Mesh(bowl_geometry, bowl_material);
        bowl_mesh.castShadow = true;
        bowl_mesh.receiveShadow = true;
        bowl_mesh.rotateX(Math.PI/2);


        const antenna = new ReceiverAntenna(this.diameter, bowl_config.angle).get3DObject();
        antenna.translateY(- this.diameter/4);
        antenna.translateZ(- this.diameter/2 - (bowl_config.radius - UTILS.calcCirclePosX(bowl_config.radius, this.diameter/4).positive));

        bowl_group.add(bowl_mesh);
        bowl_group.add(antenna);

        bowl_group.rotateX(bowl_config.angle);

        const all_group = new THREE.Group();

        const pole_geometry = new THREE.CylinderGeometry(bowl_pole_config.radius, bowl_pole_config.radius, this.height, 16);
        const pole_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const pole_mesh = new THREE.Mesh(pole_geometry, pole_material);
        pole_mesh.position.y = -this.height/2;
        pole_mesh.castShadow = true;
        pole_mesh.receiveShadow = true;

        pole_mesh.position.z += bowl_pole_config.radius;
        
        pole_mesh.position.y += this.height;
        bowl_group.position.y += this.height;

        all_group.add(pole_mesh);
        all_group.add(bowl_group);
        all_group.position.z += bowl_pole_config.radius;

        all_group.rotation.y = HC.SATELLITE_RECEIVER_Y_DIRECTION;

        return all_group;
    }
}

export function antenna_generator(){
    const diameter = UTILS.randomInRangeInt(HC.SATELLITE_RECEIVER_BOWL_DIAMETER_MIN, HC.SATELLITE_RECEIVER_BOWL_DIAMETER_MAX);
    const height = UTILS.randomInRangeInt(HC.SATELLITE_RECEIVER_BOWL_HEIGHT_MIN, HC.SATELLITE_RECEIVER_BOWL_HEIGHT_MAX);

    const bowl = new SatelliteBowlReceiver(diameter, height);
    return bowl;
}

class ReceiverAntenna{

    bowl_size: number;
    bowl_angle: number;

    constructor(bowl_size: number, bowl_angle: number){
        this.bowl_size = bowl_size;
        this.bowl_angle = bowl_angle;
    }

    get3DObject(){
        const antenna_group = new THREE.Group();

        const receiver_block_group = new THREE.Group();

        const receiver_block_params = {
                width: 0.2,
                height: 0.3,
                depth: 0.1
        }
        const receiver_block_geometry = new THREE.BoxGeometry(receiver_block_params.width, receiver_block_params.height, receiver_block_params.depth);
        const receiver_block_material = new THREE.MeshStandardMaterial({color: '#ffffff'});
        const receiver_block_mesh = new THREE.Mesh(receiver_block_geometry, receiver_block_material);
        receiver_block_mesh.castShadow = true;
        receiver_block_mesh.receiveShadow = true;
        
        const receiver_cylinder_params = {
            radius: receiver_block_params.width/3,
            height: receiver_block_params.depth,
        }

        const receiver_cylinder_geometry = new THREE.CylinderGeometry(receiver_cylinder_params.radius, receiver_cylinder_params.radius, receiver_cylinder_params.height, 16);
        const receiver_cylinder_material = new THREE.MeshStandardMaterial({color: '#ffffff'});
        const receiver_cylinder_mesh = new THREE.Mesh(receiver_cylinder_geometry, receiver_cylinder_material);
        receiver_cylinder_mesh.position.y += receiver_block_params.height/4;
        receiver_cylinder_mesh.castShadow = true;
        receiver_cylinder_mesh.receiveShadow = true;
        receiver_cylinder_mesh.rotateX(Math.PI/2);
        receiver_cylinder_mesh.position.z += receiver_block_params.depth/2;
        
        const receiver_pole_params = {
            radius: 0.02,
            height: this.bowl_size/2
        }
        const receiver_pole_geometry = new THREE.CylinderGeometry(receiver_pole_params.radius, receiver_pole_params.radius, receiver_pole_params.height, 16);
        const receiver_pole_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX, side: THREE.DoubleSide});
        const receiver_pole_mesh = new THREE.Mesh(receiver_pole_geometry, receiver_pole_material); 
        receiver_pole_mesh.castShadow = true;
        receiver_pole_mesh.receiveShadow = true;
        receiver_pole_mesh.rotateX(Math.PI/2);

        /*receiver_pole_mesh.position.y -= receiver_block_params.height/6 ;
        receiver_pole_mesh.position.z += this.bowl_size/4 + receiver_pole_params.radius;*/

        receiver_block_group.position.y += receiver_block_params.height/6 ;
        receiver_block_group.position.z -= this.bowl_size/4 + receiver_pole_params.radius;

        receiver_block_group.add(receiver_cylinder_mesh);
        receiver_block_group.add(receiver_block_mesh);

        receiver_block_group.rotateX(-this.bowl_angle);


        antenna_group.add(receiver_pole_mesh);
        antenna_group.add(receiver_block_group);

        antenna_group.position.z += receiver_pole_params.height/2;

        return antenna_group;
    }
}