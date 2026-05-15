import * as TYPE from "../../../types/typeIndex";
import {generalFunctions} from "./shaderUtils";

export const roofTileShader: TYPE.FragmentShaderType = {functions: `
    uniform vec2 tileSize;
    uniform float gapThickness;
    uniform float randomNr;
    uniform vec3 roofTileColor;` + generalFunctions
    ,
    main: `
        vec2 roofUv = vUv;

        float offsetRows = tileSize.x / 2.0;

        vec3 tileColor = roofTileColor;
        vec3 gapColor = vec3(0.1, 0.1, 0.1);

        float tileGapWidth = tileSize.x + gapThickness;
        float tileGapHeight = tileSize.y + gapThickness;

        float isOdd = step(tileGapHeight, mod(roofUv.y, tileGapHeight * 2.0));

        float isGapY = step(tileSize.y, mod(roofUv.y, tileGapHeight));
        float isGapX = step(tileSize.x, mod(roofUv.x, tileGapWidth));

        float isGap = max(isGapY, isGapX);

        float tileXID = floor((roofUv.x - isOdd * offsetRows) / tileGapWidth);
        float tileYID = floor(roofUv.y / tileGapHeight);

        float variance = randCust(vec2(tileXID, tileYID));
        float varianceGap = noise(roofUv);

        vec3 finalColor = mix(colorVariancer(tileColor, variance, 0.1), colorVariancer(gapColor, varianceGap, 0.1), isGap);
        
        float localY = mod(roofUv.y, tileGapHeight) / tileSize.y;

        // Bestimme die Pixelbreite im UV-Raum (wie viel UV deckt ein Bildschirm-Pixel ab)
        // fwidth berechnet die Änderung zum Nachbarpixel auf dem Bildschirm
        float pixelSizeY = fwidth(localY);

        // Schatten-Eigenschaften
        float shadowWidth = 0.15; // Wie weit der Schatten nach oben ragt
        
        // Dynamischer Weichzeichnungs-Bereich basierend auf der Distanz (Pixelgröße)
        // Verhindert das "Verschlucken" oder "Flackern" des Schattens in der Ferne
        float edgeSoftness = max(pixelSizeY, 0.02); 

        // Weicher Verlauf anstelle von harten Sprüngen
        // Nutzt edgeSoftness, damit die Kante in der Entfernung nicht flackert
        float bottomShadow = smoothstep(0.0, shadowWidth, localY);
        float upperFade = smoothstep(shadowWidth + edgeSoftness, shadowWidth, localY);
        float shadowIntensity = mix(upperFade, bottomShadow, step(localY, shadowWidth));

        // Abdunklungs-Faktor definieren (0.4 = maximale Abdunklung um 60%)
        // shadowIntensity steuert den Verlauf sanft aus
        float shadowFactor = mix(1.0, mix(1.0, 0.4, shadowIntensity), 1.0 - isGap);

        // Schatten auf die finale Farbe multiplizieren
        diffuseColor.rgb = finalColor * shadowFactor;`
};

export const flatTileShader: TYPE.FragmentShaderType = {functions: `
    uniform vec2 tileSize;
    uniform float randomNr;
    uniform vec3 roofTileColor;` + generalFunctions
    ,
    main: `
        vec2 roofUv = vUv;


        vec3 tileColor = roofTileColor;

        float tileWidth = tileSize.x;
        float tileHeight = tileSize.y;

        float offsetRows = tileWidth * 0.5;
        float tileYID = floor((roofUv.y) / tileHeight);
        float onTileY = mod(roofUv.y, tileHeight);

        float isOdd = step(1.0, mod(tileYID,  2.0));

        float xShift = isOdd * offsetRows;
        float tileXID = floor((roofUv.x - xShift) / tileWidth);
        float onTileX = (roofUv.x - xShift - tileXID * tileWidth) / tileWidth;

        float secureOnPart = tileHeight * 0.7;

        float amplitude = tileHeight - secureOnPart;
        float sinV = sinCust(onTileX * PI, PI, 1.0, amplitude) + amplitude;
        
        float localY = mod(roofUv.y, tileHeight);
        bool isNextTile = onTileY < sinV;
        
        
        float tileSINYID = tileYID;
        float tileSINXID = tileXID;

        if (isNextTile) {
            tileSINYID = tileYID - 1.0;
            if (isOdd == 1.0) {
                tileSINXID = (onTileX < 0.5) ? tileXID : tileXID + 1.0;
            } else {
                tileSINXID = (onTileX < 0.5) ? tileXID - 1.0 : tileXID;
            }
        }

        float variance = randCust(vec2(tileSINXID, tileSINYID));
        vec3 finalColor = colorVariancer(tileColor, variance, 0.2);
   
        float shadowWidth = 0.3;
        float newY = 0.0;
        if(isNextTile){
            newY = localY - sinV + shadowWidth * tileHeight;
        }else{
            float newSinV = sinCust((onTileX > 0.5 ? onTileX + 0.5 : onTileX - 0.5) * PI, PI, 1.0, amplitude);
            newY = localY - tileHeight + newSinV;
        }

        // Bestimme die Pixelbreite im UV-Raum (wie viel UV deckt ein Bildschirm-Pixel ab)
        // fwidth berechnet die Änderung zum Nachbarpixel auf dem Bildschirm
        float pixelSizeY = fwidth(newY);

        
        // Dynamischer Weichzeichnungs-Bereich basierend auf der Distanz (Pixelgröße)
        // Verhindert das "Verschlucken" oder "Flackern" des Schattens in der Ferne
        float edgeSoftness = max(pixelSizeY, 0.02); 

        // Weicher Verlauf anstelle von harten Sprüngen
        // Nutzt edgeSoftness, damit die Kante in der Entfernung nicht flackert
        float bottomShadow = smoothstep(0.0, shadowWidth, newY);
        float upperFade = smoothstep(shadowWidth + edgeSoftness, shadowWidth, newY);
        float shadowIntensity = mix(upperFade, bottomShadow, step(newY, shadowWidth));

        // Abdunklungs-Faktor definieren (0.4 = maximale Abdunklung um 60%)
        // shadowIntensity steuert den Verlauf sanft aus
        float shadowFactor = mix(1.0, mix(1.0, 0.4, shadowIntensity), 1.0);

        // Schatten auf die finale Farbe multiplizieren
        diffuseColor.rgb = finalColor * shadowFactor;`
};

export const norfolkTileShader: TYPE.FragmentShaderType = {functions: `
    uniform vec2 tileSize;
    uniform float randomNr;
    uniform vec3 roofTileColor;` + generalFunctions
    ,
    main: `
        vec2 roofUv = vUv;

        float offsetRows = tileSize.x / 2.0;

        vec3 tileColor = roofTileColor;

        float tileWidth = tileSize.x;
        float tileHeight = tileSize.y;

        float tileXID = floor(roofUv.x / tileWidth);
        float onTileX = (roofUv.x - tileXID * tileWidth) / tileWidth;

        float secureOnPart = tileHeight * 0.95;

        float sinV = sinCust(onTileX * 2.0 * PI, PI * 0.5, 1.0, tileHeight - secureOnPart);
        float tileYID = floor((roofUv.y - sinV) / tileHeight);
        float onTileY = roofUv.y - tileYID * tileHeight;
        float tileSINID = onTileY < secureOnPart ? sinV :onTileY < sinV ? tileYID : tileYID + 1.0; 
        float onTileYSin = onTileY - sinV;

        float variance = randCust(vec2(tileXID, tileYID));

        vec3 finalColor = colorVariancer(tileColor, variance, 0.2);
        
        float localY = onTileYSin;

        // Bestimme die Pixelbreite im UV-Raum (wie viel UV deckt ein Bildschirm-Pixel ab)
        // fwidth berechnet die Änderung zum Nachbarpixel auf dem Bildschirm
        float pixelSizeY = fwidth(localY);

        // Schatten-Eigenschaften
        float shadowWidth = 0.3; // Wie weit der Schatten nach oben ragt
        
        // Dynamischer Weichzeichnungs-Bereich basierend auf der Distanz (Pixelgröße)
        // Verhindert das "Verschlucken" oder "Flackern" des Schattens in der Ferne
        float edgeSoftness = max(pixelSizeY, 0.02); 

        // Weicher Verlauf anstelle von harten Sprüngen
        // Nutzt edgeSoftness, damit die Kante in der Entfernung nicht flackert
        float bottomShadow = smoothstep(0.0, shadowWidth, localY);
        float upperFade = smoothstep(shadowWidth + edgeSoftness, shadowWidth, localY);
        float shadowIntensity = mix(upperFade, bottomShadow, step(localY, shadowWidth));

        // Abdunklungs-Faktor definieren (0.4 = maximale Abdunklung um 60%)
        // shadowIntensity steuert den Verlauf sanft aus
        float shadowFactor = mix(1.0, mix(1.0, 0.4, shadowIntensity), 1.0);

        // Schatten auf die finale Farbe multiplizieren
        diffuseColor.rgb = finalColor * shadowFactor;`}
        