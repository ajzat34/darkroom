# version 300 es
uniform sampler2D texSampler;
uniform highp float sizes[14]; // up to 14 normalcdf samples
uniform highp int kernel; // kernel size
uniform highp int alphakernel; // kernel size
uniform lowp int mode; // 0 = horizontal, 1 = vertial
uniform lowp int alphaMode; // 1 = variance be mapped to alpha, 2 = first pass of alpha smooth
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

highp vec3 sum = vec3(0.4545454545, 0.09090909091, 0.4545454545);

// clamp sample texel
highp vec3 isample(ivec2 s)
{
  return vec3(texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x), clamp(s.y, 0, size.y)), 0));
}
highp float vsample(ivec2 s)
{
  return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x), clamp(s.y, 0, size.y)), 0).a;
}

// this also contains functions for variance calculations for alhpa modes 1&2
highp vec3 rgb2hsv(vec3 c)
{
    highp vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    highp vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    highp vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    highp float d = q.x - min(q.w, q.y);
    highp float e = 1.0e-10;
    return vec3( abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x );
}

highp float variance(ivec2 t) {
  highp float p[13];
  p[0]  = vsample(t);
  p[1]  = vsample(ivec2(t.x+1, t.y));
  p[2]  = vsample(ivec2(t.x, t.y+1));
  p[3]  = vsample(ivec2(t.x-1, t.y));
  p[4]  = vsample(ivec2(t.x, t.y-1));

  p[5]  = vsample(ivec2(t.x+1, t.y+1));
  p[6]  = vsample(ivec2(t.x-1, t.y+1));
  p[7]  = vsample(ivec2(t.x+1, t.y-1));
  p[8]  = vsample(ivec2(t.x-1, t.y-1));

  p[9]  = vsample(ivec2(t.x+2, t.y));
  p[10] = vsample(ivec2(t.x, t.y+2));
  p[11] = vsample(ivec2(t.x-2, t.y));
  p[12] = vsample(ivec2(t.x, t.y-2));

  // caclulate the mean
  highp float mean = ((p[0]+p[1]+p[2]+p[3]+p[4]+p[5]+p[6]+p[7]+p[8]+p[9]+p[10]+p[11]+p[12]) / 13.0);

  // calculate the standard deviation
  highp float acc = 0.0;
  highp float diff = 0.0;
  for (int i = 0; i <= 13; i++) {
    diff = p[i]-mean;
    acc += diff*diff;
  }
  return pow(acc/13.0, 0.33);
}

highp float nlmeans(ivec2 t) {
  highp float acc = dot(rgb2hsv(isample(t).rgb), sum)*2.0;
  if (alphakernel >= 1) {
    acc += dot(rgb2hsv(isample(ivec2(t.x+1, t.y))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x, t.y+1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-1, t.y))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x, t.y-1))), sum);
  }
  if (alphakernel >= 2) {
    acc += dot(rgb2hsv(isample(ivec2(t.x+1, t.y+1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-1, t.y+1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x+1, t.y-1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-1, t.y-1))), sum);
  }
  if (alphakernel >= 3) {
    acc += dot(rgb2hsv(isample(ivec2(t.x+2, t.y))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x, t.y+2))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-2, t.y))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x, t.y-2))), sum);
  }
  if (alphakernel >= 5) {
    acc += dot(rgb2hsv(isample(ivec2(t.x+2, t.y+1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x+1, t.y+2))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-2, t.y+1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x+1, t.y-2))), sum);

    acc += dot(rgb2hsv(isample(ivec2(t.x+2, t.y-1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-1, t.y+2))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-2, t.y-1))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-1, t.y-2))), sum);
  }
  if (alphakernel >= 6) {
    acc += dot(rgb2hsv(isample(ivec2(t.x+3, t.y))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x, t.y+3))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-3, t.y))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x, t.y-3))), sum);
  }
  if (alphakernel >= 7) {
    acc += dot(rgb2hsv(isample(ivec2(t.x+2, t.y+2))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x+2, t.y+2))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x-2, t.y+2))), sum);
    acc += dot(rgb2hsv(isample(ivec2(t.x+2, t.y-2))), sum);
  }
  return acc / float(1+(alphakernel*4));
}

void main(void) {
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp ivec2 direction;
  highp vec3 texture;
  highp vec3 base = isample(p);
  highp float basea = texelFetch(texSampler, p, 0).a;
  if (mode == 0) {
    // horizontal blur
    direction = ivec2(1,0);
  } else {
    // vertical blur
    direction = ivec2(0,1);
  }

  if (kernel == 3) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
  }
  else if (kernel == 5) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
  }
  else if (kernel == 7) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
  }
  else if (kernel == 9) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
  }
  else if (kernel == 11) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
  }
  else if (kernel == 13) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
    texture += isample(p+(direction*6)) * sizes[6];
    texture += isample(p-(direction*6)) * sizes[6];
  }
  else if (kernel == 15) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
    texture += isample(p+(direction*6)) * sizes[6];
    texture += isample(p-(direction*6)) * sizes[6];
    texture += isample(p+(direction*7)) * sizes[7];
    texture += isample(p-(direction*7)) * sizes[7];
  } else if (kernel == 17) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
    texture += isample(p+(direction*6)) * sizes[6];
    texture += isample(p-(direction*6)) * sizes[6];
    texture += isample(p+(direction*7)) * sizes[7];
    texture += isample(p-(direction*7)) * sizes[7];
    texture += isample(p+(direction*8)) * sizes[9];
    texture += isample(p-(direction*8)) * sizes[9];
  } else if (kernel == 19) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
    texture += isample(p+(direction*6)) * sizes[6];
    texture += isample(p-(direction*6)) * sizes[6];
    texture += isample(p+(direction*7)) * sizes[7];
    texture += isample(p-(direction*7)) * sizes[7];
    texture += isample(p+(direction*8)) * sizes[9];
    texture += isample(p-(direction*8)) * sizes[9];
    texture += isample(p+(direction*9)) * sizes[10];
    texture += isample(p-(direction*9)) * sizes[10];
  } else if (kernel == 21) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
    texture += isample(p+(direction*6)) * sizes[6];
    texture += isample(p-(direction*6)) * sizes[6];
    texture += isample(p+(direction*7)) * sizes[7];
    texture += isample(p-(direction*7)) * sizes[7];
    texture += isample(p+(direction*8)) * sizes[9];
    texture += isample(p-(direction*8)) * sizes[9];
    texture += isample(p+(direction*9)) * sizes[10];
    texture += isample(p-(direction*9)) * sizes[10];
    texture += isample(p+(direction*10)) * sizes[11];
    texture += isample(p-(direction*10)) * sizes[11];
  } else if (kernel == 23) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
    texture += isample(p+(direction*6)) * sizes[6];
    texture += isample(p-(direction*6)) * sizes[6];
    texture += isample(p+(direction*7)) * sizes[7];
    texture += isample(p-(direction*7)) * sizes[7];
    texture += isample(p+(direction*8)) * sizes[9];
    texture += isample(p-(direction*8)) * sizes[9];
    texture += isample(p+(direction*9)) * sizes[10];
    texture += isample(p-(direction*9)) * sizes[10];
    texture += isample(p+(direction*10)) * sizes[11];
    texture += isample(p-(direction*10)) * sizes[11];
    texture += isample(p+(direction*11)) * sizes[12];
    texture += isample(p-(direction*11)) * sizes[12];
  } else if (kernel == 25) {
    texture = base * sizes[0];
    texture += isample(p+(direction)) * sizes[1];
    texture += isample(p-(direction)) * sizes[1];
    texture += isample(p+(direction*2)) * sizes[2];
    texture += isample(p-(direction*2)) * sizes[2];
    texture += isample(p+(direction*3)) * sizes[3];
    texture += isample(p-(direction*3)) * sizes[3];
    texture += isample(p+(direction*4)) * sizes[4];
    texture += isample(p-(direction*4)) * sizes[4];
    texture += isample(p+(direction*5)) * sizes[5];
    texture += isample(p-(direction*5)) * sizes[5];
    texture += isample(p+(direction*6)) * sizes[6];
    texture += isample(p-(direction*6)) * sizes[6];
    texture += isample(p+(direction*7)) * sizes[7];
    texture += isample(p-(direction*7)) * sizes[7];
    texture += isample(p+(direction*8)) * sizes[9];
    texture += isample(p-(direction*8)) * sizes[9];
    texture += isample(p+(direction*9)) * sizes[10];
    texture += isample(p-(direction*9)) * sizes[10];
    texture += isample(p+(direction*10)) * sizes[11];
    texture += isample(p-(direction*10)) * sizes[11];
    texture += isample(p+(direction*12)) * sizes[13];
    texture += isample(p-(direction*12)) * sizes[13];
  }
  fragmentColor.rgb = vec3(texture);
  if (alphaMode == 0) {
    fragmentColor.a = basea;
  } else if (alphaMode == 1) {
    fragmentColor.a = nlmeans(p);
  } else if (alphaMode == 2) {
    fragmentColor.a = variance(p);
  }
}
