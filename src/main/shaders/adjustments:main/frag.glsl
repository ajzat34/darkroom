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
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

void main(void) {
  highp ivec2 pixel = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 texture = texelFetch(texSampler, pixel, 0);
  highp vec3 color = texture.rgb;
  highp vec3 contrast = ((color - 0.5) * contrast) + 0.5;
  highp vec3 brightness = (contrast) + brightness;
  highp vec3 levels = whites * ((blacks * (brightness-1.0))+1.0);
  highp vec3 clamped = clamp(levels, vec3(0,0,0), vec3(1,1,1));
  highp vec3 gamma = vec3(pow(clamped.r, gamma), pow(clamped.g, gamma), pow(clamped.b, gamma));
  highp vec3 intensity = vec3(dot(gamma, vec3(0.2125, 0.7154, 0.0721)));
  highp vec3 colors = mix(intensity, gamma, saturation);
  colors.r += temperature;
  colors.g += hue;
  colors.b -= temperature;
  fragmentColor.rgb = colors;
  fragmentColor.a = texture.a;
}
