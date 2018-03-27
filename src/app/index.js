"use strict";

import Geometries from "./Geometries"
import M3 from './M3'
import M4 from './M4'

const glslify = require('glslify')
import * as webglUtils from './utils/webgl-utils'
import * as webglHelpers from './utils/webgl-helpers'

// Get the strings for our GLSL shaders
const vertexShaderSource = glslify('./shaders/3d-vertex-shader.vert');
const fragmentShaderSource = glslify('./shaders/3d-fragment-shader.frag');


function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
        return shader
    }

    console.log(gl.getShaderInfoLog(shader));

    gl.deleteShader(shader);
}

function printSineAndCosineForAnAngle(angleInDegrees) {
    var angleInRadians = angleInDegrees * Math.PI / 180;
    var s = Math.sin(angleInRadians);
    var c = Math.cos(angleInRadians);
    console.log("s = " + s + " c = " + c);
}

function createProgram(gl, vertexShader, fragmentShader) {

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
        return program;
    }

    gl.deleteProgram(program);
}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}



const letterPoints = [
    // left column front
    0,   0,  0,
    30,   0,  0,
    0, 150,  0,
    0, 150,  0,
    30,   0,  0,
    30, 150,  0,

    // top rung front
    30,   0,  0,
    100,   0,  0,
    30,  30,  0,
    30,  30,  0,
    100,   0,  0,
    100,  30,  0,

    // middle rung front
    30,  60,  0,
    67,  60,  0,
    30,  90,  0,
    30,  90,  0,
    67,  60,  0,
    67,  90,  0,

    // left column back
    0,   0,  30,
    30,   0,  30,
    0, 150,  30,
    0, 150,  30,
    30,   0,  30,
    30, 150,  30,

    // top rung back
    30,   0,  30,
    100,   0,  30,
    30,  30,  30,
    30,  30,  30,
    100,   0,  30,
    100,  30,  30,

    // middle rung back
    30,  60,  30,
    67,  60,  30,
    30,  90,  30,
    30,  90,  30,
    67,  60,  30,
    67,  90,  30,

    // top
    0,   0,   0,
    100,   0,   0,
    100,   0,  30,
    0,   0,   0,
    100,   0,  30,
    0,   0,  30,

    // top rung right
    100,   0,   0,
    100,  30,   0,
    100,  30,  30,
    100,   0,   0,
    100,  30,  30,
    100,   0,  30,

    // under top rung
    30,   30,   0,
    30,   30,  30,
    100,  30,  30,
    30,   30,   0,
    100,  30,  30,
    100,  30,   0,

    // between top rung and middle
    30,   30,   0,
    30,   30,  30,
    30,   60,  30,
    30,   30,   0,
    30,   60,  30,
    30,   60,   0,

    // top of middle rung
    30,   60,   0,
    30,   60,  30,
    67,   60,  30,
    30,   60,   0,
    67,   60,  30,
    67,   60,   0,

    // right of middle rung
    67,   60,   0,
    67,   60,  30,
    67,   90,  30,
    67,   60,   0,
    67,   90,  30,
    67,   90,   0,

    // bottom of middle rung.
    30,   90,   0,
    30,   90,  30,
    67,   90,  30,
    30,   90,   0,
    67,   90,  30,
    67,   90,   0,

    // right of bottom
    30,   90,   0,
    30,   90,  30,
    30,  150,  30,
    30,   90,   0,
    30,  150,  30,
    30,  150,   0,

    // bottom
    0,   150,   0,
    0,   150,  30,
    30,  150,  30,
    0,   150,   0,
    30,  150,  30,
    30,  150,   0,

    // left side
    0,   0,   0,
    0,   0,  30,
    0, 150,  30,
    0,   0,   0,
    0, 150,  30,
    0, 150,   0
]


function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}


function main() {
    // Get A WebGL context
    const canvas = document.getElementById("c");

    const gl = canvas.getContext("webgl");

    if (!gl) {
        return;
    }

    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    const program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // Create a buffer and put three 2d clip space points in it
    const positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Put geometry data into buffer
    Geometries.drawBufferGeometry(gl, letterPoints);

    const translation = [45, 150, 0];
    const scale = [2,2,2]
    const color = [Math.random(), Math.random(), Math.random(), 1];
    const rotation = [degToRad(40), degToRad(15), degToRad(325)]

    // Define uniforms
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");



    const drawScene = (() => {

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Attributes
        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)


        // Send uniforms to shader
        //gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform4fv(colorUniformLocation, color);


        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 3;          // 3 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        // draw
        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        const count = 16 * 6;


        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset)


        let matrix = M4.projection(
            gl.canvas.clientWidth, gl.canvas.clientHeight, 400);

        matrix = M4.translate(matrix, translation[0], translation[1], translation[2])
        matrix = M4.xRotate(matrix, rotation[0])
        matrix = M4.yRotate(matrix, rotation[1])
        matrix = M4.zRotate(matrix, rotation[2])
        matrix = M4.scale(matrix, scale[0], scale[1], scale[2])


        gl.uniformMatrix4fv(matrixLocation, false, matrix)


        gl.drawArrays(primitiveType, offset, count);


    })();




}

main();