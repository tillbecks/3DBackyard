import * as THREE from 'three';
import { houseGroupGenerator } from '../house/houseBody';
//import { birdFlogGenerator } from '../birds/bird_controller';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { initSunlight, initAmbientLight } from './light';
import { SUN_CONFIG } from '../config/sceneConfig';
//import { initShowcaseContent, initShowcaseCamera } from './showcase/showcase.js';

export function initHouseScene(): {scene: BaseScene, content: Content}{
    return initScene(initContent);
}

/*export function initShowcase(){
    const {scene, content} = initScene(initShowcaseContent, initShowcaseCamera);
}*/

function initScene(contentInitializer: (scene: BaseScene) => Content, cameraInitializer = initCamera): {scene: BaseScene, content: Content}{
    const scene = initBaseScene(cameraInitializer);

    const content = contentInitializer(scene);
    /*if(Object.keys(content).includes('updateFunctions'))
        scene.updateFunctions.push(...content.updateFunctions);

    if(Object.keys(content).includes('cameraAim')){
        scene.orbitControls.target.copy(content.cameraAim);
        scene.orbitControls.update();
    }

    const animate = () => scene.updateFunctions.forEach(func => func());

    scene.renderer.setAnimationLoop(animate);*/

    return {scene: scene, content: content};
}

interface BaseScene{
    scene: THREE.Scene;
    //gui: GUI;
    //renderer: THREE.WebGLRenderer;
    //orbitControls: OrbitControls;
    light: {
        ambient: THREE.AmbientLight,
        sun: THREE.DirectionalLight
    };
    sky: Sky;
    //updateFunctions: (() => void)[];
    add: (object: THREE.Object3D) => void;
}

function initBaseScene(cameraInitializer = initCamera): BaseScene{
    const scene = new THREE.Scene();
    //const gui = initGUI();
    //const camera = cameraInitializer();

    const ambientLight = initAmbientLight();
    scene.add(ambientLight);

    const sunLight = initSunlight();
    scene.add(sunLight);
    scene.add(sunLight.target);

    const sky = initSky();
    scene.add(sky);

    //const renderer = initRenderer(window.innerWidth, window.innerHeight);
    //document.body.appendChild(renderer.domElement);

    //const orbitControls = new OrbitControls(camera, renderer.domElement);

    /*const updateFunctions = [
        () => renderer.render(scene, camera),
        () => orbitControls.update(),
    ];*/

    return {
        scene: scene,
        //gui: gui,
        //renderer: renderer,
        //orbitControls: orbitControls,
        light: {
            ambient: ambientLight,
            sun: sunLight
        },
        sky: sky,
        //updateFunctions: updateFunctions,
        add: function(object: THREE.Object3D){
            this.scene.add(object);
        }
    }
}

interface Content{
    [key: string]: unknown;
    //camera: THREE.PerspectiveCamera;
    cameraAim: THREE.Vector3;
    updateFunctions: (() => void)[];
}

function initContent(scene: BaseScene): Content{
    //const camera = initCamera(scene.);

    const houseGroup = houseGroupGenerator(12, [0,-30,0]);
    /*const bird_flog = birdFlogGenerator(scene.scene);
    initBirdGui(scene.gui, bird_flog);*/
    
    scene.add(houseGroup);
    //bird_flog.bird_flog.forEach(bird => scene.add(bird.bird_mesh));

    return{
        houseGroup: houseGroup,
        //bird_flog: bird_flog,
        //camera: camera,
        cameraAim: new THREE.Vector3(0,0,0),
        updateFunctions: [
            //() => bird_flog.update(scene.scene),
        ]
    }
}

export function initRenderer(width: number, height: number): THREE.WebGLRenderer{
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(width, height);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = true;

    renderer.autoClear = false;

    //document.body.appendChild(renderer.domElement);
    
    return renderer;
}

export function initCamera(width: number, height: number): THREE.PerspectiveCamera{
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 210;
    camera.position.y = 80;

    return camera;
}

export function initSky(): Sky{
    const sun = new THREE.Vector3();
    const sky = new Sky();

    sky.scale.setScalar( 450000 );

    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = 10;
    uniforms['rayleigh'].value = 1;
    uniforms['mieCoefficient'].value = 0.005;
    uniforms['mieDirectionalG'].value = 0.7;


    const phi = THREE.MathUtils.degToRad(90 - SUN_CONFIG.azimuth);
    const theta = THREE.MathUtils.degToRad(90 - SUN_CONFIG.elevation);

    sun.setFromSphericalCoords(1, theta, phi);
    uniforms['sunPosition'].value.copy(sun);

    return sky;
}


//Button on press sets bird goal made with threejs GUI
/*function initGUI(): GUI{
    const gui = new GUI();
    return gui;
}*/

/*function initBirdGui(gui: GUI, bird_flog){
    const birdFolder = gui.addFolder('Bird Control');
    const birdParams = {
        setBirdGoal: function() {
            const bird_goal = new THREE.Vector3(-70, 70, -40);
            bird_flog.switchToGoal(bird_goal);
        }
    };
    birdFolder.add(birdParams, 'setBirdGoal').name('Set Bird Goal');
    birdFolder.open();
}*/
