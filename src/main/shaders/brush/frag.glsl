#version 300 es
uniform sampler2D brushSampler;
uniform highp float value; // 0-1 grayscale brush color
uniform highp float hardness; // 1 - +inf, brush hardness
uniform highp float opacity; // 0-1, opacity

in highp vec2 textureCoord;
in highp vec2 vertCoord;

out highp vec4 fragmentColor;

void main(void) {
  // brush images are sampled from the red channel only
  // the brush calculation uses clipping to harden the brush edge in real time
  fragmentColor = vec4(value,0,0, clamp(texture(brushSampler, textureCoord).r * hardness, 0.0, 1.0) * opacity);
}
