# version 300 es
uniform sampler2D texSampler;
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

highp vec3 rgb2hsv(vec4 c)
{
    highp vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    highp vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    highp vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    highp float d = q.x - min(q.w, q.y);
    highp float e = 1.0e-10;
    return vec3( abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x );
}

void main(void) {
  highp ivec2 t = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));
  highp vec3 sum = vec3(1.0, 0.2, 1.0);
  highp float p[13];
  p[0] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x, t.y), 0)), sum);
  p[1] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x+1, t.y), 0)), sum);
  p[2] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x, t.y+1), 0)), sum);
  p[3] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x-1, t.y), 0)), sum);
  p[4] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x, t.y-1), 0)), sum);

  p[5] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x+1, t.y+1), 0)), sum);
  p[6] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x-1, t.y+1), 0)), sum);
  p[7] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x+1, t.y-1), 0)), sum);
  p[8] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x-1, t.y-1), 0)), sum);

  p[9] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x+2, t.y), 0)), sum);
  p[10] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x, t.y+2), 0)), sum);
  p[11] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x-2, t.y), 0)), sum);
  p[12] = dot(rgb2hsv(texelFetch(texSampler, ivec2(t.x, t.y-2), 0)), sum);

  // caclulate the mean
  highp float mean = ((p[0]+p[1]+p[2]+p[3]+p[4]+p[5]+p[6]+p[7]+p[8]+p[9]+p[10]+p[11]+p[12]) / 13.0);

  // calculate the standard deviation
  highp float acc = 0.0;
  highp float diff = 0.0;
  for (int i = 0; i <= 13; i++) {
    diff = p[i]-mean;
    acc += diff*diff;
  }
  highp float stdev = pow(acc, 0.33);

  fragmentColor.a = (stdev);
}
