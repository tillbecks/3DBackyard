import * as THREE from 'three';

export type ShaderUniformValue = THREE.Vector2 | number | THREE.Vector3;
export type ShaderUniform = { value: ShaderUniformValue };
export type ShaderUniforms = Record<string, ShaderUniform>;



export interface geomMaterialConfig{
    mergeable: boolean;
    materialMixId: string;
    color: number | undefined;
    vertexColors: boolean | undefined;
}

export interface idToMaterialMix{
    id: string;
    material: THREE.Material;
    shader: ShaderMaterialConfig;
}

export interface ShaderMaterialConfig {
    id: string;
    uniforms: ShaderUniforms;
}

export interface MaterialShaderConfig{
    materialId: string;
    shaderConfig: ShaderMaterialConfig | null;
}

export interface FragmentShaderType{
    functions: string,
    main: string
}

export type MaterialFunction = (height: number, width: number, depth: number) => MaterialShaderConfig;