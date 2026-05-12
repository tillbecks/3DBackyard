import * as THREE from "three";
import { SINGLE_WINDOW_ID, DOUBLE_WINDOW_LEFT_ID, DOUBLE_WINDOW_RIGHT_ID, WINDOW_PANE_ID } from "./houseConfig";
import { PANE_MATERIAL , PANE_HIGHLIGHT_MATERIAL } from "./materials";


export function openWindow(window: THREE.Object3D, open_angle: number): void {
    window.rotateY(open_angle);
}

export function openDoubleWindow(left_window: THREE.Object3D, right_window: THREE.Object3D, open_angle: number): void {
    left_window.rotateY(-open_angle);
    right_window.rotateY(open_angle);
}

export function closeWindow(window: THREE.Object3D, open_angle: number): void {
    window.rotateY(-open_angle);
}

export function closeDoubleWindow(left_window: THREE.Object3D, right_window: THREE.Object3D, open_angle: number): void {
    left_window.rotateY(open_angle);
    right_window.rotateY(-open_angle);
}

function bindWindowsToFunction<T = void>(house: THREE.Object3D, f_single: (window: THREE.Object3D, args?: T) => void, f_double: (left_window: THREE.Object3D, right_window: THREE.Object3D, args?: T) => void) {
    const functions: Record <string, (args?: T) => void> = {};

    house.traverse((child) => {
        if (child instanceof THREE.Object3D) {
            if (child.name.startsWith(SINGLE_WINDOW_ID)) {
                functions[child.name.replace(SINGLE_WINDOW_ID, "")] = (args?: T) => f_single(child, args);
            } 
            else if (child.name.startsWith(DOUBLE_WINDOW_LEFT_ID)) {
                const right_window_name = child.name.replace(DOUBLE_WINDOW_LEFT_ID, DOUBLE_WINDOW_RIGHT_ID);
                const right_window = house.getObjectByName(right_window_name);
                if (right_window) {
                    functions[child.name.replace(DOUBLE_WINDOW_LEFT_ID, "")] = (args?: T) => f_double(child, right_window, args);
                }
            }
        }
    });

    return functions;
}

export function bindWindowsToOpen(house: THREE.Object3D, on_click: (windows: THREE.Object3D[]) => void): Record <string, () => void> {
    const open_single = (window?: THREE.Object3D) => {
        if (window) {
            on_click([window]);
            openWindow(window, Math.PI / 2);
        }
    };
    const open_double = (left_window?: THREE.Object3D, right_window?: THREE.Object3D) => {
        if (left_window && right_window) {
            on_click([left_window, right_window]);
            openDoubleWindow(left_window, right_window, Math.PI / 2);
        }
    };

    return bindWindowsToFunction(house, open_single, open_double);
}

export function bindWindowsToMaterialChange(house: THREE.Object3D): Record <string, (args: THREE.Material) => void> {
    const material_change_single = (window: THREE.Object3D, material?: THREE.Material) => {
        window.traverse((c) => {
            if (c instanceof THREE.Mesh && c.name.startsWith(WINDOW_PANE_ID) && material) {
                c.material = material;
            }
        });
    };

    const material_change_double = (left_window: THREE.Object3D, right_window: THREE.Object3D, material?: THREE.Material) => {
        left_window.traverse((c) => {
            if (c instanceof THREE.Mesh && material && c.name.startsWith(WINDOW_PANE_ID)) {
                c.material = material;
            }
        });
        right_window.traverse((c) => {
            if (c instanceof THREE.Mesh && material && c.name.startsWith(WINDOW_PANE_ID)) {
                c.material = material;
            }
        });
    };

    return bindWindowsToFunction(house, material_change_single, material_change_double);
}


export function bindMouseMovementToRaycaster(camera: THREE.Camera, scene: THREE.Scene, container: HTMLElement, on_click: (window: THREE.Object3D[]) => void): void {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let last_hovered_id: string | null = null;
    const open_functions = bindWindowsToOpen(scene, on_click);
    const highlight_functions = bindWindowsToMaterialChange(scene);

    function functionOnWindowID(event: MouseEvent, f: (id: string | null) => void){
        mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        let found_window = false;

        for(const intersected of intersects){
            if(intersected.object.parent?.name.startsWith(SINGLE_WINDOW_ID)){
                const id = intersected.object.parent.name.replace(SINGLE_WINDOW_ID, "");
                f(id);
                found_window = true;
                break;
            }
            else if(intersected.object.parent?.name.startsWith(DOUBLE_WINDOW_LEFT_ID)){
                const id = intersected.object.parent.name.replace(DOUBLE_WINDOW_LEFT_ID, "");
                f(id);
                found_window = true;
                break;
            }
            else if(intersected.object.parent?.name.startsWith(DOUBLE_WINDOW_RIGHT_ID)){
                const id = intersected.object.parent.name.replace(DOUBLE_WINDOW_RIGHT_ID, "");
                f(id);
                found_window = true;
                break;
            }
        }
        
        if(!found_window) f(null);
    }

    const f_click = (id: string | null) => {
        if(id && open_functions[id]){
            open_functions[id]();
        }
    }

    container.addEventListener("click", (event) => {
        functionOnWindowID(event, f_click);
    });

    const f_move = (id: string | null) => {
        if (id && last_hovered_id !== id) {
            if (highlight_functions[id]){
                highlight_functions[id](PANE_HIGHLIGHT_MATERIAL);
            }
        }

        if (last_hovered_id && last_hovered_id !== id) {
            if (highlight_functions[last_hovered_id]){
                highlight_functions[last_hovered_id](PANE_MATERIAL);
            }
        }

        last_hovered_id = id;
    }

    container.addEventListener("mousemove", (event: MouseEvent) => {
        functionOnWindowID(event, f_move);
    });
}