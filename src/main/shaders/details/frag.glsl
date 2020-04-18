# version 300 es
uniform sampler2D texSampler;
// size of the kernal
uniform mediump int ksize;
uniform mediump int eksize;

uniform highp float blurweights[49];
uniform highp float edgeweights[25];

uniform highp float masking;
uniform highp float noisegamma;

uniform highp vec3 hsvweights;

uniform highp float sharpen;
uniform highp float denoise;

// uniform highp vec3 hsvweights;

uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

// clamp sample texel
highp vec3 csample(ivec2 s)
{
  return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x), clamp(s.y, 0, size.y)), 0).rgb;
}

highp vec3 rgb2hsv(vec3 c)
{
    highp vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    highp vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    highp vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    highp float d = q.x - min(q.w, q.y);
    highp float e = 1.0e-10;
    return vec3( abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x );
}

// sample for edge detection
highp float vsample(ivec2 s)
{
  return dot(rgb2hsv(texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x-1), clamp(s.y, 0, size.y-1)), 0).rgb), hsvweights);
}

highp vec3 convolution(ivec2 p, highp float weights[49]) {
 highp vec3 acc = vec3(0.0);
 if (ksize == 3) {
   acc += csample(p+ivec2(-1,1)) * weights[0];
   acc += csample(p+ivec2(0,1)) * weights[1];
   acc += csample(p+ivec2(1,1)) * weights[2];
   acc += csample(p+ivec2(-1,0)) * weights[3];
   acc += csample(p) * weights[4];
   acc += csample(p+ivec2(1,0)) * weights[5];
   acc += csample(p+ivec2(-1,-1)) * weights[6];
   acc += csample(p+ivec2(0,-1)) * weights[7];
   acc += csample(p+ivec2(1,-1)) * weights[8];
}
 else if (ksize == 5) {
   acc += csample(p+ivec2(-2,2)) * weights[0];
   acc += csample(p+ivec2(-1,2)) * weights[1];
   acc += csample(p+ivec2(0,2)) * weights[2];
   acc += csample(p+ivec2(1,2)) * weights[3];
   acc += csample(p+ivec2(2,2)) * weights[4];
   acc += csample(p+ivec2(-2,1)) * weights[5];
   acc += csample(p+ivec2(-1,1)) * weights[6];
   acc += csample(p+ivec2(0,1)) * weights[7];
   acc += csample(p+ivec2(1,1)) * weights[8];
   acc += csample(p+ivec2(2,1)) * weights[9];
   acc += csample(p+ivec2(-2,0)) * weights[10];
   acc += csample(p+ivec2(-1,0)) * weights[11];
   acc += csample(p) * weights[12];
   acc += csample(p+ivec2(1,0)) * weights[13];
   acc += csample(p+ivec2(2,0)) * weights[14];
   acc += csample(p+ivec2(-2,-1)) * weights[15];
   acc += csample(p+ivec2(-1,-1)) * weights[16];
   acc += csample(p+ivec2(0,-1)) * weights[17];
   acc += csample(p+ivec2(1,-1)) * weights[18];
   acc += csample(p+ivec2(2,-1)) * weights[19];
   acc += csample(p+ivec2(-2,-2)) * weights[20];
   acc += csample(p+ivec2(-1,-2)) * weights[21];
   acc += csample(p+ivec2(0,-2)) * weights[22];
   acc += csample(p+ivec2(1,-2)) * weights[23];
   acc += csample(p+ivec2(2,-2)) * weights[24];
}
 else if (ksize == 7) {
   acc += csample(p+ivec2(-3,3)) * weights[0];
   acc += csample(p+ivec2(-2,3)) * weights[1];
   acc += csample(p+ivec2(-1,3)) * weights[2];
   acc += csample(p+ivec2(0,3)) * weights[3];
   acc += csample(p+ivec2(1,3)) * weights[4];
   acc += csample(p+ivec2(2,3)) * weights[5];
   acc += csample(p+ivec2(3,3)) * weights[6];
   acc += csample(p+ivec2(-3,2)) * weights[7];
   acc += csample(p+ivec2(-2,2)) * weights[8];
   acc += csample(p+ivec2(-1,2)) * weights[9];
   acc += csample(p+ivec2(0,2)) * weights[10];
   acc += csample(p+ivec2(1,2)) * weights[11];
   acc += csample(p+ivec2(2,2)) * weights[12];
   acc += csample(p+ivec2(3,2)) * weights[13];
   acc += csample(p+ivec2(-3,1)) * weights[14];
   acc += csample(p+ivec2(-2,1)) * weights[15];
   acc += csample(p+ivec2(-1,1)) * weights[16];
   acc += csample(p+ivec2(0,1)) * weights[17];
   acc += csample(p+ivec2(1,1)) * weights[18];
   acc += csample(p+ivec2(2,1)) * weights[19];
   acc += csample(p+ivec2(3,1)) * weights[20];
   acc += csample(p+ivec2(-3,0)) * weights[21];
   acc += csample(p+ivec2(-2,0)) * weights[22];
   acc += csample(p+ivec2(-1,0)) * weights[23];
   acc += csample(p) * weights[24];
   acc += csample(p+ivec2(1,0)) * weights[25];
   acc += csample(p+ivec2(2,0)) * weights[26];
   acc += csample(p+ivec2(3,0)) * weights[27];
   acc += csample(p+ivec2(-3,-1)) * weights[28];
   acc += csample(p+ivec2(-2,-1)) * weights[29];
   acc += csample(p+ivec2(-1,-1)) * weights[30];
   acc += csample(p+ivec2(0,-1)) * weights[31];
   acc += csample(p+ivec2(1,-1)) * weights[32];
   acc += csample(p+ivec2(2,-1)) * weights[33];
   acc += csample(p+ivec2(3,-1)) * weights[34];
   acc += csample(p+ivec2(-3,-2)) * weights[35];
   acc += csample(p+ivec2(-2,-2)) * weights[36];
   acc += csample(p+ivec2(-1,-2)) * weights[37];
   acc += csample(p+ivec2(0,-2)) * weights[38];
   acc += csample(p+ivec2(1,-2)) * weights[39];
   acc += csample(p+ivec2(2,-2)) * weights[40];
   acc += csample(p+ivec2(3,-2)) * weights[41];
   acc += csample(p+ivec2(-3,-3)) * weights[42];
   acc += csample(p+ivec2(-2,-3)) * weights[43];
   acc += csample(p+ivec2(-1,-3)) * weights[44];
   acc += csample(p+ivec2(0,-3)) * weights[45];
   acc += csample(p+ivec2(1,-3)) * weights[46];
   acc += csample(p+ivec2(2,-3)) * weights[47];
   acc += csample(p+ivec2(3,-3)) * weights[48];
 }
 return acc;
}

highp float edgedetect(ivec2 t, highp float weights[25]) {
  highp float p[13];

  p[0] = vsample(t);

  p[1] = vsample(t+ivec2(-1, 0));
  p[2] = vsample(t+ivec2( 1, 0));
  p[3] = vsample(t+ivec2( 0,-1));
  p[4] = vsample(t+ivec2( 0, 1));

  p[5] = vsample(t+ivec2(-1, 1));
  p[6] = vsample(t+ivec2( 1, 1));
  p[7] = vsample(t+ivec2(-1,-1));
  p[8] = vsample(t+ivec2( 1,-1));

  p[9] = vsample(t+ivec2(-2, 0));
  p[10] = vsample(t+ivec2( 2, 0));
  p[11] = vsample(t+ivec2( 0,-2));
  p[12] = vsample(t+ivec2( 0, 2));

  // caclulate the mean
  highp float mean = ((p[0]+p[1]+p[2]+p[3]+p[4]+p[5]+p[6]+p[7]+p[8]+p[9]+p[10]+p[11]+p[12]) / 13.0);

  // calculate the standard deviation
  highp float acc = 0.0;
  highp float diff = 0.0;
  for (mediump int i = 0; i <= 13; i++) {
    diff = p[i]-mean;
    acc += diff*diff;
  }
  return pow(acc, noisegamma);
}

void main (void) {
  // get the center texel coord
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));

  highp vec3 blur = convolution(p, blurweights);
  highp float mask = edgedetect(p, edgeweights);

  fragmentColor = vec4(blur, mask);
}
