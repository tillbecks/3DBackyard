import { birdGenerator} from './bird';
import Bird from './bird';
import * as BC from '../config/birdConfig';
import * as THREE from 'three';
import { Trajectory, FollowCircle, MoveToTarget, LoopingGoal } from './birdTrajectory';
import { step } from 'three/tsl';

export class BirdController{
    mode: string;
    goal: THREE.Vector3;
    lastPosition: THREE.Vector3;
    position: THREE.Vector3;
    birds: Bird[]

    circle: Trajectory;
    movementAccumulator: number;

    constructor(model: THREE.Group | THREE.Object3D){
        this.mode = BC.FLIGHT_MODES.CIRCLE;
        this.goal = new THREE.Vector3(0, 0, 0);
        this.position = new THREE.Vector3(0, 0, 0);
        this.lastPosition = new THREE.Vector3(0, 0, 0);
        this.movementAccumulator = 0;

        this.birds = [];
        for (let i=0; i<BC.BIRD_COUNT; i++){
            const newBird = birdGenerator(model);
            this.birds.push(newBird);
        }
        this.circle = new FollowCircle(BC.SURROUNDING_CENTER, BC.SURROUNDING_RADIUS_WIDTH*0.9, BC.SURROUNDING_RADIUS_DEPTH*0.7, BC.MAX_SPEED * 0.6);
    }

    update(deltaSeconds: number = 1 / 60){
        this.movementAccumulator += deltaSeconds;
        const stepInterval = 60 / BC.BIRD_MOVES_PER_MINUTE;

        let positionUpdated = false;

        while (this.movementAccumulator >= stepInterval) {
            this.movementAccumulator -= stepInterval;

            const nextCirclePosition = this.circle.getNextPosition();
            if (this.mode == BC.FLIGHT_MODES.FLIGHT_TO_GOAL && nextCirclePosition==true){
                this.mode = BC.FLIGHT_MODES.LOOP;
                BC.setTurnFactor(0);
                BC.setBiasFactor(0.008);
                BC.setAvoidFactor(0.001);
                BC.setCenteringFactor(0.002);
                BC.setMatchingFactor(0.0001);
                this.circle = new LoopingGoal(this.goal, this.position, BC.MAX_SPEED * 0.8);
                return;
            }
            else if (nextCirclePosition==true){
                return;
            }
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

    switchToGoal(target: THREE.Vector3){
        
        this.mode = BC.FLIGHT_MODES.FLIGHT_TO_GOAL; //Wenn zu nah return false oder so, damit der nochmal reroaled
        this.goal = target;

        console.log("Flight to Goal initialized: " + target.x + ", " + target.y + ", " + target.z);


        BC.setBiasFactor(0.005);

        const nextPositionCircle = this.circle.getNextPosition();
        if(nextPositionCircle!=true){
            let quadrant; //Gibt nicht an in welchem quadranten man sich aktuell befindet sondern als nächstes quasi
            if(nextPositionCircle.x >= this.position.x){
                if(nextPositionCircle.z >= this.position.z){ //bedeutet, oben rechts, also q2 also q3 als nächstes
                    quadrant = 'q3';
                }
                else{
                    quadrant = 'q2';
                }
            }
            else{
                if(nextPositionCircle.z >= this.position.z){
                    quadrant = 'q4';
                }
                else{
                    quadrant = 'q1';
                }
            }      

            this.circle = new MoveToTarget(new THREE.Vector3(target.x, target.y, BC.LOOPING_MIN_WALL_DISTANCE), this.position, BC.MAX_SPEED * 0.9, quadrant);
        //addTrailPoint(new THREE.Vector3(target.x, target.y, LOOPING_MIN_WALL_DISTANCE), this.scene, 0x00ff00, 2);
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
}

let counter = 0;

export function birdFlogGenerator(model: THREE.Group | THREE.Object3D): BirdController{
    return new BirdController(model);
}

////x rechts-links, z vorne-hinten, y oben-unten
