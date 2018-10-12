/** ThreeJS based thinplates
 * Original implementation for Sylvester by GMTurbo thinplates
 * https://github.com/GMTurbo/tps
 * https://github.com/GMTurbo/tps/blob/master/thinplate.js
 */
import {matrix as Matrix, transpose, inv as inverse, multiply, distance} from 'mathjs';



class Thinplates {
    static kernel(v1, v2) {
        const d = distance(v1, v2);
        if (d) {
            return Math.pow(d, 2) * Math.log(d);

        }
        return 0;
    }
    
    static solve(b, x) {
        let X = Matrix(x);
        let B = Matrix(b);
        X = inverse(X);
        return multiply(X, B);
    }

    constructor(fitpoints, Zs) {
        if (!fitpoints.every((fitpoint) => fitpoint.length === fitpoints[0].length)) {
            throw "All array items must be same length"
        }
        this.fitpoints = fitpoints;

        const matrix = [];
        const P = [];

        for (let i = 0; i < fitpoints.length; i++) {
            const fitpoint = fitpoints[i];
            const matRow = [];
            const pRow = [1, fitpoint[0], fitpoint[1]];
            for (let j = 0; j < fitpoints.length; j++) {
                matRow.push(Thinplates.kernel(fitpoint, fitpoints[j]))
            }
            P.push(pRow);
            matrix.push(matRow.concat(pRow));
        }
        const pT = transpose(Matrix(P));
        const newRows = pT._data.map((row) => {
            for (let i = row.length; i < matrix[0].length; i++) {
                row.push(0);
            }
            return row;
        });
        for (let i = 0; i < newRows.length; i++) {
            matrix.push(newRows[i]);
            Zs.push(0);
        }
        this.ws = Thinplates.solve(Zs, matrix);
    }

    getZ(point) {
        let result = 0;
        for (let i=0; i < this.fitpoints.length; i++) {
            result += this.ws._data[i] * Thinplates.kernel(point, this.fitpoints[i]);
        }
        result += this.ws._data[this.fitpoints.length];
        for (let i=0; i < point.length; i++) {
            result += point[i] * this.ws._data[this.fitpoints.length + i + 1];
        }
        return result;
    }
}
export default Thinplates;