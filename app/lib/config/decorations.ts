import * as THREE from 'three';

import * as UTILS from '@/app/lib/config/utils';
import { SceneElement } from '@/app/lib/house/houseElement';


export abstract class Decoration extends SceneElement{
    diameter: number;
    x: number;
    y: number;
    z: number;


    constructor(diameter: number){
        super();
        this.diameter = diameter;
        this.x = 0;
        this.z = 0;
        this.y = 0;
    }
}

export class DecorationsPlacer{
    areaWidth: number;
    areaDepth: number;
    decorations: {deco: Decoration, freeDiameter: number}[];

    constructor(areaWidth: number, areaDepth: number){
        this.areaWidth = areaWidth;
        this.areaDepth = areaDepth;
        this.decorations = [];
    }

    //allowedMin/MaxX/Z in percentage of the area
    //The extraDistance describes the area around the object that should be free
    addDecorationPosition(newDecoration: Decoration, allowedMinX: number, allowedMaxX: number, allowedMinZ: number, allowedMaxZ: number, extraDiameter: number = 0): void {
        //If min is bigger tan max, we have two allowed areas of min-1 and 0-max
        const xSegments: [number, number][] = allowedMinX > allowedMaxX
            ? [[0, allowedMaxX], [allowedMinX, 1]]
            : [[allowedMinX, allowedMaxX]];

        const zSegments: [number, number][] = allowedMinZ > allowedMaxZ
            ? [[0, allowedMaxZ], [allowedMinZ, 1]]
            : [[allowedMinZ, allowedMaxZ]];

        // Alle Segment-Kombinationen als Rechtecke aufbauen
        type Rect = { minX: number; maxX: number; minZ: number; maxZ: number; weight: number };
        const rects: Rect[] = [];
        let totalArea = 0;

        for (const [minX, maxX] of xSegments) {
            for (const [minZ, maxZ] of zSegments) {
            const area = (maxX - minX) * (maxZ - minZ);
            if (area > 0) {
                rects.push({ minX, maxX, minZ, maxZ, weight: area });
                totalArea += area;
            }
            }
        }

        if (rects.length === 0) return;

        const pickRect = (): Rect => {
            const r = Math.random() * totalArea;
            let acc = 0;
            for (const rect of rects) {
            acc += rect.weight;
            if (r <= acc) return rect;
            }
            return rects[rects.length - 1];
        };

        let positionValid = false;
        let attempts = 0;
        const maxAttempts = 100;
        const positionToKey = ({ x, z }: { x: number; z: number }) =>
            `${x.toFixed(2)}_${z.toFixed(2)}`;
        const attemptedPositionKeys = new Set<string>();

        while (!positionValid && attempts < maxAttempts) {
            attempts++;

            const rect = pickRect();
            const baseWidth = (rect.maxX - rect.minX) * this.areaWidth;
            const baseDepth = (rect.maxZ - rect.minZ) * this.areaDepth;
            const ignoreDiameterX = baseWidth < newDecoration.diameter;
            const ignoreDiameterZ = baseDepth < newDecoration.diameter;
            const effectiveAreaWidth = ignoreDiameterX ? baseWidth : baseWidth - newDecoration.diameter;
            const effectiveAreaDepth = ignoreDiameterZ ? baseDepth : baseDepth - newDecoration.diameter;

            const tempPos = UTILS.randomPointOnPlane(effectiveAreaWidth, effectiveAreaDepth);
            const tempPosKey = positionToKey(tempPos);
            if (attemptedPositionKeys.has(tempPosKey)) continue;
            attemptedPositionKeys.add(tempPosKey);

            newDecoration.x = -this.areaWidth / 2 + rect.minX * this.areaWidth + tempPos.x
            + (ignoreDiameterX ? 0 : newDecoration.diameter / 2);
            newDecoration.z = -this.areaDepth / 2 + rect.minZ * this.areaDepth + tempPos.z
            + (ignoreDiameterZ ? 0 : newDecoration.diameter / 2);

            positionValid = true;
            for (const existing of this.decorations) {
            positionValid = !UTILS.collision(
                { x: newDecoration.x, z: newDecoration.z }, newDecoration.diameter / 2 + extraDiameter / 2,
                { x: existing.deco.x, z: existing.deco.z }, existing.freeDiameter / 2,
                0
            );
            if (!positionValid) break;
            }
        }

        if (attempts === maxAttempts) {
            console.warn(`Could not find valid position after ${maxAttempts} attempts. Decoration skipped.`);
        }
        if (!positionValid) return;

        this.decorations.push({ deco: newDecoration, freeDiameter: extraDiameter + newDecoration.diameter });
    }

    positionDecorations(offset: THREE.Vector3): THREE.Group{
        const group = new THREE.Group();
        for(const d of this.decorations){
            const obj = d.deco.get3DObject();
            obj.position.x = d.deco.x;
            obj.position.y = d.deco.y;
            obj.position.z = d.deco.z;
            group.add(obj);
        }
        group.position.add(offset);
        return group;
    }
}