"use strict";

const glslify = require('glslify')
import * as webglUtils from './utils/webgl-utils'
import * as webglHelpers from './utils/webgl-helpers'

// Get the strings for our GLSL shaders
var vertexShaderSource = glslify('./shaders/2d-vertex-shader.vert');
var fragmentShaderSource = glslify('./shaders/2d-fragment-shader.frag');

console.log(vertexShaderSource)

var translation = [0, 0];
var width = 100;
var height = 30;

function createShader(gl, type, source) {

    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
        return shader
    }

    console.log(gl.getShaderInfoLog(shader));

    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));

    gl.deleteProgram(program);
}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]),
        gl.STATIC_DRAW);
}


function main() {
    // Get A WebGL context
    var canvas = document.getElementById("c");

    var gl = canvas.getContext("webgl");

    if (!gl) {
        return;
    }

    // create GLSL shaders, upload the GLSL source, compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    var program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = [
        10, 40,
        180, 40,
        10, 30,
        10, 30,
        180, 40,
        180, 30,
    ];

    var translation = [0, 0];
    var width = 100;
    var height = 30;


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // code above this line is initialization code.
    // code below this line is rendering code.

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    var translation = [0, 0];

    // Uniforms
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    const translateUniformLocation = gl.getUniformLocation(program, "u_translation");
    gl.uniform2f(translateUniformLocation, translation[0], translation[1]);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Attributes
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset)

    // draw
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;

    for (var ii = 0; ii < 50; ++ii) {
        var color = [Math.random(), Math.random(), Math.random(), 1];
        gl.uniform4fv(colorUniformLocation, color);
        setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300))
        gl.drawArrays(primitiveType, offset, count);
    }


}

main();