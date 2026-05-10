import * as THREE from 'three';
import * as BC from '../config/birdConfig';

function ramanujan(a: number, b: number): number{
    if (a < b){
        const temp = a;
        a = b;
        b = temp;
    }
    const h = Math.pow((a-b),2) / Math.pow((a+b),2);
    return Math.PI * (a + b) * (1 + (3*h)/(10 + Math.sqrt(4 - 3*h)));
}

export abstract class Trajectory{
    abstract getNextPosition(): THREE.Vector3 | true;
}

export class FollowCircle extends Trajectory{
    center: THREE.Vector3;
    x_length: number;
    z_length: number;
    step: number;
    step_length: number;

    constructor(center: THREE.Vector3, x_length: number, z_length: number, velocity: number){
        super();
        this.center = center;
        this.x_length = x_length;
        this.z_length = z_length;
        this.step = 0;
        this.step_length = ramanujan (x_length, z_length) / velocity;
    }

    getNextPosition(){
        const angle = 2 * Math.PI * this.step / this.step_length;
        const x = this.center.x + this.x_length * Math.cos(angle);
        const z = this.center.z + this.z_length * Math.sin(angle);
        this.step = (this.step + 1) % this.step_length;
        return new THREE.Vector3(x, this.center.y, z);
    }
}

export class MoveToTarget extends Trajectory{
    target: THREE.Vector3;
    position: THREE.Vector3;
    velocity: number;
    quadrant: string;
    x: number;
    z: number;
    length_x: number;
    length_z: number;

    steps: number;
    step_width: number;
    current_step: number;
    next_state: string;


    constructor(target: THREE.Vector3, position: THREE.Vector3, velocity: number, quadrant: string){ //quadrant = 'q1', 'q2', 'q3', 'q4'
        super();
        this.target = target;
        this.position = position;
        this.velocity = velocity;
        this.quadrant = quadrant;

        this.steps = 0;
        this.step_width = 0;
        this.current_step = 0;

        //Will be overrwritten by init call
        this.x = 0;
        this.z = 0;
        this.length_x = 0;
        this.length_z = 0;
        this.next_state = BC.QUADRANTS.Q1;

        this.init();
    }

    nextQuadrant(){
        this.quadrant = this.next_state;

        this.position.z = this.z;
        this.position.x = this.x;
    }

    init(){
        if(this.quadrant == BC.QUADRANTS.Q1){
            const target_point_x = this.target.x - this.position.x > 0 ? this.target.x + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA: this.position.x + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA;
            const target_point_z = this.target.z - this.position.z > 0 ? this.position.z - BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA : this.target.z - BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA;
            const first_target_point = new THREE.Vector3(target_point_x, this.target.y, target_point_z);
            const x_distance = Math.abs(first_target_point.x - this.position.x);
            const z_distance = Math.abs(first_target_point.z - this.position.z);
            const length = ramanujan(x_distance, z_distance)/4;
            this.steps = length/this.velocity;
            this.step_width = (Math.PI/2) / this.steps;
            this.current_step = 0;
            this.length_x = x_distance;
            this.length_z = z_distance;
            this.next_state = BC.QUADRANTS.Q2;
        }
        else if(this.quadrant == BC.QUADRANTS.Q2){
            const target_point_x = this.target.x >= this.position.x ? (this.target.x + 2 * BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA) : this.position.x + 2 * BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA;
            const target_point_z = this.position.z > this.target.z ? (this.position.z + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA) : (this.target.z + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA);
            const first_target_point = new THREE.Vector3(target_point_x, this.target.y, target_point_z);
            const x_distance = Math.abs(first_target_point.x - this.position.x);
            const z_distance = Math.abs(first_target_point.z - this.position.z);
            const length = ramanujan(x_distance, z_distance)/4;
            this.steps = length/this.velocity;
            this.step_width = (Math.PI/2) / this.steps;
            this.current_step = 0;
            this.length_x = x_distance;
            this.length_z = z_distance;
            this.next_state = BC.QUADRANTS.Q3;
        }    
        else if(this.quadrant == BC.QUADRANTS.Q3){
            //Zwei Fälle. 1. Über dem Punkt + SMOOTH dann kann er Punkt direkt treffen, ansonsten startet er weiter in q4 und macht die Kurve so klein wie möglich
            const target_point_x = this.position.x >= this.target.x + 2 * BC.SMOOTH_DISTANCE_POINT ? (this.target.x + BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA) : this.position.x - BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA; //VIelleicht hier noch SmoothDistance bisschen runter
            const target_point_z = this.position.z >= this.target.z + BC.SMOOTH_DISTANCE_POINT ? this.position.z + BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA : this.target.z + BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA;
            const first_target_point = new THREE.Vector3(target_point_x, this.target.y, target_point_z);
            const x_distance = Math.abs(first_target_point.x - this.position.x);
            const z_distance = Math.abs(first_target_point.z - this.position.z);
            const length = ramanujan(x_distance, z_distance)/4;
            this.steps = length/this.velocity;
            this.step_width = (Math.PI/2) / this.steps;
            this.current_step = 0;
            this.length_x = x_distance;
            this.length_z = z_distance;
            this.next_state = BC.QUADRANTS.Q4;
        }
        else if(this.quadrant == BC.QUADRANTS.Q4){
            const target_point_x = this.position.x - BC.SMOOTH_DISTANCE_POINT >= this.target.x ? this.target.x : this.position.x - BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA;
            const target_point_z = this.position.z - BC.SMOOTH_DISTANCE_POINT >= this.target.z ? this.target.z : this.position.z - BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA;
            const first_target_point = new THREE.Vector3(target_point_x, this.target.y, target_point_z);
            const x_distance = Math.abs(first_target_point.x - this.position.x);
            const z_distance = Math.abs(first_target_point.z - this.position.z);
            const length = ramanujan(x_distance, z_distance)/4;
            this.steps = length/this.velocity;
            this.step_width = (Math.PI/2) / this.steps;
            this.current_step = 0;
            this.length_x = x_distance;
            this.length_z = z_distance;
            this.next_state = this.position.z - BC.SMOOTH_DISTANCE_POINT >= this.target.z && this.position.x - BC.SMOOTH_DISTANCE_POINT >= this.target.x ? BC.QUADRANTS.END : BC.QUADRANTS.Q1;
        }
        else if(this.quadrant == BC.QUADRANTS.END){
            this.steps = 1;
            this.current_step = 0;
        }
    }

    getNextPosition(){
        let x=this.x,z=this.z;
        if(this.current_step >= this.steps){
            this.nextQuadrant();
            this.init();        
        }
        if(this.quadrant == 'q1'){
            x = this.position.x - Math.cos(this.current_step * this.step_width) * this.length_x + this.length_x;
            z = this.position.z - Math.sin(this.current_step * this.step_width) * this.length_z;
            this.current_step ++;
        }
        else if(this.quadrant == 'q2'){
            x = this.position.x + Math.sin(this.current_step * this.step_width) * this.length_x;
            z = this.position.z - Math.cos(this.current_step * this.step_width) * this.length_z + this.length_z;
            this.current_step ++;
        }
        else if(this.quadrant == 'q3'){
            x = this.position.x + Math.cos(this.current_step * this.step_width) * this.length_x - this.length_x;
            z = this.position.z + Math.sin(this.current_step * this.step_width) * this.length_z ;
            this.current_step ++;
        }
        else if(this.quadrant == 'q4'){
            x = this.position.x - Math.sin(this.current_step * this.step_width) * this.length_x;
            z = this.position.z + Math.cos(this.current_step * this.step_width) * this.length_z - this.length_z;
            this.current_step ++;
        }   
        else if(this.quadrant == 'end'){
            return true;
        }
        this.x = x;
        this.z = z;
        return new THREE.Vector3(x, this.position.y, z);
    }


}

export class LoopingGoal extends Trajectory{

    target: THREE.Vector3;
    position: THREE.Vector3;
    velocity: number;
    z: number;
    y: number;
    length: number;
    y_difference: number

    step: number;
    goal_steps: number;
    step_width: number;
    looping_step: string;
    lookup: number[];

    radius: number;
    overshot: number;
    loop_type: string;
    

    constructor(target: THREE.Vector3, position: THREE.Vector3, velocity: number){
        super();
        this.target = target;
        this.position = position;
        this.velocity = velocity;
        this.z = position.z;
        this.y = position.y;

        this.length = Math.PI * BC.LOOPING_SIZE*2;

        this.y_difference = position.y - target.y;
        this.loop_type = this.y_difference > 0 ? BC.LOOPING_TYPES.UNDERSHOT : this.y_difference == 0 ? BC.LOOPING_TYPES.INLINE : BC.LOOPING_TYPES.OVERSHOT;
        this.radius = BC.LOOPING_SIZE;
        this.overshot = BC.LOOPING_OVERSHOT;
        this.step = 0;
        this.goal_steps = 0;
        this.step_width = 0;
        this.looping_step = 'init';

        this.lookup = [];
    }

    getNextPosition(){
        if (this.step >= this.goal_steps){
            this.stepNext();
        }
        if(this.looping_step == "q1"){
            const z_multi = this.radius/2 + (this.loop_type == 'overshot' ? Math.abs(this.y_difference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * z_multi + z_multi;
        }
        else if(this.looping_step == "q2"){
            const z_multi = this.radius/2 + (this.loop_type == 'overshot' ? Math.abs(this.y_difference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2 + this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * z_multi ;
        }    
        else if(this.looping_step == "q3"){
            const z_multi = this.radius/2 + (this.loop_type == 'undershot' ? Math.abs(this.y_difference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * z_multi - z_multi;
        }
        else if(this.looping_step == "q4"){
            const z_multi = this.radius/2 + (this.loop_type == 'undershot' ? Math.abs(this.y_difference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2 - this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * z_multi;
        }
        else if(this.looping_step == "line"){
            this.z = this.position.z - this.lookup[this.step];
            this.y = this.position.y;
        }
        else if(this.looping_step == "end"){
            return true;
        }

        this.step++;
        return new THREE.Vector3(this.position.x, this.y, this.z);        
    }

    stepNext(){
        this.looping_step = this.looping_step == "init" ? "q1" :
        this.looping_step == "q1" ? "q2" :
        this.looping_step == "q2" ? "q3" :
        this.looping_step == "q3" ? "q4" :
        this.looping_step == "q4" ? "line" : "end";

        this.position.z = this.z;
        this.position.y = this.y;
        
        if(this.looping_step == "q1" || this.looping_step == "q2"){
            const b = this.radius/2 + (this.loop_type == 'overshot' ? Math.abs(this.y_difference)/2 : 0);
            const start_angle = this.looping_step == "q2" ? Math.PI/2 : 0;
            this.lookup = create_elipse_step_lookup(this.radius/2, b, Math.PI/2, this.velocity, start_angle);
        }
        else if(this.looping_step == "q3" || this.looping_step == "q4"){
            const b = this.radius/2 + (this.loop_type == 'undershot' ? Math.abs(this.y_difference)/2: 0);
            const start_angle = this.looping_step == "q4" ? 3 * Math.PI/2 : Math.PI;
            this.lookup = create_elipse_step_lookup(this.radius/2, b, Math.PI/2, this.velocity, start_angle);
        }
        else if(this.looping_step == "line"){
            const length = this.z - this.target.z + this.overshot;
            this.lookup = create_line_lookup(length, this.velocity);
        }
        
        //this.goal_steps = length/this.velocity;
        this.goal_steps = this.lookup.length;
        //this.step_width = (Math.PI/2) / this.goal_steps;
        this.step_width = this.velocity / this.radius;
        this.step = 0;
    }
}

function create_line_lookup(length: number, velocity: number){
    const steps = Math.floor(Math.abs(length) / velocity);   
    const array = Array(steps).fill(0).map((_, i) => i * velocity); 
    return array;
}

function create_elipse_step_lookup(a: number, b: number, max_angle: number, velocity: number, start_angle: number = 0){
    const lookup = [];
    
    const smallest_angle = 0.005*Math.PI; 
    let traveled = 0;
    let angled = start_angle;
    let z_bf = a * Math.sin(angled);
    let y_bf = b * Math.cos(angled);

    while(angled <= start_angle + max_angle){
        angled += smallest_angle;
        const z = a * Math.sin(angled);
        const y = b * Math.cos(angled);

        const dz_dt = z_bf - z;
        const dy_dt = y_bf - y;
         
        const dist = Math.sqrt(dy_dt*dy_dt + dz_dt*dz_dt);
        traveled += dist;

        if(traveled >= velocity){
            lookup.push(angled);
            traveled -= velocity;
        }
        y_bf = y;
        z_bf = z;
    }

    return lookup;
}