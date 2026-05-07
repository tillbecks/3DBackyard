import * as THREE from 'three';
import { BALCONY_DEPTH, BALCONY_PLATFORM_THICKNESS, BALCONY_START_BOTTOM, BALCONY_WIDTH_MAX, BALCONY_WIDTH_MIN, BALCONY_MIN_OFFSET_FROM_CENTER, METAL_COLOR_HEX, BALCONY_RAILING_DIAMETER_MAIN, BALCONY_RAILING_DIAMETER_SECONDARY, BALCONY_RAILING_HEIGHT, BALCONY_RAILING_DIST_EDGE, BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE, BALCONY_RAILING_SECONDARY_DISTANCE, BALCONY_RAILING_TYPES } from '../config/houseConfig';
import { randomInRangeInt, randomFromObject } from '../config/utils';

class Balcony{
    balcony_width: number;

    constructor(balcony_width: number){
        this.balcony_width = balcony_width;
    }

    get3DObject(balcony_position: number, story_count: number, story_height: number, house_depth: number, window_count: number, window: number){
        const balconies: THREE.Group = new THREE.Group();

        let position_x: number;

        if(window == 0){
            position_x = this.balcony_width/2 - BALCONY_MIN_OFFSET_FROM_CENTER;
        }
        else if(window == window_count - 1){
            position_x = -this.balcony_width/2 + BALCONY_MIN_OFFSET_FROM_CENTER;
        }
        else{
            position_x = 0;
        }

        const railing_type: string = randomFromObject(BALCONY_RAILING_TYPES);

        for (let story=0; story<story_count; story++){
            const single_balcony_group: THREE.Group = new THREE.Group();

            const balcony_geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.balcony_width, BALCONY_PLATFORM_THICKNESS, BALCONY_DEPTH);
            const balcony_material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x606060});
            const balcony_mesh: THREE.Mesh = new THREE.Mesh(balcony_geometry, balcony_material);
            balcony_mesh.castShadow = true;
            balcony_mesh.receiveShadow = true;

            single_balcony_group.add(balcony_mesh);
            const railing: THREE.Group = balconyRailingGenerator(this.balcony_width, story_height, story == story_count - 1, railing_type);
            railing.position.y = BALCONY_PLATFORM_THICKNESS/2 + BALCONY_RAILING_HEIGHT/2;
            single_balcony_group.add(railing);

            single_balcony_group.position.set(position_x, story*story_height + story_height * BALCONY_START_BOTTOM + BALCONY_PLATFORM_THICKNESS/2 - (story_count*story_height)/2, house_depth/2 + BALCONY_DEPTH/2)

            balconies.add(single_balcony_group);
        }

        balconies.position.x = balcony_position;
        return balconies;
    }

}

export function balconyGenerator(balcony_position: number, story_count: number, story_height: number, house_depth: number, window_count: number, window: number): THREE.Group {
    const balcony_width: number = randomInRangeInt(BALCONY_WIDTH_MIN, BALCONY_WIDTH_MAX);
    const balconies: Balcony = new Balcony(balcony_width);
    return balconies.get3DObject(balcony_position, story_count, story_height, house_depth, window_count, window);
}

class BalconyRailings{
    railing_type: string;

    constructor(railing_type: string){
        this.railing_type = railing_type;
    }

    get3DObject(balcony_width: number, story_height: number, top_story: boolean): THREE.Group{
        const balcony_material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: METAL_COLOR_HEX});
        const railing_group: THREE.Group = new THREE.Group();

        const main_pillar_length = this.railing_type == BALCONY_RAILING_TYPES.CONNECTED && !top_story ? story_height-BALCONY_PLATFORM_THICKNESS : BALCONY_RAILING_HEIGHT;
        const main_pillar_y = this.railing_type == BALCONY_RAILING_TYPES.CONNECTED && !top_story ? story_height/2 - BALCONY_RAILING_HEIGHT/2 - BALCONY_PLATFORM_THICKNESS/2 : 0;
        //Railing main pillars
        const pillar_geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, main_pillar_length, 16, 1, false);
        const pillar1: THREE.Mesh = new THREE.Mesh(pillar_geometry, balcony_material);
        pillar1.position.set(-balcony_width/2+BALCONY_RAILING_DIST_EDGE, main_pillar_y, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        pillar1.castShadow = true;
        pillar1.receiveShadow = true;
        railing_group.add(pillar1);

        const pillar2: THREE.Mesh = new THREE.Mesh(pillar_geometry, balcony_material);
        pillar2.position.set(balcony_width/2-BALCONY_RAILING_DIST_EDGE, main_pillar_y, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        pillar2.castShadow = true;
        pillar2.receiveShadow = true;
        railing_group.add(pillar2);

        const lower_horizontal_height_shift: number = BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN;
        const main_horizontal_length: number = balcony_width - 2*BALCONY_RAILING_DIST_EDGE;
        const wall_horizontal_length: number = BALCONY_DEPTH - BALCONY_RAILING_DIST_EDGE;
        
        //Railing main horizontals
        const railing_horizontal_geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, main_horizontal_length, 16, 1, false);
        const railing_horizontal: THREE.Mesh = new THREE.Mesh(railing_horizontal_geometry, balcony_material);
        railing_horizontal.position.set(0, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
        railing_horizontal.rotateZ(Math.PI/2);
        railing_horizontal.castShadow = true;
        railing_horizontal.receiveShadow = true;
        railing_group.add(railing_horizontal);
        const railing_lower_horizontal: THREE.Mesh = railing_horizontal.clone();
        railing_lower_horizontal.position.setY(-lower_horizontal_height_shift);
        railing_lower_horizontal.castShadow = true;
        railing_lower_horizontal.receiveShadow = true;
        railing_group.add(railing_lower_horizontal);

        const railing_horzontal_geometry_wall: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_MAIN/2, BALCONY_RAILING_DIAMETER_MAIN/2, wall_horizontal_length, 16, 1, false);
        const railing_horizontal_wall1: THREE.Mesh = new THREE.Mesh(railing_horzontal_geometry_wall, balcony_material);
        railing_horizontal_wall1.position.set(-balcony_width/2 + BALCONY_RAILING_DIST_EDGE, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, - BALCONY_RAILING_DIST_EDGE/2);
        railing_horizontal_wall1.rotateZ(Math.PI/2);
        railing_horizontal_wall1.rotateX(Math.PI/2);
        railing_horizontal_wall1.castShadow = true;
        railing_horizontal_wall1.receiveShadow = true;
        railing_group.add(railing_horizontal_wall1);
        const railing_lower_horizontal_wall1: THREE.Mesh = railing_horizontal_wall1.clone();
        railing_lower_horizontal_wall1.position.setY(-lower_horizontal_height_shift);
        railing_lower_horizontal_wall1.castShadow = true;
        railing_lower_horizontal_wall1.receiveShadow = true;
        railing_group.add(railing_lower_horizontal_wall1);

        const railing_horizontal_wall2: THREE.Mesh = new THREE.Mesh(railing_horzontal_geometry_wall, balcony_material);
        railing_horizontal_wall2.position.set(balcony_width/2 - BALCONY_RAILING_DIST_EDGE, BALCONY_RAILING_HEIGHT/2 - BALCONY_RAILING_DIAMETER_MAIN/2, - BALCONY_RAILING_DIST_EDGE/2);
        railing_horizontal_wall2.rotateZ(Math.PI/2);
        railing_horizontal_wall2.rotateX(Math.PI/2);
        railing_horizontal_wall2.castShadow = true;
        railing_horizontal_wall2.receiveShadow = true;
        railing_group.add(railing_horizontal_wall2);
        const railing_lower_horizontal_wall2: THREE.Mesh = railing_horizontal_wall2.clone();
        railing_lower_horizontal_wall2.position.setY(-lower_horizontal_height_shift);
        railing_lower_horizontal_wall2.castShadow = true;
        railing_lower_horizontal_wall2.receiveShadow = true;
        railing_group.add(railing_lower_horizontal_wall2);

        const secondary_pillar_geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(BALCONY_RAILING_DIAMETER_SECONDARY/2, BALCONY_RAILING_DIAMETER_SECONDARY/2, BALCONY_RAILING_HEIGHT - BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN, 16, 1, false);
        const standard_secondary_pillar: THREE.Mesh = new THREE.Mesh(secondary_pillar_geometry, balcony_material);
        standard_secondary_pillar.castShadow = true;
        standard_secondary_pillar.receiveShadow = true;
        standard_secondary_pillar.position.setY(BALCONY_RAILING_LOWER_HORIZONTAL_DISTANCE - BALCONY_RAILING_DIAMETER_MAIN/2);

        const main_vertical_secondary_pillars: number = Math.floor(main_horizontal_length / BALCONY_RAILING_SECONDARY_DISTANCE);
        const wall_vertical_secondary_pillars: number = Math.floor(wall_horizontal_length / BALCONY_RAILING_SECONDARY_DISTANCE);

        const main_x_real_distance: number = main_horizontal_length / (main_vertical_secondary_pillars + 1);
        const wall_x_real_distance: number = wall_horizontal_length / (wall_vertical_secondary_pillars + 1);
        const main_x_start: number = -balcony_width/2 + BALCONY_RAILING_DIST_EDGE + main_x_real_distance + BALCONY_RAILING_DIAMETER_MAIN;
        const wall_x_start: number = -BALCONY_DEPTH/2 + wall_x_real_distance;

        for(let i=0; i<main_vertical_secondary_pillars; i++){
            const secondary_pillar: THREE.Mesh = standard_secondary_pillar.clone();
            secondary_pillar.position.setX(main_x_start + i*main_x_real_distance);
            secondary_pillar.position.setZ(BALCONY_DEPTH/2 - BALCONY_RAILING_DIST_EDGE);
            railing_group.add(secondary_pillar);
        }

        for(let i=0; i<wall_vertical_secondary_pillars; i++){
            const secondary_pillar_wall1: THREE.Mesh = standard_secondary_pillar.clone();
            secondary_pillar_wall1.position.setX(-balcony_width/2 + BALCONY_RAILING_DIST_EDGE);
            secondary_pillar_wall1.position.setZ(wall_x_start + i*wall_x_real_distance);
            railing_group.add(secondary_pillar_wall1);

            const secondary_pillar_wall2: THREE.Mesh = standard_secondary_pillar.clone();
            secondary_pillar_wall2.position.setX(balcony_width/2 - BALCONY_RAILING_DIST_EDGE);
            secondary_pillar_wall2.position.setZ(wall_x_start + i*wall_x_real_distance);
            railing_group.add(secondary_pillar_wall2);
        }

        return railing_group;
    }
}

export function balconyRailingGenerator(balcony_width: number, story_height: number, top_story: boolean, balcony_type: string): THREE.Group {
    const balcony_railings = new BalconyRailings(balcony_type);
    return balcony_railings.get3DObject(balcony_width, story_height, top_story);
}