'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { glbToObject } from '@/app/lib/config/importExportUtils';
import { initRenderer, initCamera, initSky } from '@/app/lib/scene/scene';
import { scenarios } from '@/app/lib/config/routeConfig';
import { initSunlight, initAmbientLight } from '../lib/scene/light';
import { birdFlogGenerator, birdController } from '../lib/birds/birdController';
import { bindMouseMovementToRaycaster } from '../lib/config/windowUtils';
import { calcCenterOfGeometries } from '../lib/config/3dUtils';
import { loadShader } from '../lib/textures/shader/shaderConfig';

export default function SceneViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    //const sceneRef = useRef<THREE.Scene | null>(null);
    //const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    //const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    useEffect(() => {
        const scenario = scenarios.backyard; // Hier kannst du das Szenario wechseln, z.B. scenarios.backyard
        const animations: ((...args: undefined[]) => void)[] = [];

        if (!containerRef.current) return;

        // Scene, Camera, Renderer initialisieren
        const scene = new THREE.Scene();
        //sceneRef.current = scene;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const camera = initCamera(width, height);
        //cameraRef.current = camera;

        const renderer = initRenderer(width, height);
        containerRef.current.appendChild(renderer.domElement);
        //rendererRef.current = renderer;

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        scene.add(initSky());
        scene.add(initSunlight());
        scene.add(initAmbientLight());

        const initScene = async (scenario: string) => {
            try {
                const sceneConfigResponse = await fetch(`/api/scene?scenario=${scenario}`);
                if (!sceneConfigResponse.ok) {
                    throw new Error(`HTTP error! status: ${sceneConfigResponse.status}`);
                }
                const sceneConfig = await sceneConfigResponse.json();
                camera.position.copy(new THREE.Vector3(...sceneConfig.cameraConfig.position));
                camera.lookAt(new THREE.Vector3(...sceneConfig.cameraConfig.aim));

                controls.target.copy(new THREE.Vector3(...sceneConfig.cameraConfig.aim));
                controls.update();
            } catch (error) {
                console.error('Error loading scene:', error);
            }
        }

        // GLB laden von API
        const loadContent = async (scenario: string) => {
            try {
                const contentResponse = await fetch(`/api/scene-objects?scenario=${scenario}`);
                if (!contentResponse.ok) {
                    throw new Error(`HTTP error! status: ${contentResponse.status}`);
                }
                const glb = await contentResponse.arrayBuffer();
                const loadedScene = await glbToObject(glb);
                loadedScene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(loadedScene);
            } catch (error) {
                console.error('Error loading scene:', error);
            }
        };

        const loadBirds = async (scenario: string) => {
            try {
                if(scenario === scenarios.backyard){
                    const birdModelResponse = await fetch('/api/birds');
                    if (!birdModelResponse.ok) {
                        throw new Error(`HTTP error! status: ${birdModelResponse.status}`);
                    }
                    const birdModelGlb = await birdModelResponse.arrayBuffer();
                    const birdModel = await glbToObject(birdModelGlb);
                    birdModel.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                const birdFlog = birdFlogGenerator(birdModel);
                    for(const bird of birdFlog.birds){
                        scene.add(bird.birdGeometry);
                    }
                animations.push(() => birdFlog.update());
                return birdFlog;
                }
            } catch (error) {
                console.error('Error loading birds:', error);
                return null;
            }
        };

        const getOnWindowClick = (birdFlog: birdController)=>{
            return (windows: THREE.Object3D[]) => {
                const center = calcCenterOfGeometries(windows);
                birdFlog?.switchToGoal(center);
            }
        };

        const loadBackyard = async () => {
            const scenario = scenarios.backyard;
            try{
                await initScene(scenario);
                await loadContent(scenario);
                const birdFlog = await loadBirds(scenario);
                if(containerRef.current) bindMouseMovementToRaycaster(camera, scene, containerRef.current, birdFlog instanceof birdController ? getOnWindowClick(birdFlog) : () => {});
                return birdFlog; 
            }
            catch(error){
                console.error('Error loading backyard scenario:', error);
                return null;
            }
        }

        const loadScenario = async (scenario: string) => {
            try {
                if(scenario === scenarios.backyard){
                  await loadBackyard();
                }        
                else{        
                    await initScene(scenario);
                    await loadContent(scenario);
                }
                loadShader(scene);
            } catch (error) {
                console.error('Error loading scenario:', error);
            }
        };

        loadScenario(scenario);

        // Animation Loop
        const animate = () => {
            try {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
                animations.forEach((f: (...args: undefined[]) => void) => f());
            } catch (error) {
                console.error('Render error:', error);
                return;
            }
        };
        animate();

        // Window Resize Handler
        const handleResize = () => {
            if (!containerRef.current) return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
            }}
        />
    );
}
