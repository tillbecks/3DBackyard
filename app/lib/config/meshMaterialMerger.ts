import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import * as TYPES from '@/app/types/typeIndex';

export function mergeSameMaterial(scene: THREE.Group): THREE.Group {
    const materialToGeometries: Record<string, { 
        geometries: THREE.BufferGeometry[], 
        material: THREE.Material, 
        shader: TYPES.ShaderMaterialConfig,
        originalMeshes: THREE.Mesh[]
    }> = {};

    const materialToKey = (uuid: string, shaderID: string) => `${uuid}_${shaderID}`;

    scene.traverse((child) => {
        if (child.userData.mergeable === false) return;
        if (!(child instanceof THREE.Mesh)) return;

        const mesh = child as THREE.Mesh;
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material as THREE.Material;
        const shader = child.userData.shader 
            ? child.userData.shader as TYPES.ShaderMaterialConfig 
            : { id: 'none', uniforms: {} };

        const materialKey = materialToKey(material.uuid, shader.id);

        if (!materialToGeometries[materialKey]) {
            materialToGeometries[materialKey] = { geometries: [], material, shader, originalMeshes: [] };
        }

        mesh.updateWorldMatrix(true, false);
        const geo = mesh.geometry.clone();
        geo.applyMatrix4(mesh.matrixWorld);

        materialToGeometries[materialKey].geometries.push(geo);
        materialToGeometries[materialKey].originalMeshes.push(mesh);
    });

    // Originale entfernen und gemergte hinzufügen:
    for (const { geometries, material, shader, originalMeshes } of Object.values(materialToGeometries)) {
        if (geometries.length === 0) continue;

        // Originale aus Szene entfernen:
        originalMeshes.forEach(m => m.removeFromParent());

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);
        if (!mergedGeometry) continue;

        const newMesh = new THREE.Mesh(mergedGeometry, material);
        newMesh.userData.shader = shader.id !== 'none' ? shader : undefined;
        newMesh.userData.mergeable = false; // nicht nochmal mergen
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