// + (yaw left), - (yaw right), > (pitch up), < (pitch down), & (roll left), ^ (roll right)
import * as TYPES from '../../types/typeIndex';
import * as THREE from 'three';
import { randomFromArray, randomInRangeFloat } from '../config/utils';
import { degToRad } from 'three/src/math/MathUtils.js';
import { getTreeBarkMaterial, getTreeLeafMaterial } from '../textures/materials';

const LSystem: TYPES.LSystemType = {
    axiom: "F",
    rules: {
        "F": ["SAB", "FAB"],
        "A": ["[+F]", "[-F]", "[>F]", "[<F]", ""],
        "B": ["[&F]", "[^F]"],
        "S": ["S"],
        "L": ["L"],
    }
};

const LSystemGeometryConfig: TYPES.LSystemConfig = {
    pitchAngle: 25,
    pitchAngleVariance: 5,
    rollAngle: 15,
    rollAngleVariance: 5,
    initialLength: 80,
    lengthFactor: 0.90,
    initialThickness: 10,
    thicknessFactor: 0.8,
    iterations: 15,
}

const LeafConfig = {
    widthMin : 0.8,
    widthMax : 1.2,
    depthMin : 0.8,
    depthMax : 1.2,
    heightMin : 0.4,
    heightMax : 1.2,
}

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
    const width = randomInRangeFloat(LeafConfig.widthMin, LeafConfig.widthMax) * scale;
    const height = randomInRangeFloat(LeafConfig.heightMin, LeafConfig.heightMax) * scale;
    const depth = randomInRangeFloat(LeafConfig.depthMin, LeafConfig.depthMax) * scale;
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    geometry.scale(width, height, depth);
    const material = getTreeLeafMaterial();
    const mesh = new THREE.Mesh(geometry, material.standardMaterial);
    mesh.userData.shader = material.shaderMaterial;
    mesh.position.y = height/2;
    return mesh;
}

export function generateLSystemTree(): THREE.Group{
    const evolvedString = addLeavesToTerminals(evolveLSystem(LSystem, LSystemGeometryConfig.iterations));
    const material = getTreeBarkMaterial();
    const returnObj = recursiveStringTo3DOperation(evolvedString, LSystemGeometryConfig, material);
    return returnObj.group;
}
