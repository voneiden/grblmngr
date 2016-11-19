// From jsperf https://jsperf.com/cloning-an-object/143/

export default class Clone {
    static deep(obj) {
        if (obj === null || typeof obj !== 'object')
            return obj;
        var target = obj instanceof Array ? [] : {};
        for (var i in obj) {
            target[i] = Clone.deep(obj[i]);
        }
        return target;
    }
}