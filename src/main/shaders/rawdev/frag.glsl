# version 300 es
uniform sampler2D texSampler;

uniform highp float exposure;
uniform highp float black;
uniform highp float saturation;
uniform highp float temperature;
uniform highp float hue;
uniform highp float gamma;
uniform bool clipping;

uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;


void main(void) {
  // get the texel value
  highp vec4 color = texelFetch(texSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0);
  // saturation temp and hue
  bool r = false;
  bool g = false;
  bool b = false;
  highp vec3 level = ((( pow(color.rgb,vec3(gamma)) -1.0) *black)+1.0) * exposure;
  if (clipping) {
    if (level.r < 0.0) { r=true; }
    if (level.g < 0.0) { g=true; }
    if (level.b < 0.0) { b=true; }
  }
  highp vec3 saturationc = mix(vec3(dot(level, vec3(0.2125, 0.7154, 0.0721))), level, saturation);
  saturationc.r += temperature;
  saturationc.g += hue;
  saturationc.b -= temperature;

  if (clipping) {
    if (r) {saturationc.r = 1.0;}
    if (g) {saturationc.g = 1.0;}
    if (b) {saturationc.b = 1.0;}
    if (saturationc.r > 1.0) {saturationc.r = 0.0;}
    if (saturationc.g > 1.0) {saturationc.g = 0.0;}
    if (saturationc.b > 1.0) {saturationc.b = 0.0;}
  }


  // blend the original with the filtered, based on the mask
  fragmentColor.rgb = saturationc.rgb;
  fragmentColor.a = color.a;
}
