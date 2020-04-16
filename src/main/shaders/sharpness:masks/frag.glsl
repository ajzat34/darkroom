# version 300 es
uniform sampler2D imageSampler;
uniform sampler2D blurSampler;
uniform sampler2D varianceSampler;
uniform highp float strength;
uniform highp float balance;
uniform mediump float slimit;
uniform mediump float dlimit;
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

void main(void) {
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 pixel = texelFetch(imageSampler, p, 0);
  highp vec4 blur = texelFetch(blurSampler, p, 0);
  highp float vary = texelFetch(varianceSampler, p, 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(1,0), 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(0,1), 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(-1,0), 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(0,-1), 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(1,1), 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(-1,-1), 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(-1,1), 0).a;
  vary += texelFetch(varianceSampler, p+ivec2(1,-1), 0).a;
  vary = clamp(((vary/9.0)-balance) * -strength, slimit, dlimit);
  fragmentColor = (pixel*(1.0-vary))+(blur*vary);
}
