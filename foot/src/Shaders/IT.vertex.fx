attribute vec3 position;
attribute vec2 uv;

uniform mat4 worldViewProjection;
uniform float time;

varying vec2 vUV;

void main()
{
    vec3 pos = position;
    pos.y += cos(pos.x + time * 0.01) + sin(pos.z + time * 0.01);

    gl_Position = worldViewProjection * vec4(pos, 1.0);

    vUV = uv;
}
