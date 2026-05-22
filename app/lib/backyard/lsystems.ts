// + (yaw left), - (yaw right), > (pitch up), < (pitch down), & (roll left), ^ (roll right)

import { degToRad } from 'three/src/math/MathUtils.js';
import * as THREE from 'three';

import * as TYPES from '@/app/types/typeIndex';
import * as TCONFIG from '@/app/lib/config/treeConfig';
import { randomFromArray, randomInRangeFloat } from '@/app/lib/config/utils';
import { getTreeBarkMaterial, getTreeLeafMaterial } from '@/app/lib/textures/materials';
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

function recursiveStringTo3DOperation(string: string, config: TYPES.LSystemConfig, material: TYPES.MaterialMix): { group: THREE.Group, leftOverString: string }{
    const group = new THREE.Group();
    if(string.length == 0){
        return { group, leftOverString: "" };
    }else{
        const symbol = string[0];
        const remainingString = string.slice(1);
        switch(symbol){
            case "F":
            case "S": {
                const mesh = new THREE.Mesh(new THREE.CylinderGeometry(config.initialThickness * config.thicknessFactor, config.initialThickness, config.initialLength), material.standardMaterial); 
                mesh.position.setY(config.initialLength/2);
                mesh.userData.shader = material.shaderMaterial;
                group.add(mesh);
                const newConfig = { ...config };
                newConfig.initialLength *= config.lengthFactor;
                newConfig.initialThickness *= config.thicknessFactor;
                const returnObj = recursiveStringTo3DOperation(remainingString, newConfig, material);
                returnObj.group.position.setY(config.initialLength);
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "+":{
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                returnObj.group.rotateX(degToRad(config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "-":{
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                returnObj.group.rotateX(degToRad(-config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case ">":{
                //pitch up by config.PitchAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                returnObj.group.rotateZ(degToRad(config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "<":{
                //pitch down by config.PitchAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                returnObj.group.rotateZ(degToRad(-config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "&":{
                //roll left by config.rollAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                returnObj.group.rotateY(degToRad(config.rollAngle + randomInRangeFloat(-config.rollAngleVariance, config.rollAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "^":{
                //roll right by config.rollAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                returnObj.group.rotateY(degToRad(-config.rollAngle + randomInRangeFloat(-config.rollAngleVariance, config.rollAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "[":{
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                group.add(returnObj.group);
                const secReturnObj = recursiveStringTo3DOperation(returnObj.leftOverString, config, material);
                group.add(secReturnObj.group);
                return { group, leftOverString: secReturnObj.leftOverString };
            }
            case "]":{
                return { group, leftOverString: remainingString };
            }
            case "L":{
                group.add(generateLeaf(config.initialLength));
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            default: {
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material);
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
        }
    }
}

function generateLeaf(scale: number): THREE.Mesh{
    const width = randomInRangeFloat(TCONFIG.LeafConfig.widthMin, TCONFIG.LeafConfig.widthMax) * scale;
    const height = randomInRangeFloat(TCONFIG.LeafConfig.heightMin, TCONFIG.LeafConfig.heightMax) * scale;
    const depth = randomInRangeFloat(TCONFIG.LeafConfig.depthMin, TCONFIG.LeafConfig.depthMax) * scale;
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    geometry.scale(width, height, depth);
    const material = getTreeLeafMaterial();
    const mesh = new THREE.Mesh(geometry, material.standardMaterial);
    mesh.userData.shader = material.shaderMaterial;
    mesh.position.y = height/2;
    return mesh;
}

export function generateLSystemTree(LSystem: TYPES.LSystemType, LSystemConfig: TYPES.LSystemConfig): THREE.Group{
    const evolvedString = addLeavesToTerminals(evolveLSystem(LSystem, LSystemConfig.iterations));
    const material = getTreeBarkMaterial();
    const returnObj = recursiveStringTo3DOperation(evolvedString, LSystemConfig, material);
    return returnObj.group;
}

export function generateStdLSystemTree(): THREE.Group{
    return generateLSystemTree(TCONFIG.LSystem, TCONFIG.LSystemGeometryConfig);
}

export class Tree extends Decoration{
    LSystemConfig: TYPES.LSystemConfig;
    LSystem: TYPES.LSystemType;

    constructor(LSystem: TYPES.LSystemType, LSystemConfig: TYPES.LSystemConfig){
        super(LSystemConfig.initialThickness);
        this.LSystemConfig = LSystemConfig;
        this.LSystem = LSystem;
    }

    get3DObject(){
        return generateLSystemTree(this.LSystem, this.LSystemConfig);
    }
}
