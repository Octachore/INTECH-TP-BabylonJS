uniform sampler2D makiTexture;

varying vec2 vUV;

void main()
{
    gl_FragColor = texture2D(makiTexture, vUV);
}
