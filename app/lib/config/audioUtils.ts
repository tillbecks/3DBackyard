import * as THREE from "three";
import { randomFromArray } from "./utils";

export class AudioSelector{
    private paths: string[];
    private audioLoader: THREE.AudioLoader;

    constructor( paths: string[]){
        this.paths = paths;
        this.audioLoader = new THREE.AudioLoader();
    }

    loadRandomAudio(sound: THREE.PositionalAudio): void {
        if (this.paths.length === 0) {
            console.warn("No bird audio variants configured.");
            return;
        }

        const path = randomFromArray(this.paths);
        this.audioLoader.load(path, (buffer) => {
            try {
                // stop any current playback first to avoid silent buffer swaps
                try { sound.stop(); } catch {}
                sound.setBuffer(buffer);
                try { (sound as any).setVolume?.(1); } catch {}
                try { sound.play(); } catch {}
                sound.setRefDistance(20);
            } catch (e) {
            }
        }, undefined, (error) => {
            console.error("Failed to load bird audio:", path, error);
        });
    }
}