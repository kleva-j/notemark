import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import require$$0$2 from "fs";
import require$$0 from "constants";
import require$$0$1 from "stream";
import require$$4 from "util";
import require$$5 from "assert";
import require$$1 from "path";
import { homedir } from "node:os";
import path$c from "node:path";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var fs$i = {};
var universalify$1 = {};
universalify$1.fromCallback = function(fn) {
  return Object.defineProperty(function(...args) {
    if (typeof args[args.length - 1] === "function") fn.apply(this, args);
    else {
      return new Promise((resolve, reject) => {
        args.push((err, res) => err != null ? reject(err) : resolve(res));
        fn.apply(this, args);
      });
    }
  }, "name", { value: fn.name });
};
universalify$1.fromPromise = function(fn) {
  return Object.defineProperty(function(...args) {
    const cb = args[args.length - 1];
    if (typeof cb !== "function") return fn.apply(this, args);
    else {
      args.pop();
      fn.apply(this, args).then((r) => cb(null, r), cb);
    }
  }, "name", { value: fn.name });
};
var constants = require$$0;
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd;
};
try {
  process.cwd();
} catch (er) {
}
if (typeof process.chdir === "function") {
  var chdir = process.chdir;
  process.chdir = function(d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}
var polyfills$1 = patch$1;
function patch$1(fs2) {
  if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs2);
  }
  if (!fs2.lutimes) {
    patchLutimes(fs2);
  }
  fs2.chown = chownFix(fs2.chown);
  fs2.fchown = chownFix(fs2.fchown);
  fs2.lchown = chownFix(fs2.lchown);
  fs2.chmod = chmodFix(fs2.chmod);
  fs2.fchmod = chmodFix(fs2.fchmod);
  fs2.lchmod = chmodFix(fs2.lchmod);
  fs2.chownSync = chownFixSync(fs2.chownSync);
  fs2.fchownSync = chownFixSync(fs2.fchownSync);
  fs2.lchownSync = chownFixSync(fs2.lchownSync);
  fs2.chmodSync = chmodFixSync(fs2.chmodSync);
  fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
  fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
  fs2.stat = statFix(fs2.stat);
  fs2.fstat = statFix(fs2.fstat);
  fs2.lstat = statFix(fs2.lstat);
  fs2.statSync = statFixSync(fs2.statSync);
  fs2.fstatSync = statFixSync(fs2.fstatSync);
  fs2.lstatSync = statFixSync(fs2.lstatSync);
  if (fs2.chmod && !fs2.lchmod) {
    fs2.lchmod = function(path2, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchmodSync = function() {
    };
  }
  if (fs2.chown && !fs2.lchown) {
    fs2.lchown = function(path2, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchownSync = function() {
    };
  }
  if (platform === "win32") {
    fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
      function rename2(from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB(er) {
          if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
            setTimeout(function() {
              fs2.stat(to, function(stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename2, fs$rename);
      return rename2;
    }(fs2.rename);
  }
  fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
    function read(fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === "function") {
        var eagCounter = 0;
        callback = function(er, _, __) {
          if (er && er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
    }
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read;
  }(fs2.read);
  fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : /* @__PURE__ */ function(fs$readSync) {
    return function(fd, buffer, offset, length, position) {
      var eagCounter = 0;
      while (true) {
        try {
          return fs$readSync.call(fs2, fd, buffer, offset, length, position);
        } catch (er) {
          if (er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            continue;
          }
          throw er;
        }
      }
    };
  }(fs2.readSync);
  function patchLchmod(fs22) {
    fs22.lchmod = function(path2, mode, callback) {
      fs22.open(
        path2,
        constants.O_WRONLY | constants.O_SYMLINK,
        mode,
        function(err, fd) {
          if (err) {
            if (callback) callback(err);
            return;
          }
          fs22.fchmod(fd, mode, function(err2) {
            fs22.close(fd, function(err22) {
              if (callback) callback(err2 || err22);
            });
          });
        }
      );
    };
    fs22.lchmodSync = function(path2, mode) {
      var fd = fs22.openSync(path2, constants.O_WRONLY | constants.O_SYMLINK, mode);
      var threw = true;
      var ret;
      try {
        ret = fs22.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs22.closeSync(fd);
          } catch (er) {
          }
        } else {
          fs22.closeSync(fd);
        }
      }
      return ret;
    };
  }
  function patchLutimes(fs22) {
    if (constants.hasOwnProperty("O_SYMLINK") && fs22.futimes) {
      fs22.lutimes = function(path2, at, mt, cb) {
        fs22.open(path2, constants.O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb) cb(er);
            return;
          }
          fs22.futimes(fd, at, mt, function(er2) {
            fs22.close(fd, function(er22) {
              if (cb) cb(er2 || er22);
            });
          });
        });
      };
      fs22.lutimesSync = function(path2, at, mt) {
        var fd = fs22.openSync(path2, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs22.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs22.closeSync(fd);
            } catch (er) {
            }
          } else {
            fs22.closeSync(fd);
          }
        }
        return ret;
      };
    } else if (fs22.futimes) {
      fs22.lutimes = function(_a, _b, _c, cb) {
        if (cb) process.nextTick(cb);
      };
      fs22.lutimesSync = function() {
      };
    }
  }
  function chmodFix(orig) {
    if (!orig) return orig;
    return function(target, mode, cb) {
      return orig.call(fs2, target, mode, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chmodFixSync(orig) {
    if (!orig) return orig;
    return function(target, mode) {
      try {
        return orig.call(fs2, target, mode);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function chownFix(orig) {
    if (!orig) return orig;
    return function(target, uid, gid, cb) {
      return orig.call(fs2, target, uid, gid, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chownFixSync(orig) {
    if (!orig) return orig;
    return function(target, uid, gid) {
      try {
        return orig.call(fs2, target, uid, gid);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function statFix(orig) {
    if (!orig) return orig;
    return function(target, options2, cb) {
      if (typeof options2 === "function") {
        cb = options2;
        options2 = null;
      }
      function callback(er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 4294967296;
          if (stats.gid < 0) stats.gid += 4294967296;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options2 ? orig.call(fs2, target, options2, callback) : orig.call(fs2, target, callback);
    };
  }
  function statFixSync(orig) {
    if (!orig) return orig;
    return function(target, options2) {
      var stats = options2 ? orig.call(fs2, target, options2) : orig.call(fs2, target);
      if (stats) {
        if (stats.uid < 0) stats.uid += 4294967296;
        if (stats.gid < 0) stats.gid += 4294967296;
      }
      return stats;
    };
  }
  function chownErOk(er) {
    if (!er)
      return true;
    if (er.code === "ENOSYS")
      return true;
    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true;
    }
    return false;
  }
}
var Stream = require$$0$1.Stream;
var legacyStreams = legacy$1;
function legacy$1(fs2) {
  return {
    ReadStream,
    WriteStream
  };
  function ReadStream(path2, options2) {
    if (!(this instanceof ReadStream)) return new ReadStream(path2, options2);
    Stream.call(this);
    var self2 = this;
    this.path = path2;
    this.fd = null;
    this.readable = true;
    this.paused = false;
    this.flags = "r";
    this.mode = 438;
    this.bufferSize = 64 * 1024;
    options2 = options2 || {};
    var keys = Object.keys(options2);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options2[key];
    }
    if (this.encoding) this.setEncoding(this.encoding);
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.end === void 0) {
        this.end = Infinity;
      } else if ("number" !== typeof this.end) {
        throw TypeError("end must be a Number");
      }
      if (this.start > this.end) {
        throw new Error("start must be <= end");
      }
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        self2._read();
      });
      return;
    }
    fs2.open(this.path, this.flags, this.mode, function(err, fd) {
      if (err) {
        self2.emit("error", err);
        self2.readable = false;
        return;
      }
      self2.fd = fd;
      self2.emit("open", fd);
      self2._read();
    });
  }
  function WriteStream(path2, options2) {
    if (!(this instanceof WriteStream)) return new WriteStream(path2, options2);
    Stream.call(this);
    this.path = path2;
    this.fd = null;
    this.writable = true;
    this.flags = "w";
    this.encoding = "binary";
    this.mode = 438;
    this.bytesWritten = 0;
    options2 = options2 || {};
    var keys = Object.keys(options2);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options2[key];
    }
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.start < 0) {
        throw new Error("start must be >= zero");
      }
      this.pos = this.start;
    }
    this.busy = false;
    this._queue = [];
    if (this.fd === null) {
      this._open = fs2.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
      this.flush();
    }
  }
}
var clone_1 = clone$1;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
  return obj.__proto__;
};
function clone$1(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (obj instanceof Object)
    var copy2 = { __proto__: getPrototypeOf(obj) };
  else
    var copy2 = /* @__PURE__ */ Object.create(null);
  Object.getOwnPropertyNames(obj).forEach(function(key) {
    Object.defineProperty(copy2, key, Object.getOwnPropertyDescriptor(obj, key));
  });
  return copy2;
}
var fs$h = require$$0$2;
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;
var util = require$$4;
var gracefulQueue;
var previousSymbol;
if (typeof Symbol === "function" && typeof Symbol.for === "function") {
  gracefulQueue = Symbol.for("graceful-fs.queue");
  previousSymbol = Symbol.for("graceful-fs.previous");
} else {
  gracefulQueue = "___graceful-fs.queue";
  previousSymbol = "___graceful-fs.previous";
}
function noop() {
}
function publishQueue(context, queue2) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue2;
    }
  });
}
var debug = noop;
if (util.debuglog)
  debug = util.debuglog("gfs4");
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
  debug = function() {
    var m = util.format.apply(util, arguments);
    m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
    console.error(m);
  };
if (!fs$h[gracefulQueue]) {
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$h, queue);
  fs$h.close = function(fs$close) {
    function close(fd, cb) {
      return fs$close.call(fs$h, fd, function(err) {
        if (!err) {
          resetQueue();
        }
        if (typeof cb === "function")
          cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close;
  }(fs$h.close);
  fs$h.closeSync = function(fs$closeSync) {
    function closeSync(fd) {
      fs$closeSync.apply(fs$h, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync;
  }(fs$h.closeSync);
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
    process.on("exit", function() {
      debug(fs$h[gracefulQueue]);
      require$$5.equal(fs$h[gracefulQueue].length, 0);
    });
  }
}
if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$h[gracefulQueue]);
}
var gracefulFs = patch(clone(fs$h));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$h.__patched) {
  gracefulFs = patch(fs$h);
  fs$h.__patched = true;
}
function patch(fs2) {
  polyfills(fs2);
  fs2.gracefulify = patch;
  fs2.createReadStream = createReadStream;
  fs2.createWriteStream = createWriteStream;
  var fs$readFile = fs2.readFile;
  fs2.readFile = readFile2;
  function readFile2(path2, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$readFile(path2, options2, cb);
    function go$readFile(path22, options22, cb2, startTime) {
      return fs$readFile(path22, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$readFile, [path22, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$writeFile = fs2.writeFile;
  fs2.writeFile = writeFile2;
  function writeFile2(path2, data, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$writeFile(path2, data, options2, cb);
    function go$writeFile(path22, data2, options22, cb2, startTime) {
      return fs$writeFile(path22, data2, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$writeFile, [path22, data2, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$appendFile = fs2.appendFile;
  if (fs$appendFile)
    fs2.appendFile = appendFile;
  function appendFile(path2, data, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$appendFile(path2, data, options2, cb);
    function go$appendFile(path22, data2, options22, cb2, startTime) {
      return fs$appendFile(path22, data2, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$appendFile, [path22, data2, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$copyFile = fs2.copyFile;
  if (fs$copyFile)
    fs2.copyFile = copyFile2;
  function copyFile2(src, dest, flags, cb) {
    if (typeof flags === "function") {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb);
    function go$copyFile(src2, dest2, flags2, cb2, startTime) {
      return fs$copyFile(src2, dest2, flags2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$readdir = fs2.readdir;
  fs2.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir(path2, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path22, options22, cb2, startTime) {
      return fs$readdir(path22, fs$readdirCallback(
        path22,
        options22,
        cb2,
        startTime
      ));
    } : function go$readdir2(path22, options22, cb2, startTime) {
      return fs$readdir(path22, options22, fs$readdirCallback(
        path22,
        options22,
        cb2,
        startTime
      ));
    };
    return go$readdir(path2, options2, cb);
    function fs$readdirCallback(path22, options22, cb2, startTime) {
      return function(err, files) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([
            go$readdir,
            [path22, options22, cb2],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();
          if (typeof cb2 === "function")
            cb2.call(this, err, files);
        }
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var legStreams = legacy(fs2);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }
  var fs$ReadStream = fs2.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }
  var fs$WriteStream = fs2.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }
  Object.defineProperty(fs2, "ReadStream", {
    get: function() {
      return ReadStream;
    },
    set: function(val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs2, "WriteStream", {
    get: function() {
      return WriteStream;
    },
    set: function(val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileReadStream = ReadStream;
  Object.defineProperty(fs2, "FileReadStream", {
    get: function() {
      return FileReadStream;
    },
    set: function(val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs2, "FileWriteStream", {
    get: function() {
      return FileWriteStream;
    },
    set: function(val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  function ReadStream(path2, options2) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this;
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }
  function ReadStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
        that.read();
      }
    });
  }
  function WriteStream(path2, options2) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this;
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }
  function WriteStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
      }
    });
  }
  function createReadStream(path2, options2) {
    return new fs2.ReadStream(path2, options2);
  }
  function createWriteStream(path2, options2) {
    return new fs2.WriteStream(path2, options2);
  }
  var fs$open = fs2.open;
  fs2.open = open;
  function open(path2, flags, mode, cb) {
    if (typeof mode === "function")
      cb = mode, mode = null;
    return go$open(path2, flags, mode, cb);
    function go$open(path22, flags2, mode2, cb2, startTime) {
      return fs$open(path22, flags2, mode2, function(err, fd) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$open, [path22, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  return fs2;
}
function enqueue(elem) {
  debug("ENQUEUE", elem[0].name, elem[1]);
  fs$h[gracefulQueue].push(elem);
  retry();
}
var retryTimer;
function resetQueue() {
  var now = Date.now();
  for (var i2 = 0; i2 < fs$h[gracefulQueue].length; ++i2) {
    if (fs$h[gracefulQueue][i2].length > 2) {
      fs$h[gracefulQueue][i2][3] = now;
      fs$h[gracefulQueue][i2][4] = now;
    }
  }
  retry();
}
function retry() {
  clearTimeout(retryTimer);
  retryTimer = void 0;
  if (fs$h[gracefulQueue].length === 0)
    return;
  var elem = fs$h[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];
  if (startTime === void 0) {
    debug("RETRY", fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 6e4) {
    debug("TIMEOUT", fn.name, args);
    var cb = args.pop();
    if (typeof cb === "function")
      cb.call(null, err);
  } else {
    var sinceAttempt = Date.now() - lastTime;
    var sinceStart = Math.max(lastTime - startTime, 1);
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    if (sinceAttempt >= desiredDelay) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      fs$h[gracefulQueue].push(elem);
    }
  }
  if (retryTimer === void 0) {
    retryTimer = setTimeout(retry, 0);
  }
}
(function(exports2) {
  const u2 = universalify$1.fromCallback;
  const fs2 = gracefulFs;
  const api = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "cp",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "glob",
    "lchmod",
    "lchown",
    "lutimes",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "statfs",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((key) => {
    return typeof fs2[key] === "function";
  });
  Object.assign(exports2, fs2);
  api.forEach((method) => {
    exports2[method] = u2(fs2[method]);
  });
  exports2.exists = function(filename, callback) {
    if (typeof callback === "function") {
      return fs2.exists(filename, callback);
    }
    return new Promise((resolve) => {
      return fs2.exists(filename, resolve);
    });
  };
  exports2.read = function(fd, buffer, offset, length, position, callback) {
    if (typeof callback === "function") {
      return fs2.read(fd, buffer, offset, length, position, callback);
    }
    return new Promise((resolve, reject) => {
      fs2.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
        if (err) return reject(err);
        resolve({ bytesRead, buffer: buffer2 });
      });
    });
  };
  exports2.write = function(fd, buffer, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.write(fd, buffer, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.write(fd, buffer, ...args, (err, bytesWritten, buffer2) => {
        if (err) return reject(err);
        resolve({ bytesWritten, buffer: buffer2 });
      });
    });
  };
  exports2.readv = function(fd, buffers, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.readv(fd, buffers, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.readv(fd, buffers, ...args, (err, bytesRead, buffers2) => {
        if (err) return reject(err);
        resolve({ bytesRead, buffers: buffers2 });
      });
    });
  };
  exports2.writev = function(fd, buffers, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.writev(fd, buffers, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.writev(fd, buffers, ...args, (err, bytesWritten, buffers2) => {
        if (err) return reject(err);
        resolve({ bytesWritten, buffers: buffers2 });
      });
    });
  };
  if (typeof fs2.realpath.native === "function") {
    exports2.realpath.native = u2(fs2.realpath.native);
  } else {
    process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  }
})(fs$i);
var makeDir$1 = {};
var utils$5 = {};
const path$b = require$$1;
utils$5.checkPath = function checkPath2(pth) {
  if (process.platform === "win32") {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path$b.parse(pth).root, ""));
    if (pathHasInvalidWinCharacters) {
      const error = new Error(`Path contains invalid characters: ${pth}`);
      error.code = "EINVAL";
      throw error;
    }
  }
};
const fs$g = fs$i;
const { checkPath } = utils$5;
const getMode = (options2) => {
  const defaults2 = { mode: 511 };
  if (typeof options2 === "number") return options2;
  return { ...defaults2, ...options2 }.mode;
};
makeDir$1.makeDir = async (dir, options2) => {
  checkPath(dir);
  return fs$g.mkdir(dir, {
    mode: getMode(options2),
    recursive: true
  });
};
makeDir$1.makeDirSync = (dir, options2) => {
  checkPath(dir);
  return fs$g.mkdirSync(dir, {
    mode: getMode(options2),
    recursive: true
  });
};
const u$e = universalify$1.fromPromise;
const { makeDir: _makeDir, makeDirSync } = makeDir$1;
const makeDir = u$e(_makeDir);
var mkdirs$2 = {
  mkdirs: makeDir,
  mkdirsSync: makeDirSync,
  // alias
  mkdirp: makeDir,
  mkdirpSync: makeDirSync,
  ensureDir: makeDir,
  ensureDirSync: makeDirSync
};
const u$d = universalify$1.fromPromise;
const fs$f = fs$i;
function pathExists$6(path2) {
  return fs$f.access(path2).then(() => true).catch(() => false);
}
var pathExists_1 = {
  pathExists: u$d(pathExists$6),
  pathExistsSync: fs$f.existsSync
};
const fs$e = fs$i;
const u$c = universalify$1.fromPromise;
async function utimesMillis$1(path2, atime, mtime) {
  const fd = await fs$e.open(path2, "r+");
  let closeErr = null;
  try {
    await fs$e.futimes(fd, atime, mtime);
  } finally {
    try {
      await fs$e.close(fd);
    } catch (e) {
      closeErr = e;
    }
  }
  if (closeErr) {
    throw closeErr;
  }
}
function utimesMillisSync$1(path2, atime, mtime) {
  const fd = fs$e.openSync(path2, "r+");
  fs$e.futimesSync(fd, atime, mtime);
  return fs$e.closeSync(fd);
}
var utimes = {
  utimesMillis: u$c(utimesMillis$1),
  utimesMillisSync: utimesMillisSync$1
};
const fs$d = fs$i;
const path$a = require$$1;
const u$b = universalify$1.fromPromise;
function getStats$1(src, dest, opts) {
  const statFunc = opts.dereference ? (file2) => fs$d.stat(file2, { bigint: true }) : (file2) => fs$d.lstat(file2, { bigint: true });
  return Promise.all([
    statFunc(src),
    statFunc(dest).catch((err) => {
      if (err.code === "ENOENT") return null;
      throw err;
    })
  ]).then(([srcStat, destStat]) => ({ srcStat, destStat }));
}
function getStatsSync(src, dest, opts) {
  let destStat;
  const statFunc = opts.dereference ? (file2) => fs$d.statSync(file2, { bigint: true }) : (file2) => fs$d.lstatSync(file2, { bigint: true });
  const srcStat = statFunc(src);
  try {
    destStat = statFunc(dest);
  } catch (err) {
    if (err.code === "ENOENT") return { srcStat, destStat: null };
    throw err;
  }
  return { srcStat, destStat };
}
async function checkPaths(src, dest, funcName, opts) {
  const { srcStat, destStat } = await getStats$1(src, dest, opts);
  if (destStat) {
    if (areIdentical$2(srcStat, destStat)) {
      const srcBaseName = path$a.basename(src);
      const destBaseName = path$a.basename(dest);
      if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
        return { srcStat, destStat, isChangingCase: true };
      }
      throw new Error("Source and destination must not be the same.");
    }
    if (srcStat.isDirectory() && !destStat.isDirectory()) {
      throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!srcStat.isDirectory() && destStat.isDirectory()) {
      throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`);
    }
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return { srcStat, destStat };
}
function checkPathsSync(src, dest, funcName, opts) {
  const { srcStat, destStat } = getStatsSync(src, dest, opts);
  if (destStat) {
    if (areIdentical$2(srcStat, destStat)) {
      const srcBaseName = path$a.basename(src);
      const destBaseName = path$a.basename(dest);
      if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
        return { srcStat, destStat, isChangingCase: true };
      }
      throw new Error("Source and destination must not be the same.");
    }
    if (srcStat.isDirectory() && !destStat.isDirectory()) {
      throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!srcStat.isDirectory() && destStat.isDirectory()) {
      throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`);
    }
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return { srcStat, destStat };
}
async function checkParentPaths(src, srcStat, dest, funcName) {
  const srcParent = path$a.resolve(path$a.dirname(src));
  const destParent = path$a.resolve(path$a.dirname(dest));
  if (destParent === srcParent || destParent === path$a.parse(destParent).root) return;
  let destStat;
  try {
    destStat = await fs$d.stat(destParent, { bigint: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  if (areIdentical$2(srcStat, destStat)) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return checkParentPaths(src, srcStat, destParent, funcName);
}
function checkParentPathsSync(src, srcStat, dest, funcName) {
  const srcParent = path$a.resolve(path$a.dirname(src));
  const destParent = path$a.resolve(path$a.dirname(dest));
  if (destParent === srcParent || destParent === path$a.parse(destParent).root) return;
  let destStat;
  try {
    destStat = fs$d.statSync(destParent, { bigint: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  if (areIdentical$2(srcStat, destStat)) {
    throw new Error(errMsg(src, dest, funcName));
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName);
}
function areIdentical$2(srcStat, destStat) {
  return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev;
}
function isSrcSubdir(src, dest) {
  const srcArr = path$a.resolve(src).split(path$a.sep).filter((i2) => i2);
  const destArr = path$a.resolve(dest).split(path$a.sep).filter((i2) => i2);
  return srcArr.every((cur, i2) => destArr[i2] === cur);
}
function errMsg(src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
}
var stat$4 = {
  // checkPaths
  checkPaths: u$b(checkPaths),
  checkPathsSync,
  // checkParent
  checkParentPaths: u$b(checkParentPaths),
  checkParentPathsSync,
  // Misc
  isSrcSubdir,
  areIdentical: areIdentical$2
};
const fs$c = fs$i;
const path$9 = require$$1;
const { mkdirs: mkdirs$1 } = mkdirs$2;
const { pathExists: pathExists$5 } = pathExists_1;
const { utimesMillis } = utimes;
const stat$3 = stat$4;
async function copy$2(src, dest, opts = {}) {
  if (typeof opts === "function") {
    opts = { filter: opts };
  }
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning(
      "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
      "Warning",
      "fs-extra-WARN0001"
    );
  }
  const { srcStat, destStat } = await stat$3.checkPaths(src, dest, "copy", opts);
  await stat$3.checkParentPaths(src, srcStat, dest, "copy");
  const include = await runFilter(src, dest, opts);
  if (!include) return;
  const destParent = path$9.dirname(dest);
  const dirExists = await pathExists$5(destParent);
  if (!dirExists) {
    await mkdirs$1(destParent);
  }
  await getStatsAndPerformCopy(destStat, src, dest, opts);
}
async function runFilter(src, dest, opts) {
  if (!opts.filter) return true;
  return opts.filter(src, dest);
}
async function getStatsAndPerformCopy(destStat, src, dest, opts) {
  const statFn = opts.dereference ? fs$c.stat : fs$c.lstat;
  const srcStat = await statFn(src);
  if (srcStat.isDirectory()) return onDir$1(srcStat, destStat, src, dest, opts);
  if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile$1(srcStat, destStat, src, dest, opts);
  if (srcStat.isSymbolicLink()) return onLink$1(destStat, src, dest, opts);
  if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`);
  if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`);
  throw new Error(`Unknown file: ${src}`);
}
async function onFile$1(srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile$1(srcStat, src, dest, opts);
  if (opts.overwrite) {
    await fs$c.unlink(dest);
    return copyFile$1(srcStat, src, dest, opts);
  }
  if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`);
  }
}
async function copyFile$1(srcStat, src, dest, opts) {
  await fs$c.copyFile(src, dest);
  if (opts.preserveTimestamps) {
    if (fileIsNotWritable$1(srcStat.mode)) {
      await makeFileWritable$1(dest, srcStat.mode);
    }
    const updatedSrcStat = await fs$c.stat(src);
    await utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
  }
  return fs$c.chmod(dest, srcStat.mode);
}
function fileIsNotWritable$1(srcMode) {
  return (srcMode & 128) === 0;
}
function makeFileWritable$1(dest, srcMode) {
  return fs$c.chmod(dest, srcMode | 128);
}
async function onDir$1(srcStat, destStat, src, dest, opts) {
  if (!destStat) {
    await fs$c.mkdir(dest);
  }
  const promises = [];
  for await (const item of await fs$c.opendir(src)) {
    const srcItem = path$9.join(src, item.name);
    const destItem = path$9.join(dest, item.name);
    promises.push(
      runFilter(srcItem, destItem, opts).then((include) => {
        if (include) {
          return stat$3.checkPaths(srcItem, destItem, "copy", opts).then(({ destStat: destStat2 }) => {
            return getStatsAndPerformCopy(destStat2, srcItem, destItem, opts);
          });
        }
      })
    );
  }
  await Promise.all(promises);
  if (!destStat) {
    await fs$c.chmod(dest, srcStat.mode);
  }
}
async function onLink$1(destStat, src, dest, opts) {
  let resolvedSrc = await fs$c.readlink(src);
  if (opts.dereference) {
    resolvedSrc = path$9.resolve(process.cwd(), resolvedSrc);
  }
  if (!destStat) {
    return fs$c.symlink(resolvedSrc, dest);
  }
  let resolvedDest = null;
  try {
    resolvedDest = await fs$c.readlink(dest);
  } catch (e) {
    if (e.code === "EINVAL" || e.code === "UNKNOWN") return fs$c.symlink(resolvedSrc, dest);
    throw e;
  }
  if (opts.dereference) {
    resolvedDest = path$9.resolve(process.cwd(), resolvedDest);
  }
  if (stat$3.isSrcSubdir(resolvedSrc, resolvedDest)) {
    throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
  }
  if (stat$3.isSrcSubdir(resolvedDest, resolvedSrc)) {
    throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
  }
  await fs$c.unlink(dest);
  return fs$c.symlink(resolvedSrc, dest);
}
var copy_1 = copy$2;
const fs$b = gracefulFs;
const path$8 = require$$1;
const mkdirsSync$1 = mkdirs$2.mkdirsSync;
const utimesMillisSync = utimes.utimesMillisSync;
const stat$2 = stat$4;
function copySync$1(src, dest, opts) {
  if (typeof opts === "function") {
    opts = { filter: opts };
  }
  opts = opts || {};
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning(
      "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
      "Warning",
      "fs-extra-WARN0002"
    );
  }
  const { srcStat, destStat } = stat$2.checkPathsSync(src, dest, "copy", opts);
  stat$2.checkParentPathsSync(src, srcStat, dest, "copy");
  if (opts.filter && !opts.filter(src, dest)) return;
  const destParent = path$8.dirname(dest);
  if (!fs$b.existsSync(destParent)) mkdirsSync$1(destParent);
  return getStats(destStat, src, dest, opts);
}
function getStats(destStat, src, dest, opts) {
  const statSync = opts.dereference ? fs$b.statSync : fs$b.lstatSync;
  const srcStat = statSync(src);
  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts);
  else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts);
  else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts);
  else if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`);
  else if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`);
  throw new Error(`Unknown file: ${src}`);
}
function onFile(srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts);
  return mayCopyFile(srcStat, src, dest, opts);
}
function mayCopyFile(srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs$b.unlinkSync(dest);
    return copyFile(srcStat, src, dest, opts);
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`);
  }
}
function copyFile(srcStat, src, dest, opts) {
  fs$b.copyFileSync(src, dest);
  if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src, dest);
  return setDestMode(dest, srcStat.mode);
}
function handleTimestamps(srcMode, src, dest) {
  if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode);
  return setDestTimestamps(src, dest);
}
function fileIsNotWritable(srcMode) {
  return (srcMode & 128) === 0;
}
function makeFileWritable(dest, srcMode) {
  return setDestMode(dest, srcMode | 128);
}
function setDestMode(dest, srcMode) {
  return fs$b.chmodSync(dest, srcMode);
}
function setDestTimestamps(src, dest) {
  const updatedSrcStat = fs$b.statSync(src);
  return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
}
function onDir(srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts);
  return copyDir(src, dest, opts);
}
function mkDirAndCopy(srcMode, src, dest, opts) {
  fs$b.mkdirSync(dest);
  copyDir(src, dest, opts);
  return setDestMode(dest, srcMode);
}
function copyDir(src, dest, opts) {
  const dir = fs$b.opendirSync(src);
  try {
    let dirent;
    while ((dirent = dir.readSync()) !== null) {
      copyDirItem(dirent.name, src, dest, opts);
    }
  } finally {
    dir.closeSync();
  }
}
function copyDirItem(item, src, dest, opts) {
  const srcItem = path$8.join(src, item);
  const destItem = path$8.join(dest, item);
  if (opts.filter && !opts.filter(srcItem, destItem)) return;
  const { destStat } = stat$2.checkPathsSync(srcItem, destItem, "copy", opts);
  return getStats(destStat, srcItem, destItem, opts);
}
function onLink(destStat, src, dest, opts) {
  let resolvedSrc = fs$b.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path$8.resolve(process.cwd(), resolvedSrc);
  }
  if (!destStat) {
    return fs$b.symlinkSync(resolvedSrc, dest);
  } else {
    let resolvedDest;
    try {
      resolvedDest = fs$b.readlinkSync(dest);
    } catch (err) {
      if (err.code === "EINVAL" || err.code === "UNKNOWN") return fs$b.symlinkSync(resolvedSrc, dest);
      throw err;
    }
    if (opts.dereference) {
      resolvedDest = path$8.resolve(process.cwd(), resolvedDest);
    }
    if (stat$2.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
    }
    if (stat$2.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
    }
    return copyLink(resolvedSrc, dest);
  }
}
function copyLink(resolvedSrc, dest) {
  fs$b.unlinkSync(dest);
  return fs$b.symlinkSync(resolvedSrc, dest);
}
var copySync_1 = copySync$1;
const u$a = universalify$1.fromPromise;
var copy$1 = {
  copy: u$a(copy_1),
  copySync: copySync_1
};
const fs$a = gracefulFs;
const u$9 = universalify$1.fromCallback;
function remove$2(path2, callback) {
  fs$a.rm(path2, { recursive: true, force: true }, callback);
}
function removeSync$1(path2) {
  fs$a.rmSync(path2, { recursive: true, force: true });
}
var remove_1 = {
  remove: u$9(remove$2),
  removeSync: removeSync$1
};
const u$8 = universalify$1.fromPromise;
const fs$9 = fs$i;
const path$7 = require$$1;
const mkdir$3 = mkdirs$2;
const remove$1 = remove_1;
const emptyDir = u$8(async function emptyDir2(dir) {
  let items;
  try {
    items = await fs$9.readdir(dir);
  } catch {
    return mkdir$3.mkdirs(dir);
  }
  return Promise.all(items.map((item) => remove$1.remove(path$7.join(dir, item))));
});
function emptyDirSync(dir) {
  let items;
  try {
    items = fs$9.readdirSync(dir);
  } catch {
    return mkdir$3.mkdirsSync(dir);
  }
  items.forEach((item) => {
    item = path$7.join(dir, item);
    remove$1.removeSync(item);
  });
}
var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};
const u$7 = universalify$1.fromPromise;
const path$6 = require$$1;
const fs$8 = fs$i;
const mkdir$2 = mkdirs$2;
async function createFile$1(file2) {
  let stats;
  try {
    stats = await fs$8.stat(file2);
  } catch {
  }
  if (stats && stats.isFile()) return;
  const dir = path$6.dirname(file2);
  let dirStats = null;
  try {
    dirStats = await fs$8.stat(dir);
  } catch (err) {
    if (err.code === "ENOENT") {
      await mkdir$2.mkdirs(dir);
      await fs$8.writeFile(file2, "");
      return;
    } else {
      throw err;
    }
  }
  if (dirStats.isDirectory()) {
    await fs$8.writeFile(file2, "");
  } else {
    await fs$8.readdir(dir);
  }
}
function createFileSync$1(file2) {
  let stats;
  try {
    stats = fs$8.statSync(file2);
  } catch {
  }
  if (stats && stats.isFile()) return;
  const dir = path$6.dirname(file2);
  try {
    if (!fs$8.statSync(dir).isDirectory()) {
      fs$8.readdirSync(dir);
    }
  } catch (err) {
    if (err && err.code === "ENOENT") mkdir$2.mkdirsSync(dir);
    else throw err;
  }
  fs$8.writeFileSync(file2, "");
}
var file = {
  createFile: u$7(createFile$1),
  createFileSync: createFileSync$1
};
const u$6 = universalify$1.fromPromise;
const path$5 = require$$1;
const fs$7 = fs$i;
const mkdir$1 = mkdirs$2;
const { pathExists: pathExists$4 } = pathExists_1;
const { areIdentical: areIdentical$1 } = stat$4;
async function createLink$1(srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = await fs$7.lstat(dstpath);
  } catch {
  }
  let srcStat;
  try {
    srcStat = await fs$7.lstat(srcpath);
  } catch (err) {
    err.message = err.message.replace("lstat", "ensureLink");
    throw err;
  }
  if (dstStat && areIdentical$1(srcStat, dstStat)) return;
  const dir = path$5.dirname(dstpath);
  const dirExists = await pathExists$4(dir);
  if (!dirExists) {
    await mkdir$1.mkdirs(dir);
  }
  await fs$7.link(srcpath, dstpath);
}
function createLinkSync$1(srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = fs$7.lstatSync(dstpath);
  } catch {
  }
  try {
    const srcStat = fs$7.lstatSync(srcpath);
    if (dstStat && areIdentical$1(srcStat, dstStat)) return;
  } catch (err) {
    err.message = err.message.replace("lstat", "ensureLink");
    throw err;
  }
  const dir = path$5.dirname(dstpath);
  const dirExists = fs$7.existsSync(dir);
  if (dirExists) return fs$7.linkSync(srcpath, dstpath);
  mkdir$1.mkdirsSync(dir);
  return fs$7.linkSync(srcpath, dstpath);
}
var link = {
  createLink: u$6(createLink$1),
  createLinkSync: createLinkSync$1
};
const path$4 = require$$1;
const fs$6 = fs$i;
const { pathExists: pathExists$3 } = pathExists_1;
const u$5 = universalify$1.fromPromise;
async function symlinkPaths$1(srcpath, dstpath) {
  if (path$4.isAbsolute(srcpath)) {
    try {
      await fs$6.lstat(srcpath);
    } catch (err) {
      err.message = err.message.replace("lstat", "ensureSymlink");
      throw err;
    }
    return {
      toCwd: srcpath,
      toDst: srcpath
    };
  }
  const dstdir = path$4.dirname(dstpath);
  const relativeToDst = path$4.join(dstdir, srcpath);
  const exists = await pathExists$3(relativeToDst);
  if (exists) {
    return {
      toCwd: relativeToDst,
      toDst: srcpath
    };
  }
  try {
    await fs$6.lstat(srcpath);
  } catch (err) {
    err.message = err.message.replace("lstat", "ensureSymlink");
    throw err;
  }
  return {
    toCwd: srcpath,
    toDst: path$4.relative(dstdir, srcpath)
  };
}
function symlinkPathsSync$1(srcpath, dstpath) {
  if (path$4.isAbsolute(srcpath)) {
    const exists2 = fs$6.existsSync(srcpath);
    if (!exists2) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: srcpath,
      toDst: srcpath
    };
  }
  const dstdir = path$4.dirname(dstpath);
  const relativeToDst = path$4.join(dstdir, srcpath);
  const exists = fs$6.existsSync(relativeToDst);
  if (exists) {
    return {
      toCwd: relativeToDst,
      toDst: srcpath
    };
  }
  const srcExists = fs$6.existsSync(srcpath);
  if (!srcExists) throw new Error("relative srcpath does not exist");
  return {
    toCwd: srcpath,
    toDst: path$4.relative(dstdir, srcpath)
  };
}
var symlinkPaths_1 = {
  symlinkPaths: u$5(symlinkPaths$1),
  symlinkPathsSync: symlinkPathsSync$1
};
const fs$5 = fs$i;
const u$4 = universalify$1.fromPromise;
async function symlinkType$1(srcpath, type2) {
  if (type2) return type2;
  let stats;
  try {
    stats = await fs$5.lstat(srcpath);
  } catch {
    return "file";
  }
  return stats && stats.isDirectory() ? "dir" : "file";
}
function symlinkTypeSync$1(srcpath, type2) {
  if (type2) return type2;
  let stats;
  try {
    stats = fs$5.lstatSync(srcpath);
  } catch {
    return "file";
  }
  return stats && stats.isDirectory() ? "dir" : "file";
}
var symlinkType_1 = {
  symlinkType: u$4(symlinkType$1),
  symlinkTypeSync: symlinkTypeSync$1
};
const u$3 = universalify$1.fromPromise;
const path$3 = require$$1;
const fs$4 = fs$i;
const { mkdirs, mkdirsSync } = mkdirs$2;
const { symlinkPaths, symlinkPathsSync } = symlinkPaths_1;
const { symlinkType, symlinkTypeSync } = symlinkType_1;
const { pathExists: pathExists$2 } = pathExists_1;
const { areIdentical } = stat$4;
async function createSymlink$1(srcpath, dstpath, type2) {
  let stats;
  try {
    stats = await fs$4.lstat(dstpath);
  } catch {
  }
  if (stats && stats.isSymbolicLink()) {
    const [srcStat, dstStat] = await Promise.all([
      fs$4.stat(srcpath),
      fs$4.stat(dstpath)
    ]);
    if (areIdentical(srcStat, dstStat)) return;
  }
  const relative = await symlinkPaths(srcpath, dstpath);
  srcpath = relative.toDst;
  const toType = await symlinkType(relative.toCwd, type2);
  const dir = path$3.dirname(dstpath);
  if (!await pathExists$2(dir)) {
    await mkdirs(dir);
  }
  return fs$4.symlink(srcpath, dstpath, toType);
}
function createSymlinkSync$1(srcpath, dstpath, type2) {
  let stats;
  try {
    stats = fs$4.lstatSync(dstpath);
  } catch {
  }
  if (stats && stats.isSymbolicLink()) {
    const srcStat = fs$4.statSync(srcpath);
    const dstStat = fs$4.statSync(dstpath);
    if (areIdentical(srcStat, dstStat)) return;
  }
  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type2 = symlinkTypeSync(relative.toCwd, type2);
  const dir = path$3.dirname(dstpath);
  const exists = fs$4.existsSync(dir);
  if (exists) return fs$4.symlinkSync(srcpath, dstpath, type2);
  mkdirsSync(dir);
  return fs$4.symlinkSync(srcpath, dstpath, type2);
}
var symlink = {
  createSymlink: u$3(createSymlink$1),
  createSymlinkSync: createSymlinkSync$1
};
const { createFile, createFileSync } = file;
const { createLink, createLinkSync } = link;
const { createSymlink, createSymlinkSync } = symlink;
var ensure = {
  // file
  createFile,
  createFileSync,
  ensureFile: createFile,
  ensureFileSync: createFileSync,
  // link
  createLink,
  createLinkSync,
  ensureLink: createLink,
  ensureLinkSync: createLinkSync,
  // symlink
  createSymlink,
  createSymlinkSync,
  ensureSymlink: createSymlink,
  ensureSymlinkSync: createSymlinkSync
};
function stringify$6(obj, { EOL = "\n", finalEOL = true, replacer = null, spaces } = {}) {
  const EOF = finalEOL ? EOL : "";
  const str2 = JSON.stringify(obj, replacer, spaces);
  return str2.replace(/\n/g, EOL) + EOF;
}
function stripBom$1(content) {
  if (Buffer.isBuffer(content)) content = content.toString("utf8");
  return content.replace(/^\uFEFF/, "");
}
var utils$4 = { stringify: stringify$6, stripBom: stripBom$1 };
let _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = require$$0$2;
}
const universalify = universalify$1;
const { stringify: stringify$5, stripBom } = utils$4;
async function _readFile(file2, options2 = {}) {
  if (typeof options2 === "string") {
    options2 = { encoding: options2 };
  }
  const fs2 = options2.fs || _fs;
  const shouldThrow = "throws" in options2 ? options2.throws : true;
  let data = await universalify.fromCallback(fs2.readFile)(file2, options2);
  data = stripBom(data);
  let obj;
  try {
    obj = JSON.parse(data, options2 ? options2.reviver : null);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file2}: ${err.message}`;
      throw err;
    } else {
      return null;
    }
  }
  return obj;
}
const readFile = universalify.fromPromise(_readFile);
function readFileSync(file2, options2 = {}) {
  if (typeof options2 === "string") {
    options2 = { encoding: options2 };
  }
  const fs2 = options2.fs || _fs;
  const shouldThrow = "throws" in options2 ? options2.throws : true;
  try {
    let content = fs2.readFileSync(file2, options2);
    content = stripBom(content);
    return JSON.parse(content, options2.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file2}: ${err.message}`;
      throw err;
    } else {
      return null;
    }
  }
}
async function _writeFile(file2, obj, options2 = {}) {
  const fs2 = options2.fs || _fs;
  const str2 = stringify$5(obj, options2);
  await universalify.fromCallback(fs2.writeFile)(file2, str2, options2);
}
const writeFile = universalify.fromPromise(_writeFile);
function writeFileSync(file2, obj, options2 = {}) {
  const fs2 = options2.fs || _fs;
  const str2 = stringify$5(obj, options2);
  return fs2.writeFileSync(file2, str2, options2);
}
const jsonfile$1 = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
};
var jsonfile_1 = jsonfile$1;
const jsonFile$1 = jsonfile_1;
var jsonfile = {
  // jsonfile exports
  readJson: jsonFile$1.readFile,
  readJsonSync: jsonFile$1.readFileSync,
  writeJson: jsonFile$1.writeFile,
  writeJsonSync: jsonFile$1.writeFileSync
};
const u$2 = universalify$1.fromPromise;
const fs$3 = fs$i;
const path$2 = require$$1;
const mkdir = mkdirs$2;
const pathExists$1 = pathExists_1.pathExists;
async function outputFile$1(file2, data, encoding = "utf-8") {
  const dir = path$2.dirname(file2);
  if (!await pathExists$1(dir)) {
    await mkdir.mkdirs(dir);
  }
  return fs$3.writeFile(file2, data, encoding);
}
function outputFileSync$1(file2, ...args) {
  const dir = path$2.dirname(file2);
  if (!fs$3.existsSync(dir)) {
    mkdir.mkdirsSync(dir);
  }
  fs$3.writeFileSync(file2, ...args);
}
var outputFile_1 = {
  outputFile: u$2(outputFile$1),
  outputFileSync: outputFileSync$1
};
const { stringify: stringify$4 } = utils$4;
const { outputFile } = outputFile_1;
async function outputJson(file2, data, options2 = {}) {
  const str2 = stringify$4(data, options2);
  await outputFile(file2, str2, options2);
}
var outputJson_1 = outputJson;
const { stringify: stringify$3 } = utils$4;
const { outputFileSync } = outputFile_1;
function outputJsonSync(file2, data, options2) {
  const str2 = stringify$3(data, options2);
  outputFileSync(file2, str2, options2);
}
var outputJsonSync_1 = outputJsonSync;
const u$1 = universalify$1.fromPromise;
const jsonFile = jsonfile;
jsonFile.outputJson = u$1(outputJson_1);
jsonFile.outputJsonSync = outputJsonSync_1;
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;
var json$1 = jsonFile;
const fs$2 = fs$i;
const path$1 = require$$1;
const { copy } = copy$1;
const { remove } = remove_1;
const { mkdirp } = mkdirs$2;
const { pathExists } = pathExists_1;
const stat$1 = stat$4;
async function move$1(src, dest, opts = {}) {
  const overwrite = opts.overwrite || opts.clobber || false;
  const { srcStat, isChangingCase = false } = await stat$1.checkPaths(src, dest, "move", opts);
  await stat$1.checkParentPaths(src, srcStat, dest, "move");
  const destParent = path$1.dirname(dest);
  const parsedParentPath = path$1.parse(destParent);
  if (parsedParentPath.root !== destParent) {
    await mkdirp(destParent);
  }
  return doRename$1(src, dest, overwrite, isChangingCase);
}
async function doRename$1(src, dest, overwrite, isChangingCase) {
  if (!isChangingCase) {
    if (overwrite) {
      await remove(dest);
    } else if (await pathExists(dest)) {
      throw new Error("dest already exists.");
    }
  }
  try {
    await fs$2.rename(src, dest);
  } catch (err) {
    if (err.code !== "EXDEV") {
      throw err;
    }
    await moveAcrossDevice$1(src, dest, overwrite);
  }
}
async function moveAcrossDevice$1(src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true,
    preserveTimestamps: true
  };
  await copy(src, dest, opts);
  return remove(src);
}
var move_1 = move$1;
const fs$1 = gracefulFs;
const path = require$$1;
const copySync = copy$1.copySync;
const removeSync = remove_1.removeSync;
const mkdirpSync = mkdirs$2.mkdirpSync;
const stat = stat$4;
function moveSync(src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;
  const { srcStat, isChangingCase = false } = stat.checkPathsSync(src, dest, "move", opts);
  stat.checkParentPathsSync(src, srcStat, dest, "move");
  if (!isParentRoot(dest)) mkdirpSync(path.dirname(dest));
  return doRename(src, dest, overwrite, isChangingCase);
}
function isParentRoot(dest) {
  const parent = path.dirname(dest);
  const parsedPath = path.parse(parent);
  return parsedPath.root === parent;
}
function doRename(src, dest, overwrite, isChangingCase) {
  if (isChangingCase) return rename(src, dest, overwrite);
  if (overwrite) {
    removeSync(dest);
    return rename(src, dest, overwrite);
  }
  if (fs$1.existsSync(dest)) throw new Error("dest already exists.");
  return rename(src, dest, overwrite);
}
function rename(src, dest, overwrite) {
  try {
    fs$1.renameSync(src, dest);
  } catch (err) {
    if (err.code !== "EXDEV") throw err;
    return moveAcrossDevice(src, dest, overwrite);
  }
}
function moveAcrossDevice(src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true,
    preserveTimestamps: true
  };
  copySync(src, dest, opts);
  return removeSync(src);
}
var moveSync_1 = moveSync;
const u = universalify$1.fromPromise;
var move = {
  move: u(move_1),
  moveSync: moveSync_1
};
var lib = {
  // Export promiseified graceful-fs:
  ...fs$i,
  // Export extra methods:
  ...copy$1,
  ...empty,
  ...ensure,
  ...json$1,
  ...mkdirs$2,
  ...move,
  ...outputFile_1,
  ...pathExists_1,
  ...remove_1
};
const APP_NAME = "Notemark";
const APP_DIR_NAME = APP_NAME;
const fileEncoding = "utf-8";
var toString = Object.prototype.toString;
var kindOf = function kindOf2(val) {
  if (val === void 0) return "undefined";
  if (val === null) return "null";
  var type2 = typeof val;
  if (type2 === "boolean") return "boolean";
  if (type2 === "string") return "string";
  if (type2 === "number") return "number";
  if (type2 === "symbol") return "symbol";
  if (type2 === "function") {
    return isGeneratorFn(val) ? "generatorfunction" : "function";
  }
  if (isArray(val)) return "array";
  if (isBuffer$1(val)) return "buffer";
  if (isArguments(val)) return "arguments";
  if (isDate(val)) return "date";
  if (isError(val)) return "error";
  if (isRegexp(val)) return "regexp";
  switch (ctorName(val)) {
    case "Symbol":
      return "symbol";
    case "Promise":
      return "promise";
    case "WeakMap":
      return "weakmap";
    case "WeakSet":
      return "weakset";
    case "Map":
      return "map";
    case "Set":
      return "set";
    case "Int8Array":
      return "int8array";
    case "Uint8Array":
      return "uint8array";
    case "Uint8ClampedArray":
      return "uint8clampedarray";
    case "Int16Array":
      return "int16array";
    case "Uint16Array":
      return "uint16array";
    case "Int32Array":
      return "int32array";
    case "Uint32Array":
      return "uint32array";
    case "Float32Array":
      return "float32array";
    case "Float64Array":
      return "float64array";
  }
  if (isGeneratorObj(val)) {
    return "generator";
  }
  type2 = toString.call(val);
  switch (type2) {
    case "[object Object]":
      return "object";
    case "[object Map Iterator]":
      return "mapiterator";
    case "[object Set Iterator]":
      return "setiterator";
    case "[object String Iterator]":
      return "stringiterator";
    case "[object Array Iterator]":
      return "arrayiterator";
  }
  return type2.slice(8, -1).toLowerCase().replace(/\s/g, "");
};
function ctorName(val) {
  return typeof val.constructor === "function" ? val.constructor.name : null;
}
function isArray(val) {
  if (Array.isArray) return Array.isArray(val);
  return val instanceof Array;
}
function isError(val) {
  return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
}
function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
}
function isRegexp(val) {
  if (val instanceof RegExp) return true;
  return typeof val.flags === "string" && typeof val.ignoreCase === "boolean" && typeof val.multiline === "boolean" && typeof val.global === "boolean";
}
function isGeneratorFn(name, val) {
  return ctorName(name) === "GeneratorFunction";
}
function isGeneratorObj(val) {
  return typeof val.throw === "function" && typeof val.return === "function" && typeof val.next === "function";
}
function isArguments(val) {
  try {
    if (typeof val.length === "number" && typeof val.callee === "function") {
      return true;
    }
  } catch (err) {
    if (err.message.indexOf("callee") !== -1) {
      return true;
    }
  }
  return false;
}
function isBuffer$1(val) {
  if (val.constructor && typeof val.constructor.isBuffer === "function") {
    return val.constructor.isBuffer(val);
  }
  return false;
}
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */
var isExtendable = function isExtendable2(val) {
  return typeof val !== "undefined" && val !== null && (typeof val === "object" || typeof val === "function");
};
var isObject$1 = isExtendable;
var extendShallow = function extend2(o) {
  if (!isObject$1(o)) {
    o = {};
  }
  var len = arguments.length;
  for (var i2 = 1; i2 < len; i2++) {
    var obj = arguments[i2];
    if (isObject$1(obj)) {
      assign(o, obj);
    }
  }
  return o;
};
function assign(a, b) {
  for (var key in b) {
    if (hasOwn(b, key)) {
      a[key] = b[key];
    }
  }
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
var typeOf$2 = kindOf;
var extend$1 = extendShallow;
var sectionMatter = function(input, options2) {
  if (typeof options2 === "function") {
    options2 = { parse: options2 };
  }
  var file2 = toObject(input);
  var defaults2 = { section_delimiter: "---", parse: identity };
  var opts = extend$1({}, defaults2, options2);
  var delim = opts.section_delimiter;
  var lines = file2.content.split(/\r?\n/);
  var sections2 = null;
  var section = createSection();
  var content = [];
  var stack = [];
  function initSections(val) {
    file2.content = val;
    sections2 = [];
    content = [];
  }
  function closeSection(val) {
    if (stack.length) {
      section.key = getKey(stack[0], delim);
      section.content = val;
      opts.parse(section, sections2);
      sections2.push(section);
      section = createSection();
      content = [];
      stack = [];
    }
  }
  for (var i2 = 0; i2 < lines.length; i2++) {
    var line = lines[i2];
    var len = stack.length;
    var ln = line.trim();
    if (isDelimiter(ln, delim)) {
      if (ln.length === 3 && i2 !== 0) {
        if (len === 0 || len === 2) {
          content.push(line);
          continue;
        }
        stack.push(ln);
        section.data = content.join("\n");
        content = [];
        continue;
      }
      if (sections2 === null) {
        initSections(content.join("\n"));
      }
      if (len === 2) {
        closeSection(content.join("\n"));
      }
      stack.push(ln);
      continue;
    }
    content.push(line);
  }
  if (sections2 === null) {
    initSections(content.join("\n"));
  } else {
    closeSection(content.join("\n"));
  }
  file2.sections = sections2;
  return file2;
};
function isDelimiter(line, delim) {
  if (line.slice(0, delim.length) !== delim) {
    return false;
  }
  if (line.charAt(delim.length + 1) === delim.slice(-1)) {
    return false;
  }
  return true;
}
function toObject(input) {
  if (typeOf$2(input) !== "object") {
    input = { content: input };
  }
  if (typeof input.content !== "string" && !isBuffer(input.content)) {
    throw new TypeError("expected a buffer or string");
  }
  input.content = input.content.toString();
  input.sections = [];
  return input;
}
function getKey(val, delim) {
  return val ? val.slice(delim.length).trim() : "";
}
function createSection() {
  return { key: "", data: "", content: "" };
}
function identity(val) {
  return val;
}
function isBuffer(val) {
  if (val && val.constructor && typeof val.constructor.isBuffer === "function") {
    return val.constructor.isBuffer(val);
  }
  return false;
}
var engines$2 = { exports: {} };
var jsYaml$1 = {};
var loader$1 = {};
var common$6 = {};
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
common$6.isNothing = isNothing;
common$6.isObject = isObject;
common$6.toArray = toArray;
common$6.repeat = repeat;
common$6.isNegativeZero = isNegativeZero;
common$6.extend = extend;
function YAMLException$4(reason, mark2) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark2;
  this.message = (this.reason || "(unknown reason)") + (this.mark ? " " + this.mark.toString() : "");
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$4.prototype = Object.create(Error.prototype);
YAMLException$4.prototype.constructor = YAMLException$4;
YAMLException$4.prototype.toString = function toString2(compact) {
  var result = this.name + ": ";
  result += this.reason || "(unknown reason)";
  if (!compact && this.mark) {
    result += " " + this.mark.toString();
  }
  return result;
};
var exception = YAMLException$4;
var common$5 = common$6;
function Mark$1(name, buffer, position, line, column) {
  this.name = name;
  this.buffer = buffer;
  this.position = position;
  this.line = line;
  this.column = column;
}
Mark$1.prototype.getSnippet = function getSnippet(indent, maxLength) {
  var head, start, tail, end, snippet;
  if (!this.buffer) return null;
  indent = indent || 4;
  maxLength = maxLength || 75;
  head = "";
  start = this.position;
  while (start > 0 && "\0\r\n\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1) {
    start -= 1;
    if (this.position - start > maxLength / 2 - 1) {
      head = " ... ";
      start += 5;
      break;
    }
  }
  tail = "";
  end = this.position;
  while (end < this.buffer.length && "\0\r\n\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1) {
    end += 1;
    if (end - this.position > maxLength / 2 - 1) {
      tail = " ... ";
      end -= 5;
      break;
    }
  }
  snippet = this.buffer.slice(start, end);
  return common$5.repeat(" ", indent) + head + snippet + tail + "\n" + common$5.repeat(" ", indent + this.position - start + head.length) + "^";
};
Mark$1.prototype.toString = function toString3(compact) {
  var snippet, where = "";
  if (this.name) {
    where += 'in "' + this.name + '" ';
  }
  where += "at line " + (this.line + 1) + ", column " + (this.column + 1);
  if (!compact) {
    snippet = this.getSnippet();
    if (snippet) {
      where += ":\n" + snippet;
    }
  }
  return where;
};
var mark = Mark$1;
var YAMLException$3 = exception;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$h(tag, options2) {
  options2 = options2 || {};
  Object.keys(options2).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException$3('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.tag = tag;
  this.kind = options2["kind"] || null;
  this.resolve = options2["resolve"] || function() {
    return true;
  };
  this.construct = options2["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options2["instanceOf"] || null;
  this.predicate = options2["predicate"] || null;
  this.represent = options2["represent"] || null;
  this.defaultStyle = options2["defaultStyle"] || null;
  this.styleAliases = compileStyleAliases(options2["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException$3('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$h;
var common$4 = common$6;
var YAMLException$2 = exception;
var Type$g = type;
function compileList(schema2, name, result) {
  var exclude = [];
  schema2.include.forEach(function(includedSchema) {
    result = compileList(includedSchema, name, result);
  });
  schema2[name].forEach(function(currentType) {
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
        exclude.push(previousIndex);
      }
    });
    result.push(currentType);
  });
  return result.filter(function(type2, index) {
    return exclude.indexOf(index) === -1;
  });
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {}
  }, index, length;
  function collectType(type2) {
    result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$5(definition) {
  this.include = definition.include || [];
  this.implicit = definition.implicit || [];
  this.explicit = definition.explicit || [];
  this.implicit.forEach(function(type2) {
    if (type2.loadKind && type2.loadKind !== "scalar") {
      throw new YAMLException$2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
  });
  this.compiledImplicit = compileList(this, "implicit", []);
  this.compiledExplicit = compileList(this, "explicit", []);
  this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
}
Schema$5.DEFAULT = null;
Schema$5.create = function createSchema() {
  var schemas, types;
  switch (arguments.length) {
    case 1:
      schemas = Schema$5.DEFAULT;
      types = arguments[0];
      break;
    case 2:
      schemas = arguments[0];
      types = arguments[1];
      break;
    default:
      throw new YAMLException$2("Wrong number of arguments for Schema.create function");
  }
  schemas = common$4.toArray(schemas);
  types = common$4.toArray(types);
  if (!schemas.every(function(schema2) {
    return schema2 instanceof Schema$5;
  })) {
    throw new YAMLException$2("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");
  }
  if (!types.every(function(type2) {
    return type2 instanceof Type$g;
  })) {
    throw new YAMLException$2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  }
  return new Schema$5({
    include: schemas,
    explicit: types
  });
};
var schema = Schema$5;
var Type$f = type;
var str = new Type$f("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var Type$e = type;
var seq = new Type$e("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var Type$d = type;
var map = new Type$d("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var Schema$4 = schema;
var failsafe = new Schema$4({
  explicit: [
    str,
    seq,
    map
  ]
});
var Type$c = type;
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new Type$c("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    }
  },
  defaultStyle: "lowercase"
});
var Type$b = type;
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new Type$b("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
var common$3 = common$6;
var Type$a = type;
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    for (; index < max; index++) {
      ch = data[index];
      if (ch === "_") continue;
      if (!isOctCode(data.charCodeAt(index))) return false;
      hasDigits = true;
    }
    return hasDigits && ch !== "_";
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (ch === ":") break;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  if (ch !== ":") return true;
  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch, base, digits = [];
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value, 16);
    return sign * parseInt(value, 8);
  }
  if (value.indexOf(":") !== -1) {
    value.split(":").forEach(function(v) {
      digits.unshift(parseInt(v, 10));
    });
    value = 0;
    base = 1;
    digits.forEach(function(d) {
      value += d * base;
      base *= 60;
    });
    return sign * value;
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common$3.isNegativeZero(object));
}
var int = new Type$a("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0" + obj.toString(8) : "-0" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var common$2 = common$6;
var Type$9 = type;
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign, base, digits;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  digits = [];
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  } else if (value.indexOf(":") >= 0) {
    value.split(":").forEach(function(v) {
      digits.unshift(parseFloat(v, 10));
    });
    value = 0;
    base = 1;
    digits.forEach(function(d) {
      value += d * base;
      base *= 60;
    });
    return sign * value;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common$2.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common$2.isNegativeZero(object));
}
var float = new Type$9("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var Schema$3 = schema;
var json = new Schema$3({
  include: [
    failsafe
  ],
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var Schema$2 = schema;
var core = new Schema$2({
  include: [
    json
  ]
});
var Type$8 = type;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new Type$8("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
var Type$7 = type;
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new Type$7("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var NodeBuffer;
try {
  var _require$1 = commonjsRequire;
  NodeBuffer = _require$1("buffer").Buffer;
} catch (__) {
}
var Type$6 = type;
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  if (NodeBuffer) {
    return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
  }
  return result;
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(object) {
  return NodeBuffer && NodeBuffer.isBuffer(object);
}
var binary = new Type$6("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var Type$5 = type;
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new Type$5("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var Type$4 = type;
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new Type$4("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var Type$3 = type;
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new Type$3("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var Schema$1 = schema;
var default_safe = new Schema$1({
  include: [
    core
  ],
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var Type$2 = type;
function resolveJavascriptUndefined() {
  return true;
}
function constructJavascriptUndefined() {
  return void 0;
}
function representJavascriptUndefined() {
  return "";
}
function isUndefined(object) {
  return typeof object === "undefined";
}
var _undefined = new Type$2("tag:yaml.org,2002:js/undefined", {
  kind: "scalar",
  resolve: resolveJavascriptUndefined,
  construct: constructJavascriptUndefined,
  predicate: isUndefined,
  represent: representJavascriptUndefined
});
var Type$1 = type;
function resolveJavascriptRegExp(data) {
  if (data === null) return false;
  if (data.length === 0) return false;
  var regexp2 = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
  if (regexp2[0] === "/") {
    if (tail) modifiers = tail[1];
    if (modifiers.length > 3) return false;
    if (regexp2[regexp2.length - modifiers.length - 1] !== "/") return false;
  }
  return true;
}
function constructJavascriptRegExp(data) {
  var regexp2 = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
  if (regexp2[0] === "/") {
    if (tail) modifiers = tail[1];
    regexp2 = regexp2.slice(1, regexp2.length - modifiers.length - 1);
  }
  return new RegExp(regexp2, modifiers);
}
function representJavascriptRegExp(object) {
  var result = "/" + object.source + "/";
  if (object.global) result += "g";
  if (object.multiline) result += "m";
  if (object.ignoreCase) result += "i";
  return result;
}
function isRegExp(object) {
  return Object.prototype.toString.call(object) === "[object RegExp]";
}
var regexp = new Type$1("tag:yaml.org,2002:js/regexp", {
  kind: "scalar",
  resolve: resolveJavascriptRegExp,
  construct: constructJavascriptRegExp,
  predicate: isRegExp,
  represent: representJavascriptRegExp
});
var esprima;
try {
  var _require = commonjsRequire;
  esprima = _require("esprima");
} catch (_) {
  if (typeof window !== "undefined") esprima = window.esprima;
}
var Type = type;
function resolveJavascriptFunction(data) {
  if (data === null) return false;
  try {
    var source = "(" + data + ")", ast = esprima.parse(source, { range: true });
    if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
function constructJavascriptFunction(data) {
  var source = "(" + data + ")", ast = esprima.parse(source, { range: true }), params = [], body;
  if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
    throw new Error("Failed to resolve function");
  }
  ast.body[0].expression.params.forEach(function(param) {
    params.push(param.name);
  });
  body = ast.body[0].expression.body.range;
  if (ast.body[0].expression.body.type === "BlockStatement") {
    return new Function(params, source.slice(body[0] + 1, body[1] - 1));
  }
  return new Function(params, "return " + source.slice(body[0], body[1]));
}
function representJavascriptFunction(object) {
  return object.toString();
}
function isFunction(object) {
  return Object.prototype.toString.call(object) === "[object Function]";
}
var _function = new Type("tag:yaml.org,2002:js/function", {
  kind: "scalar",
  resolve: resolveJavascriptFunction,
  construct: constructJavascriptFunction,
  predicate: isFunction,
  represent: representJavascriptFunction
});
var Schema = schema;
var default_full = Schema.DEFAULT = new Schema({
  include: [
    default_safe
  ],
  explicit: [
    _undefined,
    regexp,
    _function
  ]
});
var common$1 = common$6;
var YAMLException$1 = exception;
var Mark = mark;
var DEFAULT_SAFE_SCHEMA$1 = default_safe;
var DEFAULT_FULL_SCHEMA$1 = default_full;
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function State$1(input, options2) {
  this.input = input;
  this.filename = options2["filename"] || null;
  this.schema = options2["schema"] || DEFAULT_FULL_SCHEMA$1;
  this.onWarning = options2["onWarning"] || null;
  this.legacy = options2["legacy"] || false;
  this.json = options2["json"] || false;
  this.listener = options2["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.documents = [];
}
function generateError(state, message) {
  return new YAMLException$1(
    message,
    new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart)
  );
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common$1.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    _result[keyNode] = valueNode;
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common$1.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = {}, keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common$1.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common$1.repeat("\n", emptyLines);
      }
    } else {
      state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _pos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = {}, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    _pos = state.position;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    } else {
      break;
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if (state.lineIndent > nodeIndent && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag !== null && state.tag !== "!") {
    if (state.tag === "?") {
      if (state.result !== null && state.kind !== "scalar") {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }
      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type2 = state.implicitTypes[typeIndex];
        if (type2.resolve(state.result)) {
          state.result = type2.construct(state.result);
          state.tag = type2.tag;
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
      if (state.result !== null && type2.kind !== state.kind) {
        throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
      }
      if (!type2.resolve(state.result)) {
        throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
      } else {
        state.result = type2.construct(state.result);
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = {};
  state.anchorMap = {};
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options2) {
  input = String(input);
  options2 = options2 || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options2);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll(input, iterator, options2) {
  if (iterator !== null && typeof iterator === "object" && typeof options2 === "undefined") {
    options2 = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options2);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load(input, options2) {
  var documents = loadDocuments(input, options2);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException$1("expected a single document in the stream, but found more");
}
function safeLoadAll(input, iterator, options2) {
  if (typeof iterator === "object" && iterator !== null && typeof options2 === "undefined") {
    options2 = iterator;
    iterator = null;
  }
  return loadAll(input, iterator, common$1.extend({ schema: DEFAULT_SAFE_SCHEMA$1 }, options2));
}
function safeLoad(input, options2) {
  return load(input, common$1.extend({ schema: DEFAULT_SAFE_SCHEMA$1 }, options2));
}
loader$1.loadAll = loadAll;
loader$1.load = load;
loader$1.safeLoadAll = safeLoadAll;
loader$1.safeLoad = safeLoad;
var dumper$1 = {};
var common = common$6;
var YAMLException = exception;
var DEFAULT_FULL_SCHEMA = default_full;
var DEFAULT_SAFE_SCHEMA = default_safe;
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
function State(options2) {
  this.schema = options2["schema"] || DEFAULT_FULL_SCHEMA;
  this.indent = Math.max(1, options2["indent"] || 2);
  this.noArrayIndent = options2["noArrayIndent"] || false;
  this.skipInvalid = options2["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options2["flowLevel"]) ? -1 : options2["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options2["styles"] || null);
  this.sortKeys = options2["sortKeys"] || false;
  this.lineWidth = options2["lineWidth"] || 80;
  this.noRefs = options2["noRefs"] || false;
  this.noCompatMode = options2["noCompatMode"] || false;
  this.condenseFlow = options2["condenseFlow"] || false;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== 65279 || 65536 <= c && c <= 1114111;
}
function isNsChar(c) {
  return isPrintable(c) && !isWhitespace(c) && c !== 65279 && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev) {
  return isPrintable(c) && c !== 65279 && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_COLON && (c !== CHAR_SHARP || prev && isNsChar(prev));
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== 65279 && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
  var i2;
  var char, prev_char;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
  if (singleLineOnly) {
    for (i2 = 0; i2 < string.length; i2++) {
      char = string.charCodeAt(i2);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      prev_char = i2 > 0 ? string.charCodeAt(i2 - 1) : null;
      plain = plain && isPlainSafe(char, prev_char);
    }
  } else {
    for (i2 = 0; i2 < string.length; i2++) {
      char = string.charCodeAt(i2);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i2;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      prev_char = i2 > 0 ? string.charCodeAt(i2 - 1) : null;
      plain = plain && isPlainSafe(char, prev_char);
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}
function writeScalar(state, string, level, iskey) {
  state.dump = function() {
    if (string.length === 0) {
      return "''";
    }
    if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
      return "'" + string + "'";
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new YAMLException("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char, nextChar;
  var escapeSeq;
  for (var i2 = 0; i2 < string.length; i2++) {
    char = string.charCodeAt(i2);
    if (char >= 55296 && char <= 56319) {
      nextChar = string.charCodeAt(i2 + 1);
      if (nextChar >= 56320 && nextChar <= 57343) {
        result += encodeHex((char - 55296) * 1024 + nextChar - 56320 + 65536);
        i2++;
        continue;
      }
    }
    escapeSeq = ESCAPE_SEQUENCES[char];
    result += !escapeSeq && isPrintable(char) ? string[i2] : escapeSeq || encodeHex(char);
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length;
  for (index = 0, length = object.length; index < length; index += 1) {
    if (writeNode(state, level, object[index], false, false)) {
      if (index !== 0) _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length;
  for (index = 0, length = object.length; index < length; index += 1) {
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || index !== 0) {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (index !== 0) pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new YAMLException("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || index !== 0) {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      state.tag = explicit ? type2.tag : "?";
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new YAMLException("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      var arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
      if (block && state.dump.length !== 0) {
        writeBlockSequence(state, arrayLevel, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, arrayLevel, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey);
      }
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      state.dump = "!<" + state.tag + "> " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump(input, options2) {
  options2 = options2 || {};
  var state = new State(options2);
  if (!state.noRefs) getDuplicateReferences(input, state);
  if (writeNode(state, 0, input, true, true)) return state.dump + "\n";
  return "";
}
function safeDump(input, options2) {
  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options2));
}
dumper$1.dump = dump;
dumper$1.safeDump = safeDump;
var loader = loader$1;
var dumper = dumper$1;
function deprecated(name) {
  return function() {
    throw new Error("Function " + name + " is deprecated and cannot be used.");
  };
}
jsYaml$1.Type = type;
jsYaml$1.Schema = schema;
jsYaml$1.FAILSAFE_SCHEMA = failsafe;
jsYaml$1.JSON_SCHEMA = json;
jsYaml$1.CORE_SCHEMA = core;
jsYaml$1.DEFAULT_SAFE_SCHEMA = default_safe;
jsYaml$1.DEFAULT_FULL_SCHEMA = default_full;
jsYaml$1.load = loader.load;
jsYaml$1.loadAll = loader.loadAll;
jsYaml$1.safeLoad = loader.safeLoad;
jsYaml$1.safeLoadAll = loader.safeLoadAll;
jsYaml$1.dump = dumper.dump;
jsYaml$1.safeDump = dumper.safeDump;
jsYaml$1.YAMLException = exception;
jsYaml$1.MINIMAL_SCHEMA = failsafe;
jsYaml$1.SAFE_SCHEMA = default_safe;
jsYaml$1.DEFAULT_SCHEMA = default_full;
jsYaml$1.scan = deprecated("scan");
jsYaml$1.parse = deprecated("parse");
jsYaml$1.compose = deprecated("compose");
jsYaml$1.addConstructor = deprecated("addConstructor");
var yaml = jsYaml$1;
var jsYaml = yaml;
(function(module, exports) {
  const yaml = jsYaml;
  const engines = module.exports;
  engines.yaml = {
    parse: yaml.safeLoad.bind(yaml),
    stringify: yaml.safeDump.bind(yaml)
  };
  engines.json = {
    parse: JSON.parse.bind(JSON),
    stringify: function(obj, options2) {
      const opts = Object.assign({ replacer: null, space: 2 }, options2);
      return JSON.stringify(obj, opts.replacer, opts.space);
    }
  };
  engines.javascript = {
    parse: function parse(str, options, wrap) {
      try {
        if (wrap !== false) {
          str = "(function() {\nreturn " + str.trim() + ";\n}());";
        }
        return eval(str) || {};
      } catch (err) {
        if (wrap !== false && /(unexpected|identifier)/i.test(err.message)) {
          return parse(str, options, false);
        }
        throw new SyntaxError(err);
      }
    },
    stringify: function() {
      throw new Error("stringifying JavaScript is not supported");
    }
  };
})(engines$2);
var enginesExports = engines$2.exports;
var utils$3 = {};
/*!
 * strip-bom-string <https://github.com/jonschlinkert/strip-bom-string>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */
var stripBomString = function(str2) {
  if (typeof str2 === "string" && str2.charAt(0) === "\uFEFF") {
    return str2.slice(1);
  }
  return str2;
};
(function(exports2) {
  const stripBom2 = stripBomString;
  const typeOf2 = kindOf;
  exports2.define = function(obj, key, val) {
    Reflect.defineProperty(obj, key, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: val
    });
  };
  exports2.isBuffer = function(val) {
    return typeOf2(val) === "buffer";
  };
  exports2.isObject = function(val) {
    return typeOf2(val) === "object";
  };
  exports2.toBuffer = function(input) {
    return typeof input === "string" ? Buffer.from(input) : input;
  };
  exports2.toString = function(input) {
    if (exports2.isBuffer(input)) return stripBom2(String(input));
    if (typeof input !== "string") {
      throw new TypeError("expected input to be a string or buffer");
    }
    return stripBom2(input);
  };
  exports2.arrayify = function(val) {
    return val ? Array.isArray(val) ? val : [val] : [];
  };
  exports2.startsWith = function(str2, substr, len) {
    if (typeof len !== "number") len = substr.length;
    return str2.slice(0, len) === substr;
  };
})(utils$3);
const engines$1 = enginesExports;
const utils$2 = utils$3;
var defaults$4 = function(options2) {
  const opts = Object.assign({}, options2);
  opts.delimiters = utils$2.arrayify(opts.delims || opts.delimiters || "---");
  if (opts.delimiters.length === 1) {
    opts.delimiters.push(opts.delimiters[0]);
  }
  opts.language = (opts.language || opts.lang || "yaml").toLowerCase();
  opts.engines = Object.assign({}, engines$1, opts.parsers, opts.engines);
  return opts;
};
var engine = function(name, options2) {
  let engine2 = options2.engines[name] || options2.engines[aliase(name)];
  if (typeof engine2 === "undefined") {
    throw new Error('gray-matter engine "' + name + '" is not registered');
  }
  if (typeof engine2 === "function") {
    engine2 = { parse: engine2 };
  }
  return engine2;
};
function aliase(name) {
  switch (name.toLowerCase()) {
    case "js":
    case "javascript":
      return "javascript";
    case "coffee":
    case "coffeescript":
    case "cson":
      return "coffee";
    case "yaml":
    case "yml":
      return "yaml";
    default: {
      return name;
    }
  }
}
const typeOf$1 = kindOf;
const getEngine$1 = engine;
const defaults$3 = defaults$4;
var stringify$2 = function(file2, data, options2) {
  if (data == null && options2 == null) {
    switch (typeOf$1(file2)) {
      case "object":
        data = file2.data;
        options2 = {};
        break;
      case "string":
        return file2;
      default: {
        throw new TypeError("expected file to be a string or object");
      }
    }
  }
  const str2 = file2.content;
  const opts = defaults$3(options2);
  if (data == null) {
    if (!opts.data) return file2;
    data = opts.data;
  }
  const language = file2.language || opts.language;
  const engine2 = getEngine$1(language, opts);
  if (typeof engine2.stringify !== "function") {
    throw new TypeError('expected "' + language + '.stringify" to be a function');
  }
  data = Object.assign({}, file2.data, data);
  const open = opts.delimiters[0];
  const close = opts.delimiters[1];
  const matter2 = engine2.stringify(data, options2).trim();
  let buf = "";
  if (matter2 !== "{}") {
    buf = newline(open) + newline(matter2) + newline(close);
  }
  if (typeof file2.excerpt === "string" && file2.excerpt !== "") {
    if (str2.indexOf(file2.excerpt.trim()) === -1) {
      buf += newline(file2.excerpt) + newline(close);
    }
  }
  return buf + newline(str2);
};
function newline(str2) {
  return str2.slice(-1) !== "\n" ? str2 + "\n" : str2;
}
const defaults$2 = defaults$4;
var excerpt$1 = function(file2, options2) {
  const opts = defaults$2(options2);
  if (file2.data == null) {
    file2.data = {};
  }
  if (typeof opts.excerpt === "function") {
    return opts.excerpt(file2, opts);
  }
  const sep = file2.data.excerpt_separator || opts.excerpt_separator;
  if (sep == null && (opts.excerpt === false || opts.excerpt == null)) {
    return file2;
  }
  const delimiter = typeof opts.excerpt === "string" ? opts.excerpt : sep || opts.delimiters[0];
  const idx = file2.content.indexOf(delimiter);
  if (idx !== -1) {
    file2.excerpt = file2.content.slice(0, idx);
  }
  return file2;
};
const typeOf = kindOf;
const stringify$1 = stringify$2;
const utils$1 = utils$3;
var toFile$1 = function(file2) {
  if (typeOf(file2) !== "object") {
    file2 = { content: file2 };
  }
  if (typeOf(file2.data) !== "object") {
    file2.data = {};
  }
  if (file2.contents && file2.content == null) {
    file2.content = file2.contents;
  }
  utils$1.define(file2, "orig", utils$1.toBuffer(file2.content));
  utils$1.define(file2, "language", file2.language || "");
  utils$1.define(file2, "matter", file2.matter || "");
  utils$1.define(file2, "stringify", function(data, options2) {
    if (options2 && options2.language) {
      file2.language = options2.language;
    }
    return stringify$1(file2, data, options2);
  });
  file2.content = utils$1.toString(file2.content);
  file2.isEmpty = false;
  file2.excerpt = "";
  return file2;
};
const getEngine = engine;
const defaults$1 = defaults$4;
var parse$1 = function(language, str2, options2) {
  const opts = defaults$1(options2);
  const engine2 = getEngine(language, opts);
  if (typeof engine2.parse !== "function") {
    throw new TypeError('expected "' + language + '.parse" to be a function');
  }
  return engine2.parse(str2, opts);
};
const fs = require$$0$2;
const sections = sectionMatter;
const defaults = defaults$4;
const stringify = stringify$2;
const excerpt = excerpt$1;
const engines = enginesExports;
const toFile = toFile$1;
const parse = parse$1;
const utils = utils$3;
function matter(input, options2) {
  if (input === "") {
    return { data: {}, content: input, excerpt: "", orig: input };
  }
  let file2 = toFile(input);
  const cached = matter.cache[file2.content];
  if (!options2) {
    if (cached) {
      file2 = Object.assign({}, cached);
      file2.orig = cached.orig;
      return file2;
    }
    matter.cache[file2.content] = file2;
  }
  return parseMatter(file2, options2);
}
function parseMatter(file2, options2) {
  const opts = defaults(options2);
  const open = opts.delimiters[0];
  const close = "\n" + opts.delimiters[1];
  let str2 = file2.content;
  if (opts.language) {
    file2.language = opts.language;
  }
  const openLen = open.length;
  if (!utils.startsWith(str2, open, openLen)) {
    excerpt(file2, opts);
    return file2;
  }
  if (str2.charAt(openLen) === open.slice(-1)) {
    return file2;
  }
  str2 = str2.slice(openLen);
  const len = str2.length;
  const language = matter.language(str2, opts);
  if (language.name) {
    file2.language = language.name;
    str2 = str2.slice(language.raw.length);
  }
  let closeIndex = str2.indexOf(close);
  if (closeIndex === -1) {
    closeIndex = len;
  }
  file2.matter = str2.slice(0, closeIndex);
  const block = file2.matter.replace(/^\s*#[^\n]+/gm, "").trim();
  if (block === "") {
    file2.isEmpty = true;
    file2.empty = file2.content;
    file2.data = {};
  } else {
    file2.data = parse(file2.language, file2.matter, opts);
  }
  if (closeIndex === len) {
    file2.content = "";
  } else {
    file2.content = str2.slice(closeIndex + close.length);
    if (file2.content[0] === "\r") {
      file2.content = file2.content.slice(1);
    }
    if (file2.content[0] === "\n") {
      file2.content = file2.content.slice(1);
    }
  }
  excerpt(file2, opts);
  if (opts.sections === true || typeof opts.section === "function") {
    sections(file2, opts.section);
  }
  return file2;
}
matter.engines = engines;
matter.stringify = function(file2, data, options2) {
  if (typeof file2 === "string") file2 = matter(file2, options2);
  return stringify(file2, data, options2);
};
matter.read = function(filepath, options2) {
  const str2 = fs.readFileSync(filepath, "utf8");
  const file2 = matter(str2, options2);
  file2.path = filepath;
  return file2;
};
matter.test = function(str2, options2) {
  return utils.startsWith(str2, defaults(options2).delimiters[0]);
};
matter.language = function(str2, options2) {
  const opts = defaults(options2);
  const open = opts.delimiters[0];
  if (matter.test(str2)) {
    str2 = str2.slice(open.length);
  }
  const language = str2.slice(0, str2.search(/\r?\n/));
  return {
    raw: language,
    name: language ? language.trim() : ""
  };
};
matter.cache = {};
matter.clearCache = function() {
  matter.cache = {};
};
var grayMatter = matter;
const grayMatter$1 = /* @__PURE__ */ getDefaultExportFromCjs(grayMatter);
const getRootDir = () => {
  return `${homedir()}/${APP_DIR_NAME}`;
};
const getNotes = async () => {
  const rootDir = getRootDir();
  await lib.ensureDir(rootDir);
  const notesFile = await lib.readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  });
  const notes = notesFile.filter((noteFile) => noteFile.endsWith(".md"));
  return Promise.all(notes.map(getNoteInfoFromFilename));
};
const getNoteInfoFromFilename = async (filename) => {
  const filePath = `${getRootDir()}/${filename}`;
  const fileStat = await lib.stat(filePath);
  const fileContent = await lib.readFile(filePath, { encoding: fileEncoding });
  const { content, data } = grayMatter$1(fileContent);
  const { description, category } = data;
  return {
    id: fileStat.ino.toString(),
    title: filename.replace(/\.md$/, ""),
    content,
    description,
    category,
    createdAt: fileStat.birthtime,
    updatedAt: fileStat.mtime
  };
};
const __dirname = path$c.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$c.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const RENDERER_DIST = path$c.join(process.env.APP_ROOT, "dist");
const MAIN_DIST = path$c.join(process.env.APP_ROOT, "dist-electron");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$c.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let window$1;
function createWindow() {
  window$1 = new BrowserWindow({
    icon: path$c.join(process.env.VITE_PUBLIC ?? "", "electron-vite.svg"),
    width: 1360,
    height: 840,
    title: "NoteMark",
    center: true,
    vibrancy: "under-window",
    trafficLightPosition: { x: 15, y: 10 },
    titleBarStyle: process.platform === "darwin" ? "hidden" : "default",
    autoHideMenuBar: true,
    frame: false,
    visualEffectState: "active",
    webPreferences: {
      preload: path$c.join(__dirname, "preload.mjs"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true
    }
  });
  window$1.webContents.on(
    "did-finish-load",
    () => window$1 == null ? void 0 : window$1.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    )
  );
  window$1.webContents.openDevTools();
  if (VITE_DEV_SERVER_URL) {
    window$1.loadURL(VITE_DEV_SERVER_URL);
  } else {
    window$1.loadFile(path$c.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    window$1 = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  ipcMain.handle(
    "getNotes",
    (_, ...args) => getNotes(...args)
  );
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
