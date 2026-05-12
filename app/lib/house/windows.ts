import * as HC from '../config/houseConfig';
import { randomInRangeInt, randomFromObject, randomBoolean } from "../config/utils";
import * as THREE from "three";
import {Brush, Evaluator, ADDITION } from 'three-bvh-csg';
import { balconyGenerator } from "./balcony";
import { createAxisHelper } from '../config/3dUtils';
import { PANE_MATERIAL } from '../config/materials';

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

    get3DObject(story_cnt: number, story_height: number, house_width: number, house_depth: number, getID: () => string): {"window_holes": THREE.BoxGeometry[][], "window_panes": (THREE.Mesh | THREE.Group)[][], "stair_window_holes": THREE.BoxGeometry[][], "stair_window_panes": (THREE.Mesh | THREE.Group) [], "balcony_position": number, "balcony_space": {left: number, right: number}}{
        const window_material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB( 1, 1, 1 )});
        const window_hole_geometries: THREE.BoxGeometry[][] = [];
        const stair_window_holes: THREE.BoxGeometry[][] = []
        const window_pane_geometries: (THREE.Mesh | THREE.Group)[][] = [];
        const stair_window_pane_geometries: (THREE.Mesh | THREE.Group)[] = [];
        const half_house_height: number = story_height * story_cnt / 2;
        let balcony_space: {left: number, right: number} = {left: 0, right: 0};

        const windows_split_horizontal = randomBoolean(HC.WINDOW_SPLIT_HORIZONTAL_PROBABILITY);
        const windows_split_vertical = this.window_width >= HC.WINDOW_SPLIT_VERTICAL_MIN_WIDTH && randomBoolean(HC.WINDOW_SPLIT_VERTICAL_PROBABILITY);

        let balcony_position_x: number = 0;

        const left_right_more_windows = randomInRangeInt(0,2);

        for(let story=0; story<story_cnt; ++story){
            const window_hole_story_group: THREE.BoxGeometry[] = [];
            const window_pane_story_geometries: (THREE.Mesh | THREE.Group)[] = [];
            if (this.window_breaking_scheme == HC.WINDOW_SPACING_SCHEME.EQUALLY_SPACED){
                //let dist_between = house_width/(this.window_cnt_per_story+1);
                //dist_between -= this.window_width;
                const width_divided: number = house_width/(this.window_cnt_per_story+1);
                const start_distance: number = width_divided ;
                const add_on: number = width_divided;

                for(let window=0; window<this.window_cnt_per_story; ++window){
                    let translate_y: number;
                    const translate_x: number = -house_width/2 + start_distance + window * add_on;
                    let window_height: number;
                    let is_balcony = false;
                    if(this.has_balcony && window == this.balcony_window){
                        window_height = HC.BALCONY_DOOR_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * HC.BALCONY_DOOR_START_BOTTOM - half_house_height + window_height/2;
                        balcony_position_x = translate_x;
                        const balcony_space_left = (window == 0 ? start_distance : add_on)  - HC.BALCONY_DIST_OTHER_WINDOWS - this.window_width/2;
                        const balcony_space_right = (window == this.window_cnt_per_story - 1 ? start_distance : add_on) - HC.BALCONY_DIST_OTHER_WINDOWS - this.window_width/2;
                        balcony_space = {left: balcony_space_left, right: balcony_space_right};
                        is_balcony = true;
                    }
                    else{
                        window_height = HC.WINDOW_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * HC.WINDOW_START_BOTTOM - half_house_height + window_height/2;
                    }
                    const window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, HC.WINDOW_DEPTH + 2);
                    const window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, 1);
                    window_geometry.translate(translate_x, translate_y, house_depth/2);
                    //window_pane_geometry.translate(translate_x, translate_y, house_depth/2 - 1);
                    window_hole_story_group.push(window_geometry);
                    //window_pane_story_geometries.push(new THREE.Mesh(window_pane_geometry, window_material));
                    const window_frame = new WindowFrame(this.window_width, window_height, !is_balcony && windows_split_vertical, !is_balcony && windows_split_horizontal);
                    const frame_3d = window_frame.get3DObject(getID);
                    frame_3d.position.set(translate_x, translate_y, house_depth/2 - 1);
                    window_pane_story_geometries.push(frame_3d);
                }
            }
            else{
                const space_half_house: number = (house_width - house_width * HC.WINDOW_BREAK_SCHEME_DIST_PERCENTAGE)/2;
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
                    let is_balcony = false;
                    if(this.has_balcony && window_l == this.balcony_window){
                        window_height = HC.BALCONY_DOOR_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * HC.BALCONY_DOOR_START_BOTTOM - half_house_height + window_height/2;
                        balcony_position_x = translate_x;
                        const balcony_space_left = (window_l == 0 ? dist_left_start : top_on_left) - HC.BALCONY_DIST_OTHER_WINDOWS - this.window_width/2;
                        const balcony_space_right = (window_l == window_cnt_left - 1 ? dist_right_start : top_on_left) - HC.BALCONY_DIST_OTHER_WINDOWS - this.window_width/2;
                        balcony_space = {left: balcony_space_left , right: balcony_space_right};
                        is_balcony = true;
                    }
                    else{
                        window_height = HC.WINDOW_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * HC.WINDOW_START_BOTTOM - half_house_height + window_height/2;
                    }
                    const window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, HC.WINDOW_DEPTH);
                    const window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, 1);
                    window_geometry.translate(translate_x, translate_y, house_depth/2);
                    //window_pane_geometry.translate(translate_x, translate_y, house_depth/2 - 1);
                    window_hole_story_group.push(window_geometry);
                    const window_frame = new WindowFrame(this.window_width, window_height, !is_balcony && windows_split_vertical, !is_balcony && windows_split_horizontal);
                    const frame_3d = window_frame.get3DObject(getID);
                    frame_3d.position.set(translate_x, translate_y, house_depth/2 - 1);
                    window_pane_story_geometries.push(frame_3d);

                    //window_pane_story_geometries.push(new THREE.Mesh(window_pane_geometry, window_material));
                }
                for(let window_r=0; window_r < window_cnt_right; ++window_r){
                    let translate_y: number;
                    let window_height: number;
                    const translate_x: number = (house_width * HC.WINDOW_BREAK_SCHEME_DIST_PERCENTAGE)/2 + dist_right_start + top_on_right * window_r;
                    let is_balcony = false;
                    if(this.has_balcony && (window_r + window_cnt_left) == this.balcony_window){
                        window_height = HC.BALCONY_DOOR_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * HC.BALCONY_DOOR_START_BOTTOM - half_house_height + window_height/2;
                        balcony_position_x = translate_x;
                        const balcony_space_left = (window_r == 0 ? dist_right_start : top_on_right) - HC.BALCONY_DIST_OTHER_WINDOWS - this.window_width/2;
                        const balcony_space_right = (window_r == window_cnt_right - 1 ? dist_left_start : top_on_right) - HC.BALCONY_DIST_OTHER_WINDOWS - this.window_width/2;
                        balcony_space = {left: balcony_space_left, right: balcony_space_right};
                        is_balcony = true;
                    }
                    else{
                        window_height = HC.WINDOW_HEIGHT_PERCENTAGE * story_height;
                        translate_y = story * story_height + story_height * HC.WINDOW_START_BOTTOM - half_house_height + window_height/2;
                    }
                    const window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, HC.WINDOW_DEPTH);
                    const window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, window_height, 1);
                    window_geometry.translate(translate_x, translate_y,  house_depth/2);
                    //window_pane_geometry.translate(translate_x, translate_y,  house_depth/2 - 1);
                    window_hole_story_group.push(window_geometry);
                    const window_frame = new WindowFrame(this.window_width, window_height, !is_balcony && windows_split_vertical, !is_balcony && windows_split_horizontal);
                    const frame_3d = window_frame.get3DObject(getID);
                    frame_3d.position.set(translate_x, translate_y, house_depth/2 - 1);
                    window_pane_story_geometries.push(frame_3d);
                    //window_pane_story_geometries.push(new THREE.Mesh(window_pane_geometry, window_material));
                }
                if (story > 0){
                    //Treppenhausfenster location calculation
                    //TODO: Add window_pane_geometry 
                    const stair_window_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, story_height * HC.WINDOW_HEIGHT_PERCENTAGE, HC.WINDOW_DEPTH);
                    const x_position: number = (-(dist_left_equal) + (dist_right_equal))/2;
                    const y_position: number = story * story_height + story_height * HC.WINDOW_START_BOTTOM - half_house_height - story_height/2;
                    stair_window_geometry.translate(x_position, y_position, house_depth/2);
                    const stair_window_pane_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.window_width, story_height * HC.WINDOW_HEIGHT_PERCENTAGE, 1);
                    stair_window_pane_geometry.translate(x_position, y_position, house_depth/2 - 1);
                    stair_window_holes.push([stair_window_geometry]); //In extra array, so it's handled by create_window_brush
                    const window_frame = new WindowFrame(this.window_width, story_height * HC.WINDOW_HEIGHT_PERCENTAGE);
                    const frame_3d = window_frame.get3DObject(getID);
                    frame_3d.position.set(x_position, y_position, house_depth/2 - 1);
                    stair_window_pane_geometries.push(frame_3d);
                    //stair_window_pane_geometries.push(new THREE.Mesh(stair_window_pane_geometry, window_material));
                }

            }
            window_hole_geometries.push(window_hole_story_group);
            window_pane_geometries.push(window_pane_story_geometries);
            //window_story_group.translateY(story * story_height + story_height * WINDOW_START_BOTTOM);
            //window_stories_group.add(window_story_group);
        }
        //window_story_group = mergeBufferGeometries(window_geometries, false);
        //window_stories_group.translateZ(house_depth/2 - this.window_width/2);
        return {"window_holes": window_hole_geometries, "window_panes": window_pane_geometries, "stair_window_holes": stair_window_holes, "stair_window_panes": stair_window_pane_geometries, "balcony_position": balcony_position_x, "balcony_space": balcony_space};
    }

}

export function window_generator(house_width: number, story_cnt: number, story_height: number, house_depth: number, getID: () => string): {"windows": {"window_holes": THREE.BoxGeometry[][], "window_panes": (THREE.Mesh | THREE.Group)[][], "stair_window_holes": THREE.BoxGeometry[][], "stair_window_panes": (THREE.Mesh | THREE.Group)[]}, "balconies"?: THREE.Group}{
    const window_cnt_per_story: number = randomInRangeInt(HC.WINDOW_MIN_PER_STORY, HC.WINDOW_MAX_PER_STORY);
    
    const window_width: number = randomInRangeInt(HC.WINDOW_MIN_WIDTH, HC.WINDOW_MAX_WIDTH);

    const window_breaking_scheme: string = randomFromObject(HC.WINDOW_SPACING_SCHEME);

    const has_balcony = Math.random() < 0.5;
    const balcony_window = randomInRangeInt(0, window_cnt_per_story-1);

    const windows: Windows = new Windows(window_cnt_per_story, window_width, window_breaking_scheme, has_balcony, balcony_window);
    const windows_geometries = windows.get3DObject(story_cnt, story_height, house_width, house_depth, getID);
    let balconies: THREE.Group | undefined = undefined;
    if (has_balcony)
        balconies = balconyGenerator(windows_geometries["balcony_position"], story_cnt, story_height, house_depth, windows_geometries["balcony_space"]);
    
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

class WindowFrame{
    window_width: number;
    window_height: number;
    vertical_split: boolean;
    horizontal_split: boolean;

    constructor(window_width: number, window_height: number, vertical_split: boolean = false, horizontal_split: boolean = false){
        this.window_width = window_width;
        this.window_height = window_height;
        this.vertical_split = vertical_split;
        this.horizontal_split = horizontal_split;
    }

    get3DObject(getID: () => string): THREE.Group{
        const frame_material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color:HC.WINDOW_FRAME_COLOR_HEX});
        const pane_material = PANE_MATERIAL;
        
        const frame_group = new THREE.Group();

        if(this.horizontal_split){
            const upper_window_height = this.window_height * HC.WINDOW_SPLIT_HORIZONTAL_PERCENTAGE;
            const upper_window = new THREE.Group();
            const b1_geo = new THREE.BoxGeometry(this.window_width, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            const b1 = new THREE.Mesh(b1_geo, frame_material);
            b1.translateY(upper_window_height/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const b2 = new THREE.Mesh(b1_geo, frame_material);
            b2.translateY(- upper_window_height/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b3_geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, upper_window_height - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            const b3 = new THREE.Mesh(b3_geo, frame_material);
            b3.translateX(- this.window_width/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b4 = new THREE.Mesh(b3_geo, frame_material);
            b4.translateX(this.window_width/2 - HC.WINDOW_FRAME_THICKNESS/2);

            const pane_geo = new THREE.BoxGeometry(this.window_width - 2 * HC.WINDOW_FRAME_THICKNESS, upper_window_height - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const pane = new THREE.Mesh(pane_geo, pane_material);
            
            upper_window.add(b1, b2, b3, b4, pane);
            upper_window.translateY(this.window_height/2 - upper_window_height/2);
            frame_group.add(upper_window);
        }

        const lower_window_height = this.horizontal_split ? this.window_height * (1 - HC.WINDOW_SPLIT_HORIZONTAL_PERCENTAGE) : this.window_height;
        const lower_window = new THREE.Group();
        
        if(this.vertical_split){
            const half_width = this.window_width/2;
            const left_window = new THREE.Group();
            const b1_geo = new THREE.BoxGeometry(half_width, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            const b1 = new THREE.Mesh(b1_geo, frame_material);
            b1.translateY(lower_window_height/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const b2 = new THREE.Mesh(b1_geo, frame_material);
            b2.translateY(- lower_window_height/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b3_geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, lower_window_height - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            const b3 = new THREE.Mesh(b3_geo, frame_material);
            b3.translateX(- half_width/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b4 = new THREE.Mesh(b3_geo, frame_material);
            b4.translateX(half_width/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const pane_geo = new THREE.BoxGeometry(half_width - 2 * HC.WINDOW_FRAME_THICKNESS, lower_window_height - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const pane_left = new THREE.Mesh(pane_geo, pane_material);
            pane_left.name = HC.WINDOW_PANE_ID;

            left_window.add(b1,b2,b3,b4,pane_left);
            const right_window = new THREE.Group();
            right_window.add(b1.clone(), b2.clone(), b3.clone(), b4.clone(), pane_left.clone());
            left_window.children.forEach(child => child.translateX(half_width/2));
            right_window.children.forEach(child => child.translateX(-half_width/2));

            const id = getID();

            left_window.name = HC.DOUBLE_WINDOW_LEFT_ID + "_" + id;
            right_window.name = HC.DOUBLE_WINDOW_RIGHT_ID + "_" + id;

            left_window.translateX(-half_width);
            right_window.translateX(half_width);

            lower_window.add(left_window, right_window);
        }
        else{
            const b1_geo = new THREE.BoxGeometry(this.window_width, HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_FRAME_DEPTH);
            const b1 = new THREE.Mesh(b1_geo, frame_material);
            b1.translateY(lower_window_height/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const b2 = new THREE.Mesh(b1_geo, frame_material);
            b2.translateY(- lower_window_height/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b3_geo = new THREE.BoxGeometry(HC.WINDOW_FRAME_THICKNESS, lower_window_height - 2 * (HC.WINDOW_FRAME_THICKNESS), HC.WINDOW_FRAME_DEPTH);
            const b3 = new THREE.Mesh(b3_geo, frame_material);
            b3.translateX(- this.window_width/2 + HC.WINDOW_FRAME_THICKNESS/2);
            const b4 = new THREE.Mesh(b3_geo, frame_material);
            b4.translateX(this.window_width/2 - HC.WINDOW_FRAME_THICKNESS/2);
            const pane_geo = new THREE.BoxGeometry(this.window_width - 2 * HC.WINDOW_FRAME_THICKNESS, lower_window_height - 2 * HC.WINDOW_FRAME_THICKNESS, HC.WINDOW_PANE_THICKNESS);
            const pane = new THREE.Mesh(pane_geo, pane_material);
            pane.name = HC.WINDOW_PANE_ID;

            lower_window.add(b1, b2, b3, b4, pane);
            lower_window.children.forEach(child => child.translateX(- this.window_width/2));
            lower_window.translateX(this.window_width/2);
            lower_window.name = HC.SINGLE_WINDOW_ID + "_" + getID();
        }

        lower_window.translateY(- this.window_height/2 + lower_window_height/2);
        frame_group.add(lower_window);

        return frame_group;
    }

}