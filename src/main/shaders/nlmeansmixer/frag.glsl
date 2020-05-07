# version 300 es
uniform sampler2D texSampler;
uniform sampler2D lumaSampler;
uniform sampler2D chromaSampler;
uniform ivec2 size;
uniform highp float chromaAmount;
uniform highp float lumaAmount;
uniform highp float desaturate;
uniform highp float darken;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

highp vec3 rgb2hsv(vec3 c)
{
    highp vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    highp vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    highp vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    highp float d = q.x - min(q.w, q.y);
    highp float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

highp vec3 hsv2rgb(vec3 c)
{
    highp vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    highp vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

highp float huediff(float h1, float h2)
{
  highp float diff = abs(h1-h2);
  return min(diff, 1.0-diff);
}

void main(void) {
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec4 color = texelFetch(texSampler, p, 0);
  highp vec3 hsvColor = rgb2hsv(color.rgb);
  highp vec3 hsvChroma = rgb2hsv(mix(color.rgb, texelFetch(chromaSampler, p, 0).rgb, chromaAmount));
  highp vec3 hsvLuma = rgb2hsv(texelFetch(lumaSampler, p, 0).rgb);

  highp float hd = max(huediff(hsvColor.g, hsvChroma.g),huediff(hsvColor.g, hsvLuma.g));

  fragmentColor.rgb = hsv2rgb(vec3(
    hsvChroma.r,
    mix(hsvColor.g, hsvChroma.g, chromaAmount)-clamp(hd*desaturate, 0.0, 1.0),
    mix(hsvColor.b, hsvLuma.b , lumaAmount)-clamp(hd*darken, 0.0, 1.0)
  ));
  fragmentColor.a = color.a;
}
