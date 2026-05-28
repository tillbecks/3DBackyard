const SunCalc = require('suncalc3');

const latitude = 49.8787;
const longitude = 8.6469;

export const LIGHT_UPDATE_INTERVAL = 5;

export const SUN_CONFIG = {
    MAX_SUN_INTENSITY: 10,
    SUN_DISTANCE: 300,
    SUN_COLOR: 0xffffff,
};

export const AMBIENT_LIGHT_CONFIG = {
    INTENSITY_MAX: 2.5,
    INTENSITY_MIN: 0.5,
    COLOR: 0xffffff
};

export const MOON_LIGHT_CONFIG = {
    INTENSITY_MAX: 3,
    MOON_DISTANCE: 300,
    COLOR: 0xaaaaaa, //"#e0e0e0"
};

export function getMoonPosition(time: number) {
    const pos = SunCalc.getMoonPosition(time, latitude, longitude);

    //Corrections
    const phi = Math.PI/2 - pos.altitude;
    const theta = - (pos.azimuth - Math.PI * 0.25);

    return {phi: phi, theta: theta, altitude: pos.altitude, azimuth: pos.azimuth};
}

export function getMoonLightIntensityFromElevation(elevation: number){
    const intensity = getLightIntensityFromElevation(elevation, MOON_LIGHT_CONFIG.INTENSITY_MAX, 0, 0);
    const moonIntensity  = SunCalc.getMoonIllumination(Date.now()).fraction;
    return intensity * moonIntensity;
}

export function getSunPosition(time: number) {
    const pos = SunCalc.getPosition(time, latitude, longitude);

    //Corrections
    const phi = Math.PI/2 - pos.altitude;
    const theta = - (pos.azimuth - Math.PI * 0.25);

    return {phi: phi, theta: theta, altitude: pos.altitude, azimuth: pos.azimuth};
}

export function getLightIntensityFromElevation(elevation: number, maxIntensity: number, minIntensity: number = 0, lowestAngle: number = 0, highestAngle: number = Math.PI* 0.5) {
    if(elevation <= lowestAngle) return minIntensity;
    if(elevation >= highestAngle) return maxIntensity;

    const normalizedElevation = (elevation - lowestAngle) / (highestAngle - lowestAngle);
    const intensity = normalizedElevation * (maxIntensity - minIntensity) + minIntensity;

    return intensity;
}
