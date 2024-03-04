// enum

/**
 * Define an enum type. <br/>
 * If a enum item has a value of -999, it will be given an Integer number according to it's order in the list.<br/>
 */
cc.Enum = function (obj) {
    if ('__enums__' in obj) {
        return obj;
    }
    cc.js.value(obj, '__enums__', null, true);

    var lastIndex = -1;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = obj[key];

        if (val === -999) {
            val = ++lastIndex;
            obj[key] = val;
        }
        else {
            if (typeof val === 'number') {
                lastIndex = val;
            }
            else if (typeof val === 'string' && Number.isInteger(parseFloat(key))) {
                continue;
            }
        }

        var reverseKey = '' + val;
        if (key !== reverseKey) {
            if ((CC_EDITOR || CC_TEST) && reverseKey in obj && obj[reverseKey] !== key) {
                cc.errorID(7100, reverseKey);
                continue;
            }
            cc.js.value(obj, reverseKey, key);
        }
    }

    return obj;
};

cc.Enum.isEnum = function (enumType) {
    return enumType && enumType.hasOwnProperty('__enums__');
};

/**
 * @method getList
 * @param {Object} enumDef - the enum type defined from cc.Enum
 * @return {Object[]}
 * @private
 */
cc.Enum.getList = function (enumDef) {
    if (enumDef.__enums__)
        return enumDef.__enums__;

    var enums = enumDef.__enums__ = [];
    for (var name in enumDef) {
        var value = enumDef[name];
        if (Number.isInteger(value)) {
            var object = { name: name, value: value }
            enums.push(object);
        }
    }
    enums.sort(function (a, b) { return a.value - b.value; });
    return enums;
};

if (CC_DEV) {
    // check key order in object literal
    var _TestEnum = cc.Enum({
        NODE: -1,
        ZERO: 0,
        ONE: 1,
        TWO: 2,
        THREE: 3
    });
    if (_TestEnum.NODE !== -1 || _TestEnum.ZERO !== 0 || _TestEnum.ONE !== 1 || _TestEnum.THREE !== 3) {
        cc.errorID(7101);
    }
}