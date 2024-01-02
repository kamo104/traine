precision highp float;


uniform float maxDistance;
uniform float viewerY;

varying vec3 vPositionW;


void main(void) {

    float yDiff = viewerY-vPositionW.y;
    yDiff/=maxDistance;

    normalize(yDiff);

    gl_FragColor = vec4( yDiff, yDiff, yDiff, 1.0);
}