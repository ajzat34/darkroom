# version 300 es
  // generated by OpenDarkroom/tools/nlmeans
  // impliments fast nlmeans filter in glsl
  uniform sampler2D texSampler;
  uniform ivec2 size;
  uniform sampler2D weights;
  in highp vec2 textureCoord;
  out highp vec4 fragmentColor;
  void main(void){
 highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
 highp vec3 acc = vec3(0.0);
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-32, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(8,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-31, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-30, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-29, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-28, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-27, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-26, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-25, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-24, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-23, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-22, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-21, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-20, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-19, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-18, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-17, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-16, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-15, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-14, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-13, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-12, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-11, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-10, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-9, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-8, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-7, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-6, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-5, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-4, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-3, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(0,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-2, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(0,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+-1, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(0,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+0, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(0,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+1, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(0,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+2, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(0,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+3, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(0,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+4, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+5, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+6, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+7, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(1,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+8, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+9, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+10, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+11, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(2,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+12, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+13, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+14, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+15, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(3,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+16, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+17, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+18, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+19, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(4,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+20, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+21, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+22, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+23, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(5,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+24, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+25, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+26, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+27, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(6,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+28, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).r;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+29, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).g;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+30, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).b;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+31, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(7,0), 0).a;
 acc+= texelFetch(texSampler, ivec2(clamp(p.x+32, 0, size.x-1), clamp(p.y, 0, size.y-1)), 0).rgb * texelFetch(weights, ivec2(8,0), 0).r;

  fragmentColor.rgb = acc;
  fragmentColor.a  = 1.0;}