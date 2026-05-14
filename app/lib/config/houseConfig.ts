export const MAX_STORY_HEIGHT: number = 30;
export const MIN_STORY_HEIGHT: number = 25;
export const HOUSE_WIDTH: number = 70;
export const HOUSE_DEPTH: number = 60;
export const MAX_STORY_COUNT: number = 5;
export const MIN_STORY_COUNT: number = 3;
export const MAX_HOUSE_WIDTH: number = 100;
export const MIN_HOUSE_WIDTH: number = 70;

export const COLOR_LIGHTNESS_VARIETY: number = 10;

export const MAX_ROOF_HEIGHT: number = 40;
export const MIN_ROOF_HEIGHT: number = 30;
export const MAX_ROOF_OVERHANG: number = 5;
export const MIN_ROOF_OVERHANG: number = 3;
export const ROOF_WALL_THICKNESS: number = 1;
export const ROOF_OVERHANG_SIDES: number = 1;

export const WINDOW_MAX_PER_STORY: number = 5;
export const WINDOW_MIN_PER_STORY: number = 3;
export const WINDOW_MAX_WIDTH: number = 8;
export const WINDOW_MIN_WIDTH: number = 6;
export const WINDOW_HEIGHT_PERCENTAGE: number = 0.4;
export const WINDOW_START_BOTTOM: number = 0.4;
export const WINDOW_DEPTH: number = 3;

export const WINDOW_SPLIT_VERTICAL_MIN_WIDTH: number = 8;
export const WINDOW_SPLIT_VERTICAL_PROBABILITY: number = 0.3;
export const WINDOW_SPLIT_HORIZONTAL_PROBABILITY: number = 0.3;
export const WINDOW_SPLIT_HORIZONTAL_PERCENTAGE: number = 0.3;

export const WINDOW_PANE_THICKNESS: number = 0.1;
export const WINDOW_PANE_ID: string = "window_pane";

export const WINDOW_FRAME_THICKNESS: number = 0.4;
export const WINDOW_FRAME_DEPTH: number = 0.5;
export const WINDOW_FRAME_COLOR_HEX: string = "#fafafa";
export const SINGLE_WINDOW_ID: string = "single_window";
export const DOUBLE_WINDOW_LEFT_ID: string = "double_window_left";
export const DOUBLE_WINDOW_RIGHT_ID: string = "double_window_right";

export const WINDOW_SPACING_SCHEME = {
    EQUALLY_SPACED: "equal" as const,
    BREAK_MIDDLE: "break" as const
} as const;

export const WINDOW_BREAK_SCHEME_DIST_PERCENTAGE: number = 0.01;

console.assert(
    WINDOW_MIN_WIDTH * WINDOW_MAX_PER_STORY < MIN_HOUSE_WIDTH - MIN_HOUSE_WIDTH * WINDOW_BREAK_SCHEME_DIST_PERCENTAGE,
    "The accumulated width of all windows if the maximum amount of windows per story would be created exceeds the minimum Story width."
);

export const FASSADE_MATERIALS = {
    BRICKS: "brick" as const,
    PLASTER: "plaster" as const
} as const;

export const GUTTER_TUBE_DISTANCE_SIDES: number = 3;

export const BALCONY_DOOR_START_BOTTOM: number = 0.2;
export const BALCONY_DOOR_HEIGHT_PERCENTAGE: number = 0.65;

export const BALCONY_DEPTH: number = 7;
export const BALCONY_PLATFORM_THICKNESS: number = 1.5;
export const BALCONY_START_BOTTOM: number = 0.2;
export const BALCONY_WIDTH_MIN: number = 10;
export const BALCONY_WIDTH_MAX: number = 20;
export const BALCONY_MIN_OFFSET_FROM_CENTER: number = WINDOW_MAX_WIDTH / 2 + 1;
export const BALCONY_DIST_OTHER_WINDOWS: number = 2;

export const BALCONY_RAILING_HEIGHT: number = 5;
export const BALCONY_RAILING_DIST_EDGE: number = 0.5;
export const BALCONY_RAILING_DIAMETER_MAIN: number = 0.3;
export const BALCONY_RAILING_DIAMETER_SECONDARY: number = 0.2;
export const BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE: number = 0.5;
export const BALCONY_RAILING_SECONDARY_DISTANCE: number = 1;

export const BALCONY_RAILING_TYPES = {
    STANDARD: "standard",
    CONNECTED: "connected",
};

export const METAL_COLOR_HEX: string = "#7a7a7a";

// Antenna
export const SATELLITE_RECEIVER_BOWL_DIAMETER_MAX: number = 8;
export const SATELLITE_RECEIVER_BOWL_DIAMETER_MIN: number = 5;
export const SATELLITE_RECEIVER_BOWL_HEIGHT_MAX: number = 4;
export const SATELLITE_RECEIVER_BOWL_HEIGHT_MIN: number = 2;
export const SATELLITE_RECEIVER_POLE_RADIUS: number = 0.2;
export const SATELLITE_RECEIVER_Y_DIRECTION: number = Math.PI * 2.75;

export const AMFMANTENNA_TYPES = {
    SINGLE: "single",
    CROSS: "cross",
};

export const ANTENNA_ROD_DIAMETER: number = 0.1;

export const AMFMANTENNA_HEIGHT: number = 0.25;
export const AMFMANTENNA_WIDTH_MAX: number = 7;
export const AMFMANTENNA_WIDTH_MIN: number = 5;

export const TVANTENNA_HEIGHT: number = 0.25;
export const TVANTENNA_LENGTH_MAX: number = 25;
export const TVANTENNA_LENGTH_MIN: number = 15;
export const TVANTENNA_ELEMENT_DIST_MAX: number = 4;
export const TVANTENNA_ELEMENT_DIST_MIN: number = 2;
export const TVANTENNA_ELEMENT_LENGTH_MAX: number = 8;
export const TVANTENNA_ELEMENT_LENGTH_MIN: number = 5;

export const REFLECTOR_ANGLE = Math.PI / 4;
export const REFLECTOR_ELEMENT_DIST = 0.5;
export const REFLECTOR_ELEMENT_LENGTH_MAX = 4;
export const REFLECTOR_ELEMENT_LENGTH_MIN = 2;
export const REFLECTOR_ELEMENT_WIDTH_MAX = 6;
export const REFLECTOR_ELEMENT_WIDTH_MIN = 4;
export const REFLECTOR_ANTENNA_LENGTH_MAX = 20;
export const REFLECTOR_ANTENNA_LENGTH_MIN = 10;
export const REFLECTOR_ANTENNA_ELEMENT_LENGTH_MAX = 5;
export const REFLECTOR_ANTENNA_ELEMENT_LENGTH_MIN = 3;
export const REFLECTOR_ANTENNA_DIST_MAX: number = 3;
export const REFLECTOR_ANTENNA_DIST_MIN: number = 1;
export const REFLECTOR_FRAME_PIECES: number = 3;

export const ANTENNA_TYPES = {
    AMFM: "amfm",
    TV: "tv",
    REFLECTOR: "reflector"
};

export const ANTENNA_TYPES_MAX_COUNT: Record<string, number> = {
    [ANTENNA_TYPES.AMFM]: 2,
    [ANTENNA_TYPES.TV]: 1,
    [ANTENNA_TYPES.REFLECTOR]: 2
};

export const antennaTypeCounter: Record<string, number> = {
    [ANTENNA_TYPES.AMFM]: 0,
    [ANTENNA_TYPES.TV]: 0,
    [ANTENNA_TYPES.REFLECTOR]: 0
};

export const ANTENNA_COUNT_MAX: number = 3;
export const ANTENNA_COUNT_MIN: number = 0;

console.assert(
    ANTENNA_COUNT_MAX < Object.values(ANTENNA_TYPES_MAX_COUNT).reduce((sum, count) => sum + count, 0),
    "The maximum amount of antennas must be lower than the sum of the maximum count of each antenna type."
);

export const ANTENNA_POLE_RADIUS: number = 0.2;
export const ANTENNA_POLE_DISTANCE_ANTENNAS: number = 2;
export const ANTENNA_POLE_MIN_HEIGHT: number = 5;
export const ANTENNA_POLE_SPACE_BOTTOM: number = 6;
export const ANTENNA_POLE_RANDOM_EXTRA_HEIGHT: number = 20;

export const ANTENNA_PROBABILITY: number = 0.8;

export const MAX_SATELLITE_RECEIVERS: number = 3;
export const SATELLITE_RECEIVER_PROBABILITY: number = 0.5;

export const EXTRA_DIST_ROOF_ELEMENTS: number = 2;
export const ANTENNA_ROOF_POSITION_FROM_TOP: number = 0.5;

export const LAWN_FIELDS_PER_SIZE: number = 0.5;

