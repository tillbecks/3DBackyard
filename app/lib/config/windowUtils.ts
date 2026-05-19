import * as THREE from "three";
import { SINGLE_WINDOW_ID, DOUBLE_WINDOW_LEFT_ID, DOUBLE_WINDOW_RIGHT_ID, WINDOW_PANE_ID, WINDOW_OPENING_TIME } from "./houseConfig";
import { PANE_MATERIAL , PANE_HIGHLIGHT_MATERIAL } from "../textures/materials";
import * as TWEEN from '@tweenjs/tween.js';

function rotateOverTime(object: THREE.Object3D, targetRotation: number, duration: number, onComplete?: () => void): TWEEN.Tween {
    const proxy = { rotation: 0, lastRotation: 0 };
    
    const tween = new TWEEN.Tween(proxy)
        .to({ rotation: targetRotation }, duration)
        .easing(TWEEN.Easing.Elastic.Out)
        .onUpdate(() => {object.rotateY(proxy.rotation - proxy.lastRotation); proxy.lastRotation = proxy.rotation;})
        .onComplete(onComplete)
        .start();

    return tween;
}

export function openWindow(window: THREE.Object3D, openAngle: number): TWEEN.Tween {
    return rotateOverTime(window, openAngle, WINDOW_OPENING_TIME);
}

export function openDoubleWindow(leftWindow: THREE.Object3D, rightWindow: THREE.Object3D, openAngle: number): TWEEN.Tween[] {
    const leftTween = rotateOverTime(leftWindow, -openAngle, WINDOW_OPENING_TIME);
    const rightTween = rotateOverTime(rightWindow, openAngle, WINDOW_OPENING_TIME);
    return [leftTween, rightTween];
}

export function closeWindow(window: THREE.Object3D, openAngle: number): TWEEN.Tween {
    return rotateOverTime(window, -openAngle, WINDOW_OPENING_TIME);
}

export function closeDoubleWindow(leftWindow: THREE.Object3D, rightWindow: THREE.Object3D, openAngle: number): TWEEN.Tween[] {
    const leftTween = rotateOverTime(leftWindow, openAngle, WINDOW_OPENING_TIME);
    const rightTween = rotateOverTime(rightWindow, -openAngle, WINDOW_OPENING_TIME);
    return [leftTween, rightTween];
}

function bindWindowsToFunction<T = void>(house: THREE.Object3D, fSingle: (window: THREE.Object3D, args?: T) => void, fDouble: (leftWindow: THREE.Object3D, rightWindow: THREE.Object3D, args?: T) => void) {
    const functions: Record <string, (args?: T) => void> = {};

    house.traverse((child) => {
        if (child instanceof THREE.Object3D) {
            if (child.name.startsWith(SINGLE_WINDOW_ID)) {
                functions[child.name.replace(SINGLE_WINDOW_ID, "")] = (args?: T) => fSingle(child, args);
            } 
            else if (child.name.startsWith(DOUBLE_WINDOW_LEFT_ID)) {
                const rightWindowName = child.name.replace(DOUBLE_WINDOW_LEFT_ID, DOUBLE_WINDOW_RIGHT_ID);
                const rightWindow = house.getObjectByName(rightWindowName);
                if (rightWindow) {
                    functions[child.name.replace(DOUBLE_WINDOW_LEFT_ID, "")] = (args?: T) => fDouble(child, rightWindow, args);
                }
            }
        }
    });

    return functions;
}

export function bindWindowsToOpen(house: THREE.Object3D, onClick: (windows: THREE.Object3D[]) => void, tweenGroup: TWEEN.Group): Record <string, () => void> {
    const openSingle = (window?: THREE.Object3D) => {
        if (window) {
            onClick([window]);
            tweenGroup.add(openWindow(window, Math.PI / 2));
        }
    };
    const openDouble = (leftWindow?: THREE.Object3D, rightWindow?: THREE.Object3D) => {
        if (leftWindow && rightWindow) {
            onClick([leftWindow, rightWindow]);
            const tweens = openDoubleWindow(leftWindow, rightWindow, Math.PI / 2);
            tweens.forEach(tween => tweenGroup.add(tween));
        }
    };

    return bindWindowsToFunction(house, openSingle, openDouble);
}

export function bindWindowsToMaterialChange(house: THREE.Object3D): Record <string, (args: THREE.Material) => void> {
    const materialChangeSingle = (window: THREE.Object3D, material?: THREE.Material) => {
        window.traverse((c) => {
            if (c instanceof THREE.Mesh && c.name.startsWith(WINDOW_PANE_ID) && material) {
                c.material = material;
            }
        });
    };

    const materialChangeDouble = (leftWindow: THREE.Object3D, rightWindow: THREE.Object3D, material?: THREE.Material) => {
        leftWindow.traverse((c) => {
            if (c instanceof THREE.Mesh && material && c.name.startsWith(WINDOW_PANE_ID)) {
                c.material = material;
            }
        });
        rightWindow.traverse((c) => {
            if (c instanceof THREE.Mesh && material && c.name.startsWith(WINDOW_PANE_ID)) {
                c.material = material;
            }
        });
    };

    return bindWindowsToFunction(house, materialChangeSingle, materialChangeDouble);
}


export function bindMouseMovementToRaycaster(camera: THREE.Camera, scene: THREE.Scene, container: HTMLElement, onClick: (window: THREE.Object3D[]) => void, tweenGroup: TWEEN.Group): void {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastHoveredId: string | null = null;
    let hasClicked = false; // Flag: kann nur einmal geklickt werden
    const openFunctions = bindWindowsToOpen(scene, onClick, tweenGroup);
    const highlightFunctions = bindWindowsToMaterialChange(scene);

    function functionOnWindowID(event: MouseEvent, f: (id: string | null) => void){
        mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        let foundWindow = false;

        for(const intersected of intersects){
            if(intersected.object.parent?.name.startsWith(SINGLE_WINDOW_ID)){
                const id = intersected.object.parent.name.replace(SINGLE_WINDOW_ID, "");
                f(id);
                foundWindow = true;
                break;
            }
            else if(intersected.object.parent?.name.startsWith(DOUBLE_WINDOW_LEFT_ID)){
                const id = intersected.object.parent.name.replace(DOUBLE_WINDOW_LEFT_ID, "");
                f(id);
                foundWindow = true;
                break;
            }
            else if(intersected.object.parent?.name.startsWith(DOUBLE_WINDOW_RIGHT_ID)){
                const id = intersected.object.parent.name.replace(DOUBLE_WINDOW_RIGHT_ID, "");
                f(id);
                foundWindow = true;
                break;
            }
        }
        
        if(!foundWindow) f(null);
    }

    const fClick = (id: string | null) => {
        if(hasClicked) return; // Keine weiteren Clicks erlaubt
        if(id && openFunctions[id]){
            hasClicked = true; // Nach erstem Click blockieren
            openFunctions[id]();
        }
    }

    container.addEventListener("click", (event) => {
        functionOnWindowID(event, fClick);
    });

    const fMove = (id: string | null) => {

        if (id && lastHoveredId !== id && !hasClicked) {
            if (highlightFunctions[id]){
                highlightFunctions[id](PANE_HIGHLIGHT_MATERIAL);
            }
        }

        if (lastHoveredId && lastHoveredId !== id) {
            if (highlightFunctions[lastHoveredId]){
                highlightFunctions[lastHoveredId](PANE_MATERIAL);
            }
        }

        lastHoveredId = id;
    }

    container.addEventListener("mousemove", (event: MouseEvent) => {
        functionOnWindowID(event, fMove);
    });
}