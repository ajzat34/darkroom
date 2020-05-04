# version 300 es
uniform sampler2D imageSampler;
uniform sampler2D blurSampler;
uniform sampler2D maskSampler;
uniform highp float strength;
uniform highp float balance;
uniform highp float sharpen;
uniform highp float denoise;
uniform bool showmask;
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

highp float vsample(ivec2 s)
{
  return texelFetch(blurSampler, ivec2(clamp(s.x, 0, size.x-1), clamp(s.y, 0, size.y-1)), 0).a;
}

void sort2(inout float a0, inout float a1) {
	highp float b0 = min(a0, a1);
	highp float b1 = max(a0, a1);
	a0 = b0;
	a1 = b1;
}

void sort(inout float a0, inout float a1, inout float a2, inout float a3, inout float a4) {
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
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp float mask = texelFetch(maskSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0).r;

  highp float c0 =  vsample(p);
  highp float c1 = vsample(p + ivec2(-1, 0));
  highp float c2 = vsample(p + ivec2( 0,-1));
  highp float c3 = vsample(p + ivec2( 1, 0));
  highp float c4 = vsample(p + ivec2( 0, 1));

  highp float c5 = vsample(p + ivec2( 1, 1));
  highp float c6 = vsample(p + ivec2(-1, 1));
  highp float c7 = vsample(p + ivec2( 1,-1));
  highp float c8 = vsample(p + ivec2(-1,-1));

  sort(c0, c1, c2, c3, c4);
  sort(c5, c6, c2, c7, c8);
  highp float vary = 0.0-(c2-balance);

  if (vary < 0.0) {
    // sharpen pixel
    vary *= sharpen;
  } else {
    // denoise pixel
    vary *= denoise;
  }

  vary = clamp(vary, -1.0, 1.0);

  if (showmask) {
    fragmentColor.b = vary * mask;
    fragmentColor.g = (0.0-vary) * mask;
    fragmentColor.a = 1.0;
  } else {
    highp vec4 color = texelFetch(imageSampler, p, 0);
    fragmentColor.rgb = mix(color.rgb, mix(color.rgb, texelFetch(blurSampler, p, 0).rgb, vary), mask);
    // fragmentColor.rgb = (((color.rgb*(1.0-vary))+(texelFetch(blurSampler, p, 0).rgb*(vary))) * mask) + (color.rgb * (1.0 - mask));
    fragmentColor.a = color.a;
  }
}
