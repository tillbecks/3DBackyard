import {WINDOW_HEIGHT_PERCENTAGE, WINDOW_MAX_PER_STORY, WINDOW_MAX_WIDTH, WINDOW_MIN_PER_STORY, WINDOW_MIN_WIDTH, WINDOW_START_BOTTOM, WINDOW_BREAK_SCHEME_DIST_PERCENTAGE, WINDOW_SPACING_SCHEME, WINDOW_DEPTH, BALCONY_DOOR_HEIGHT_PERCENTAGE, BALCONY_DOOR_START_BOTTOM } from "../config/houseConfig";
import { randomInRangeInt, randomFromObject } from "../config/utils";
import * as THREE from "three";
import {Brush, Evaluator, ADDITION } from 'three-bvh-csg';
import { balconyGenerator } from "./balcony";


class Windows{
    window_cnt_per_story: number;
    window_width: number;
    window_breaking_scheme: string;
    has_balcony: boolean;
    balcony_window: number;

    constructor(window_cnt_per_story: number, window_width: number, window_breaking_scheme: string, has_balcony: boolean, balcony_window: number){
        this.window_cnt_per_story = window_cnt_per_story;
        this.window_width = window_width;
        this.window_breaking_scheme = window_breaking_scheme;        
        this.has_balcony = has_balcony;
        this.balcony_window = balcony_window;
    }

    get3DObject(story_cnt: number, story_height: number, house_width: number, house_depth: number): {"window_holes": THREE.BoxGeometry[][], "window_panes": THREE.Mesh[][], "stair_window_holes": THREE.BoxGeometry[][], "stair_window_panes": THREE.Mesh[], "balcony_position": number}{
        const window_material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB( 1, 1, 1 )});
        const window_hole_geometries: THREE.BoxGeometry[][] = [];
        const stair_window_holes: THREE.BoxGeometry[][] = []
        const window_pane_geometries: THREE.Mesh[][] = [];
        const stair_window_pane_geometries: THREE.Mesh[] = [];
        const half_house_height: number = story_height * story_cnt / 2;

        let balcony_position_x: number = 0;

        const left_right_more_windows = randomInRangeInt(0,2);

        for(let story=0; story<story_cnt; ++story){
            const window_hole_story_group: THREE.BoxGeometry[] = [];
            const window_pane_story_geometries: THREE.Mesh[] = [];
            if (this.window_breaking_scheme == WINDOW_SPACING_SCHEME.EQUALLY_SPACED){
                //let dist_between = house_width/(this.window_cnt_per_story+1);
                //dist_between -= this.window_width;
                const width_divided: number = house_width/(this.window_cnt_per_story+1);
                const start_distance: number = width_divided ;
                const add_on: number = width_divided;

                for(let window=0; window<this.window_cnt_per_story; ++window){
                    let translate_y: number;
                    const translate_x: number = -house_width/2 + start_distance + window * add_on;
                    let window_height: number;
                    if(this.has_balcony && window == this.balcony_window){
                        window_height = BALCONY_DOOR_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * BALCONY_DOOR_START_BOTTOM - half_house_height + window_height/2;
                        balcony_position_x = translate_x;
                    }
                    else{
                        window_height = WINDOW_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * WINDOW_START_BOTTOM - half_house_height + window_height/2;
                    }
                    const window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, WINDOW_DEPTH + 2);
                    const window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, 1);
                    window_geometry.translate(translate_x, translate_y, house_depth/2);
                    window_pane_geometry.translate(translate_x, translate_y, house_depth/2 - 1);
                    window_hole_story_group.push(window_geometry);
                    window_pane_story_geometries.push(new THREE.Mesh(window_pane_geometry, window_material));
                }
            }
            else{
                const space_half_house: number = (house_width - house_width * WINDOW_BREAK_SCHEME_DIST_PERCENTAGE)/2;
                let dist_left_equal: number = space_half_house;
                let dist_right_equal: number = space_half_house;
                let window_cnt_right: number = 0;
                let window_cnt_left: number = 0;

                if(this.window_cnt_per_story%2 == 0){
                    window_cnt_right = this.window_cnt_per_story / 2;
                    window_cnt_left = window_cnt_right
                }
                else{
                    const windows_half_mo: number = Math.floor(this.window_cnt_per_story/2);
                    if(left_right_more_windows==1){ //Dann left mehr fenster
                        window_cnt_right = windows_half_mo;
                        window_cnt_left = windows_half_mo + 1;
                    }
                    else{
                        window_cnt_right = windows_half_mo + 1;
                        window_cnt_left = windows_half_mo;
                    }
                }
                dist_right_equal /= window_cnt_right + 1;
                const dist_right_start: number = dist_right_equal + this.window_width/2;
                const top_on_right: number = dist_right_equal
                dist_left_equal /= window_cnt_left + 1;
                const dist_left_start: number = dist_left_equal - this.window_width/2;
                const top_on_left: number =  dist_left_equal

                for(let window_l=0; window_l < window_cnt_left; ++window_l){
                    let translate_y: number;
                    const translate_x: number = (-house_width/2) + dist_left_start + top_on_left * window_l;
                    let window_height: number;
                    if(this.has_balcony && window_l == this.balcony_window){
                        window_height = BALCONY_DOOR_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * BALCONY_DOOR_START_BOTTOM - half_house_height + window_height/2;
                        balcony_position_x = translate_x;
                    }
                    else{
                        window_height = WINDOW_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * WINDOW_START_BOTTOM - half_house_height + window_height/2;
                    }
                    const window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, WINDOW_DEPTH);
                    const window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, 1);
                    window_geometry.translate(translate_x, translate_y, house_depth/2);
                    window_pane_geometry.translate(translate_x, translate_y, house_depth/2 - 1);
                    window_hole_story_group.push(window_geometry);
                    window_pane_story_geometries.push(new THREE.Mesh(window_pane_geometry, window_material));
                }
                for(let window_r=0; window_r < window_cnt_right; ++window_r){
                    let translate_y: number;
                    let window_height: number;
                    const translate_x: number = (house_width * WINDOW_BREAK_SCHEME_DIST_PERCENTAGE)/2 + dist_right_start + top_on_right * window_r;
                    if(this.has_balcony && (window_r + window_cnt_left) == this.balcony_window){
                        window_height = BALCONY_DOOR_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * BALCONY_DOOR_START_BOTTOM - half_house_height + window_height/2;
                        balcony_position_x = translate_x;
                    }
                    else{
                        window_height = WINDOW_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * WINDOW_START_BOTTOM - half_house_height + window_height/2;
                    }
                    const window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, WINDOW_DEPTH);
                    const window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, 1);
                    window_geometry.translate(translate_x, translate_y,  house_depth/2);
                    window_pane_geometry.translate(translate_x, translate_y,  house_depth/2 - 1);
                    window_hole_story_group.push(window_geometry);
                    window_pane_story_geometries.push(new THREE.Mesh(window_pane_geometry, window_material));
                }
                if (story > 0){
                    //Treppenhausfenster location calculation
                    //TODO: Add window_pane_geometry 
                    const stair_window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, story_height * WINDOW_HEIGHT_PERCENTAGE, WINDOW_DEPTH);
                    const x_position: number = (-(dist_left_equal) + (dist_right_equal))/2;
                    const y_position: number = story * story_height + story_height * WINDOW_START_BOTTOM - half_house_height - story_height/2;
                    stair_window_geometry.translate(x_position, y_position, house_depth/2);
                    const stair_window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, story_height * WINDOW_HEIGHT_PERCENTAGE, 1);
                    stair_window_pane_geometry.translate(x_position, y_position, house_depth/2 - 1);
                    stair_window_holes.push([stair_window_geometry]); //In extra array, so it's handled by create_window_brush
                    stair_window_pane_geometries.push(new THREE.Mesh(stair_window_pane_geometry, window_material));
                }

            }
            window_hole_geometries.push(window_hole_story_group);
            window_pane_geometries.push(window_pane_story_geometries);
            //window_story_group.translateY(story * story_height + story_height * WINDOW_START_BOTTOM);
            //window_stories_group.add(window_story_group);
        }
        //window_story_group = mergeBufferGeometries(window_geometries, false);
        //window_stories_group.translateZ(house_depth/2 - this.window_width/2);
        return {"window_holes": window_hole_geometries, "window_panes": window_pane_geometries, "stair_window_holes": stair_window_holes, "stair_window_panes": stair_window_pane_geometries, "balcony_position": balcony_position_x};
    }

}


export function window_generator(house_width: number, story_cnt: number, story_height: number, house_depth: number): {"windows": {"window_holes": THREE.BoxGeometry[][], "window_panes": THREE.Mesh[][], "stair_window_holes": THREE.BoxGeometry[][], "stair_window_panes": THREE.Mesh[]}, "balconies"?: THREE.Group}{
    const window_cnt_per_story: number = randomInRangeInt(WINDOW_MIN_PER_STORY, WINDOW_MAX_PER_STORY);
    
    const window_width: number = randomInRangeInt(WINDOW_MIN_WIDTH, WINDOW_MAX_WIDTH);

    const window_breaking_scheme: string = randomFromObject(WINDOW_SPACING_SCHEME);

    const has_balcony = Math.random() < 0.5;
    const balcony_window = randomInRangeInt(0, window_cnt_per_story);

    const windows: Windows = new Windows(window_cnt_per_story, window_width, window_breaking_scheme, has_balcony, balcony_window);
    const windows_geometries = windows.get3DObject(story_cnt, story_height, house_width, house_depth);
    let balconies: THREE.Group | undefined = undefined;
    if (has_balcony)
        balconies = balconyGenerator(windows_geometries["balcony_position"], story_cnt, story_height, house_depth, window_cnt_per_story, balcony_window);
    
    return {"windows": windows_geometries, "balconies": balconies};
}

export function create_windows_brush(windows: THREE.BoxGeometry[][]): Brush | null{
    const evaluator: Evaluator = new Evaluator();
    evaluator.attributes = ['position', 'normal'];

    let brush: Brush | null = null;
    windows.forEach(story=>{
        story.forEach(window => {
            const window_brush = new Brush(window)
            brush = brush == null ? window_brush : evaluator.evaluate(brush, window_brush, ADDITION);
        })
    })

    return brush;
}