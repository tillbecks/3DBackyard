'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { glbToObject, objectFromGLBBase64, objectToGLBBase64 } from '@/app/lib/config/importExportUtils';
import { initRenderer, initCamera, initSky } from '@/app/lib/scene/scene';
import { scenarios } from '@/app/lib/config/routeConfig';
import { initSunlight, initAmbientLight } from '../lib/scene/light';
import { birdFlogGenerator, BirdController } from '../lib/birds/birdController';
import { bindMouseMovementToRaycaster } from '../lib/config/windowUtils';
import { calcCenterOfGeometries, calcNormalizedDirectionVector } from '../lib/config/3dUtils';
import { loadShader } from '../lib/textures/shader/shaderConfig';
import {Group} from '@tweenjs/tween.js';
import * as TYPES from '../types/typeIndex';
import LightController from '../lib/scene/lightController';

export default function SceneViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    //const sceneRef = useRef<THREE.Scene | null>(null);
    //const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    //const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    useEffect(() => {
        const tweenGroup = new Group();
        const scenario = scenarios.backyard; // Hier kannst du das Szenario wechseln, z.B. scenarios.backyard
        const animations: ((deltaSeconds: number) => void)[] = [];
        const timer = new THREE.Timer();
        timer.connect(document);

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

        let isFollowingBird = false; // Flag für Follow-Modus
        const smoothLookAtTarget = new THREE.Vector3(); // Gepufferter Punkt zum Schauen

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
                if (!contentResponse.ok ) {
                    throw new Error(`HTTP error! status: ${contentResponse.status}`);
                }
                const content = await contentResponse.json();
                const loadedScene = await objectFromGLBBase64(content.object);
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
                animations.push((deltaSeconds) => birdFlog.update(deltaSeconds));
                return birdFlog;
                }
            } catch (error) {
                console.error('Error loading birds:', error);
                return null;
            }
        };

        const cameraFollowObject = (camera: THREE.Camera, object: THREE.Object3D, delta: number) => {
            // Berechne Blickrichtung des Vogels (wo schaut der Vogel hin)
            const birdForward = new THREE.Vector3(0, 0, 1).applyQuaternion(object.quaternion).normalize();
            
            // Offset ist immer HINTER dem Vogel, relativ zu seiner Blickrichtung
            const offset = birdForward.multiplyScalar(5);
            const targetPosition = new THREE.Vector3().copy(object.position).add(offset);
            
            const posLerpFactor = 1 - Math.exp(-3 * delta); 
            const lookLerpFactor = 1 - Math.exp(-4 * delta); 

            smoothLookAtTarget.lerp(targetPosition, lookLerpFactor);
            const targetQuat = new THREE.Quaternion();
            targetQuat.copy(camera.quaternion);
            
            camera.lookAt(smoothLookAtTarget);
            camera.quaternion.slerp(targetQuat, lookLerpFactor );
            camera.position.lerp(object.position, posLerpFactor);
        }

        const getOnWindowClick = (birdFlog: BirdController)=>{
            return (windows: THREE.Object3D[]) => {
                const center = calcCenterOfGeometries(windows);
                if(birdFlog){
                    birdFlog?.switchToGoal(center);
                    isFollowingBird = true;
                    controls.enabled = false; // OrbitControls deaktivieren
                    animations.push((deltaSeconds) => cameraFollowObject(camera, birdFlog.birds[0].birdGeometry, deltaSeconds));
                }
            }
        };

        const loadBackyard = async () => {
            const scenario = scenarios.backyard;
            try{
                await initScene(scenario);
                await loadContent(scenario);
                const birdFlog = await loadBirds(scenario);
                if(containerRef.current) bindMouseMovementToRaycaster(camera, scene, containerRef.current, birdFlog instanceof BirdController ? getOnWindowClick(birdFlog) : () => {}, tweenGroup);
                return birdFlog; 
            }
            catch(error){
                console.error('Error loading backyard scenario:', error);
                return null;
            }
        }

        let loaded = false;

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
                loaded =  true;
            } catch (error) {
                console.error('Error loading scenario:', error);
                loaded = false;
            }
        };

        // Animation Loop
        const animate = (timestamp: number) => {
            try {
                requestAnimationFrame(animate);
                if(!loaded) return;
                timer.update(timestamp);
                const deltaSeconds = timer.getDelta();
                if(!isFollowingBird) controls.update(); // OrbitControls nur wenn nicht Following timer.getDelta();
                animations.forEach((f) => f(deltaSeconds));
                //controls.update();
                tweenGroup.update();
                renderer.render(scene, camera);
            } catch (error) {
                console.error('Render error:', error);
                return;
            }
        };

        loadScenario(scenario);
        timer.getDelta();
        requestAnimationFrame(animate);

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
