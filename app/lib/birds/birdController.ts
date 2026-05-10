import { birdGenerator} from './bird';
import bird from './bird';
import * as BC from '../config/birdConfig';
import * as THREE from 'three';
import { velocity } from 'three/tsl';
import { Trajectory, FollowCircle, MoveToTarget, LoopingGoal } from './birdTrajectory';

export class birdController{
    mode: string;
    goal: THREE.Vector3;
    position: THREE.Vector3;
    birds: bird[]

    circle: Trajectory;

    constructor(){
        this.mode = BC.FLIGHT_MODES.CIRCLE;
        this.goal = new THREE.Vector3(0, 0, 0);
        this.position = new THREE.Vector3(0, 0, 0);

        this.birds = [];
        for (let i=0; i<BC.BIRD_COUNT; i++){
            const new_bird = birdGenerator();
            this.birds.push(new_bird);
        }
        this.circle = new FollowCircle(BC.SURROUNDING_CENTER, BC.SURROUNDING_RADIUS_WIDTH*0.9, BC.SURROUNDING_RADIUS_DEPTH*0.7, BC.MAX_SPEED * 0.95);
    }

    update(){
        const nextCirclePosition = this.circle.getNextPosition();
        if (this.mode == 'flight_to_goal' && nextCirclePosition==true){
            this.mode = 'loop';
            BC.set_turn_factor(0);
            BC.set_bias_factor(0.005);
            BC.set_avoid_factor(0.001);
            BC.set_centering_factor(0.002);
            BC.set_matching_factor(0.0001);
            this.circle = new LoopingGoal(this.goal, this.position, BC.MAX_SPEED * 0.9);
            //console.log("Starting Looping");
            return;
        }
        else if (nextCirclePosition==true){
            return;
        }
        
        //console.log("Bird Position: " + nextCirclePosition.x + ", " + nextCirclePosition.y + ", " + nextCirclePosition.z);
        this.position = nextCirclePosition;
        //addTrailPoint(this.position, scene, 0xff0000, 1, true);

        this.birds.forEach((bird, index) => {
            bird.updatePositionWithBias(this.birds, this.position);
        });
    }

    switchToGoal(target: THREE.Vector3){
        
        this.mode = 'flight_to_goal'; //Wenn zu nah return false oder so, damit der nochmal reroaled
        this.goal = target;


        BC.set_bias_factor(0.0025);

        //addTrailPoint(target, this.scene, 0x0000ff, 2);

        const next_position_circle = this.circle.getNextPosition();
        if(next_position_circle!=true){
            let quadrant; //Gibt nicht an in welchem quadranten man sich aktuell befindet sondern als nächstes quasi
            if(next_position_circle.x >= this.position.x){
                if(next_position_circle.z >= this.position.z){ //bedeutet, oben rechts, also q2 also q3 als nächstes
                    quadrant = 'q3';
                }
                else{
                    quadrant = 'q2';
                }
            }
            else{
                if(next_position_circle.z >= this.position.z){
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
}

let counter = 0;

function addTrailPoint(position: THREE.Vector3, scene: THREE.Scene, color=0xff0000, size=1, counter_active=false) {
    if(counter_active) counter++;
  const trailMaterial = new THREE.MeshBasicMaterial({ color: color });
  const trailGeometry = new THREE.SphereGeometry(size, 8, 8);

  if (counter_active && counter%4 !== 0) return; // Nur jeden 10. Punkt hinzufügen
  const point = new THREE.Mesh(trailGeometry, trailMaterial);
  point.position.copy(position);
  scene.add(point);
}

export function birdFlogGenerator(): birdController{
    return new birdController();
}

////x rechts-links, z vorne-hinten, y oben-unten
