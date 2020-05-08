# version 300 es
  // generated by OpenDarkroom/tools/nlmeans
  // impliments fast nlmeans filter in glsl
  uniform sampler2D texSampler;
  uniform ivec2 size;
  uniform highp float weights[25];
  in highp vec2 textureCoord;
  out highp vec4 fragmentColor;
  void main(void){
 highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
 highp vec3 acc = vec3(0.0);
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-24, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[24];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-23, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[23];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-22, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[22];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-21, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[21];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-20, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[20];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-19, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[19];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-18, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[18];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-17, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[17];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-16, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[16];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-15, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[15];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-14, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[14];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-13, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[13];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-12, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[12];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-11, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[11];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-10, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[10];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-9, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[9];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-8, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[8];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-7, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[7];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-6, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[6];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-5, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[5];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-4, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[4];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-3, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[3];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-2, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[2];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-1, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[1];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+0, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[0];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+1, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[1];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+2, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[2];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+3, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[3];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+4, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[4];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+5, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[5];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+6, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[6];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+7, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[7];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+8, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[8];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+9, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[9];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+10, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[10];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+11, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[11];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+12, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[12];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+13, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[13];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+14, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[14];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+15, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[15];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+16, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[16];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+17, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[17];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+18, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[18];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+19, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[19];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+20, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[20];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+21, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[21];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+22, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[22];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+23, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[23];
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+24, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * weights[24];

  fragmentColor.rgb = acc;
  fragmentColor.a  = 1.0;}
