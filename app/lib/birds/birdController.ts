'use client';
import * as THREE from 'three';

import { birdGenerator} from './bird';
import Bird from './bird';
import { Trajectory, FollowCircle, MoveToTarget, LoopingGoal } from './birdTrajectory';

import * as BC from '@/app/lib/config/birdConfig';
import * as TYPES from '@/app/types/typeIndex';

export class BirdController{
    mode: string;
    target: THREE.Vector3;
    lastPosition: THREE.Vector3;
    position: THREE.Vector3;
    birds: Bird[]
    circle: Trajectory;
    movementAccumulator: number;
    targetHit: boolean;
    onTargetHit: (() => void) = () => {};


    constructor(model: THREE.Group | THREE.Object3D){
        this.mode = BC.FLIGHT_MODES.CIRCLE;
        this.target = new THREE.Vector3(0, 0, 0);
        this.position = new THREE.Vector3(0, 0, 0);
        this.lastPosition = new THREE.Vector3(0, 0, 0);
        this.movementAccumulator = 0;
        this.targetHit = false;

        this.birds = [];
        for (let i=0; i<BC.BIRD_COUNT; i++){
            const newBird = birdGenerator(model);
            this.birds.push(newBird);
        }
        this.circle = this.getStdFollowCircle();
    }

    update(deltaSeconds: number = 1 / 60){
        this.movementAccumulator += deltaSeconds;
        const stepInterval = 60 / BC.BIRD_MOVES_PER_MINUTE;

        let positionUpdated = false;

        while (this.movementAccumulator >= stepInterval) {
            this.movementAccumulator -= stepInterval;

            const nextCirclePosition = this.circle.getNextPosition();
            console.log("Next circle position:", nextCirclePosition);

            if (this.mode === BC.FLIGHT_MODES.FLIGHT_TO_GOAL && nextCirclePosition === true){
                this.mode = BC.FLIGHT_MODES.LOOP;
                this.setBirdConfig(BC.TARGET_LOOP_BIRD_CONFIG);
                this.circle = new LoopingGoal(new THREE.Vector3(this.target.x, this.target.y, this.target.z - BC.DISTANCE_TARGET_OVERSHOOT), this.position, BC.TARGET_APPROACH_SPEED);
                return;
            }else if (this.mode == BC.FLIGHT_MODES.LOOP){
                if(this.birdsHaveHitTarget()){
                    this.onTargetHit();
                    this.setBirdConfig(BC.STD_BIRD_CONFIG);
                    this.mode = BC.FLIGHT_MODES.CIRCLE;
                    this.circle = this.getStdFollowCircle();
                }
            }

            if(nextCirclePosition === true) return;

            this.lastPosition.copy(this.position);
            this.position = nextCirclePosition;
            positionUpdated = true;
        }

        if(positionUpdated){
            this.birds.forEach((bird) => {
                bird.updatePositionWithBias(this.birds, this.position);
            });
        }
    }

    switchToTarget(target: THREE.Vector3, onTargetHit: () => void = () => {}) {

        
        this.mode = BC.FLIGHT_MODES.FLIGHT_TO_GOAL; //Wenn zu nah return false oder so, damit der nochmal reroaled
        this.target = target;
        this.targetHit = false;
        this.onTargetHit = onTargetHit;

        this.setBirdConfig(BC.TARGET_ELYPSE_BIRD_CONFIG);

        const nextPositionCircle = this.circle.getNextPosition();
        if(nextPositionCircle !== true){
            let quadrant; //Gibt nicht an in welchem quadranten man sich aktuell befindet sondern als nächstes quasi
            if(nextPositionCircle.x >= this.position.x){
                if(nextPositionCircle.z >= this.position.z){ //bedeutet, oben rechts, also q2 also q3 als nächstes
                    quadrant = BC.QUADRANTS.Q3;
                }
                else{
                    quadrant = BC.QUADRANTS.Q2;
                }
            }
            else{
                if(nextPositionCircle.z >= this.position.z){
                    quadrant = BC.QUADRANTS.Q4;
                }
                else{
                    quadrant = BC.QUADRANTS.Q1;
                }
            }      

            this.circle = new MoveToTarget(new THREE.Vector3(target.x, target.y, target.z  + BC.DISTANCE_TARGET_BEFORE_LOOP), this.position, BC.TARGET_APPROACH_SPEED, quadrant);
        }
        return true;
    }
    
    points: THREE.Mesh[] = [];

    drawPosition(scene: THREE.Scene, color=0xff0000, size=3, counterActive=false) {
        //console.log(this.position);
        if(this.points.length > 30){
            const oldPoint = this.points.shift();
            if(oldPoint){
                scene.remove(oldPoint);
                oldPoint.geometry.dispose();
                if(oldPoint.material instanceof THREE.Material) oldPoint.material.dispose();
            }
        }

        if(counterActive) counter++;
        const trailMaterial = new THREE.MeshBasicMaterial({ color: color });
        const trailGeometry = new THREE.SphereGeometry(size, 8, 8);

        if (counterActive && counter%4 !== 0) return;
        const point = new THREE.Mesh(trailGeometry, trailMaterial);
        point.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(point);
        this.points.push(point);
    }

    birdsHaveHitTarget(){
        if(this.targetHit) return true;
        for(const bird of this.birds){
            if(bird.position.distanceTo(new THREE.Vector3(this.target.x, this.target.y, this.target.z - BC.DISTANCE_TARGET_OVERSHOOT)) < BC.TARGET_HIT_DISTANCE_TOLERANCE){
                this.targetHit = true;
                return true;
            }
        }
        return false;
    }   

    setBirdConfig(birdConfig: TYPES.BirdConfig){
        this.birds.forEach(bird => bird.birdConfig = birdConfig);
    }

    getStdFollowCircle(){
        return new FollowCircle(BC.SURROUNDING_CENTER, BC.SURROUNDING_RADIUS_WIDTH*0.9, BC.SURROUNDING_RADIUS_DEPTH*0.7, BC.CIRCLE_SPEED);
    }
}

let counter = 0;

export function birdFlogGenerator(model: THREE.Group | THREE.Object3D): BirdController{
    return new BirdController(model);
}

////x rechts-links, z vorne-hinten, y oben-unten
