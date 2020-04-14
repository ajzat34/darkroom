#version 100
attribute vec4 aVertex;
attribute vec2 aTextureCoord;

varying lowp vec2 textureCoord;

void main(void) {
  gl_Position = aVertex;
  textureCoord = aTextureCoord;
}
