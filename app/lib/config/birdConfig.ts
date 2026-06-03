import * as THREE from 'three';

import * as TYPES from '@/app/types/typeIndex';

export const SURROUNDING_CENTER = new THREE.Vector3(0, 100, 0);
export const SURROUNDING_RADIUS_DEPTH = 80;
export const SURROUNDING_RADIUS_WIDTH = 100;
export const SURROUNDING_RADIUS_HEIGHT = 50;
export const BIRD_COUNT = 7;
const BIRD_MOVES_PER_SECOND = 30;
export const BIRD_MOVES_PER_MINUTE = BIRD_MOVES_PER_SECOND * 60;

export const STD_BIRD_CONFIG: TYPES.BirdConfig = {
    avoidFactor: 0.1,
    matchingFactor: 0.08,
    centeringFactor: 0.001,
    turnFactor: 0.3,
    biasFactor: 0.005
}

export const TARGET_ELYPSE_BIRD_CONFIG: TYPES.BirdConfig = {
    avoidFactor: 0.1,
    matchingFactor: 0.08,
    centeringFactor: 0.001,
    turnFactor: 0.3,
    biasFactor: 0.02
}

export const TARGET_LOOP_BIRD_CONFIG: TYPES.BirdConfig = {
    avoidFactor: 0.001,
    matchingFactor: 0.0001,
    centeringFactor: 0.001,
    turnFactor: 0.1,
    biasFactor: 0.02
}

export const MIN_SPEED = 1.0;
export const MAX_SPEED = 3.0;
export const CIRCLE_SPEED = MAX_SPEED * 0.7;
export const TARGET_APPROACH_SPEED = MAX_SPEED * 0.7;

export const PROTECTED_RANGE = 10;
export const VISUAL_RANGE = 20;

export const INIT_SPEED_MIN = 1.0;
export const INIT_SPEED_MAX = 2.0;
export const INIT_CENTER_DISTANCE = 20; //Should be smaller than surrounding_radius

export const BIRD_LENGTH = 3;
export const BIRD_WIDTH = 2;
export const BIRD_HEIGHT = 1;

export const LOOPING_SIZE = 40;
export const LOOPING_OVERSHOT = 60;
export const LOOPING_MIN_WALL_DISTANCE = 100;

export const DISTANCE_TARGET_BEFORE_LOOP = 40;
export const DISTANCE_TARGET_OVERSHOOT = 5;

export const TARGET_HIT_DISTANCE_TOLERANCE = 5;

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

export const LOOPING_STEPS = {
    Q1: 'q1',
    Q2: 'q2',
    Q3: 'q3',
    Q4: 'q4',
    LINE: 'line',
    END: 'end',
    INIT: 'init'
}

export const LOOPING_TYPES = {
    UNDERSHOT: 'undershot',
    OVERSHOT: 'overshot',
    INLINE: 'inline'
}
export const ANIMATIONS_FOR_FLAP = 1;
export const FLAP_POSITIONS = [0,45,0,-45];

export const LEAN_ANGLE_FACTOR = 20 ;

export const ID_LEFT_WING = 'wing_left';
export const ID_RIGHT_WING = 'wing_right';

const BIRD_SOUND_PREFIX = 'ChimneySwiftScream-';
const BIRD_SOUND_PATH = '/bird_screams/';
const BIRD_SOUNDS_COUNT = 22;
export const BIRD_SOUND_PATHS = Array.from({length: BIRD_SOUNDS_COUNT}, (_, i) => `${BIRD_SOUND_PREFIX}${String(i+1).padStart(2, '0')}.mp3`).map(filename => BIRD_SOUND_PATH + filename);

export const BIRD_SCREAM_INTERVAL_MIN = 1; //In seconds
export const BIRD_SCREAM_INTERVAL_MAX = 2;