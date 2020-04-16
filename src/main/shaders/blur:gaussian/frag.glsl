# version 300 es
uniform sampler2D texSampler;
uniform highp float sizes[8]; // up to 8 normalcdf samples
uniform highp int kernel; // kernel size
uniform lowp int mode; // 0 = horizontal, 1 = vertial
uniform lowp int alphaMode; // 1 = variance be mapped to alpha, 2 = first pass of alpha smooth
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

void main(void) {
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp ivec2 direction;
  highp vec4 texture;
  highp vec4 base = texelFetch(texSampler, p, 0);
  if (mode == 0) {
    // horizontal blur
    if (p.x == 0 || p.x == size.x-1){
      direction = ivec2(1,0);
    } else {
      direction = ivec2(1,0);
    }
  } else {
    // vertical blur
    if (p.y == 0 || p.y == size.y-1){
      direction = ivec2(0,1);
    } else {
      direction = ivec2(0,1);
    }
  }

  if (kernel == 3) {
    texture = base * sizes[0];
    texture += texelFetch(texSampler, p+(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p-(direction), 0) * sizes[1];
  }
  else if (kernel == 5) {
    texture = base * sizes[0];
    texture += texelFetch(texSampler, p+(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p-(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p+(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p-(direction*2), 0) * sizes[2];
  }
  else if (kernel == 7) {
    texture = base * sizes[0];
    texture += texelFetch(texSampler, p+(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p-(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p+(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p-(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p+(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p-(direction*3), 0) * sizes[3];
  }
  else if (kernel == 9) {
    texture = base * sizes[0];
    texture += texelFetch(texSampler, p+(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p-(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p+(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p-(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p+(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p-(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p+(direction*4), 0) * sizes[4];
    texture += texelFetch(texSampler, p-(direction*4), 0) * sizes[4];
  }
  else if (kernel == 11) {
    texture = base * sizes[0];
    texture += texelFetch(texSampler, p+(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p-(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p+(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p-(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p+(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p-(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p+(direction*4), 0) * sizes[4];
    texture += texelFetch(texSampler, p-(direction*4), 0) * sizes[4];
    texture += texelFetch(texSampler, p+(direction*5), 0) * sizes[5];
    texture += texelFetch(texSampler, p-(direction*5), 0) * sizes[5];
  }
  else if (kernel == 13) {
    texture = base * sizes[0];
    texture += texelFetch(texSampler, p+(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p-(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p+(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p-(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p+(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p-(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p+(direction*4), 0) * sizes[4];
    texture += texelFetch(texSampler, p-(direction*4), 0) * sizes[4];
    texture += texelFetch(texSampler, p+(direction*5), 0) * sizes[5];
    texture += texelFetch(texSampler, p-(direction*5), 0) * sizes[5];
    texture += texelFetch(texSampler, p+(direction*6), 0) * sizes[6];
    texture += texelFetch(texSampler, p-(direction*6), 0) * sizes[6];
  }
  else if (kernel == 15) {
    texture = base * sizes[0];
    texture += texelFetch(texSampler, p+(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p-(direction), 0) * sizes[1];
    texture += texelFetch(texSampler, p+(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p-(direction*2), 0) * sizes[2];
    texture += texelFetch(texSampler, p+(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p-(direction*3), 0) * sizes[3];
    texture += texelFetch(texSampler, p+(direction*4), 0) * sizes[4];
    texture += texelFetch(texSampler, p-(direction*4), 0) * sizes[4];
    texture += texelFetch(texSampler, p+(direction*5), 0) * sizes[5];
    texture += texelFetch(texSampler, p-(direction*5), 0) * sizes[5];
    texture += texelFetch(texSampler, p+(direction*6), 0) * sizes[6];
    texture += texelFetch(texSampler, p-(direction*6), 0) * sizes[6];
    texture += texelFetch(texSampler, p+(direction*7), 0) * sizes[7];
    texture += texelFetch(texSampler, p-(direction*7), 0) * sizes[7];
  }
  fragmentColor = texture;
}
