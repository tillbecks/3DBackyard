import * as THREE from 'three';

export abstract class SceneElement {
    abstract get3DObject(...args: unknown[]): THREE.Group;
}