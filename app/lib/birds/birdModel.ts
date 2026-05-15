import * as THREE from 'three';
import * as TDUTILS from '../config/3dUtils';
import { ID_LEFT_WING, ID_RIGHT_WING } from '../config/birdConfig';


export default class BirdModel {
    model: THREE.Group;
    leftWing: THREE.Mesh;
    rightWing: THREE.Mesh;

    constructor(){
        const bodySize = 0.5;

        const birdParameter = {
            bodySize: bodySize,
            wingScaley: 3 * bodySize,
            wingScalex: 5 * bodySize,
            bodyLength: 5 * bodySize,
            wingThickness: 0.2 * bodySize,
            wingShiftUp: 0.3 * bodySize,
            wingShiftOutside: 0.4 * bodySize,
            bodyCenterPercentage: 0.55,
            tailScale: 0.4,
            tailLength: 3 * bodySize,
            bodyNormalLength: 1.1,
        }

        this.model = new THREE.Group();
        const birdColor = '#574128'
        const wingMaterial = new THREE.MeshStandardMaterial({color: birdColor, side: THREE.DoubleSide});
        this.leftWing = new THREE.Mesh(wingGeometry(birdParameter.wingScalex, birdParameter.wingScaley, 0.2), wingMaterial);
        this.leftWing.position.y += birdParameter.wingShiftUp;
        this.leftWing.position.x -= birdParameter.wingShiftOutside;
        this.leftWing.castShadow = true;
        this.leftWing.receiveShadow = true;
        this.leftWing.name= ID_LEFT_WING;
        this.rightWing = new THREE.Mesh(wingGeometry(-birdParameter.wingScalex, birdParameter.wingScaley, 0.2), wingMaterial);
        this.rightWing.position.y += birdParameter.wingShiftUp;
        this.rightWing.position.x += birdParameter.wingShiftOutside;
        this.rightWing.castShadow = true;
        this.rightWing.receiveShadow = true;
        this.rightWing.name = ID_RIGHT_WING;

        const tailMaterial = new THREE.MeshStandardMaterial({color: birdColor, side: THREE.DoubleSide});
        const tail = new THREE.Mesh(tailGeometry(birdParameter.tailScale, birdParameter.tailLength), tailMaterial);
        tail.castShadow = true;
        tail.receiveShadow = true;
        tail.position.z =  - birdParameter.bodyLength * birdParameter.bodyNormalLength * birdParameter.bodyCenterPercentage * birdParameter.tailScale;
        tail.position.y = birdParameter.bodySize * 0.1;

        const bodyMaterial = new THREE.MeshStandardMaterial({color: birdColor, side: THREE.DoubleSide});
        const body = new THREE.Mesh(bodyGeometry(birdParameter.bodyLength, birdParameter.bodySize, birdParameter.bodyCenterPercentage), bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;


        this.model.add(tail);
        this.model.add(body);
        this.model.add(this.leftWing);
        this.model.add(this.rightWing);
    }


    get3DObject(){
        return this.model;
    }
}

function wingGeometry(xscale = 1, yscale = 1, depth = 0.1): THREE.BufferGeometry {
    //Eine Geoemetrie, wie ein halber Sichelförmiger Mond

    const shape = new THREE.Shape();
    const start = new THREE.Vector2(0 * xscale, 0 * yscale);

    const cp1 = new THREE.Vector2(0.5 * xscale, 0 * yscale);
    const wingTip = new THREE.Vector2(1 * xscale, -0.7 * yscale);

    const cp2 = new THREE.Vector2(0.5 * xscale, -0.3 * yscale);
    const end = new THREE.Vector2(0 * xscale, -0.5 * yscale);
    
    shape.moveTo(start.x, start.y);
    shape.quadraticCurveTo(cp1.x, cp1.y, wingTip.x, wingTip.y);
    shape.quadraticCurveTo(cp2.x, cp2.y, end.x, end.y);
    shape.moveTo(start.x, start.y);

    const geometry = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    geometry.rotateX(Math.PI / 2);

    geometry.translate(0, 0, 0.5/2 * yscale);
    return geometry;
}

function bodyGeometry(length = 5, scale = 1, bodyCenterPercentage = 0.6): THREE.BufferGeometry {
    //Mit LatheGeometry 
    
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    const plusX = 0.075;
    const plusY = 0.1;
    let x = 0.275;
    let y = 0;
    for(let i = 0; i < 8; i++){
        points.push(new THREE.Vector3(x *scale , y * scale * length, 0));
        x += plusX;
        y += plusY;
    }
    points.push(new THREE.Vector3(0.8 * scale, 0.8 * length * scale, 0));
    points.push(new THREE.Vector3(0.6  * scale, 0.9 * length * scale, 0));
    points.push(new THREE.Vector3(0.5  * scale, 1 * length * scale, 0));
    points.push(new THREE.Vector3(0, 1.1 * length * scale, 0));
    
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(40);
    const tdCurvePoints = curvePoints.map(p => new THREE.Vector2(p.x, p.y));

    const geometry = new THREE.LatheGeometry(tdCurvePoints, 16);
    geometry.rotateX(Math.PI / 2);

    geometry.translate(0, 0, - 1.1 * length * scale * bodyCenterPercentage);
    return geometry;
}

function tailGeometry(scale = 1, length = 1): THREE.BufferGeometry{
    const shape = new THREE.Shape();
    const start = new THREE.Vector2(0.5 * scale, 0 * scale * length);
    const p1 = new THREE.Vector2(0.7 * scale, -1.2 * scale * length);
    const p2 = new THREE.Vector2(0 * scale, -0.6 * scale * length);
    const p3 = new THREE.Vector2(-0.7 * scale, -1.2 * scale * length);
    const p4 = new THREE.Vector2(-0.5 * scale, 0 * scale * length);

    shape.moveTo(start.x, start.y);
    shape.lineTo(p1.x, p1.y);
    shape.lineTo(p2.x, p2.y);
    shape.lineTo(p3.x, p3.y);
    shape.lineTo(p4.x, p4.y);
    shape.lineTo(start.x, start.y);

    const depth = 0.1 * scale;
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    geometry.rotateX(Math.PI / 2);

    geometry.translate(0, depth/2, 0);
    return geometry;
}