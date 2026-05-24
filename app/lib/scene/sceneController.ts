'use client';

import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { Group } from '@tweenjs/tween.js';

import { initCamera, initController, initRenderer } from './scene';
import { initLightSky } from './light';

import * as TYPES from '@/app/types/typeIndex';
import { scenarios, mainScenarios } from '@/app/lib/config/routeConfig';
import { loadShader } from '@/app/lib/textures/shader/shaderConfig';
import { glbToObject, objectFromGLBBase64 } from '@/app/lib/config/importExportUtils';
import { birdFlogGenerator, BirdController } from '@/app/lib/birds/birdController';
import { bindMouseMovementToRaycaster } from '@/app/lib/config/windowUtils';
import { calcCenterOfGeometries, cameraFollowObject } from '@/app/lib/config/3dUtils';

export class SceneController{
    containerRef: React.RefObject<HTMLDivElement>;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    listener: THREE.AudioListener;
    audioToggle: boolean = false;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    skyLightController: TYPES.LightSkyController;
    birdController: BirdController | null = null;
    timer: THREE.Timer;

    private states: Record<string, unknown> = {};
    private scenario: TYPES.RouteParams;
    private scenarioLoaded: boolean = false;
    private animations: ((deltaSeconds: number) => void)[] = [];
    private tweenGroup: Group;


    constructor(containerRef: React.RefObject<HTMLDivElement | null>, document: Document){ 
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
        this.scenario = scenarios.backyard;

        this.tweenGroup = new Group();
        this.timer = new THREE.Timer();
        this.timer.connect(document);

        this.containerRef.current.appendChild(this.renderer.domElement);
    }

    toggleAudio(){
        this.audioToggle = !this.audioToggle;
        this.birdController?.toggleAudio(this.audioToggle);
        return this.audioToggle;
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
            const sceneConfigResponse = await fetch(`/api/scene?scenario=${scenario}`);
            if (!sceneConfigResponse.ok) {
                throw new Error(`HTTP error! status: ${sceneConfigResponse.status}`);
            }
            const sceneConfig = await sceneConfigResponse.json();
            this.camera.position.copy(new THREE.Vector3(...sceneConfig.cameraConfig.position));
            this.camera.lookAt(new THREE.Vector3(...sceneConfig.cameraConfig.aim));

            this.controls.target.copy(new THREE.Vector3(...sceneConfig.cameraConfig.aim));
            this.controls.update();
        } catch (error) {
            console.error('Error loading scene:', error);
        }
    }

    // GLB laden von API
    private async loadContent(scenario: string) {
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
            this.scene.add(loadedScene);
        } catch (error) {
            console.error('Error loading scene:', error);
        }
    };

    private async loadBirds(scenario: string) {
        try {
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

            const birdFlog = birdFlogGenerator(birdModel, this.listener);
                for(const bird of birdFlog.birds){
                    this.scene.add(bird.birdGeometry);
                }
            this.animations.push((deltaSeconds) => {birdFlog.update(deltaSeconds);});
            return birdFlog;
        } catch (error) {
            console.error('Error loading birds:', error);
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
                this.states.lookAtTargetBuffer = new THREE.Vector3();
                const followFunction = (deltaSeconds: number) => cameraFollowObject(this.camera, this.birdController!.birds[0].birdGeometry, deltaSeconds, this.states.lookAtTargetBuffer as THREE.Vector3);
                this.animations.push(followFunction);
                const functionIndex = this.animations.length - 1;

                this.birdController!.switchToTarget(center, 
                    () => {this.animations.splice(functionIndex, 1);});
            }
        }
    };

    start() {
        this.loadScenario();
        this.timer.getDelta();
        requestAnimationFrame(this.animate);
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