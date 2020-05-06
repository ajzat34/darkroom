# version 300 es
uniform sampler2D texSampler;

uniform highp float exposure;
uniform highp float black;
uniform highp float saturation;
uniform highp float temperature;
uniform highp float hue;
uniform highp float gamma;

uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;


void main(void) {
  // get the texel value
  highp vec4 color = texelFetch(texSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0);
  // saturation temp and hue
  highp vec3 level = pow( max((((color.rgb-1.0)*black)+1.0) * exposure, 0.0), vec3(gamma));
  highp vec3 saturationc = mix(vec3(dot(level, vec3(0.2125, 0.7154, 0.0721))), level, saturation);
  saturationc.r += temperature;
  saturationc.g += hue;
  saturationc.b -= temperature;

  // blend the original with the filtered, based on the mask
  fragmentColor.rgb = saturationc.rgb;
  fragmentColor.a = color.a;
}
