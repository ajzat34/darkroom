uniform sampler2D texSampler;

varying highp vec2 textureCoord;

void main(void) {
  gl_FragColor = texture2D(texSampler, textureCoord);
}
