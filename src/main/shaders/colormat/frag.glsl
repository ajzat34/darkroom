# version 300 es
uniform sampler2D texSampler;
uniform sampler2D maskSampler;
uniform highp vec3 r;
uniform highp vec3 g;
uniform highp vec3 b;

uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;


void main(void) {
  // get the texel value
  highp vec4 color = texelFetch(texSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0);
  highp float mask = texelFetch(maskSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0).r;

  // lut
  highp vec3 mix = vec3(
    dot(color.rgb, r),
    dot(color.rgb, g),
    dot(color.rgb, b)
  );

  // blend the original with the filtered, based on the mask
  fragmentColor.rgb = (mix*mask)+(color.rgb * (1.0-mask));
  fragmentColor.a = color.a;
}
