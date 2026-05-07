import * as THREE from 'three';
import * as HC from '../../config/houseConfig';
import * as UTILS from '../../config/utils';
import * as TDUTILS from '../../config/3dUtils';
import { reflector } from 'three/tsl';

class TerrestrialAntenna{
    height: number;
    direction: number;
    radius: number;

    constructor(height: number, direction: number, radius: number = 0.5){
        this.height = height;
        this.direction = direction;
        this.radius = radius;
    }

    get3DObject(): THREE.Group{
        return new THREE.Group();
    }
}

class AmFmAntenna extends TerrestrialAntenna{
    type: string;
    width: number;

    constructor(direction: number, type: string, width: number){
        super(HC.AMFMANTENNA_HEIGHT, direction, width);

        this.type = type;
        this.width = width;
    }

    get3DObject(): THREE.Group{
        const antenna_group = new THREE.Group();

        const antenna_block_config = {
            size: 0.3,
            height: this.height}

        const antenna_block = new THREE.BoxGeometry(antenna_block_config.size, antenna_block_config.height, antenna_block_config.size);
        //antenna_block.translate(0, antenna_block_config.height / 2, 0); // Move origin to bottom
        const antenna_block_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const antenna_block_mesh = new THREE.Mesh(antenna_block, antenna_block_material);
        antenna_block_mesh.castShadow = true;
        antenna_block_mesh.receiveShadow = true;

        antenna_group.add (antenna_block_mesh);

        const antenna_stick_group = new THREE.Group();

        const stick_geometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.width, 16);
        const stick_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const stick_mesh = new THREE.Mesh(stick_geometry, stick_material);
        stick_mesh.castShadow = true;
        stick_mesh.receiveShadow = true;
        stick_mesh.rotateX(0.5*Math.PI);
        antenna_stick_group.add(stick_mesh);

        if(this.type == HC.AMFMANTENNA_TYPES.CROSS){
            const stick_mesh_2 = new THREE.Mesh(stick_geometry, stick_material);
            stick_mesh_2.castShadow = true;
            stick_mesh_2.receiveShadow = true;
            stick_mesh_2.rotateX(0.5*Math.PI);
            stick_mesh_2.rotateZ(0.5*Math.PI);
            antenna_stick_group.add(stick_mesh_2);
        }


        antenna_group.add(antenna_stick_group);
        antenna_group.rotateY(this.direction);

        return antenna_group
    } 
}

function amFmAntenna_generator(){
    const direction = UTILS.randomInRangeFloat(0, 2 * Math.PI);
    const width = UTILS.randomInRangeFloat(HC.AMFMANTENNA_WIDTH_MIN, HC.AMFMANTENNA_WIDTH_MAX);
    const type = UTILS.randomFromObject(HC.AMFMANTENNA_TYPES);

    const antenna = new AmFmAntenna(direction, type, width);

    return antenna;
}

class TVAntenna extends TerrestrialAntenna{
    length: number;
    elementDist: number;
    elementLength: number;
    hasReflector: boolean;

    constructor(direction: number, length: number, elementDist: number, elementLength: number, hasReflector: boolean = false){
        super(HC.TVANTENNA_HEIGHT, direction, hasReflector ? length: length/2);
        this.length = length;
        this.elementDist = elementDist;
        this.elementLength = elementLength;
        this.hasReflector = hasReflector;
    }

    get3DObject(): THREE.Group{
        const antenna_group = new THREE.Group();

        if(!this.hasReflector){
            const antenna_block_config = {
                size: 0.3,
                height: this.height}

            const antenna_block = new THREE.BoxGeometry(antenna_block_config.size, antenna_block_config.height, antenna_block_config.size);
            const antenna_block_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
            const antenna_block_mesh = new THREE.Mesh(antenna_block, antenna_block_material);
            antenna_block_mesh.castShadow = true;
            antenna_block_mesh.receiveShadow = true;
            antenna_group.add (antenna_block_mesh);
        }

        const antenna_main_rod_geometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.length, 16);
        const antenna_main_rod_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const antenna_main_rod_mesh = new THREE.Mesh(antenna_main_rod_geometry, antenna_main_rod_material);
        antenna_main_rod_mesh.castShadow = true;
        antenna_main_rod_mesh.receiveShadow = true;
        antenna_main_rod_mesh.rotateX(0.5*Math.PI);
        antenna_group.add(antenna_main_rod_mesh);

        const element_group = new THREE.Group();

        const element_amount = Math.floor(this.length / this.elementDist);
        const element_geometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.elementLength, 16);
        const element_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});

        const extra_offset_y = (this.length - (element_amount - 1) * this.elementDist) / 2;
        for(let i = 0; i < element_amount; i++){
            const element_mesh = new THREE.Mesh(element_geometry, element_material);
            element_mesh.castShadow = true;
            element_mesh.receiveShadow = true;
            element_mesh.position.y = -this.length/2 + i*this.elementDist + extra_offset_y;
            element_mesh.rotateZ(0.5*Math.PI);
            element_group.add(element_mesh);
        }

        element_group.rotateX(0.5*Math.PI);

        antenna_group.add(element_group);

        if(this.hasReflector){
            antenna_group.translateZ(this.length/2);
        }

        if(!this.hasReflector){
            antenna_group.rotateY(this.direction);
        }

        return antenna_group;
    }

}

function tvAntenna_generator(){
    const direction = UTILS.randomInRangeFloat(0, 2 * Math.PI);
    const length = UTILS.randomInRangeFloat(HC.TVANTENNA_LENGTH_MIN, HC.TVANTENNA_LENGTH_MAX);
    const elementDist = UTILS.randomInRangeFloat(HC.TVANTENNA_ELEMENT_DIST_MIN, HC.TVANTENNA_ELEMENT_DIST_MAX);
    const elementLength = UTILS.randomInRangeFloat(HC.TVANTENNA_ELEMENT_LENGTH_MIN, HC.TVANTENNA_ELEMENT_LENGTH_MAX);

    const antenna = new TVAntenna(direction, length, elementDist, elementLength);

    return antenna;
}

class TVAntennaWithReflector extends TVAntenna{
    reflectorWidth: number;
    reflectorLength: number;
    reflectorAngle: number;

    constructor(direction: number, length: number, elementDist: number, elementLength: number, reflectorWidth: number, reflectorLength: number, reflectorAngle: number){
        super(direction, length, elementDist, elementLength, true);
        this.reflectorWidth = reflectorWidth;
        this.reflectorLength = reflectorLength;
        this.reflectorAngle = reflectorAngle;

        this.height = reflectorLength * Math.sin(reflectorAngle) * 2;
    }

    get3DObject(): THREE.Group{
        const reflector_antenna_group = new THREE.Group();
        const antenna_part = super.get3DObject();
        reflector_antenna_group.add(antenna_part);

        const connector_geometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorWidth, 16);
        const connector_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const connector_mesh = new THREE.Mesh(connector_geometry, connector_material);
        connector_mesh.castShadow = true;
        connector_mesh.receiveShadow = true;
        connector_mesh.rotateZ(0.5*Math.PI);
        reflector_antenna_group.add(connector_mesh);

        const reflector_wing_group = new THREE.Group();

        const frame_piece_geoemtry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorLength, 16);
        const frame_piece_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});

        for(let i = 0; i<HC.REFLECTOR_FRAME_PIECES; ++i){
            const frame_piece_mesh = new THREE.Mesh(frame_piece_geoemtry, frame_piece_material);
            frame_piece_mesh.castShadow = true;
            frame_piece_mesh.receiveShadow = true;
            frame_piece_mesh.position.z = -this.reflectorWidth/2 + i*(this.reflectorWidth/(HC.REFLECTOR_FRAME_PIECES-1));
            reflector_wing_group.add(frame_piece_mesh);
        }
        
        const reflector_element_cnt = Math.floor(this.reflectorLength / HC.REFLECTOR_ELEMENT_DIST);
        const reflector_element_dst = this.reflectorLength / reflector_element_cnt;

        const reflector_element_geometry = new THREE.CylinderGeometry(HC.ANTENNA_ROD_DIAMETER, HC.ANTENNA_ROD_DIAMETER, this.reflectorWidth, 16);
        const reflector_element_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});

        for(let i = 0; i < reflector_element_cnt; ++i){
            const reflector_element_mesh = new THREE.Mesh(reflector_element_geometry, reflector_element_material);
            reflector_element_mesh.castShadow = true;
            reflector_element_mesh.receiveShadow = true;
            reflector_element_mesh.position.y = -this.reflectorLength/2 + (i)*reflector_element_dst + reflector_element_dst;
            reflector_element_mesh.rotateX(0.5*Math.PI);
            reflector_wing_group.add(reflector_element_mesh);
        }

        reflector_wing_group.rotateY(0.5*Math.PI);
        reflector_wing_group.rotateZ(this.reflectorAngle);
        const reflector_wing_group_sec = reflector_wing_group.clone();

        reflector_wing_group.translateY(this.reflectorLength/2);

        reflector_wing_group_sec.rotateZ(this.reflectorAngle*2);
        reflector_wing_group_sec.translateY(this.reflectorLength/2);

        reflector_antenna_group.add(reflector_wing_group);
        reflector_antenna_group.add(reflector_wing_group_sec);

        return reflector_antenna_group;
    }
}

function tvAntennaWithReflector_generator(){
    const direction = UTILS.randomInRangeFloat(0, 2 * Math.PI);
    const antennalength = UTILS.randomInRangeFloat(HC.REFLECTOR_ANTENNA_LENGTH_MIN, HC.REFLECTOR_ANTENNA_LENGTH_MAX);
    const antennaelementlength = UTILS.randomInRangeFloat(HC.REFLECTOR_ANTENNA_ELEMENT_LENGTH_MIN, HC.REFLECTOR_ANTENNA_ELEMENT_LENGTH_MAX);
    const antennaelementdist = UTILS.randomInRangeFloat(HC.REFLECTOR_ANTENNA_DIST_MIN, HC.REFLECTOR_ANTENNA_DIST_MAX);
    const reflectorlength = UTILS.randomInRangeFloat(HC.REFLECTOR_ELEMENT_LENGTH_MIN, HC.REFLECTOR_ELEMENT_LENGTH_MAX);
    const reflectorwidth = UTILS.randomInRangeFloat(HC.REFLECTOR_ELEMENT_WIDTH_MIN, HC.REFLECTOR_ELEMENT_WIDTH_MAX);
    const reflectorangle = HC.REFLECTOR_ANGLE;

    const antenna = new TVAntennaWithReflector(direction, antennalength, antennaelementdist, antennaelementlength, reflectorwidth, reflectorlength, reflectorangle);
    return antenna;
}

class Antenna_Pole {
    antennas: TerrestrialAntenna[];
    radius: number;

    constructor(antennas: TerrestrialAntenna[]){
        this.antennas = antennas;
        this.radius = antennas.reduce((max, ant) => Math.max(max, ant.radius), 0);
    }

    get3DObject(){
        const pole_group = new THREE.Group();

        let pole_length = HC.ANTENNA_POLE_SPACE_BOTTOM + (this.antennas.length -1) * HC.ANTENNA_POLE_DISTANCE_ANTENNAS + this.antennas.reduce((sum, ant) => sum + ant.height, 0) + UTILS.randomInRangeFloat(0, HC.ANTENNA_POLE_RANDOM_EXTRA_HEIGHT);
        if(pole_length < HC.ANTENNA_POLE_MIN_HEIGHT + HC.ANTENNA_POLE_SPACE_BOTTOM) pole_length = HC.ANTENNA_POLE_MIN_HEIGHT + HC.ANTENNA_POLE_SPACE_BOTTOM;

        const clearance_between_overall = pole_length - this.antennas.reduce((sum, ant) => sum + ant.height, 0) - (this.antennas.length - 1) * HC.ANTENNA_POLE_DISTANCE_ANTENNAS - HC.ANTENNA_POLE_SPACE_BOTTOM;
        const clearance_between = clearance_between_overall / this.antennas.length;

        const pole_geometry = new THREE.CylinderGeometry(HC.ANTENNA_POLE_RADIUS, HC.ANTENNA_POLE_RADIUS, pole_length, 16);
        pole_geometry.translate(0, pole_length / 2 - HC.ANTENNA_POLE_SPACE_BOTTOM / 2, 0); // Move origin to bottom
        const pole_material = new THREE.MeshStandardMaterial({color: HC.METAL_COLOR_HEX});
        const pole_mesh = new THREE.Mesh(pole_geometry, pole_material);
        pole_mesh.castShadow = true;
        pole_mesh.receiveShadow = true;

        pole_group.add(pole_mesh);

        let current_height = HC.ANTENNA_POLE_SPACE_BOTTOM/2;
        this.antennas.forEach(antenna => {
            const antenna_3d = antenna.get3DObject();
            const clearance = UTILS.randomInRangeFloat(0,clearance_between);
            antenna_3d.position.y = current_height + antenna.height/2 + clearance;
            antenna_3d.rotateY(antenna.direction);
            pole_group.add(antenna_3d);
            current_height += antenna.height + HC.ANTENNA_POLE_DISTANCE_ANTENNAS + clearance;
        });


        return pole_group;

    }
}

function antennaGeneratorFromType(type: string): TerrestrialAntenna{
    switch(type){
        case HC.ANTENNA_TYPES.AMFM:
            return amFmAntenna_generator();
        case HC.ANTENNA_TYPES.TV:
            return tvAntenna_generator();
        case HC.ANTENNA_TYPES.REFLECTOR:
            return tvAntennaWithReflector_generator();
        default:
            throw new Error("Invalid antenna type: " + type);
    }
}

export function terrestrialAntenna_generator(){

    const antenna_cnt = UTILS.randomInRangeInt(HC.ANTENNA_COUNT_MIN, HC.ANTENNA_COUNT_MAX);
    const antenna_type_counter = {...HC.antennaTypeCounter};

    const antennas: TerrestrialAntenna[] = [];

    for(let i = 0; i < antenna_cnt; ++i){
        const possible_antenna_types = Object.keys(HC.ANTENNA_TYPES_MAX_COUNT).filter(type => antenna_type_counter[type] < HC.ANTENNA_TYPES_MAX_COUNT[type]);
        const antenna_type = UTILS.randomFromArray(possible_antenna_types);
        antenna_type_counter[antenna_type]++;

        antennas.push(antennaGeneratorFromType(antenna_type));
    }

    const antenna_pole = new Antenna_Pole(antennas);
    
    return antenna_pole;
}
