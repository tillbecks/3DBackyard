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
    xLength: number;
    zLength: number;
    step: number;
    stepLength: number;

    constructor(center: THREE.Vector3, xLength: number, zLength: number, velocity: number){
        super();
        this.center = center;
        this.xLength = xLength;
        this.zLength = zLength;
        this.step = 0;
        this.stepLength = ramanujan (xLength, zLength) / velocity;
    }

    getNextPosition(){
        const angle = 2 * Math.PI * this.step / this.stepLength;
        const x = this.center.x + this.xLength * Math.cos(angle);
        const z = this.center.z + this.zLength * Math.sin(angle);
        this.step = (this.step + 1) % this.stepLength;
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
    xLength: number;
    zLength: number;

    steps: number;
    stepWidth: number;
    currentStep: number;
    nextState: string;


    constructor(target: THREE.Vector3, position: THREE.Vector3, velocity: number, quadrant: string){ //quadrant = 'q1', 'q2', 'q3', 'q4'
        super();
        this.target = target;
        this.position = position;
        this.velocity = velocity;
        this.quadrant = quadrant;

        this.steps = 0;
        this.stepWidth = 0;
        this.currentStep = 0;

        //Will be overrwritten by init call
        this.x = 0;
        this.z = 0;
        this.xLength = 0;
        this.zLength = 0;
        this.nextState = BC.QUADRANTS.Q1;

        this.init();
    }

    nextQuadrant(){
        this.quadrant = this.nextState;

        this.position.z = this.z;
        this.position.x = this.x;
    }

    init(){
        if(this.quadrant == BC.QUADRANTS.Q1){
            const targetPointX = this.target.x - this.position.x > 0 ? this.target.x + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA: this.position.x + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA;
            const targetPointZ = this.target.z - this.position.z > 0 ? this.position.z - BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA : this.target.z - BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA;
            const firstTargetPoint = new THREE.Vector3(targetPointX, this.target.y, targetPointZ);
            const xDistance = Math.abs(firstTargetPoint.x - this.position.x);
            const zDistance = Math.abs(firstTargetPoint.z - this.position.z);
            const length = ramanujan(xDistance, zDistance)/4;
            this.steps = length/this.velocity;
            this.stepWidth = (Math.PI/2) / this.steps;
            this.currentStep = 0;
            this.xLength = xDistance;
            this.zLength = zDistance;
            this.nextState = BC.QUADRANTS.Q2;
        }
        else if(this.quadrant == BC.QUADRANTS.Q2){
            const targetPointX = this.target.x >= this.position.x ? (this.target.x + 2 * BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA) : this.position.x + 2 * BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA;
            const targetPointZ = this.position.z > this.target.z ? (this.position.z + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA) : (this.target.z + BC.SMOOTH_DISTANCE_POINT * BC.SMOOTH_DISTANCE_EXTRA);
            const firstTargetPoint = new THREE.Vector3(targetPointX, this.target.y, targetPointZ);
            const xDistance = Math.abs(firstTargetPoint.x - this.position.x);
            const zDistance = Math.abs(firstTargetPoint.z - this.position.z);
            const length = ramanujan(xDistance, zDistance)/4;
            this.steps = length/this.velocity;
            this.stepWidth = (Math.PI/2) / this.steps;
            this.currentStep = 0;
            this.xLength = xDistance;
            this.zLength = zDistance;
            this.nextState = BC.QUADRANTS.Q3;
        }    
        else if(this.quadrant == BC.QUADRANTS.Q3){
            //Zwei Fälle. 1. Über dem Punkt + SMOOTH dann kann er Punkt direkt treffen, ansonsten startet er weiter in q4 und macht die Kurve so klein wie möglich
            const targetPointX = this.position.x >= this.target.x + 2 * BC.SMOOTH_DISTANCE_POINT ? (this.target.x + BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA) : this.position.x - BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA; //VIelleicht hier noch SmoothDistance bisschen runter
            const targetPointZ = this.position.z >= this.target.z + BC.SMOOTH_DISTANCE_POINT ? this.position.z + BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA : this.target.z + BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA;
            const firstTargetPoint = new THREE.Vector3(targetPointX, this.target.y, targetPointZ);
            const xDistance = Math.abs(firstTargetPoint.x - this.position.x);
            const zDistance = Math.abs(firstTargetPoint.z - this.position.z);
            const length = ramanujan(xDistance, zDistance)/4;
            this.steps = length/this.velocity;
            this.stepWidth = (Math.PI/2) / this.steps;
            this.currentStep = 0;
            this.xLength = xDistance;
            this.zLength = zDistance;
            this.nextState = BC.QUADRANTS.Q4;
        }
        else if(this.quadrant == BC.QUADRANTS.Q4){
            const targetPointX = this.position.x - BC.SMOOTH_DISTANCE_POINT >= this.target.x ? this.target.x : this.position.x - BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA;
            const targetPointZ = this.position.z - BC.SMOOTH_DISTANCE_POINT >= this.target.z ? this.target.z : this.position.z - BC.SMOOTH_DISTANCE_POINT* BC.SMOOTH_DISTANCE_EXTRA;
            const firstTargetPoint = new THREE.Vector3(targetPointX, this.target.y, targetPointZ);
            const xDistance = Math.abs(firstTargetPoint.x - this.position.x);
            const zDistance = Math.abs(firstTargetPoint.z - this.position.z);
            const length = ramanujan(xDistance, zDistance)/4;
            this.steps = length/this.velocity;
            this.stepWidth = (Math.PI/2) / this.steps;
            this.currentStep = 0;
            this.xLength = xDistance;
            this.zLength = zDistance;
            this.nextState = this.position.z - BC.SMOOTH_DISTANCE_POINT >= this.target.z && this.position.x - BC.SMOOTH_DISTANCE_POINT >= this.target.x ? BC.QUADRANTS.END : BC.QUADRANTS.Q1;
        }
        else if(this.quadrant == BC.QUADRANTS.END){
            this.steps = 1;
            this.currentStep = 0;
        }
    }

    getNextPosition(){
        let x=this.x,z=this.z;
        if(this.currentStep >= this.steps){
            this.nextQuadrant();
            this.init();        
        }
        if(this.quadrant == 'q1'){
            x = this.position.x - Math.cos(this.currentStep * this.stepWidth) * this.xLength + this.xLength;
            z = this.position.z - Math.sin(this.currentStep * this.stepWidth) * this.zLength;
            this.currentStep ++;
        }
        else if(this.quadrant == 'q2'){
            x = this.position.x + Math.sin(this.currentStep * this.stepWidth) * this.xLength;
            z = this.position.z - Math.cos(this.currentStep * this.stepWidth) * this.zLength + this.zLength;
            this.currentStep ++;
        }
        else if(this.quadrant == 'q3'){
            x = this.position.x + Math.cos(this.currentStep * this.stepWidth) * this.xLength - this.xLength;
            z = this.position.z + Math.sin(this.currentStep * this.stepWidth) * this.zLength ;
            this.currentStep ++;
        }
        else if(this.quadrant == 'q4'){
            x = this.position.x - Math.sin(this.currentStep * this.stepWidth) * this.xLength;
            z = this.position.z + Math.cos(this.currentStep * this.stepWidth) * this.zLength - this.zLength;
            this.currentStep ++;
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
    yDifference: number

    step: number;
    goalSteps: number;
    stepWidth: number;
    loopingStep: string;
    lookup: number[];

    radius: number;
    overshot: number;
    loopType: string;
    

    constructor(target: THREE.Vector3, position: THREE.Vector3, velocity: number){
        super();
        this.target = target;
        this.position = position;
        this.velocity = velocity;
        this.z = position.z;
        this.y = position.y;

        this.length = Math.PI * BC.LOOPING_SIZE*2;

        this.yDifference = position.y - target.y;
        this.loopType = this.yDifference > 0 ? BC.LOOPING_TYPES.UNDERSHOT : this.yDifference == 0 ? BC.LOOPING_TYPES.INLINE : BC.LOOPING_TYPES.OVERSHOT;
        this.radius = BC.LOOPING_SIZE;
        this.overshot = BC.LOOPING_OVERSHOT;
        this.step = 0;
        this.goalSteps = 0;
        this.stepWidth = 0;
        this.loopingStep = 'init';

        this.lookup = [];
    }

    getNextPosition(){
        if (this.step >= this.goalSteps){
            this.stepNext();
        }
        if(this.loopingStep == "q1"){
            const zMulti = this.radius/2 + (this.loopType == 'overshot' ? Math.abs(this.yDifference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * zMulti + zMulti;
        }
        else if(this.loopingStep == "q2"){
            const zMulti = this.radius/2 + (this.loopType == 'overshot' ? Math.abs(this.yDifference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2 + this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * zMulti ;
        }    
        else if(this.loopingStep == "q3"){
            const zMulti = this.radius/2 + (this.loopType == 'undershot' ? Math.abs(this.yDifference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * zMulti - zMulti;
        }
        else if(this.loopingStep == "q4"){
            const zMulti = this.radius/2 + (this.loopType == 'undershot' ? Math.abs(this.yDifference)/2 : 0);
            this.z = this.position.z - Math.sin(this.lookup[this.step]) * this.radius/2 - this.radius/2;
            this.y = this.position.y - Math.cos(this.lookup[this.step]) * zMulti;
        }
        else if(this.loopingStep == "line"){
            this.z = this.position.z - this.lookup[this.step];
            this.y = this.position.y;
        }
        else if(this.loopingStep == "end"){
            return true;
        }

        this.step++;
        return new THREE.Vector3(this.position.x, this.y, this.z);        
    }

    stepNext(){
        this.loopingStep = this.loopingStep == "init" ? "q1" :
        this.loopingStep == "q1" ? "q2" :
        this.loopingStep == "q2" ? "q3" :
        this.loopingStep == "q3" ? "q4" :
        this.loopingStep == "q4" ? "line" : "end";

        this.position.z = this.z;
        this.position.y = this.y;
        
        if(this.loopingStep == "q1" || this.loopingStep == "q2"){
            const b = this.radius/2 + (this.loopType == 'overshot' ? Math.abs(this.yDifference)/2 : 0);
            const startAngle = this.loopingStep == "q2" ? Math.PI/2 : 0;
            this.lookup = createElipseStepLookup(this.radius/2, b, Math.PI/2, this.velocity, startAngle);
        }
        else if(this.loopingStep == "q3" || this.loopingStep == "q4"){
            const b = this.radius/2 + (this.loopType == 'undershot' ? Math.abs(this.yDifference)/2: 0);
            const startAngle = this.loopingStep == "q4" ? 3 * Math.PI/2 : Math.PI;
            this.lookup = createElipseStepLookup(this.radius/2, b, Math.PI/2, this.velocity, startAngle);
        }
        else if(this.loopingStep == "line"){
            const length = this.z - this.target.z + this.overshot;
            this.lookup = createLineLookup(length, this.velocity);
        }
        
        //this.goal_steps = length/this.velocity;
        this.goalSteps = this.lookup.length;
        //this.step_width = (Math.PI/2) / this.goal_steps;
        this.stepWidth = this.velocity / this.radius;
        this.step = 0;
    }
}

function createLineLookup(length: number, velocity: number){
    const steps = Math.floor(Math.abs(length) / velocity);   
    const array = Array(steps).fill(0).map((_, i) => i * velocity); 
    return array;
}

function createElipseStepLookup(a: number, b: number, maxAngle: number, velocity: number, startAngle: number = 0){
    const lookup = [];
    
    const smallestAngle = 0.005*Math.PI; 
    let traveled = 0;
    let angled = startAngle;
    let zBf = a * Math.sin(angled);
    let yBf = b * Math.cos(angled);

    while(angled <= startAngle + maxAngle){
        angled += smallestAngle;
        const z = a * Math.sin(angled);
        const y = b * Math.cos(angled);

        const dzDt = zBf - z;
        const dyDt = yBf - y;
         
        const dist = Math.sqrt(dyDt*dyDt + dzDt*dzDt);
        traveled += dist;

        if(traveled >= velocity){
            lookup.push(angled);
            traveled -= velocity;
        }
        yBf = y;
        zBf = z;
    }

    return lookup;
}