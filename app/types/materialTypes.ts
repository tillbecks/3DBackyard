import * as THREE from 'three';

export type ShaderUniformValue = THREE.Vector2 | number | THREE.Vector3;
export type ShaderUniform = { value: ShaderUniformValue };
export type ShaderUniforms = Record<string, ShaderUniform>;

export interface ShaderMaterialConfig {
    id: string;
    uniforms: ShaderUniforms;
}

export interface MaterialMix{
    standardMaterial: THREE.Material;
    shaderMaterial: ShaderMaterialConfig | null;
}

export interface FragmentShaderType{
    functions: string,
    main: string
}

export type MaterialFunction = (height: number, width: number, depth: number) => MaterialMix;