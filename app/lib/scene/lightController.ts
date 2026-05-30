'use client';

import * as THREE from "three";

import * as TYPES from "@/app/types/typeIndex";
import * as LC from "@/app/lib/config/lightConfig";
import { randomBoolean, randomInRangeInt } from "@/app/lib/config/utils";

export default class LightController {
    private lights: TYPES.LightObject[] = [];
    private lightTimers: TYPES.LightTimer[] = [];
    private offTurnableLightIndexes: number[] = [];
    private onTurnableLightIndexes: number[] = [];
    private timeElapsed: number = 0;
    private init = false;
    private lightsAdded = false;
    private time: Date= new Date();

    initController(lights: TYPES.LightConfig[]){
        this.lights = [];
        this.lightTimers = [];
        this.offTurnableLightIndexes = [];
        this.onTurnableLightIndexes = [];
        if(lights == undefined || lights.length == 0) return;
        this.createLights(lights);
        this.init = true;
    }

    private createLights(lights: TYPES.LightConfig[]){
        for(let i=0; i<lights.length; i++){
            const lightConfig = lights[i];

            if(lightConfig.initTurnedOn && lightConfig.timer > 0){
                this.addLightTimer({name: lightConfig.name, turnedOn: true, timer: lightConfig.timer}, i);
                this.onTurnableLightIndexes.push(i);
            }
            else if(lightConfig.initTurnedOn){
                this.offTurnableLightIndexes.push(i);
            } 
            else {
                this.onTurnableLightIndexes.push(i);
            }

            this.lights.push({name: lightConfig.name, turnedOn: lightConfig.initTurnedOn, timer: lightConfig.timer});
        }
    }

    private addLightsToScene(scene: THREE.Scene){
        if(this.lightsAdded) return;
        for(const index of this.onTurnableLightIndexes){
            this.turnLightOff(this.lights[index].name, scene);
        }
        this.lightsAdded = true;
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
            const onOffProbabilities = LC.turnOnOffProbs[this.time.getHours()];
            if(randomBoolean(onOffProbabilities.on)){
                if(this.onTurnableLightIndexes.length > 0){
                    lightOnIndex = this.onTurnableLightIndexes[randomInRangeInt(0, this.onTurnableLightIndexes.length - 1)];
                    this.lights[lightOnIndex].turnedOn = true;
                    
                    this.turnLightOn(this.lights[lightOnIndex].name, scene);
                    this.onTurnableLightIndexes.splice(this.onTurnableLightIndexes.indexOf(lightOnIndex), 1);
                    if(this.lights[lightOnIndex].timer > 0){
                        console.log(`Turning on light ${this.lights[lightOnIndex].name} with timer ${this.lights[lightOnIndex].timer}`);
                        this.addLightTimer(this.lights[lightOnIndex], lightOnIndex);
                    }
                    
                }
            }            
            if(randomBoolean(onOffProbabilities.off)){
                if(this.offTurnableLightIndexes.length > 0){
                    const lightOffIndex = this.offTurnableLightIndexes[randomInRangeInt(0, this.offTurnableLightIndexes.length - 1)];
                    this.lights[lightOffIndex].turnedOn = false;
                    this.turnLightOff(this.lights[lightOffIndex].name, scene);
                    this.offTurnableLightIndexes.splice(this.offTurnableLightIndexes.indexOf(lightOffIndex), 1);
                    this.onTurnableLightIndexes.push(lightOffIndex);
                }
            }    

            if(lightOnIndex && this.lights[lightOnIndex].timer == 0){
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
                this.turnLightOff(lightTimer.light.name, scene);
                this.lightTimers.splice(i, 1);  // ← Entfernen
                this.onTurnableLightIndexes.push(lightTimer.lightIndex);
            }
        }
    }

    private addLightTimer(light: TYPES.LightObject, index: number){
        this.lightTimers.push({light, timeElapsed: 0, lightIndex: index});
    }

    private turnLightOn(lightName: string, scene: THREE.Scene){
        const wallLight = scene.getObjectByName(lightName);
        if(wallLight){
            wallLight.visible = true;
        }
    }

    private turnLightOff(lightName: string, scene: THREE.Scene){
        const wallLight = scene.getObjectByName(lightName);
        if(wallLight){
            wallLight.visible = false;
        }
    }
}