import * as THREE from 'three';

import * as TYPES from '@/app/types/typeIndex';
import * as HC from '@/app/lib/config/houseConfig';

import { randomInRangeInt, randomInRangeFloat, randomFromObject } from '@/app/lib/config/utils';
import { createSinusHeightMap, mapHeightMapToPlane, calcUVS  } from '@/app/lib/config/3dUtils';
import { materialShaderConfigs } from '@/app/lib/materials/materials';
import {RoofDecorations} from '@/app/lib/house/roofDecorations';

class TopChimney extends RoofDecorations{
    width: number;
    depth: number;
    height: number;
    roofAngle: number;
    materialMix: TYPES.MaterialShaderConfig;

    constructor(width: number, depth: number, height: number, roofAngle: number, materialMix: TYPES.MaterialShaderConfig){
        super(Math.sqrt(Math.pow(width/2, 2) + Math.pow(depth/2, 2)) * 2);
        this.width = width;
        this.depth = depth;
        this.height = height;
        this.roofAngle = roofAngle;
        this.materialMix = materialMix;
    }

    get3DObject(): THREE.Group{
        const group = new THREE.Group();
        group.add(this.getBasicBlockGeometry(this.materialMix));
        calcUVS(group);
        const decorations = this.getDecoration();
        decorations.position.setY(this.height);
        group.add(decorations);
        return group;
    }

    getBasicBlockGeometry(material: TYPES.MaterialShaderConfig): THREE.Group{
        const BlockGeometryGroup = new THREE.Group();

        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        geometry.translate(0, this.height/2, 0);
        const geometryMesh = new THREE.Mesh(geometry);
        geometryMesh.userData.materialConfig = material;

        const extraHeight = this.depth * Math.tan(this.roofAngle);
        const roofSlopeGeometry = new THREE.BoxGeometry(this.width, extraHeight, this.depth);
        roofSlopeGeometry.translate(0, - extraHeight/2, 0);
        const roofSlopeMesh = new THREE.Mesh(roofSlopeGeometry);
        roofSlopeMesh.userData.materialConfig = material;
        
        BlockGeometryGroup.add(geometryMesh);
        BlockGeometryGroup.add(roofSlopeMesh);

        return BlockGeometryGroup;
    }

    getDecoration(){
        const decorationType = randomFromObject(HC.CHIMNEY_DECORATIONS);
        switch(decorationType){
            case HC.CHIMNEY_DECORATIONS.TOP_CHIMNEYS:
                return topChimneysGenerator(this.width, this.depth);
            case HC.CHIMNEY_DECORATIONS.CHIMNEY_ON_TOP_BUILD:
                return chimneyOnTopBuildGenerator(this.width, this.depth);
            case HC.CHIMNEY_DECORATIONS.ROOF:
                return chimneyRoofGenerator(this.width, this.depth);
            default:
                return new THREE.Group();
        }
    }
}

export function chimneyGenerator(roofAngle: number, material: TYPES.MaterialShaderConfig): TopChimney{
    const width = randomInRangeInt(HC.CHIMNEY_WIDTH_MIN, HC.CHIMNEY_WIDTH_MAX);
    const depth = randomInRangeInt(HC.CHIMNEY_DEPTH_MIN, HC.CHIMNEY_DEPTH_MAX);
    const height = randomInRangeInt(HC.CHIMNEY_HEIGHT_MIN, HC.CHIMNEY_HEIGHT_MAX);

    const chimney = new TopChimney(width, depth, height, roofAngle, material);
    return chimney;
}

class TopChimneys{
    count: number;
    type: string;

    constructor(count: number, type: string){
        this.count = count;
        this.type = type;
    }

    get3DObject(chimneyWidth: number, chimneyDepth: number, materialMixConfig: TYPES.MaterialShaderConfig): THREE.Group{
        const group = new THREE.Group();

        const maxChimneyDiameter = Math.min(chimneyWidth / this.count, chimneyDepth / this.count);
        const chimneyDiameter = maxChimneyDiameter * randomInRangeFloat(HC.CHIMNEY_TOP_CHIMNEYS_SIZE_PERC_MIN, HC.CHIMNEY_TOP_CHIMNEYS_SIZE_PERC_MAX);

        let heights = Array(this.count).fill(0);
        if(this.type == HC.CHIMNEY_TOP_CHIMNEYS_TYPES.EQUAL_HEIGHT){
            heights.fill(randomInRangeInt(HC.CHIMNEY_TOP_CHIMNEYS_HEIGHT_MIN, HC.CHIMNEY_TOP_CHIMNEYS_HEIGHT_MAX));
        }else{
            heights = heights.map(() => randomInRangeInt(HC.CHIMNEY_TOP_CHIMNEYS_HEIGHT_MIN, HC.CHIMNEY_TOP_CHIMNEYS_HEIGHT_MAX));
        }

        let distX = 0;
        let startX = 0;
        let distZ = 0;
        let startZ = 0;

        if(chimneyWidth > chimneyDepth){
            distX = (chimneyWidth - chimneyDiameter) / (this.count + 1);
            startX = - chimneyWidth / 2 + distX + chimneyDiameter / 2;
        }else{
            distZ = (chimneyDepth - chimneyDiameter) / (this.count + 1);
            startZ = - chimneyDepth / 2 + distZ + chimneyDiameter / 2;
        }

        for(let i = 0; i < this.count; i++){
            const chimneyMesh = new THREE.CylinderGeometry(chimneyDiameter/2, chimneyDiameter/2, heights[i], 8);
            chimneyMesh.translate(startX + i * distX, heights[i]/2, startZ + i * distZ);
            const chimneyMeshMesh = new THREE.Mesh(chimneyMesh);
            chimneyMeshMesh.userData.materialConfig = materialMixConfig;
            group.add(chimneyMeshMesh);
        }

        return group;
    }
}

function topChimneysGenerator(chimneyWidth: number, chimneyDepth: number): THREE.Group{
    const count = randomInRangeInt(HC.CHIMNEY_TOP_CHIMNEYS_MIN, HC.CHIMNEY_TOP_CHIMNEYS_MAX);
    const type = randomFromObject(HC.CHIMNEY_TOP_CHIMNEYS_TYPES);
    const topChimneysMaterial = materialShaderConfigs.SMALL_CHIMNEY_MATERIAL();

    const chimneys = new TopChimneys(count, type);
    return chimneys.get3DObject(chimneyWidth, chimneyDepth, topChimneysMaterial);
}

class chimneyOnTopBuild{
    height: number;
    basePercentage: number;
    taperPercentage: number;

    constructor(height: number, basePercentage: number, taperPercentage: number){
        this.height = height;
        this.basePercentage = basePercentage;
        this.taperPercentage = taperPercentage;
    }

    get3DObject(chimneyWidth:number, chimneyDepth:number, materialMixConfig: TYPES.MaterialShaderConfig): THREE.Group{
        const group = new THREE.Group();
        const baseWidth = chimneyWidth * this.basePercentage;
        const baseDepth = chimneyDepth * this.basePercentage;
        const topWidth = baseWidth * (1 - this.taperPercentage);
        const topDepth = baseDepth * (1 - this.taperPercentage);

        const geometry = new THREE.BoxGeometry(baseWidth, this.height, baseDepth);
        geometry.translate(0, this.height/2, 0);

        for(let i = 0; i < geometry.attributes.position.array.length; i += 3){
            if(geometry.attributes.position.array[i + 1] >= this.height){
                geometry.attributes.position.array[i] *= topWidth / baseWidth / 2;
                geometry.attributes.position.array[i + 2] *= topDepth / baseDepth / 2;
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();


        const geometryMesh = new THREE.Mesh(geometry);
        geometryMesh.userData.materialConfig = materialMixConfig;
        group.add(geometryMesh);

        return group;
    }
}      

function chimneyOnTopBuildGenerator(chimneyWidth: number, chimneyDepth: number): THREE.Group{
    const height = randomInRangeInt(HC.CHIMNEY_ON_TOP_BUILD_HEIGHT_MIN, HC.CHIMNEY_ON_TOP_BUILD_HEIGHT_MAX);
    const basePercentage = randomInRangeFloat(HC.CHIMNEY_ON_TOP_BASE_PERCENTAGE_MIN, HC.CHIMNEY_ON_TOP_BASE_PERCENTAGE_MAX);
    const taperPercentage = randomInRangeFloat(HC.CHIMNEY_ON_TOP_TAPER_PERCENTAGE_MIN, HC.CHIMNEY_ON_TOP_TAPER_PERCENTAGE_MAX);
    const chimneyTopMaterial = materialShaderConfigs.SMALL_CHIMNEY_MATERIAL();
    const chimneyOnTop = new chimneyOnTopBuild(height, basePercentage, taperPercentage);
    return chimneyOnTop.get3DObject(chimneyWidth, chimneyDepth, chimneyTopMaterial);
}

class chimneyRoof{
    rodHeight: number;
    roofType: string;

    constructor(rodHeight: number, roofType: string){
        this.rodHeight = rodHeight;
        this.roofType = roofType;
    }
    
    get3DObject(chimneyWidth: number, chimneyDepth: number, rodMaterialMixConfig: TYPES.MaterialShaderConfig, roofMaterialConfig: TYPES.MaterialShaderConfig): THREE.Group{
        const group = new THREE.Group();

        //Roof flat geometry
        const width = chimneyWidth + 2 * HC.CHIMNEY_TOP_ROOF_OVERHANG;
        const depth = chimneyDepth + 2 * HC.CHIMNEY_TOP_ROOF_OVERHANG;
        const widthSegments = Math.ceil(width * HC.CHIMNEY_ROOF_SEGMENTS_PER_UNIT);
        const depthSegments = Math.ceil(depth * HC.CHIMNEY_ROOF_SEGMENTS_PER_UNIT);
        let roofGeometry: THREE.PlaneGeometry | THREE.BufferGeometry = new THREE.PlaneGeometry(width, depth, widthSegments, depthSegments);
        if(this.roofType == HC.CHIMNEY_ROOF_TYPES.WAVY){
            const roofPlane = roofGeometry as THREE.PlaneGeometry;
            roofGeometry = mapHeightMapToPlane(roofPlane, createSinusHeightMap(HC.CHIMNEY_ROOF_SIN_AMPLITUDE, HC.CHIMNEY_ROOF_SIN_FREQUENCY, 0, widthSegments + 1, depthSegments + 1), widthSegments + 1, depthSegments + 1);
        }

        roofGeometry.rotateX(-Math.PI / 2);
        const roofMesh = new THREE.Mesh(roofGeometry);
        roofMesh.userData.materialConfig = roofMaterialConfig;
        roofMesh.translateY(this.rodHeight - (this.roofType == HC.CHIMNEY_ROOF_TYPES.FLAT ? 0 : HC.CHIMNEY_ROOF_SIN_AMPLITUDE));
        group.add(roofMesh);

        const rodGeometry = new THREE.CylinderGeometry(HC.CHIMNEY_TOP_ROD_RADIUS, HC.CHIMNEY_TOP_ROD_RADIUS, this.rodHeight, 8);
        rodGeometry.translate(0, this.rodHeight/2, 0);

        const xOffset = chimneyWidth * HC.CHIMNEY_TOP_ROD_BASE_PERCENTAGE / 2;
        const zOffset = chimneyDepth * HC.CHIMNEY_TOP_ROD_BASE_PERCENTAGE / 2;

        for(let i = 0; i < 4; i++){
            const rodMesh = new THREE.Mesh(rodGeometry);
            rodMesh.userData.materialConfig = rodMaterialMixConfig;
            rodMesh.translateX((i % 2 == 0 ? -1 : 1) * xOffset);
            rodMesh.translateZ((i < 2 ? -1 : 1) * zOffset);
            group.add(rodMesh);
        }

        return group;
    }
}

function chimneyRoofGenerator(chimneyWidth: number, chimneyDepth: number): THREE.Group{
    const rodHeight = randomInRangeInt(HC.CHIMNEY_TOP_ROD_MIN_HEIGHT, HC.CHIMNEY_TOP_ROD_MAX_HEIGHT);
    const roofType = randomFromObject(HC.CHIMNEY_ROOF_TYPES);

    const roof = new chimneyRoof(rodHeight, roofType);
    const roofMaterial = materialShaderConfigs.CHIMNEY_ROOF_MATERIAL();
    const rodMaterial = materialShaderConfigs.FLAT_METAL_MATERIAL();
    return roof.get3DObject(chimneyWidth, chimneyDepth, rodMaterial, roofMaterial);
}

