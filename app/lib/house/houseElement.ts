import * as THREE from 'three';

export abstract class HouseElement {
    abstract get3DObject(...args: unknown[]): THREE.Group;
}