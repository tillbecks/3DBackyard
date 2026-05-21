'use client';

import * as TYPES from "@/app/types/typeIndex";
import * as THREE from "three";
import * as LC from "../config/lightConfig";
import { randomBoolean, randomInRangeInt } from "../config/utils";

export default class LightController {
    private lightObjects: TYPES.LightObject[] = [];
    private lightTimers: TYPES.LightTimer[] = [];
    private offTurnableLightIndexes: number[] = [];
    private onTurnableLightIndexes: number[] = [];
    private timeElapsed: number = 0;
    private init = false;
    private lightsAdded = false;

    initController(lights: TYPES.LightConfig[]){this.lightObjects = [];
        this.lightTimers = [];
        this.offTurnableLightIndexes = [];
        this.onTurnableLightIndexes = [];
        
        this.createLights(lights);
        this.init = true;
    }

    private createLights(lights: TYPES.LightConfig[]){
        for(let i=0; i<lights.length; i++){
            const lightConfig = lights[i];
            const light = new THREE.SpotLight(new THREE.Color(0xffffff), 3000, 15, Math.PI / 2.2, 0.5, 1);
            light.castShadow = true;
            light.shadow.mapSize.width = 256;   // statt 2048
            light.shadow.mapSize.height = 256;
            light.shadow.autoUpdate = false;
            light.position.copy(lightConfig.position);
            light.target.position.copy(lightConfig.position).add(new THREE.Vector3(0, -1, 0));

            if(lightConfig.initTurnedOn && lightConfig.timer > 0){
                this.addLightTimer({light, turnedOn: true, timer: lightConfig.timer}, i);
            }
            else if(lightConfig.initTurnedOn){
                this.offTurnableLightIndexes.push(i);
            } 
            else {
                this.onTurnableLightIndexes.push(i);
            }

            this.lightObjects.push({light, turnedOn: lightConfig.initTurnedOn, timer: lightConfig.timer});
        }
    }

    private addLightsToScene(scene: THREE.Scene){
        if(this.lightsAdded) return;
        this.lightsAdded = true;
        for(const index of this.offTurnableLightIndexes){
            scene.add(this.lightObjects[index].light);
            this.lightObjects[index].light.shadow.needsUpdate = true;
        }
        for(const lightTimer of this.lightTimers){
            scene.add(lightTimer.light.light);
            lightTimer.light.light.shadow.needsUpdate = true;
        }
    }

    updateLights(deltaTime: number, scene: THREE.Scene){
        if(!this.init) return;
        if(!this.lightsAdded){
            this.addLightsToScene(scene);
        }
        this.constUpdateLightTimers(deltaTime, scene);
        this.timeElapsed += deltaTime;

        let lightOnIndex: number | null = null;

        const secondsElapsed = Math.floor(this.timeElapsed);
        if(secondsElapsed <= 0) return;
        this.timeElapsed -= secondsElapsed;

        for(let i = 0; i < secondsElapsed; i++){
            if(randomBoolean(LC.TURN_ON_PROB_SEC)){
                if(this.onTurnableLightIndexes.length > 0){
                    lightOnIndex = this.onTurnableLightIndexes[randomInRangeInt(0, this.onTurnableLightIndexes.length - 1)];
                    this.lightObjects[lightOnIndex].turnedOn = true;
                    scene.add(this.lightObjects[lightOnIndex].light);
                    this.lightObjects[lightOnIndex].light.shadow.needsUpdate = true;
                    this.onTurnableLightIndexes.splice(this.onTurnableLightIndexes.indexOf(lightOnIndex), 1);
                    if(this.lightObjects[lightOnIndex].timer > 0){
                        this.addLightTimer(this.lightObjects[lightOnIndex], lightOnIndex);
                    }
                    
                }
            }            
            if(randomBoolean(LC.TURN_OFF_PROB_SEC)){
                if(this.offTurnableLightIndexes.length > 0){
                    const lightOffIndex = this.offTurnableLightIndexes[randomInRangeInt(0, this.offTurnableLightIndexes.length - 1)];
                    this.lightObjects[lightOffIndex].turnedOn = false;
                    scene.remove(this.lightObjects[lightOffIndex].light);
                    this.offTurnableLightIndexes.splice(this.offTurnableLightIndexes.indexOf(lightOffIndex), 1);
                    this.onTurnableLightIndexes.push(lightOffIndex);
                }
            }    

            if(lightOnIndex && this.lightObjects[lightOnIndex].timer == 0){
                this.offTurnableLightIndexes.push(lightOnIndex);
            }
        }
    }

    private constUpdateLightTimers(deltaTime: number, scene: THREE.Scene){
        for(let i = this.lightTimers.length - 1; i >= 0; i--){
            const lightTimer = this.lightTimers[i];
            lightTimer.timeElapsed += deltaTime;
            if(lightTimer.timeElapsed >= lightTimer.light.timer){
                lightTimer.light.turnedOn = false;
                scene.remove(lightTimer.light.light);
                this.lightTimers.splice(i, 1);  // ← Entfernen
                this.onTurnableLightIndexes.push(lightTimer.lightIndex);
            }
        }
    }

    private addLightTimer(light: TYPES.LightObject, index: number){
        this.lightTimers.push({light, timeElapsed: 0, lightIndex: index});
    }

}