uniform sampler2D texSampler;
uniform highp float gamma;

varying highp vec2 textureCoord;

void main(void) {
  highp vec4 texture = texture2D(texSampler, textureCoord);
  highp vec3 color = texture.rgb;
  highp vec3 gamma = vec3(pow(color.r, gamma), pow(color.g, gamma), pow(color.b, gamma));
  gl_FragColor.rgb = gamma;
  gl_FragColor.a = texture.a;
}
