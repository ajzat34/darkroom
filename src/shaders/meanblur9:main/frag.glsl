uniform sampler2D texSampler;
uniform ivec2 size;

varying highp vec2 textureCoord;

void main(void) {
  highp vec2 offset = vec2(1.0 / float(size.x), 1.0 / float(size.y));
  highp vec4 color = texture2D(texSampler, textureCoord);
  color += texture2D(texSampler, vec2(textureCoord.x + offset.x, textureCoord.y));
  color += texture2D(texSampler, vec2(textureCoord.x - offset.x, textureCoord.y));
  color += texture2D(texSampler, vec2(textureCoord.x, textureCoord.y + offset.y));
  color += texture2D(texSampler, vec2(textureCoord.x, textureCoord.y - offset.y));
  color += texture2D(texSampler, vec2(textureCoord.x + offset.x, textureCoord.y + offset.y));
  color += texture2D(texSampler, vec2(textureCoord.x - offset.x, textureCoord.y + offset.y));
  color += texture2D(texSampler, vec2(textureCoord.x + offset.x, textureCoord.y - offset.y));
  color += texture2D(texSampler, vec2(textureCoord.x - offset.x, textureCoord.y - offset.y));
  gl_FragColor = color / 9.0;
}
