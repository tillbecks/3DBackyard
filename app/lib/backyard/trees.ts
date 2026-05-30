// + (yaw left), - (yaw right), > (pitch up), < (pitch down), & (roll left), ^ (roll right)

import { degToRad } from 'three/src/math/MathUtils.js';
import * as THREE from 'three';

import * as TYPES from '@/app/types/typeIndex';
import * as TCONFIG from '@/app/lib/config/treeConfig';
import { randomFromArray, randomInRangeFloat } from '@/app/lib/config/utils';
import { getTreeBarkMaterial, getTreeLeafMaterial } from '@/app/lib/materials/materials';
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

function recursiveStringTo3DOperation(string: string, config: TYPES.LSystemConfig, material: TYPES.MaterialMix, leafGeometry: THREE.SphereGeometry, leafConfig: TYPES.LeafConfig): { group: THREE.Group, leftOverString: string }{
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
                const returnObj = recursiveStringTo3DOperation(remainingString, newConfig, material, leafGeometry, leafConfig);
                returnObj.group.position.setY(config.initialLength);
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "+":{
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                returnObj.group.rotateX(degToRad(config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "-":{
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                returnObj.group.rotateX(degToRad(-config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case ">":{
                //pitch up by config.PitchAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                returnObj.group.rotateZ(degToRad(config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "<":{
                //pitch down by config.PitchAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                returnObj.group.rotateZ(degToRad(-config.pitchAngle + randomInRangeFloat(-config.pitchAngleVariance, config.pitchAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "&":{
                //roll left by config.rollAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                returnObj.group.rotateY(degToRad(config.rollAngle + randomInRangeFloat(-config.rollAngleVariance, config.rollAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "^":{
                //roll right by config.rollAngle
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                returnObj.group.rotateY(degToRad(-config.rollAngle + randomInRangeFloat(-config.rollAngleVariance, config.rollAngleVariance)));
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            case "[":{
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                group.add(returnObj.group);
                const secReturnObj = recursiveStringTo3DOperation(returnObj.leftOverString, config, material, leafGeometry, leafConfig);
                group.add(secReturnObj.group);
                return { group, leftOverString: secReturnObj.leftOverString };
            }
            case "]":{
                return { group, leftOverString: remainingString };
            }
            case "L":{
                group.add(generateLeaf(leafGeometry, leafConfig));
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
            default: {
                const returnObj = recursiveStringTo3DOperation(remainingString, config, material, leafGeometry, leafConfig);
                group.add(returnObj.group);
                return { group, leftOverString: returnObj.leftOverString };
            }
        }
    }
}

function generateLeaf(geometry: THREE.SphereGeometry, leafConfig: TYPES.LeafConfig): THREE.Mesh{
    const width = randomInRangeFloat(leafConfig.widthMin, leafConfig.widthMax) * leafConfig.scale;
    const height = randomInRangeFloat(leafConfig.heightMin, leafConfig.heightMax) * leafConfig.scale;
    const depth = randomInRangeFloat(leafConfig.depthMin, leafConfig.depthMax) * leafConfig.scale;

    const material = getTreeLeafMaterial(randomInRangeFloat(leafConfig.leafColorLightnessMin, leafConfig.leafColorLightnessMax));
    const mesh = new THREE.Mesh(geometry, material.standardMaterial);
    mesh.userData.shader = material.shaderMaterial;
    mesh.scale.set(width, height, depth);
    mesh.position.y = height/2;
    return mesh;
}

export function generateLSystemTree(LSystem: TYPES.LSystemType, LSystemConfig: TYPES.LSystemConfig, LeafConfig: TYPES.LeafConfig): THREE.Group{
    const evolvedString = addLeavesToTerminals(evolveLSystem(LSystem, LSystemConfig.iterations));
    const material = getTreeBarkMaterial();
    const leafGeometry = new THREE.SphereGeometry(1, LeafConfig.heightSegments, LeafConfig.widthSegments);
    const returnObj = recursiveStringTo3DOperation(evolvedString, LSystemConfig, material, leafGeometry, LeafConfig);
    return returnObj.group;
}

export function generateStdLSystemTree(): THREE.Group{
    return generateLSystemTree(TCONFIG.lSystemTree, TCONFIG.lSystemGeometryConfigTree, TCONFIG.leafConfigTree);
}

export class Tree extends Decoration{
    LSystemConfig: TYPES.LSystemConfig;
    LSystem: TYPES.LSystemType;
    LeafConfig: TYPES.LeafConfig;

    constructor(LSystem: TYPES.LSystemType, LSystemConfig: TYPES.LSystemConfig, leafConfig: TYPES.LeafConfig){
        super(LSystemConfig.initialThickness * 2);
        this.LSystemConfig = LSystemConfig;
        this.LSystem = LSystem;
        this.LeafConfig = leafConfig;
    }

    get3DObject(){
        return generateLSystemTree(this.LSystem, this.LSystemConfig, this.LeafConfig);
    }
}
