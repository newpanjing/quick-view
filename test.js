/**
 * w1在w2中按比例缩放
 * @param w1
 * @param h1
 * @param w2
 * @param h2
 */
function scale(w1, h1, w2, h2) {

    var v1 = w1 / w2;
    var v2 = h1 / h2;
    var r1 = w1, r2 = h1;

    if (w1 > w2) {
        r1 = w2;
        r2 = (w2 / w1) * h1;
        if (r2 > h2) {
            r2 = h2;
            r1 = (h2 / h1) * w1;
        }
    }

    if (h1 > h2) {
        r2 = h2;
        r1 = (h2 / h1) * w1;
        if (r1 > w2) {
            r1 = w2;
            r2 = (h2 / h1) * w1;
        }
    }

    return {
        width: r1,
        height: r2
    }
}

r = scale(300, 600, 800, 500);
console.log(r)