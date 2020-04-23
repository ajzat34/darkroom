#version 300 es
in vec4 aVertex;
in vec2 aTextureCoord;

out highp vec2 textureCoord;
out highp vec2 vertCoord;

uniform mat4 transform;

void main(void) {
  gl_Position =  transform * aVertex;
  textureCoord = aTextureCoord;
}
