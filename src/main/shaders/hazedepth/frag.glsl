# version 300 es
uniform sampler2D texSampler;

uniform ivec2 size;
uniform bool vis;
uniform highp float amount;
uniform highp float ambient;
uniform highp float dark;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

// clamp sample texel
highp vec4 csample(ivec2 s)
{
  return texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x-1), clamp(s.y, 0, size.y-1)), 0);
}

highp float minc(ivec2 p) {
  highp vec4 color = csample(p);
  return min(min(color.r, color.g),color.b);
}

void main (void) {
  // get the center texel coord
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 color = csample(p);
  highp float avg = dot(color.rgb, vec3(0.333333333333333,0.333333333333333,0.333333333333333));

  highp float t = 1.0;
  t = min(t, minc(p+ivec2(-2,2)));
  t = min(t, minc(p+ivec2(-1,2)));
  t = min(t, minc(p+ivec2( 0,2)));
  t = min(t, minc(p+ivec2( 1,2)));
  t = min(t, minc(p+ivec2( 2,2)));

  t = min(t, minc(p+ivec2(-2,1)));
  t = min(t, minc(p+ivec2(-1,1)));
  t = min(t, minc(p+ivec2( 0,1)));
  t = min(t, minc(p+ivec2( 1,1)));
  t = min(t, minc(p+ivec2( 2,1)));

  t = min(t, minc(p+ivec2(-2,0)));
  t = min(t, minc(p+ivec2(-1,0)));
  t = min(t, minc(p+ivec2( 0,0)));
  t = min(t, minc(p+ivec2( 1,0)));
  t = min(t, minc(p+ivec2( 2,0)));

  t = min(t, minc(p+ivec2(-2,-1)));
  t = min(t, minc(p+ivec2(-1,-1)));
  t = min(t, minc(p+ivec2( 0,-1)));
  t = min(t, minc(p+ivec2( 1,-1)));
  t = min(t, minc(p+ivec2( 2,-1)));

  t = min(t, minc(p+ivec2(-2,-2)));
  t = min(t, minc(p+ivec2(-1,-2)));
  t = min(t, minc(p+ivec2( 0,-2)));
  t = min(t, minc(p+ivec2( 1,-2)));
  t = min(t, minc(p+ivec2( 2,-2)));

  t = 1.0-t;

  if (vis) {
    fragmentColor.rgb = vec3(t);
  } else {
    fragmentColor.rgb = mix(color.rgb, ((color.rgb-(ambient*(1.0-t)))/t)-(amount-dark), amount);
  }
  fragmentColor.a = color.a;
}
