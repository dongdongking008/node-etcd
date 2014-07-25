// Generated by CoffeeScript 1.7.1
var Client, Etcd, HttpsAgent, Watcher, exports, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('underscore');

Watcher = require('./watcher');

Client = require('./client');

HttpsAgent = (require('https')).Agent;

Etcd = (function() {
  function Etcd(host, port, sslopts, client) {
    this.host = host != null ? host : '127.0.0.1';
    this.port = port != null ? port : '4001';
    this.sslopts = sslopts != null ? sslopts : null;
    this.client = client != null ? client : null;
    this.watcher = __bind(this.watcher, this);
    if (this.client == null) {
      this.client = new Client(this.sslopts);
    }
  }

  Etcd.prototype.set = function(key, value, options, callback) {
    var opt, _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    opt = this._prepareOpts("keys/" + this._stripSlashPrefix(key), "/v2", value, options);
    return this.client.put(opt, callback);
  };

  Etcd.prototype.get = function(key, options, callback) {
    var opt, _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    opt = this._prepareOpts("keys/" + this._stripSlashPrefix(key), "/v2", null, options);
    return this.client.get(opt, callback);
  };

  Etcd.prototype.create = function(dir, value, options, callback) {
    var opt, _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    opt = this._prepareOpts("keys/" + this._stripSlashPrefix(dir), "/v2", value, options);
    return this.client.post(opt, callback);
  };

  Etcd.prototype.post = Etcd.prototype.create;

  Etcd.prototype.del = function(key, options, callback) {
    var opt, _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    opt = this._prepareOpts("keys/" + this._stripSlashPrefix(key), "/v2", null, options);
    return this.client["delete"](opt, callback);
  };

  Etcd.prototype["delete"] = Etcd.prototype.del;

  Etcd.prototype.mkdir = function(dir, options, callback) {
    var _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    options.dir = true;
    return this.set(dir, null, options, callback);
  };

  Etcd.prototype.rmdir = function(dir, options, callback) {
    var _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    options.dir = true;
    return this.del(dir, options, callback);
  };

  Etcd.prototype.compareAndSwap = function(key, value, oldvalue, options, callback) {
    var _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    if (options == null) {
      options = {};
    }
    options.prevValue = oldvalue;
    return this.set(key, value, options, callback);
  };

  Etcd.prototype.testAndSet = Etcd.prototype.compareAndSwap;

  Etcd.prototype.compareAndDelete = function(key, oldvalue, options, callback) {
    var _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    if (options == null) {
      options = {};
    }
    options.prevValue = oldvalue;
    return this.del(key, options, callback);
  };

  Etcd.prototype.testAndDelete = Etcd.prototype.compareAndDelete;

  Etcd.prototype.raw = function(method, key, value, options, callback) {
    var opt, _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    opt = this._prepareOpts(key, "", value, options);
    return this.client.execute(method, opt, callback);
  };

  Etcd.prototype.watch = function(key, options, callback) {
    var _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    if (options == null) {
      options = {};
    }
    options.wait = true;
    return this.get(key, options, callback);
  };

  Etcd.prototype.watchIndex = function(key, index, options, callback) {
    var _ref;
    _ref = this._argParser(options, callback), options = _ref[0], callback = _ref[1];
    if (options == null) {
      options = {};
    }
    options.waitIndex = index;
    return this.watch(key, options, callback);
  };

  Etcd.prototype.watcher = function(key, index, options) {
    if (index == null) {
      index = null;
    }
    if (options == null) {
      options = {};
    }
    return new Watcher(this, key, index, options);
  };

  Etcd.prototype.machines = function(callback) {
    var opt;
    opt = this._prepareOpts("keys/_etcd/machines");
    return this.client.get(opt, callback);
  };

  Etcd.prototype.leader = function(callback) {
    var opt;
    opt = this._prepareOpts("leader");
    return this.client.get(opt, callback);
  };

  Etcd.prototype.leaderStats = function(callback) {
    var opt;
    opt = this._prepareOpts("stats/leader");
    return this.client.get(opt, callback);
  };

  Etcd.prototype.selfStats = function(callback) {
    var opt;
    opt = this._prepareOpts("stats/self");
    return this.client.get(opt, callback);
  };

  Etcd.prototype.version = function(callback) {
    var opt;
    opt = this._prepareOpts("version", "");
    return this.client.get(opt, callback);
  };

  Etcd.prototype._stripSlashPrefix = function(key) {
    return key.replace(/^\//, '');
  };

  Etcd.prototype._prepareOpts = function(path, apiVersion, value, queryString) {
    var httpsagent, opt, protocol;
    if (apiVersion == null) {
      apiVersion = "/v2";
    }
    if (value == null) {
      value = null;
    }
    if (queryString == null) {
      queryString = null;
    }
    protocol = "http";
    if (this.sslopts != null) {
      protocol = "https";
      httpsagent = new HttpsAgent;
      _.extend(httpsagent.options, this.sslopts);
    }
    return opt = {
      url: "" + protocol + "://" + this.host + ":" + this.port + apiVersion + "/" + path,
      json: true,
      agent: httpsagent != null ? httpsagent : void 0,
      qs: queryString != null ? queryString : void 0,
      form: value != null ? {
        value: value
      } : void 0
    };
  };

  Etcd.prototype._argParser = function(options, callback) {
    if (typeof options === 'function') {
      return [{}, options];
    } else {
      return [options, callback];
    }
  };

  return Etcd;

})();

exports = module.exports = Etcd;