export function randomInRangeInt(min: number, max: number): number {
    const dif = max - min + 1;
    return Math.floor(Math.random()*dif) + min;
}

export function randomInRangeIntDividableTwo(min: number, max: number): number {
    const firstRand = randomInRangeInt(min, max);
    return firstRand % 2 == 0 ? firstRand : firstRand + 1;
}

export function randomInRangeFloat(min: number, max: number): number {
    const dif = max - min;
    return Math.random()*dif + min;
}

export function randomFromObject<T>(obj: Record<string, T>): T {
    const keys = Object.keys(obj);
    const randIndex = randomInRangeInt(0, keys.length - 1);
    return obj[keys[randIndex]];
}

export function randomFromArray<T>(arr: T[]): T {
    const randIndex = randomInRangeInt(0, arr.length - 1);
    return arr[randIndex];
}

export function randomBoolean(chance: number=0.5): boolean {
    return Math.random() < chance;
}

export function randomPointOnPlane(width: number, depth: number): { x: number; z: number } {
    const x = randomInRangeFloat(-width / 2, width / 2);
    const z = randomInRangeFloat(-depth / 2, depth / 2);
    return {x: x, z: z};
}

export function adjustColor(hexColor: string, variety: number): string {
    const randLigthness = Math.floor(Math.random() * (variety * 2 + 1)) - variety;

    // Hex ohne # und in RGB umwandeln
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Farbkanal anpassen
    const adjustChannel = (channel: number) => Math.min(255, Math.max(0, channel + randLigthness));

    // Neue Kanäle berechnen und in Hex zurückwandeln
    return `#${[r, g, b].map(c => adjustChannel(c).toString(16).padStart(2, "0")).join("")}`;
}

export function angleToRad(angle: number): number {
    return angle * Math.PI / 180;
}

export function calcPositionOnCircle(radius: number, angle: number): { x: number; z: number } {
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    return {x: x, z: z};
}

export function calcCirclePosX(radius: number, posZ: number): { positive: number; negative: number } {
    const remaining = Math.sqrt(radius * radius - posZ * posZ);
    return {positive: remaining, negative: -remaining};
}

export function calcCirclePosZ(radius: number, posX: number): { positive: number; negative: number } {
    const remaining = Math.sqrt(radius * radius - posX * posX);
    return {positive: remaining, negative: -remaining};
}

export function collision(pos1: { x: number; z: number }, radius1: number, pos2: { x: number; z: number }, radius2: number, extraDistance: number = 0): boolean {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < (radius1 + radius2 + extraDistance);
}

export function simplexNoise(x: number, y: number): number {
    // Placeholder for simplex noise function, you can replace this with an actual implementation
    return Math.random() * 2 - 1; // Returns a value between -1 and 1
}