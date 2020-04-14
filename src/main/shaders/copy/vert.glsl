#version 100
attribute vec4 aVertex;
attribute vec2 aTextureCoord;

varying highp vec2 textureCoord;

uniform mat4 transform;

void main(void) {
  gl_Position = transform * aVertex;
  textureCoord = aTextureCoord;
}
