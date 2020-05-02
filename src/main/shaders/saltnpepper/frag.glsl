# version 300 es
uniform sampler2D texSampler;
uniform highp float amount;
uniform highp float threshold;
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

highp vec4 csample(ivec2 s)
{
  return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x-1), clamp(s.y, 0, size.y-1)), 0);
}

highp vec3 rgbsample(ivec2 s)
{
  return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x-1), clamp(s.y, 0, size.y-1)), 0).rgb;
}

void sort2(inout vec3 a0, inout vec3 a1) {
	highp vec3 b0 = min(a0, a1);
	highp vec3 b1 = max(a0, a1);
	a0 = b0;
	a1 = b1;
}

void sort(inout vec3 a0, inout vec3 a1, inout vec3 a2, inout vec3 a3, inout vec3 a4) {
	sort2(a0, a1);
	sort2(a3, a4);
	sort2(a0, a2);
	sort2(a1, a2);
	sort2(a0, a3);
	sort2(a2, a3);
	sort2(a1, a4);
	sort2(a1, a2);
	sort2(a3, a4);
}

void main(void) {
  // get the texel value
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 color = csample(p);

  highp vec3 c0 = color.rgb;
  highp vec3 c1 = rgbsample(p + ivec2(-1, 0));
  highp vec3 c2 = rgbsample(p + ivec2( 0,-1));
  highp vec3 c3 = rgbsample(p + ivec2( 1, 0));
  highp vec3 c4 = rgbsample(p + ivec2( 0, 1));

  highp vec3 c5 = rgbsample(p + ivec2( 1, 1));
  highp vec3 c6 = rgbsample(p + ivec2(-1, 1));
  highp vec3 c7 = rgbsample(p + ivec2( 1,-1));
  highp vec3 c8 = rgbsample(p + ivec2(-1,-1));

  sort(c0, c1, c2, c3, c4);
  sort(c5, c6, c2, c7, c8);

  fragmentColor.rgb = mix(color.rgb, c2, amount);
  fragmentColor.a  = color.a;
}
