#version 300 es
uniform sampler2D brushSampler;
uniform highp float value;

in highp vec2 textureCoord;
in highp vec2 vertCoord;

out highp vec4 fragmentColor;

void main(void) {
  fragmentColor = vec4(value,0,0, texture(brushSampler, textureCoord).r);
}
