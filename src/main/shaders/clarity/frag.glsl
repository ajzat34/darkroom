# version 300 es
uniform sampler2D texSampler;
uniform sampler2D blurSampler;
uniform ivec2 size;
uniform highp float amount;
in highp vec2 textureCoord;
out highp vec4 fragmentColor;

void main(void){
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 color = texelFetch(texSampler, p, 0);
  highp vec3 blur = texelFetch(blurSampler, p, 0).rgb;

  fragmentColor.rgb = mix(color.rgb, color.rgb-(blur-color.rgb), amount);
  fragmentColor.a  = color.a;
}
