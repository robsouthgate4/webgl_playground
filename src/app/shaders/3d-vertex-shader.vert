// an attribute will receive data from a buffer
attribute vec4 a_position;
uniform vec2 u_translation;
uniform vec2 u_scale;
uniform vec2 u_rotation;
uniform mat4 u_matrix;

void main() {
    // is responsible for setting
    gl_Position = u_matrix * a_position;

}