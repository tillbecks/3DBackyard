import * as bc from '../config/birdConfig';
import * as THREE from 'three';
import {randomInRangeFloat} from '../config/utils';
import { FLAP_POSITIONS } from '../config/birdConfig';
import { angleToRad } from '../config/utils';

export default class Bird{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    birdGeometry: THREE.Group | THREE.Mesh | THREE.Object3D;
    //birdModel: BirdModel;
    lastVelocity: THREE.Vector3;
    leftWing: THREE.Mesh|null;
    rightWing: THREE.Mesh|null;
    flapPosition: number;

    constructor(position: THREE.Vector3, velocity: THREE.Vector3, model: THREE.Group | THREE.Object3D){

        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.velocity = new THREE.Vector3(velocity.x, velocity.y, velocity.z);
        this.lastVelocity = this.velocity.clone();

        this.flapPosition = 0;
        this.leftWing = null;
        this.rightWing = null;

        this.birdGeometry = model.clone();
        try{
            this.birdGeometry.traverse((child) => {
                if (child.name === bc.ID_LEFT_WING) {
                    this.leftWing = child as THREE.Mesh;
                }
                if (child.name === bc.ID_RIGHT_WING) {
                    this.rightWing = child as THREE.Mesh;
                }
            });
        }catch(error){
            console.error("Error traversing bird model to find wings:", error);
        }
        
        this.birdGeometry.position.copy(this.position);
        // Ausrichtung nach Bewegungsrichtung und Center

        this.birdGeometry.castShadow = true;
        this.birdGeometry.receiveShadow = true;
    }

    animation(){
        if(this.velocity.length() < this.lastVelocity.length()){
            this.glide();
        }
        else{
            this.flap();
        }
        this.birdGeometry.position.copy(this.position);

        const forward = this.velocity.clone().normalize();
        const distCenter = new THREE.Vector3(bc.SURROUNDING_CENTER.x, this.position.y, bc.SURROUNDING_CENTER.z).sub(this.position).normalize();
        const right = new THREE.Vector3().crossVectors(forward, distCenter).normalize();
        const matrix = new THREE.Matrix4();

        matrix.lookAt(this.position, this.position.clone().sub(forward), right);   
        this.birdGeometry.quaternion.setFromRotationMatrix(matrix);
        this.birdGeometry.rotation.z += this.calculateOutlean();
        this.lastVelocity = this.velocity.clone();
    }

    glide(){
        if(this.leftWing && this.rightWing && this.flapPosition !== 0){
            this.leftWing.rotation.z = -angleToRad(FLAP_POSITIONS[0]);
            this.rightWing.rotation.z = angleToRad(FLAP_POSITIONS[0]);
            this.flapPosition = 0;
        }
    }

    flap(){
        if(this.leftWing && this.rightWing){
            this.flapPosition = (this.flapPosition + 1) % FLAP_POSITIONS.length;
            this.leftWing.rotation.z = -angleToRad(FLAP_POSITIONS[this.flapPosition]);
            this.rightWing.rotation.z = angleToRad(FLAP_POSITIONS[this.flapPosition]);
        }else{
            //console.log("No wings found for flapping animation.");
            //console.log(this.leftWing, this.rightWing);
        }
    }

    calculateOutlean(){
        const currentVelocityXZ = new THREE.Vector2(this.velocity.x, this.velocity.z);
        const lastVelocityXZ = new THREE.Vector2(this.lastVelocity.x, this.lastVelocity.z);
        const angle = currentVelocityXZ.angleTo(lastVelocityXZ);
        return angle * bc.LEAN_ANGLE_FACTOR;
    }

    updatePosition(birds: Bird[]){
        this.updateVelocity(birds);
        this.position.add(this.velocity);
        this.animation();
    }

    updatePositionWithBias(birds: Bird[], point: THREE.Vector3){
        this.updateVelocityWithBias(birds, point);
        this.position.add(this.velocity);
        this.animation();
    }

    updateVelocity(birds: Bird[]){
        this.seperation(birds);
        this.alignment(birds);
        this.cohesion(birds);
        this.areaBoundaries();
        this.speedNormalize();
    }

    updateVelocityWithBias(birds: Bird[], point: THREE.Vector3){
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

    seperation(birds: Bird[]){    
        const difference = new THREE.Vector3(0,0,0);
        for (const bird of birds){
            const distance = this.position.distanceTo(bird.position);
            if (distance < bc.PROTECTED_RANGE){
                difference.add(this.position.clone().sub(bird.position));
            }

        }

        this.velocity.add(difference.multiplyScalar(bc.avoidFactor));
    }

    alignment(birds: Bird[]){
        const avgVelocity = new THREE.Vector3(0,0,0);
        let neighborCount = 0;
        
        for (const bird of birds){
            const distance = this.position.distanceTo(bird.position);
            if (distance < bc.VISUAL_RANGE){
                avgVelocity.add(bird.velocity);
                neighborCount += 1;
            }
        }
        if (neighborCount > 0) {
            avgVelocity.divideScalar(neighborCount);
            avgVelocity.sub(this.velocity);
        }
        this.velocity.add(avgVelocity.multiplyScalar(bc.matchingFactor));
    }

    cohesion(birds: Bird[]){
        const centerOfMass = new THREE.Vector3(0,0,0);
        let neighborCount = 0;

        for (const bird of birds){
            const distance = this.position.distanceTo(bird.position);
            if (distance < bc.VISUAL_RANGE){
                centerOfMass.add(bird.position);
                neighborCount += 1;
            }
        }
        if (neighborCount > 0) {
            centerOfMass.divideScalar(neighborCount);
            centerOfMass.sub(this.position);
        }
        this.velocity.add(centerOfMass.multiplyScalar(bc.centeringFactor));
    }

    areaBoundaries(){
        const toCenter = new THREE.Vector3(bc.SURROUNDING_CENTER.x, bc.SURROUNDING_CENTER.y, bc.SURROUNDING_CENTER.z).sub(this.position);
        if (toCenter.x > bc.SURROUNDING_RADIUS_WIDTH){
            this.velocity.x += bc.turnFactor;
        }
        if (toCenter.x < -bc.SURROUNDING_RADIUS_WIDTH){
            this.velocity.x -= bc.turnFactor;
        }
        if (toCenter.y > bc.SURROUNDING_RADIUS_HEIGHT){
            this.velocity.y += bc.turnFactor;
        }
        if (toCenter.y < -bc.SURROUNDING_RADIUS_HEIGHT){
            this.velocity.y -= bc.turnFactor;
        }
        if (toCenter.z > bc.SURROUNDING_RADIUS_DEPTH){
            this.velocity.z += bc.turnFactor;
        } 
        if (toCenter.z < -bc.SURROUNDING_RADIUS_DEPTH){
            this.velocity.z -= bc.turnFactor;
        }
    }    

    biasPoint(point: THREE.Vector3){
        const toPoint = new THREE.Vector3(point.x, point.y, point.z).sub(this.position);
        this.velocity.add(toPoint.multiplyScalar(bc.biasFactor));
    }
}

export function birdGenerator(model: THREE.Group | THREE.Object3D){
    const getVelocity = () => randomInRangeFloat(bc.INIT_SPEED_MIN, bc.INIT_SPEED_MAX);
    const initVelocity = new THREE.Vector3(getVelocity(), getVelocity(), getVelocity());
    const getPosition = () => randomInRangeFloat(-bc.INIT_CENTER_DISTANCE, bc.INIT_CENTER_DISTANCE);
    const initPosition = new THREE.Vector3(bc.SURROUNDING_CENTER.x + getPosition(), bc.SURROUNDING_CENTER.y + getPosition(), bc.SURROUNDING_CENTER.z + getPosition());
    return new Bird(initPosition, initVelocity, model);
}

