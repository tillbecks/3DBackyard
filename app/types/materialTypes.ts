import * as THREE from 'three';

export type ShaderUniformValue = THREE.Vector2 | number | THREE.Vector3;
export type ShaderUniform = { value: ShaderUniformValue };
export type ShaderUniforms = Record<string, ShaderUniform>;

export interface shaderMaterialConfig {
    id: string;
    uniforms: ShaderUniforms;
}

export interface MaterialMix{
    standardMaterial: THREE.Material;
    shaderMaterial: shaderMaterialConfig | null;
}

export interface fragmentShaderType{
    functions: string,
    main: string
}

export type materialFunction = (height: number, width: number, depth: number) => MaterialMix;