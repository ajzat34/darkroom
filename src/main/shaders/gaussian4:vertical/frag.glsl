uniform sampler2D texSampler;
uniform ivec2 size;

varying highp vec2 textureCoord;

void main(void) {
  highp vec2 offset = vec2(1.0 / float(size.x), 1.0 / float(size.y));
  highp vec4 color = texture2D(texSampler, textureCoord) * 0.38292;
  color += texture2D(texSampler, vec2(textureCoord.x, textureCoord.y + offset.y)) * 0.2417;
  color += texture2D(texSampler, vec2(textureCoord.x, textureCoord.y + (offset.y*2.0))) * 0.0668;
  color += texture2D(texSampler, vec2(textureCoord.x, textureCoord.y - offset.y)) * 0.2417;
  color += texture2D(texSampler, vec2(textureCoord.x, textureCoord.y - (offset.y*2.0))) * 0.0668;
  gl_FragColor = color;
}
