'use client';

import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { Group } from '@tweenjs/tween.js';

import { initCamera, initController, initRenderer } from './scene';
import { initLightSky } from './light';
import { CameraController } from './cameraController';

import * as TYPES from '@/app/types/typeIndex';
import { scenarios, mainScenarios } from '@/app/lib/config/routeConfig';
import { loadShader } from '@/app/lib/materials/shader/shaderConfig';
import { glbToObject, objectFromGLBBase64 } from '@/app/lib/config/importExportUtils';
import { fetchWithTimeout, isAbortError } from '@/app/lib/config/fetchUtils';
import { birdFlogGenerator, BirdController } from '@/app/lib/birds/birdController';
import { bindMouseMovementToRaycaster } from '@/app/lib/config/windowUtils';
import { calcCenterOfGeometries } from '@/app/lib/config/3dUtils';
import LightController from './lightController';

export class SceneController{
    containerRef: React.RefObject<HTMLDivElement>;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    listener: THREE.AudioListener;
    audioToggle: boolean;
    birdToggle: boolean;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    skyLightController: TYPES.LightSkyController;
    lightController: LightController;
    cameraController: CameraController;
    birdController: BirdController | null = null;
    timer: THREE.Timer;

    private states: Record<string, unknown> = {};
    private scenario: TYPES.RouteParams;
    private scenarioLoaded: boolean = false;
    private animations: ((deltaSeconds: number) => void)[] = [];
    private tweenGroup: Group;
    private loadAbortController: AbortController | null = null;


    constructor(containerRef: React.RefObject<HTMLDivElement | null>, document: Document, audioToggle: boolean, birdToggle: boolean){ 
        this.scenario = scenarios.backyard;

        this.audioToggle = audioToggle;
        this.birdToggle = birdToggle;

        if(!containerRef.current) throw new Error('Container reference is null');
        this.containerRef = containerRef as React.RefObject<HTMLDivElement>;

        const width = this.containerRef.current?.clientWidth || window.innerWidth;
        const height = this.containerRef.current?.clientHeight || window.innerHeight;

        this.scene = new THREE.Scene();
        this.camera = initCamera(width, height);
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.renderer = initRenderer(width, height);
        this.controls = initController(this.camera, this.renderer);
        this.skyLightController = initLightSky(this.scene);
        this.animations.push(this.skyLightController.update);

        this.tweenGroup = new Group();
        this.lightController = new LightController();
        this.cameraController = new CameraController(this.camera, new THREE.Vector3(0, 0, 0), this.controls);

        this.timer = new THREE.Timer();
        this.timer.connect(document);

        this.containerRef.current.appendChild(this.renderer.domElement);
    }

    toggleAudio(){
        this.audioToggle = !this.audioToggle;
        this.birdController?.toggleAudio(this.audioToggle);
        return this.audioToggle;
    }

    toggleBirds(){
        this.birdToggle = !this.birdToggle;
        this.birdController?.toggleBirds(this.birdToggle);
        return this.birdToggle;
    }

    private async loadScenario() {
        try {
            if(this.scenario.main === mainScenarios.backyard){
                await this.loadBackyard();
            }else{
                if(!this.scenario.sub){
                    throw new Error('Sub-scenario is required for showcase scenarios');
                }
                await this.loadShowcase();
            }
            loadShader(this.scene);
            this.scenarioLoaded = true;
        } catch (error) {
            console.error('Error loading scenario:', error);
            this.scenarioLoaded = false;
        }
    };

    private async loadShowcase() {
        await this.initScene(this.scenario.sub!);
        await this.loadContent(this.scenario.sub!);
    }

    private async initScene(scenario: string){
        try {
            // create a per-load AbortController so we can cancel fetches on close
            this.loadAbortController = new AbortController();
            const sceneConfigResponse = await fetchWithTimeout(`/api/scene?scenario=${scenario}`, {}, 7000, this.loadAbortController.signal);
            if (!sceneConfigResponse.ok) {
                throw new Error(`HTTP error! status: ${sceneConfigResponse.status}`);
            }
            const sceneConfig = await sceneConfigResponse.json();
            this.cameraController.setPosition(new THREE.Vector3(...sceneConfig.cameraConfig.position));
            this.cameraController.setTarget(new THREE.Vector3(...sceneConfig.cameraConfig.aim));
        } catch (error) {
            if (isAbortError(error)) console.warn('Scene load aborted');
            else console.error('Error loading scene:', error);
        }
    }

    // GLB laden von API
    private async loadContent(scenario: string) {
        try {
            const contentResponse = await fetchWithTimeout(`/api/scene-objects?scenario=${scenario}`, {}, 15000, this.loadAbortController?.signal);
            if (!contentResponse.ok ) {
                throw new Error(`HTTP error! status: ${contentResponse.status}`);
            }
            const content = await contentResponse.json();
            const loadedScene = await objectFromGLBBase64(content.object);
            loadedScene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    console.log(`Mesh loaded: ${child.name}`);
                }
            });
            console.log("Lights loaded from API:", content.lightConfigs);
            this.lightController.initController(content.lightConfigs);
            this.animations.push((deltaSeconds) => this.lightController.updateLights(deltaSeconds, this.scene));
            this.scene.add(loadedScene);
        } catch (error) {
            if (isAbortError(error)) console.warn('Scene content load aborted');
            else console.error('Error loading scene:', error);
        }
    };

    private async loadBirds(scenario: string) {
        try {
            const birdModelResponse = await fetchWithTimeout('/api/birds', {}, 15000, this.loadAbortController?.signal);
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

            const birdFlog = birdFlogGenerator(birdModel, this.listener, this.birdToggle, this.audioToggle);
            birdFlog.addBirdsToScene(this.scene);
            this.animations.push((deltaSeconds) => {birdFlog.update(deltaSeconds);});
            return birdFlog;
        } catch (error) {
            if (isAbortError(error)) console.warn('Bird model load aborted');
            else console.error('Error loading birds:', error);
            return null;
        }
    };

    async loadBackyard(){
        const scenario = scenarios.backyard;
        try{
            await this.initScene(scenario.main);
            await this.loadContent(scenario.main);
            this.birdController = await this.loadBirds(scenario.main);
            if(this.containerRef.current) bindMouseMovementToRaycaster(this.camera, this.scene, this.containerRef.current, this.birdController  ? this.getOnWindowClick() : () => {}, this.tweenGroup);
        }
        catch(error){
            console.error('Error loading backyard scenario:', error);
            return null;
        }
    }

    getOnWindowClick (){
        return (windows: THREE.Object3D[]) => {
            const center = calcCenterOfGeometries(windows);
            if(this.birdController){
                this.controls.enabled = false;
                //this.states.lookAtTargetBuffer = new THREE.Vector3();

                const followFunction = (deltaSeconds: number) => 
                    {
                        const birdsActivated = () => this.birdToggle;
                        if(birdsActivated())
                            this.cameraController.followObject(this.birdController!.birds[0].birdGeometry, deltaSeconds, true, -2, 2);
                        else
                            this.cameraController.followObject(center, deltaSeconds, false, -10, 0.5);
                    }
                this.animations.push(followFunction);
                const functionIndex = this.animations.length - 1;

                this.birdController!.switchToTarget(center, 
                    () => {this.animations.splice(functionIndex, 1);});
            }
        }
    };

    start() {
        const loadPromise = this.loadScenario();
        this.timer.getDelta();
        requestAnimationFrame(this.animate);
        return loadPromise;
    }

    animate = (timestamp: number) => {
        try {
            requestAnimationFrame(this.animate);

            if(!this.scenarioLoaded) return;

            this.timer.update(timestamp);
            const deltaSeconds = this.timer.getDelta();

            if(this.controls.enabled) this.controls.update(); // OrbitControls nur wenn nicht Following this.timer.getDelta();
            this.animations.forEach((f) => f(deltaSeconds));
            this.tweenGroup.update();

            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Render error:', error);
            return;
        }
    };

    close(){
        // abort any in-flight loading fetches
        if (this.loadAbortController) {
            try { this.loadAbortController.abort(); } catch (e) {}
            this.loadAbortController = null;
        }
        this.renderer.dispose();
        this.scene.clear();
    }

    handleResize(containerRef: React.RefObject<HTMLDivElement | null>){
        if (!containerRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;

        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newWidth, newHeight);
    }
}