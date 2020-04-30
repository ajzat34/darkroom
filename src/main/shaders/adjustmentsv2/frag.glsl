# version 300 es
uniform sampler2D texSampler;
uniform sampler2D maskSampler;
uniform sampler2D lut;

uniform highp float saturation;
uniform highp float vibrance;
uniform highp float temperature;
uniform highp float hue;

uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

const highp vec3 coeff = vec3(0.299,0.587,0.114);


void main(void) {
  // get the texel value
  highp vec4 color = texelFetch(texSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0);
  highp float mask = texelFetch(maskSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0).r;

  // lut
  highp vec3 lutc = vec3(
    texelFetch(lut, ivec2(int(color.r * 255.0), 0), 0).r,
    texelFetch(lut, ivec2(int(color.g * 255.0), 0), 0).g,
    texelFetch(lut, ivec2(int(color.b * 255.0), 0), 0).b);

  // saturation
  highp vec3 sat = mix(vec3(dot(lutc, vec3(0.2125, 0.7154, 0.0721))), lutc, saturation);
  // vibrance
  highp float lum = dot(sat, coeff);
  highp vec3 cmask = clamp((sat - vec3(lum)), 0.0, 1.0);
  highp float lumMask = 1.0 - dot(coeff, cmask);
  highp vec3 rgb = mix(vec3(lum), sat, 1.0 + vibrance * lumMask);
  rgb.r += temperature;
  rgb.g += hue;
  rgb.b -= temperature;

  // blend the original with the filtered, based on the mask
  fragmentColor.rgb = (rgb * mask) + (rgb.rgb * (1.0 - mask));
  fragmentColor.a = color.a;
}
