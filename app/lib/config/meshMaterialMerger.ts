import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import * as TYPES from '@/app/types/typeIndex';

export function mergeSameMaterial(scene: THREE.Group): THREE.Group {
    const materialToGeometries: Record<string, { 
        geometries: THREE.BufferGeometry[], 
        materialConfig: TYPES.MaterialShaderConfig | undefined,
        originalMeshes: THREE.Mesh[]
    }> = {};

    const materialToKey = (materialId: string, shaderID: string) => `${materialId}_${shaderID}`;

    scene.traverse((child) => {
        if (child.userData.mergeable === false) return;
        if (!(child instanceof THREE.Mesh)) return;

        const mesh = child as THREE.Mesh;
        const materialConfig = mesh.userData.materialConfig as TYPES.MaterialShaderConfig | undefined;
        if(materialConfig === null || materialConfig === undefined) return;
        
        const shader: TYPES.ShaderMaterialConfig = materialConfig.shaderConfig !== null && materialConfig.shaderConfig !== undefined
            ? materialConfig.shaderConfig as TYPES.ShaderMaterialConfig 
            : { id: 'none', uniforms: {} };

        const materialKey = materialToKey(materialConfig.materialId, shader.id);

        if (!materialToGeometries[materialKey]) {
            materialToGeometries[materialKey] = { geometries: [], materialConfig, originalMeshes: [] };
        }

        mesh.updateWorldMatrix(true, false);
        const geo = mesh.geometry.clone();
        geo.applyMatrix4(mesh.matrixWorld);

        materialToGeometries[materialKey].geometries.push(geo);
        materialToGeometries[materialKey].originalMeshes.push(mesh);
    });

    // Originale entfernen und gemergte hinzufügen:
    for (const { geometries, materialConfig, originalMeshes } of Object.values(materialToGeometries)) {
        if (geometries.length === 0) continue;

        // Originale aus Szene entfernen:
        originalMeshes.forEach(m => m.removeFromParent());

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);
        if (!mergedGeometry) continue;

        const newMesh = new THREE.Mesh(mergedGeometry);
        newMesh.userData.materialConfig = materialConfig;
        scene.add(newMesh);

        // Geklonte Geometrien aufräumen:
        geometries.forEach(g => g.dispose());
    }

    return scene;
}

export function makeUnmergeable(mesh: THREE.Object3D): void {
    mesh.userData.mergeable = false;
    mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.userData.mergeable = false;
        }
    });
}