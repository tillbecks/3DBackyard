import * as THREE from 'three';

export const SURROUNDING_CENTER = new THREE.Vector3(0, 80, 100);
export const SURROUNDING_RADIUS_DEPTH = 30;
export const SURROUNDING_RADIUS_WIDTH = 80;
export const SURROUNDING_RADIUS_HEIGHT = 50;
export const BIRD_COUNT = 7;

export let avoid_factor = 0.1;
export let matching_factor = 0.08;
export let centering_factor = 0.001;
export let turn_factor = 0.3;
export let bias_factor = 0.0005;

export const MAX_SPEED = 1.1;
export const MIN_SPEED = 0.5;

export const PROTECTED_RANGE = 10;
export const VISUAL_RANGE = 20;

export const INIT_SPEED_MIN = 0.5;
export const INIT_SPEED_MAX = 0.75;
export const INIT_CENTER_DISTANCE = 40; //Should be smaller than surrounding_radius

export const BIRD_LENGTH = 3;
export const BIRD_WIDTH = 2;
export const BIRD_HEIGHT = 1;

export const LOOPING_SIZE = 40;
export const LOOPING_OVERSHOT = 40;
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

export function set_turn_factor(x: number) {turn_factor = x};
export function set_bias_factor(x: number) {bias_factor = x};
export function set_avoid_factor(x: number) {avoid_factor = x};
export function set_centering_factor(x: number) {centering_factor = x};
export function set_matching_factor(x: number) {matching_factor = x};

export const FLAP_POSITIONS = [0, 20, 40, 20, 0, -20];

export const LEAN_ANGLE_FACTOR = 30 ;

export const ID_LEFT_WING = 'wing_left';
export const ID_RIGHT_WING = 'wing_right';