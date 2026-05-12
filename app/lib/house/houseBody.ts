import { MAX_STORY_COUNT, MIN_STORY_COUNT, MAX_STORY_HEIGHT, MIN_STORY_HEIGHT, MAX_HOUSE_WIDTH, MIN_HOUSE_WIDTH, HOUSE_DEPTH } from "../config/houseConfig";
import * as THREE from 'three';
import { randomInRangeInt, randomInRangeIntDividableTwo, adjustColor } from "../config/utils";
import { roof_generator } from "./roof";
import { window_generator, create_windows_brush } from "./windows";
/*import { brickFragmentShader } from "../../procedural_textures/brick_texture";
import { vertexShader } from "../../procedural_textures/general_texture";*/
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';


class HouseBody{
    house_group: THREE.Group;
    id: number;
    child_id: number;
    story_count: number;
    story_height: number;
    house_width: number;
    color: string;
    left_size: number;
    right_size: number;

    constructor(id: number, story_count: number, story_height: number, house_width: number, color: string, left_size: number, right_size: number){
        this.house_group = new THREE.Group();

        this.id = id;
        this.story_count = story_count;
        this.story_height = story_height;
        this.house_width = house_width;
        this.color = color;
        this.left_size = left_size;
        this.right_size = right_size;
        this.child_id = 0;
    }

    getNewChildId(): string{
        return `${this.id}_${this.child_id++}`;
    }

    get3dContent(): THREE.Group {
        const house_height: number = this.story_count * this.story_height;
        const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.house_width, house_height, HOUSE_DEPTH);
        const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: this.color});
        const brickSize: { x: number; y: number } = {x: 2, y: 1};

        /*const uniforms= {
                brickSize: { value: new THREE.Vector2(brickSize.x, brickSize.y) }, // Set brick width and height in world units
                wallSize: { value: new THREE.Vector2(this.house_width, this.story_count*this.story_height) },   // Wall size in world units
                mortarThickness: {value:0},
                randomNr: {value: Math.random()*10}
            }
        const material = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: vertexShader, fragmentShader: brickFragmentShader});*/

        const roof: THREE.Group = roof_generator(HOUSE_DEPTH, this.house_width, brickSize, material, this.left_size, this.right_size, house_height);
        roof.position.setY(house_height/2);

        const windows_balcon = window_generator(this.house_width, this.story_count, this.story_height, HOUSE_DEPTH, () => this.getNewChildId());
        const balconies: THREE.Group | undefined = windows_balcon["balconies"];
        if(balconies)
            this.house_group.add(balconies);

        const windows = windows_balcon["windows"];
        const windows_brush = create_windows_brush(windows["window_holes"]);
        let windows_stair_brush;
        if (windows["stair_window_holes"].length > 0)
            windows_stair_brush = create_windows_brush(windows["stair_window_holes"]);

        const house_brush = new Brush(geometry);

        const evaluator = new Evaluator();
        evaluator.attributes = ['position', 'normal'];

        let house_without_windows = house_brush;
        if(windows_stair_brush) house_without_windows = evaluator.evaluate(house_without_windows, windows_stair_brush, SUBTRACTION);
        if(windows_brush) house_without_windows = evaluator.evaluate(house_without_windows, windows_brush, SUBTRACTION);

        house_without_windows.castShadow = true;
        house_without_windows.receiveShadow = true;
        house_without_windows.material = material;

        this.house_group.add(house_without_windows);
        this.house_group.add(roof);
        windows["window_panes"].forEach(story => {
            story.forEach(window => {
                this.house_group.add(window);
            })
        })
        windows["stair_window_panes"].forEach(window => {
            this.house_group.add(window);
        })

        return this.house_group;
    } 
};

//x rechts-links, z vorne-hinten, y oben-unten
export function houseGroupGenerator(house_cnt: number, center_point: [number, number, number]): THREE.Group {
    const house_group = new THREE.Group();
    let houses_width: number = 0;

    //const most_left_x_coordinate = center_point[0] - Math.floor(house_cnt / 2 * HOUSE_WIDTH);
    let last_story_cnt: number | null = null;
    let last_story_height: number | null = null;
    let story_cnt: number | null = null;
    let story_height: number | null = null;
    let next_story_cnt: number | null = randomInRangeInt(MAX_STORY_COUNT, MIN_STORY_COUNT);
    let next_story_height: number | null = randomInRangeIntDividableTwo(MAX_STORY_HEIGHT, MIN_STORY_HEIGHT);

    for(let i=0; i< house_cnt; ++i){
        last_story_cnt = story_cnt;
        last_story_height = story_height;
        story_cnt = next_story_cnt;
        story_height = next_story_height;
        next_story_cnt = i == house_cnt - 1 ? null : randomInRangeInt(MAX_STORY_COUNT, MIN_STORY_COUNT);
        next_story_height = i == house_cnt - 1 ? null : randomInRangeIntDividableTwo(MAX_STORY_HEIGHT, MIN_STORY_HEIGHT);
        const house_width = randomInRangeIntDividableTwo(MAX_HOUSE_WIDTH, MIN_HOUSE_WIDTH);
        houses_width += house_width;
        const house_height = story_cnt != null && story_height != null ? story_cnt * story_height : 0;
        const left_house = last_story_cnt == null || last_story_height == null ? 1 : last_story_cnt * last_story_height < house_height ? 1 : 0;
        const right_house = next_story_cnt == null || next_story_height == null ? 1 : next_story_cnt * next_story_height < house_height ? 1 : 0;
        const house_color = adjustColor("#a52a2a", 10)
        const house = new HouseBody(i,  story_cnt != null ? story_cnt : 0, story_height != null ? story_height : 0, house_width, house_color, left_house, right_house);
        const house_mesh = house.get3dContent();
        house_mesh.position.set(houses_width-Math.floor(house_width/2), Math.floor(house_height/2), 0);
        //house_mesh.translateX(houses_width-Math.floor(house_width/2));
        //house.translate(houses_width-Math.floor(house_width/2), Math.floor(house_height/2), 0);
        //house_mesh.translateY(Math.floor(house_height/2));
        house_group.add(house_mesh);
    }

    house_group.position.set(center_point[0]-Math.floor(houses_width/2), center_point[1], center_point[2]);
    return house_group;
};

export function houseDrawer(group: THREE.Group, scene: THREE.Scene){
    scene.add(group);
}