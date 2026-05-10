import * as bc from '../config/birdConfig';
import * as THREE from 'three';
import {randomInRangeFloat} from '../config/utils';
import BirdModel from './birdModel';

export default class bird{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    birdGeometry: THREE.Group | THREE.Mesh;
    birdModel: BirdModel;
    lastVelocity: THREE.Vector3;

    constructor(position: THREE.Vector3, velocity: THREE.Vector3){

        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.velocity = new THREE.Vector3(velocity.x, velocity.y, velocity.z);
        this.lastVelocity = this.velocity.clone();

        const birdModel = new BirdModel();
        this.birdModel = birdModel;
        this.birdGeometry = birdModel.get3DObject();
        
        this.birdGeometry.position.copy(this.position);
        // Ausrichtung nach Bewegungsrichtung und Center

        this.birdGeometry.castShadow = true;
        this.birdGeometry.receiveShadow = true;
    }

    animation(){
        if(this.velocity.length() < this.lastVelocity.length()){
            this.birdModel.glide();
        }
        else{
            this.birdModel.flap();
        }
        this.birdGeometry.position.copy(this.position);

        const forward = this.velocity.clone().normalize();
        const dist_center = new THREE.Vector3(bc.SURROUNDING_CENTER.x, this.position.y, bc.SURROUNDING_CENTER.z).sub(this.position).normalize();
        const right = new THREE.Vector3().crossVectors(forward, dist_center).normalize();
        const matrix = new THREE.Matrix4();

        matrix.lookAt(this.position, this.position.clone().sub(forward), right);   
        this.birdGeometry.quaternion.setFromRotationMatrix(matrix);
        this.birdGeometry.rotation.z += this.calculateOutlean();
        this.lastVelocity = this.velocity.clone();
    }

    calculateOutlean(){
        const currentVelocityXZ = new THREE.Vector2(this.velocity.x, this.velocity.z);
        const lastVelocityXZ = new THREE.Vector2(this.lastVelocity.x, this.lastVelocity.z);
        const angle = currentVelocityXZ.angleTo(lastVelocityXZ);
        return angle * bc.LEAN_ANGLE_FACTOR;
    }

    updatePosition(birds: bird[]){
        this.updateVelocity(birds);
        this.position.add(this.velocity);
        this.animation();
    }

    updatePositionWithBias(birds: bird[], point: THREE.Vector3){
        this.updateVelocityWithBias(birds, point);
        this.position.add(this.velocity);
        this.animation();
    }

    updateVelocity(birds: bird[]){
        this.seperation(birds);
        this.alignment(birds);
        this.cohesion(birds);
        this.areaBoundaries();
        this.speedNormalize();
    }

    updateVelocityWithBias(birds: bird[], point: THREE.Vector3){
        this.seperation(birds);
        this.alignment(birds);
        this.cohesion(birds);
        this.areaBoundaries();
        this.biasPoint(point);
        this.speedNormalize();
    }

    speedNormalize(){
        const speed = this.velocity.length();
        if (speed > bc.MAX_SPEED){
            this.velocity.multiplyScalar(bc.MAX_SPEED / speed);
        }
        if (speed < bc.MIN_SPEED){
            this.velocity.multiplyScalar(bc.MIN_SPEED / speed);
        }
    }

    seperation(birds: bird[]){    
        const difference = new THREE.Vector3(0,0,0);
        for (const bird of birds){
            const distance = this.position.distanceTo(bird.position);
            if (distance < bc.PROTECTED_RANGE){
                difference.add(this.position.clone().sub(bird.position));
            }

        }

        this.velocity.add(difference.multiplyScalar(bc.avoid_factor));
    }

    alignment(birds: bird[]){
        const avg_velocity = new THREE.Vector3(0,0,0);
        let neighbor_count = 0;
        
        for (const bird of birds){
            const distance = this.position.distanceTo(bird.position);
            if (distance < bc.VISUAL_RANGE){
                avg_velocity.add(bird.velocity);
                neighbor_count += 1;
            }
        }
        if (neighbor_count > 0) {
            avg_velocity.divideScalar(neighbor_count);
            avg_velocity.sub(this.velocity);
        }
        this.velocity.add(avg_velocity.multiplyScalar(bc.matching_factor));
    }

    cohesion(birds: bird[]){
        const center_of_mass = new THREE.Vector3(0,0,0);
        let neighbor_count = 0;

        for (const bird of birds){
            const distance = this.position.distanceTo(bird.position);
            if (distance < bc.VISUAL_RANGE){
                center_of_mass.add(bird.position);
                neighbor_count += 1;
            }
        }
        if (neighbor_count > 0) {
            center_of_mass.divideScalar(neighbor_count);
            center_of_mass.sub(this.position);
        }
        this.velocity.add(center_of_mass.multiplyScalar(bc.centering_factor));
    }

    areaBoundaries(){
        const to_center = new THREE.Vector3(bc.SURROUNDING_CENTER.x, bc.SURROUNDING_CENTER.y, bc.SURROUNDING_CENTER.z).sub(this.position);
        if (to_center.x > bc.SURROUNDING_RADIUS_WIDTH){
            this.velocity.x += bc.turn_factor;
        }
        if (to_center.x < -bc.SURROUNDING_RADIUS_WIDTH){
            this.velocity.x -= bc.turn_factor;
        }
        if (to_center.y > bc.SURROUNDING_RADIUS_HEIGHT){
            this.velocity.y += bc.turn_factor;
        }
        if (to_center.y < -bc.SURROUNDING_RADIUS_HEIGHT){
            this.velocity.y -= bc.turn_factor;
        }
        if (to_center.z > bc.SURROUNDING_RADIUS_DEPTH){
            this.velocity.z += bc.turn_factor;
        } 
        if (to_center.z < -bc.SURROUNDING_RADIUS_DEPTH){
            this.velocity.z -= bc.turn_factor;
        }
    }    

    biasPoint(point: THREE.Vector3){
        const to_point = new THREE.Vector3(point.x, point.y, point.z).sub(this.position);
        this.velocity.add(to_point.multiplyScalar(bc.bias_factor));
    }
}

export function birdGenerator(){
    const get_velocity = () => randomInRangeFloat(bc.INIT_SPEED_MIN, bc.INIT_SPEED_MAX);
    const init_velocity = new THREE.Vector3(get_velocity(), get_velocity(), get_velocity());
    const get_position = () => randomInRangeFloat(-bc.INIT_CENTER_DISTANCE, bc.INIT_CENTER_DISTANCE);
    const init_position = new THREE.Vector3(bc.SURROUNDING_CENTER.x + get_position(), bc.SURROUNDING_CENTER.y + get_position(), bc.SURROUNDING_CENTER.z + get_position());
    return new bird(init_position, init_velocity);
}

