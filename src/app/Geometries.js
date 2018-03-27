
export default class Geometries {

    static drawBufferGeometry(gl, points) {
            return gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(points),
                gl.STATIC_DRAW);
        }

    static drawRectangle(gl, x, y, width, height) {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;
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
}