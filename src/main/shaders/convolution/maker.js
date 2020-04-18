// this script genorates frag.glsl

console.log(`
# version 300 es
uniform sampler2D texSampler;
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
  return vec3(texelFetch(texSampler, ivec2(clamp(s.x, 0, size.x), clamp(s.y, 0, size.y)), 0));
}

void main (void) {
  // get the center texel coord
  highp ivec2 p = ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y)));

  highp vec3 acc = vec3(0.0);
`)

new Array(3,5,7,9).forEach((kernel, i) => {
  if (i !== 0) {
    console.log(` else if (ksize == ${kernel}) {`)
  } else {
    console.log(` if (ksize == ${kernel}) {`)
  }
  var n = (kernel-1)/2
  var i = 0
  for (y = n; y >= -n; y--) {
    for (x = -n; x <= n; x++) {
      console.log(`   acc += csample(p+ivec2(${x},${y})) * weights[${i}];`)
      i++
    }
  }
  console.log(`}`)
});

console.log(`
  fragmentColor = vec4(acc.rgb, 1.0);
}
`)
