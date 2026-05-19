import * as THREE from 'three';

export const SURROUNDING_CENTER = new THREE.Vector3(0, 100, 200);
export const SURROUNDING_RADIUS_DEPTH = 50;
export const SURROUNDING_RADIUS_WIDTH = 100;
export const SURROUNDING_RADIUS_HEIGHT = 50;
export const BIRD_COUNT = 7;
const BIRD_MOVES_PER_SECOND = 45;
export const BIRD_MOVES_PER_MINUTE = BIRD_MOVES_PER_SECOND * 60;

export let avoidFactor = 0.1;
export let matchingFactor = 0.08;
export let centeringFactor = 0.001;
export let turnFactor = 0.3;
export let biasFactor = 0.002;

export const MAX_SPEED = 2.0;
export const MIN_SPEED = 0.8;

export const PROTECTED_RANGE = 10;
export const VISUAL_RANGE = 20;

export const INIT_SPEED_MIN = 1.0;
export const INIT_SPEED_MAX = 1.3;
export const INIT_CENTER_DISTANCE = 20; //Should be smaller than surrounding_radius

export const BIRD_LENGTH = 3;
export const BIRD_WIDTH = 2;
export const BIRD_HEIGHT = 1;

export const LOOPING_SIZE = 40;
export const LOOPING_OVERSHOT = 60;
export const LOOPING_MIN_WALL_DISTANCE = 100;
export const DISTANCE_CENTER_BEFORE_LOOP = 40;

export const OVERSHOOT_DISTANCE_QUADRANT = 20;
export const SMOOTH_DISTANCE_POINT = 20;
export const SMOOTH_DISTANCE_EXTRA = 1.2;

export const FLIGHT_MODES = {
    CIRCLE: 'circle',
    FLIGHT_TO_GOAL: 'flight_to_goal',
    LOOP: 'loop'
}

export const QUADRANTS = {
    Q1: 'q1',
    Q2: 'q2',
    Q3: 'q3',
    Q4: 'q4',
    END: 'end'
}

export const LOOPING_TYPES = {
    UNDERSHOT: 'undershot',
    OVERSHOT: 'overshot',
    INLINE: 'inline'
}

export function setTurnFactor(x: number) {turnFactor = x};
export function setBiasFactor(x: number) {biasFactor = x};
export function setAvoidFactor(x: number) {avoidFactor = x};
export function setCenteringFactor(x: number) {centeringFactor = x};
export function setMatchingFactor(x: number) {matchingFactor = x};

export const FLAP_POSITIONS = [0, 20, 40, 20, 0, -20];

export const LEAN_ANGLE_FACTOR = 30 ;

export const ID_LEFT_WING = 'wing_left';
export const ID_RIGHT_WING = 'wing_right';