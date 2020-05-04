# version 300 es
uniform sampler2D texSampler;
uniform ivec2 size;

in highp vec2 textureCoord;
out highp vec4 fragmentColor;

void main(void) {
  fragmentColor = texelFetch(texSampler, ivec2(int(textureCoord.x * float(size.x)), int(textureCoord.y * float(size.y))), 0);
}
