#version 300 es
in vec4 aVertex;
in vec2 aTextureCoord;

out lowp vec2 textureCoord;

void main(void) {
  gl_Position = aVertex;
  textureCoord = aTextureCoord;
}
