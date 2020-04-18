# version 300 es
uniform sampler2D imageSampler;
uniform sampler2D blurSampler;
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
  return texelFetch(blurSampler, ivec2(clamp(s.x, 3, size.x-3), clamp(s.y, 3, size.y-3)), 0).a;
}

void main(void) {
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp float vary = vsample(p)*2.0;
  vary += vsample(p+ivec2(1,0))*1.5;
  vary += vsample(p+ivec2(0,1))*1.5;
  vary += vsample(p+ivec2(-1,0))*1.5;
  vary += vsample(p+ivec2(0,-1))*1.5;

  vary += vsample(p+ivec2( 1, 1));
  vary += vsample(p+ivec2(-1, 1));
  vary += vsample(p+ivec2( 1,-1));
  vary += vsample(p+ivec2(-1,-1));

  vary = 0.0-((vary/12.0)-balance);

  if (vary < 0.0) {
    // sharpen pixel
    vary *= sharpen;
  } else {
    // denoise pixel
    vary *= denoise;
  }

  vary = clamp(vary, -1.0, 1.0);

  if (showmask) {
    fragmentColor.b = (0.0-vary);
    fragmentColor.g = vary;
    fragmentColor.r = 0.0;
    fragmentColor.a = 1.0;
  } else {
    fragmentColor.rgb = (texelFetch(imageSampler, p, 0).rgb*(1.0-vary))+(texelFetch(blurSampler, p, 0).rgb*(vary));
    fragmentColor.a = 1.0;
  }
}
