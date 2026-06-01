// + (yaw left), - (yaw right), > (pitch up), < (pitch down), & (roll left), ^ (roll right)

import { degToRad } from 'three/src/math/MathUtils.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import * as TYPES from '@/app/types/typeIndex';
import { randomFromArray, randomInRangeFloat } from '@/app/lib/config/utils';
import { getTreeBarkMaterial } from '@/app/lib/materials/materials';
import { Decoration } from '@/app/lib/config/decorations';

function evolveLSystem(system: TYPES.LSystemType, iterations: number): string{
    let currentString = system.axiom;
    for(let i = 0; i < iterations; i++){
        let newString = "";
        for(let char of currentString){
            if(system.rules[char]){
                const replacement = randomFromArray(system.rules[char]);
                newString += replacement;
            }else{
                newString += char;
            }
        }
        currentString = newString;
    }
    return currentString;
}

function addLeavesToTerminals(lsystemString: string): string {
    // Ersetze A] und B] am Ende von Ästen mit AL] und BL]
    return lsystemString
        .replace(/A(?=\])/g, "AL")
        .replace(/B(?=\])/g, "BL")
        .replace(/F(?=\])/g, "BL");;
}

function createLeafGeometry(leafConfig: TYPES.LeafConfig, worldMatrix: THREE.Matrix4): THREE.BufferGeometry {
    const scale = new THREE.Vector3(
        randomInRangeFloat(leafConfig.widthMin, leafConfig.widthMax) * leafConfig.scale,
        randomInRangeFloat(leafConfig.heightMin, leafConfig.heightMax) * leafConfig.scale,
        randomInRangeFloat(leafConfig.depthMin, leafConfig.depthMax) * leafConfig.scale
    );

    const localMatrix = new THREE.Matrix4()
        .makeTranslation(0, scale.y / 2, 0)
        .scale(scale);

    const finalMatrix = worldMatrix.clone().multiply(localMatrix);

    const geo = new THREE.SphereGeometry(1, 4, 4);
    geo.applyMatrix4(finalMatrix);

    // Farbe als Vertex Color einbacken
    const lightness = randomInRangeFloat(leafConfig.leafColorLightnessMin, leafConfig.leafColorLightnessMax);
    const color = new THREE.Color().setHSL(0.28, 0.6, lightness);
    const colors = new Float32Array(geo.attributes.position.count * 3);
    for (let i = 0; i < geo.attributes.position.count; i++) {
        colors[i * 3]     = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geo;
}

function recursiveStringTo3DOperation(
    string: string,
    config: TYPES.LSystemConfig,
    material: TYPES.MaterialMix,
    leafConfig: TYPES.LeafConfig,
    currentMatrix: THREE.Matrix4
): { branchGeometries: THREE.BufferGeometry[], leafGeometries: THREE.BufferGeometry[], leftOverString: string } {

    if (string.length === 0) {
        return { branchGeometries: [], leafGeometries: [], leftOverString: "" };
    }

    const symbol = string[0];
    const remainingString = string.slice(1);

    switch (symbol) {
        case "F":
        case "S": {
            const geometry = new THREE.CylinderGeometry(
                config.initialThickness * config.thicknessFactor,
                config.initialThickness,
                config.initialLength
            );
            const geoMatrix = currentMatrix.clone().multiply(
                new THREE.Matrix4().makeTranslation(0, config.initialLength / 2, 0)
            );
            geometry.applyMatrix4(geoMatrix);

            const newConfig = { ...config };
            newConfig.initialLength *= config.lengthFactor;
            newConfig.initialThickness *= config.thicknessFactor;

            const nextMatrix = currentMatrix.clone().multiply(
                new THREE.Matrix4().makeTranslation(0, config.initialLength, 0)
            );
            const returnObj = recursiveStringTo3DOperation(remainingString, newConfig, material, leafConfig, nextMatrix);
            returnObj.branchGeometries.push(geometry);
            return returnObj;
        }
        case "+": {
            const angle = degToRad(config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance));
            const nextMatrix = currentMatrix.clone().multiply(new THREE.Matrix4().makeRotationX(angle));
            return recursiveStringTo3DOperation(remainingString, config, material, leafConfig, nextMatrix);
        }
        case "-": {
            const angle = degToRad(-config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance));
            const nextMatrix = currentMatrix.clone().multiply(new THREE.Matrix4().makeRotationX(angle));
            return recursiveStringTo3DOperation(remainingString, config, material, leafConfig, nextMatrix);
        }
        case ">": {
            const angle = degToRad(config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance));
            const nextMatrix = currentMatrix.clone().multiply(new THREE.Matrix4().makeRotationZ(angle));
            return recursiveStringTo3DOperation(remainingString, config, material, leafConfig, nextMatrix);
        }
        case "<": {
            const angle = degToRad(-config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance));
            const nextMatrix = currentMatrix.clone().multiply(new THREE.Matrix4().makeRotationZ(angle));
            return recursiveStringTo3DOperation(remainingString, config, material, leafConfig, nextMatrix);
        }
        case "&": {
            const angle = degToRad(config.rollAngle + randomInRangeFloat(-config.rollAngleVariance, config.rollAngleVariance));
            const nextMatrix = currentMatrix.clone().multiply(new THREE.Matrix4().makeRotationY(angle));
            return recursiveStringTo3DOperation(remainingString, config, material, leafConfig, nextMatrix);
        }
        case "^": {
            const angle = degToRad(-config.rollAngle + randomInRangeFloat(-config.rollAngleVariance, config.rollAngleVariance));
            const nextMatrix = currentMatrix.clone().multiply(new THREE.Matrix4().makeRotationY(angle));
            return recursiveStringTo3DOperation(remainingString, config, material, leafConfig, nextMatrix);
        }
        case "[": {
            const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafConfig, currentMatrix);
            const secReturnObj = recursiveStringTo3DOperation(returnObj.leftOverString, config, material, leafConfig, currentMatrix);
            return {
                branchGeometries: [...returnObj.branchGeometries, ...secReturnObj.branchGeometries],
                leafGeometries: [...returnObj.leafGeometries, ...secReturnObj.leafGeometries],
                leftOverString: secReturnObj.leftOverString,
            };
        }
        case "]": {
            return { branchGeometries: [], leafGeometries: [], leftOverString: remainingString };
        }
        case "L": {
            const leafGeo = createLeafGeometry(leafConfig, currentMatrix);
            const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafConfig, currentMatrix);
            returnObj.leafGeometries.push(leafGeo);
            return returnObj;
        }
        default: {
            return recursiveStringTo3DOperation(remainingString, config, material, leafConfig, currentMatrix);
        }
    }
}

export class Tree extends Decoration {
    lSystemConfig: TYPES.LSystemConfig;
    lSystem: TYPES.LSystemType;
    leafConfig: TYPES.LeafConfig;
    branchGeometries: THREE.BufferGeometry[];
    leafGeometries: THREE.BufferGeometry[];

    constructor(lSystem: TYPES.LSystemType, lSystemConfig: TYPES.LSystemConfig, leafConfig: TYPES.LeafConfig) {
        super(lSystemConfig.initialThickness * 2);
        this.lSystemConfig = lSystemConfig;
        this.lSystem = lSystem;
        this.leafConfig = leafConfig;
        this.branchGeometries = [];
        this.leafGeometries = [];
    }

    get3DObject(): THREE.Group {
        const evolvedString = addLeavesToTerminals(evolveLSystem(this.lSystem, this.lSystemConfig.iterations));
        const material = getTreeBarkMaterial();
        const initialMatrix = new THREE.Matrix4(); // Identity — Position kommt in afterPositioning

        const returnObj = recursiveStringTo3DOperation(
            evolvedString, this.lSystemConfig, material, this.leafConfig, initialMatrix
        );

        this.branchGeometries = returnObj.branchGeometries;
        this.leafGeometries = returnObj.leafGeometries;

        return new THREE.Group(); // leer — Geometrien werden extern gemergt
    }

    afterPositioning(): void {
        const translationMatrix = new THREE.Matrix4().makeTranslation(this.x, this.y, this.z);
        this.branchGeometries.forEach(geo => geo.applyMatrix4(translationMatrix));
        this.leafGeometries.forEach(geo => geo.applyMatrix4(translationMatrix));
    }
}