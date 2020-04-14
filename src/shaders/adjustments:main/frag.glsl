uniform sampler2D texSampler;
uniform highp float brightness;
uniform highp float contrast;
uniform highp float blacks;
uniform highp float whites;

varying highp vec2 textureCoord;

void main(void) {
  highp vec4 texture = texture2D(texSampler, textureCoord);
  highp vec3 color = texture.rgb;
  highp vec3 contrast = ((color - 0.5) * contrast) + 0.5;
  highp vec3 brightness = (contrast) + brightness;
  highp vec3 levels = whites * ((blacks * (brightness-1.0))+1.0);
  gl_FragColor.rgb = levels;
  gl_FragColor.a = texture.a;
}
