'use client';

import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

export function initRenderer(width: number, height: number): THREE.WebGLRenderer{
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(width, height);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = true;

    renderer.autoClear = false;

    //document.body.appendChild(renderer.domElement);
    
    return renderer;
}

export function initCamera(width: number, height: number): THREE.PerspectiveCamera{
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 210;
    camera.position.y = 80;

    return camera;
}

export function initController(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): OrbitControls{
    const controller = new OrbitControls(camera, renderer.domElement);
    controller.enableDamping = true;
    controller.dampingFactor = 0.05;
    return controller;
}
