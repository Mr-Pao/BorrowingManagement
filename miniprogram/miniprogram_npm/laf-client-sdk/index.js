module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1691414667943, function(require, module, exports) {

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * set `globalThis` trickily
 */
((t) => {
    function setGlobalThis() {
        const globalObj = this;
        globalObj.globalThis = globalObj;
        // @ts-ignore
        delete t.prototype._T_;
    }
    ;
    if (typeof globalThis !== "object") {
        if (this) {
            setGlobalThis();
        }
        else {
            Object.defineProperty(t.prototype, "_T_", {
                configurable: true,
                get: setGlobalThis,
            });
            // @ts-ignore
            _T_;
        }
    }
})(Object);
/**
 * hack `process` missing for wechat miniprogram
 */
if (globalThis.wx && !globalThis.process) {
    globalThis.process = {
        env: {}
    };
    console.info('hacked for `process` missing for wechat miniprogram');
}
const cloud_1 = require("./cloud");
exports.Cloud = cloud_1.Cloud;
exports.Db = cloud_1.Db;
__export(require("./request"));
__export(require("./types"));
function init(config) {
    return new cloud_1.Cloud(config);
}
exports.init = init;
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./cloud":1691414667944,"./request":1691414667950,"./types":1691414667946}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1691414667944, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const database_ql_1 = require("database-ql");
exports.Db = database_ql_1.Db;
const request_1 = require("./request/request");
exports.Request = request_1.Request;
const request_uni_1 = require("./request/request-uni");
const request_wxmp_1 = require("./request/request-wxmp");
const request_taro_1 = require("./request/request-taro");
const types_1 = require("./types");
/**
 * class Cloud provide the interface to request cloud function and cloud database.
 */
class Cloud {
    /**
     * Create a cloud instance
     * @param config
     */
    constructor(config) {
        const warningFunc = () => {
            console.warn("WARNING: no getAccessToken set for db proxy request");
            return "";
        };
        this.config = {
            baseUrl: config.baseUrl,
            dbProxyUrl: config.dbProxyUrl,
            getAccessToken: (config === null || config === void 0 ? void 0 : config.getAccessToken) || warningFunc,
            environment: (config === null || config === void 0 ? void 0 : config.environment) || types_1.EnvironmentType.H5,
            primaryKey: config === null || config === void 0 ? void 0 : config.primaryKey,
            timeout: config === null || config === void 0 ? void 0 : config.timeout,
            headers: config === null || config === void 0 ? void 0 : config.headers,
            requestClass: config === null || config === void 0 ? void 0 : config.requestClass,
        };
        const reqClass = this.requestClass;
        this._request = new reqClass(this.config);
    }
    /**
     * request class by environment
     */
    get requestClass() {
        var _a, _b, _c;
        const env = (_a = this.config) === null || _a === void 0 ? void 0 : _a.environment;
        let ret = request_1.Request;
        if ((_b = this.config) === null || _b === void 0 ? void 0 : _b.requestClass) {
            ret = (_c = this.config) === null || _c === void 0 ? void 0 : _c.requestClass;
        }
        else if (env === types_1.EnvironmentType.UNI_APP) {
            const { uniPlatform } = uni.getSystemInfoSync();
            if (uniPlatform == 'mp-weixin') {
                ret = request_wxmp_1.WxmpRequest;
            }
            else {
                ret = request_uni_1.UniRequest;
            }
        }
        else if (env === types_1.EnvironmentType.WX_MP) {
            ret = request_wxmp_1.WxmpRequest;
        }
        else if (env === types_1.EnvironmentType.TARO) {
            ret = request_taro_1.TaroRequest;
        }
        else {
            ret = request_1.Request;
        }
        return ret;
    }
    /**
     * Get a cloud database instance
     * @returns
     */
    database() {
        var _a;
        return new database_ql_1.Db({
            request: this._request,
            primaryKey: (_a = this.config) === null || _a === void 0 ? void 0 : _a.primaryKey,
        });
    }
    /**
     * Invoke cloud function by name use POST http method
     * @alias alias of `invoke()` for history reason
     * @param functionName
     * @param data
     * @returns
     */
    async invokeFunction(functionName, data) {
        const url = this.config.baseUrl + `/${functionName}`;
        const res = await this._request.request(url, data);
        return res.data;
    }
    /**
     * Invoke cloud function by name use POST http method
     * @param functionName
     * @param data
     * @returns
     */
    async invoke(functionName, data) {
        return await this.invokeFunction(functionName, data);
    }
}
exports.Cloud = Cloud;
//# sourceMappingURL=cloud.js.map
}, function(modId) { var map = {"./request/request":1691414667945,"./request/request-uni":1691414667947,"./request/request-wxmp":1691414667948,"./request/request-taro":1691414667949,"./types":1691414667946}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1691414667945, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const types_1 = require("../types");
/**
 * 默认使用 axios 发送请求，可支持浏览器 和 Node.js 环境，如需支持其它平台，请派生子类并重写 `send()` 方法
 */
class Request {
    constructor(options) {
        this.options = Object.assign({}, options);
        this.options.timeout = (options === null || options === void 0 ? void 0 : options.timeout) || 15000;
    }
    /**
     * 发送 less-api 数据操作请求, 由 `Db` 中调用
     * @param action
     * @param data
     * @returns
     */
    async send(action, data) {
        const params = Object.assign({}, data, {
            action
        });
        const slowQueryWarning = setTimeout(() => {
            console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
        }, 3000);
        try {
            const req_url = this.options.baseUrl + this.options.dbProxyUrl;
            const res = await this.request(req_url, params);
            return res.data;
        }
        finally {
            clearTimeout(slowQueryWarning);
        }
    }
    /**
     * 发出 HTTP 请求，主要于 `less-api` 数据请求和 `less-framework` 云函数调用时使用
     * 默认使用 axios 发送请求，可支持浏览器 和 Node.js 环境，如需支持其它平台，请派生子类并重写本方法
     * @param data
     * @returns
     */
    async request(url, data) {
        if (this.options.environment !== types_1.EnvironmentType.H5) {
            throw new Error('environment type must be h5');
        }
        const token = this.options.getAccessToken();
        const headers = this.getHeaders(token);
        const res = await axios_1.default
            .post(url, data, {
            headers,
            timeout: this.options.timeout,
        });
        return res;
    }
    /**
     * 获取必要的请求头
     * @param token
     * @returns
     */
    getHeaders(token, headers) {
        var _a;
        headers = headers !== null && headers !== void 0 ? headers : { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const optionHeader = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.headers) || {};
        return Object.assign(headers, optionHeader);
    }
}
exports.Request = Request;
//# sourceMappingURL=request.js.map
}, function(modId) { var map = {"../types":1691414667946}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1691414667946, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var EnvironmentType;
(function (EnvironmentType) {
    EnvironmentType["H5"] = "h5";
    EnvironmentType["WX_MP"] = "wxmp";
    EnvironmentType["UNI_APP"] = "uniapp";
    EnvironmentType["TARO"] = "taro";
})(EnvironmentType = exports.EnvironmentType || (exports.EnvironmentType = {}));
//# sourceMappingURL=types.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1691414667947, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
const types_1 = require("../types");
/**
 * Uni-app 环境请求类
 */
class UniRequest extends request_1.Request {
    constructor(config) {
        super(config);
    }
    /**
     * uni-app 环境请求方法
     * @override
     * @param data
     * @returns
     */
    async request(url, data, _options) {
        var _a;
        if (this.options.environment !== types_1.EnvironmentType.UNI_APP) {
            throw new Error('environment type must be uniapp');
        }
        const token = this.options.getAccessToken();
        const header = this.getHeaders(token);
        const options = {
            url,
            header,
            method: (_a = _options === null || _options === void 0 ? void 0 : _options.method) !== null && _a !== void 0 ? _a : 'POST',
            data,
            dataType: 'json'
        };
        const res = await uni.request(options);
        return res;
    }
}
exports.UniRequest = UniRequest;
//# sourceMappingURL=request-uni.js.map
}, function(modId) { var map = {"./request":1691414667945,"../types":1691414667946}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1691414667948, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const request_1 = require("./request");
/**
 * 微信小程序环境请求类
 */
class WxmpRequest extends request_1.Request {
    constructor(config) {
        super(config);
    }
    /**
     * 微信小程序环境请求方法
     * @override
     * @param data
     * @returns
     */
    async request(url, data, _options) {
        var _a;
        if (this.options.environment !== types_1.EnvironmentType.WX_MP) {
            throw new Error('environment type must be wxmp');
        }
        const token = this.options.getAccessToken();
        const header = this.getHeaders(token);
        const options = {
            url,
            header,
            method: (_a = _options === null || _options === void 0 ? void 0 : _options.method) !== null && _a !== void 0 ? _a : 'POST',
            data,
            dataType: 'json'
        };
        return new Promise((resolve, reject) => {
            wx.request(Object.assign(Object.assign({}, options), { success(res) {
                    resolve(res);
                },
                fail(err) {
                    reject(err);
                } }));
        });
    }
}
exports.WxmpRequest = WxmpRequest;
//# sourceMappingURL=request-wxmp.js.map
}, function(modId) { var map = {"../types":1691414667946,"./request":1691414667945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1691414667949, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
const types_1 = require("../types");
/**
 * Taro 环境请求类
 */
class TaroRequest extends request_1.Request {
    constructor(config) {
        super(config);
    }
    /**
     * Taro 环境请求方法
     * @override
     * @param data
     * @returns
     */
    async request(url, data, _options) {
        var _a;
        if (this.options.environment !== types_1.EnvironmentType.TARO) {
            throw new Error('environment type must be taro');
        }
        const token = this.options.getAccessToken();
        const header = this.getHeaders(token);
        const options = {
            url,
            header,
            method: (_a = _options === null || _options === void 0 ? void 0 : _options.method) !== null && _a !== void 0 ? _a : 'POST',
            data,
            dataType: 'json'
        };
        const res = await taro.request(options);
        return res;
    }
}
exports.TaroRequest = TaroRequest;
//# sourceMappingURL=request-taro.js.map
}, function(modId) { var map = {"./request":1691414667945,"../types":1691414667946}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1691414667950, function(require, module, exports) {

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./request"));
__export(require("./request-uni"));
__export(require("./request-wxmp"));
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./request":1691414667945,"./request-uni":1691414667947,"./request-wxmp":1691414667948}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1691414667943);
})()
//miniprogram-npm-outsideDeps=["database-ql","axios"]
//# sourceMappingURL=index.js.map