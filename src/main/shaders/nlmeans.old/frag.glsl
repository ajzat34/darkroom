# version 300 es
uniform sampler2D texSampler;
uniform highp float amount;
uniform highp float threshold;
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

const highp vec3 dotsums = vec3(0.33333333333,0.33333333333,0.33333333333);

highp vec4 csample(ivec2 s) {return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x-1), clamp(s.y, 0, size.y-1)), 0);}
highp vec3 rgbsample(ivec2 s) {return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x-1), clamp(s.y, 0, size.y-1)), 0).rgb;}

void sampleKernal(ivec2 center, inout vec3 [9]src)
{
  src[0] += rgbsample(center+ivec2(-1, 1));
  src[1] += rgbsample(center+ivec2( 0, 1));
  src[2] += rgbsample(center+ivec2( 1, 1));
  src[3] += rgbsample(center+ivec2(-1, 0));
  src[4] += rgbsample(center+ivec2( 0, 0));
  src[5] += rgbsample(center+ivec2( 1, 0));
  src[6] += rgbsample(center+ivec2(-1,-1));
  src[7] += rgbsample(center+ivec2( 0,-1));
  src[8] += rgbsample(center+ivec2( 1,-1));
}

highp float compare(vec3 [9]src, vec3 [9]compare)
{
  highp float acc = 0.0;
  acc += dot(abs(src[0]-compare[0]), dotsums);
  acc += dot(abs(src[1]-compare[1]), dotsums);
  acc += dot(abs(src[2]-compare[2]), dotsums);

  acc += dot(abs(src[3]-compare[3]), dotsums);
  acc += dot(abs(src[4]-compare[4]), dotsums);
  acc += dot(abs(src[5]-compare[5]), dotsums);

  acc += dot(abs(src[6]-compare[6]), dotsums);
  acc += dot(abs(src[7]-compare[7]), dotsums);
  acc += dot(abs(src[8]-compare[8]), dotsums);

  return 1.0-(acc/9.0);
}

void main(void) {
  // get the texel value
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 color = csample(p);

  highp float [9]weights;

  highp vec3 [9]center;
  sampleKernal(p+ivec2( 0, 0), center);

  highp vec3 [9]p0; sampleKernal(p+ivec2(-1, 1), p0);
  weights[0] = compare(center, p0);
  highp vec3 [9]p1; sampleKernal(p+ivec2( 0, 1), p1);
  weights[1] = compare(center, p1);
  highp vec3 [9]p2; sampleKernal(p+ivec2( 1, 1), p2);
  weights[2] = compare(center, p2);

  highp vec3 [9]p3; sampleKernal(p+ivec2(-1, 0), p3);
  weights[3] = compare(center, p3);
  weights[4] = 1.0;
  highp vec3 [9]p5; sampleKernal(p+ivec2( 1, 1), p5);
  weights[5] = compare(center, p5);

  highp vec3 [9]p6; sampleKernal(p+ivec2(-1,-1), p6);
  weights[6] = compare(center, p6);
  highp vec3 [9]p7; sampleKernal(p+ivec2( 0,-1), p7);
  weights[7] = compare(center, p7);
  highp vec3 [9]p8; sampleKernal(p+ivec2( 1,-1), p8);
  weights[8] = compare(center, p8);

  highp float weightsum = weights[0]+weights[1]+weights[2]+weights[3]+weights[4]+weights[5]+weights[6]+weights[7]+weights[8];
  weights[0] /= weightsum; weights[1] /= weightsum; weights[2] /= weightsum;
  weights[3] /= weightsum; weights[4] /= weightsum; weights[5] /= weightsum;
  weights[6] /= weightsum; weights[7] /= weightsum; weights[8] /= weightsum;

  highp vec3 acc = vec3(0);
  acc += weights[0]*p0[4]; acc += weights[1]*p1[4]; acc += weights[2]*p2[4];
  acc += weights[3]*p3[4]; acc += weights[4]*center[4]; acc += weights[5]*p5[4];
  acc += weights[6]*p6[4]; acc += weights[7]*p7[4]; acc += weights[8]*p8[4];

  fragmentColor.rgb = acc;
  fragmentColor.a  = color.a;
}
