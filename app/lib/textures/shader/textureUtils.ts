export const generalFunctions = 
    `vec3 colorVariancer(vec3 color, float rnd, float influence){
        float middle_rnd = rnd - 0.5;
        return vec3(color.x+color.x*middle_rnd*influence, color.y+color.y*middle_rnd*influence, color.z+color.z*middle_rnd*influence);
    }

    float randCust(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * (43758.5453 + randomNr));
    }

    vec2 random2(vec2 st){
        st = vec2( dot(st,vec2(127.1,311.7)),
                dot(st,vec2(269.5,183.3)) );
        return -1.0 + 2.0*fract(sin(st)*43758.5453123 + randomNr );
    }

    // Gradient Noise by Inigo Quilez - iq/2013
    // https://www.shadertoy.com/view/XdXGW8
    // modified with 0.25
    float noise(vec2 st) {
        vec2 i = floor(st*0.25);
        vec2 f = fract(st*0.25);

        vec2 u = f*f*(3.0-2.0*f);

        return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                        dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                    mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                        dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    }
                        
    float sinCust(float x, float offset, float frequency, float amplitude){
        return sin(x  * frequency + offset) * amplitude;
    }
    `;
