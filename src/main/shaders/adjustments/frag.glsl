# version 300 es
uniform sampler2D texSampler;
uniform highp float brightness;
uniform highp float contrast;
uniform highp float blacks;
uniform highp float whites;
uniform highp float gamma;
uniform highp float saturation;
uniform highp float temperature;
uniform highp float hue;
uniform bool showClipped;
uniform bool showGamut;
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

void main(void) {
  highp ivec2 pixel = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 texture = texelFetch(texSampler, pixel, 0);
  highp vec3 gamma = vec3(pow(texture.r, gamma), pow(texture.g, gamma), pow(texture.b, gamma));
  highp vec3 contrast = ((gamma - 0.5) * contrast) + 0.5;
  highp vec3 brightness = (contrast) + brightness;
  highp vec3 levels = whites * ((blacks * (brightness-1.0))+1.0);
  highp vec3 intensity = vec3(dot(levels, vec3(0.2125, 0.7154, 0.0721)));
  highp vec3 colors = mix(intensity, levels, saturation);
  colors.r += temperature;
  colors.g += hue;
  colors.b -= temperature;
  fragmentColor.rgb = colors;
  // clipped black
  if        (showClipped && colors.r < 0.0 && colors.g < 0.0 && colors.b < 0.0) {
    fragmentColor.rgb = vec3 (1.0,1.0,1.0);

  // out of gamut black
  } else if (showGamut && (colors.r < 0.0 || colors.g < 0.0 || colors.b < 0.0)) {
    fragmentColor.rgb = vec3 (0.6,0.6,1.0);

  // clipped white
  } else if (showClipped && colors.r > 1.0 && colors.g > 1.0 && colors.b > 1.0) {
    fragmentColor.rgb = vec3 (0.0, 0.0, 0.0);

  // out of gamut white
  } else if (showGamut && (colors.r > 1.0 || colors.g > 1.0 || colors.b > 1.0)) {
    fragmentColor.rgb = vec3 (0.25,0.0,0.0);
  }
  fragmentColor.a = texture.a;
}
