# version 300 es
uniform sampler2D texSampler;
uniform sampler2D maskSampler;
// size of the kernal
uniform mediump int ksize;
// max 80 weights = max kernel size of 9x9
uniform highp float weights[81];

uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

// clamp sample texel
highp vec3 csample(ivec2 s)
{
  return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x), clamp(s.y, 0, size.y)), 0).rgb;
}

void main (void) {
  // get the center texel coord
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp float mask = texelFetch(maskSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0).r;

  highp vec3 acc = vec3(0.0);

 if (ksize == 3) {
   acc += csample(p+ivec2(-1,1)) * weights[0];
   acc += csample(p+ivec2(0,1)) * weights[1];
   acc += csample(p+ivec2(1,1)) * weights[2];
   acc += csample(p+ivec2(-1,0)) * weights[3];
   acc += csample(p+ivec2(0,0)) * weights[4];
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
   acc += csample(p+ivec2(0,0)) * weights[12];
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
   acc += csample(p+ivec2(0,0)) * weights[24];
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
 else if (ksize == 9) {
   acc += csample(p+ivec2(-4,4)) * weights[0];
   acc += csample(p+ivec2(-3,4)) * weights[1];
   acc += csample(p+ivec2(-2,4)) * weights[2];
   acc += csample(p+ivec2(-1,4)) * weights[3];
   acc += csample(p+ivec2(0,4)) * weights[4];
   acc += csample(p+ivec2(1,4)) * weights[5];
   acc += csample(p+ivec2(2,4)) * weights[6];
   acc += csample(p+ivec2(3,4)) * weights[7];
   acc += csample(p+ivec2(4,4)) * weights[8];
   acc += csample(p+ivec2(-4,3)) * weights[9];
   acc += csample(p+ivec2(-3,3)) * weights[10];
   acc += csample(p+ivec2(-2,3)) * weights[11];
   acc += csample(p+ivec2(-1,3)) * weights[12];
   acc += csample(p+ivec2(0,3)) * weights[13];
   acc += csample(p+ivec2(1,3)) * weights[14];
   acc += csample(p+ivec2(2,3)) * weights[15];
   acc += csample(p+ivec2(3,3)) * weights[16];
   acc += csample(p+ivec2(4,3)) * weights[17];
   acc += csample(p+ivec2(-4,2)) * weights[18];
   acc += csample(p+ivec2(-3,2)) * weights[19];
   acc += csample(p+ivec2(-2,2)) * weights[20];
   acc += csample(p+ivec2(-1,2)) * weights[21];
   acc += csample(p+ivec2(0,2)) * weights[22];
   acc += csample(p+ivec2(1,2)) * weights[23];
   acc += csample(p+ivec2(2,2)) * weights[24];
   acc += csample(p+ivec2(3,2)) * weights[25];
   acc += csample(p+ivec2(4,2)) * weights[26];
   acc += csample(p+ivec2(-4,1)) * weights[27];
   acc += csample(p+ivec2(-3,1)) * weights[28];
   acc += csample(p+ivec2(-2,1)) * weights[29];
   acc += csample(p+ivec2(-1,1)) * weights[30];
   acc += csample(p+ivec2(0,1)) * weights[31];
   acc += csample(p+ivec2(1,1)) * weights[32];
   acc += csample(p+ivec2(2,1)) * weights[33];
   acc += csample(p+ivec2(3,1)) * weights[34];
   acc += csample(p+ivec2(4,1)) * weights[35];
   acc += csample(p+ivec2(-4,0)) * weights[36];
   acc += csample(p+ivec2(-3,0)) * weights[37];
   acc += csample(p+ivec2(-2,0)) * weights[38];
   acc += csample(p+ivec2(-1,0)) * weights[39];
   acc += csample(p+ivec2(0,0)) * weights[40];
   acc += csample(p+ivec2(1,0)) * weights[41];
   acc += csample(p+ivec2(2,0)) * weights[42];
   acc += csample(p+ivec2(3,0)) * weights[43];
   acc += csample(p+ivec2(4,0)) * weights[44];
   acc += csample(p+ivec2(-4,-1)) * weights[45];
   acc += csample(p+ivec2(-3,-1)) * weights[46];
   acc += csample(p+ivec2(-2,-1)) * weights[47];
   acc += csample(p+ivec2(-1,-1)) * weights[48];
   acc += csample(p+ivec2(0,-1)) * weights[49];
   acc += csample(p+ivec2(1,-1)) * weights[50];
   acc += csample(p+ivec2(2,-1)) * weights[51];
   acc += csample(p+ivec2(3,-1)) * weights[52];
   acc += csample(p+ivec2(4,-1)) * weights[53];
   acc += csample(p+ivec2(-4,-2)) * weights[54];
   acc += csample(p+ivec2(-3,-2)) * weights[55];
   acc += csample(p+ivec2(-2,-2)) * weights[56];
   acc += csample(p+ivec2(-1,-2)) * weights[57];
   acc += csample(p+ivec2(0,-2)) * weights[58];
   acc += csample(p+ivec2(1,-2)) * weights[59];
   acc += csample(p+ivec2(2,-2)) * weights[60];
   acc += csample(p+ivec2(3,-2)) * weights[61];
   acc += csample(p+ivec2(4,-2)) * weights[62];
   acc += csample(p+ivec2(-4,-3)) * weights[63];
   acc += csample(p+ivec2(-3,-3)) * weights[64];
   acc += csample(p+ivec2(-2,-3)) * weights[65];
   acc += csample(p+ivec2(-1,-3)) * weights[66];
   acc += csample(p+ivec2(0,-3)) * weights[67];
   acc += csample(p+ivec2(1,-3)) * weights[68];
   acc += csample(p+ivec2(2,-3)) * weights[69];
   acc += csample(p+ivec2(3,-3)) * weights[70];
   acc += csample(p+ivec2(4,-3)) * weights[71];
   acc += csample(p+ivec2(-4,-4)) * weights[72];
   acc += csample(p+ivec2(-3,-4)) * weights[73];
   acc += csample(p+ivec2(-2,-4)) * weights[74];
   acc += csample(p+ivec2(-1,-4)) * weights[75];
   acc += csample(p+ivec2(0,-4)) * weights[76];
   acc += csample(p+ivec2(1,-4)) * weights[77];
   acc += csample(p+ivec2(2,-4)) * weights[78];
   acc += csample(p+ivec2(3,-4)) * weights[79];
   acc += csample(p+ivec2(4,-4)) * weights[80];
}

  fragmentColor = vec4((acc.rgb*mask)  + (csample(p)*(1.0-mask)), 1.0);
}
