var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-p6Xbe5/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// dist-worker/index.js
var __defProp2 = Object.defineProperty;
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var strictDecoder = new TextDecoder("utf-8", { fatal: true });
var UINT32_RANGE = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0), buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers)
    buf.set(buffer, i), i += buffer.length;
  return buf;
}
__name(concat, "concat");
var NON_ASCII = /[^\x00-\x7f]/;
function encode(string) {
  if (typeof string == "string" && string.length >= 128) {
    if (NON_ASCII.test(string))
      throw new TypeError("non-ASCII string encountered in encode()");
    return encoder.encode(string);
  }
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127)
      throw new TypeError("non-ASCII string encountered in encode()");
    bytes[i] = code;
  }
  return bytes;
}
__name(encode, "encode");
function decodeBase64(encoded, url = false) {
  if (Uint8Array.fromBase64)
    return Uint8Array.fromBase64(encoded, { alphabet: url ? "base64url" : "base64" });
  if (url) {
    if (encoded.includes("+") || encoded.includes("/"))
      throw new TypeError("Invalid base64url");
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  }
  const binary = atob(encoded), bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
}
__name(decodeBase64, "decodeBase64");
var errors_exports = {};
__export(errors_exports, {
  JOSEAlgNotAllowed: () => JOSEAlgNotAllowed,
  JOSEError: () => JOSEError,
  JOSENotSupported: () => JOSENotSupported,
  JWEDecryptionFailed: () => JWEDecryptionFailed,
  JWEInvalid: () => JWEInvalid,
  JWKInvalid: () => JWKInvalid,
  JWKSInvalid: () => JWKSInvalid,
  JWKSMultipleMatchingKeys: () => JWKSMultipleMatchingKeys,
  JWKSNoMatchingKey: () => JWKSNoMatchingKey,
  JWKSTimeout: () => JWKSTimeout,
  JWSInvalid: () => JWSInvalid,
  JWSSignatureVerificationFailed: () => JWSSignatureVerificationFailed,
  JWTClaimValidationFailed: () => JWTClaimValidationFailed,
  JWTExpired: () => JWTExpired,
  JWTInvalid: () => JWTInvalid
});
var _a;
var JOSEError = /* @__PURE__ */ __name((_a = class extends Error {
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
  }
}, __publicField(_a, "code", "ERR_JOSE_GENERIC"), _a), "JOSEError");
var _a2;
var JWTClaimValidationFailed = /* @__PURE__ */ __name((_a2 = class extends JOSEError {
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
}, __publicField(_a2, "code", "ERR_JWT_CLAIM_VALIDATION_FAILED"), _a2), "JWTClaimValidationFailed");
var _a3;
var JWTExpired = /* @__PURE__ */ __name((_a3 = class extends JOSEError {
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
}, __publicField(_a3, "code", "ERR_JWT_EXPIRED"), _a3), "JWTExpired");
var _a4;
var JOSEAlgNotAllowed = /* @__PURE__ */ __name((_a4 = class extends JOSEError {
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
}, __publicField(_a4, "code", "ERR_JOSE_ALG_NOT_ALLOWED"), _a4), "JOSEAlgNotAllowed");
var _a5;
var JOSENotSupported = /* @__PURE__ */ __name((_a5 = class extends JOSEError {
  code = "ERR_JOSE_NOT_SUPPORTED";
}, __publicField(_a5, "code", "ERR_JOSE_NOT_SUPPORTED"), _a5), "JOSENotSupported");
var _a6;
var JWEDecryptionFailed = /* @__PURE__ */ __name((_a6 = class extends JOSEError {
  code = "ERR_JWE_DECRYPTION_FAILED";
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
  }
}, __publicField(_a6, "code", "ERR_JWE_DECRYPTION_FAILED"), _a6), "JWEDecryptionFailed");
var _a7;
var JWEInvalid = /* @__PURE__ */ __name((_a7 = class extends JOSEError {
  code = "ERR_JWE_INVALID";
}, __publicField(_a7, "code", "ERR_JWE_INVALID"), _a7), "JWEInvalid");
var _a8;
var JWSInvalid = /* @__PURE__ */ __name((_a8 = class extends JOSEError {
  code = "ERR_JWS_INVALID";
}, __publicField(_a8, "code", "ERR_JWS_INVALID"), _a8), "JWSInvalid");
var _a9;
var JWTInvalid = /* @__PURE__ */ __name((_a9 = class extends JOSEError {
  code = "ERR_JWT_INVALID";
}, __publicField(_a9, "code", "ERR_JWT_INVALID"), _a9), "JWTInvalid");
var _a10;
var JWKInvalid = /* @__PURE__ */ __name((_a10 = class extends JOSEError {
  code = "ERR_JWK_INVALID";
}, __publicField(_a10, "code", "ERR_JWK_INVALID"), _a10), "JWKInvalid");
var _a11;
var JWKSInvalid = /* @__PURE__ */ __name((_a11 = class extends JOSEError {
  code = "ERR_JWKS_INVALID";
}, __publicField(_a11, "code", "ERR_JWKS_INVALID"), _a11), "JWKSInvalid");
var _a12;
var JWKSNoMatchingKey = /* @__PURE__ */ __name((_a12 = class extends JOSEError {
  code = "ERR_JWKS_NO_MATCHING_KEY";
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
  }
}, __publicField(_a12, "code", "ERR_JWKS_NO_MATCHING_KEY"), _a12), "JWKSNoMatchingKey");
var _a13;
var JWKSMultipleMatchingKeys = /* @__PURE__ */ __name((_a13 = class extends JOSEError {
  [Symbol.asyncIterator] = async function* () {
  };
  code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
  }
}, __publicField(_a13, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS"), _a13), "JWKSMultipleMatchingKeys");
var _a14;
var JWKSTimeout = /* @__PURE__ */ __name((_a14 = class extends JOSEError {
  code = "ERR_JWKS_TIMEOUT";
  constructor(message2 = "request timed out", options) {
    super(message2, options);
  }
}, __publicField(_a14, "code", "ERR_JWKS_TIMEOUT"), _a14), "JWKSTimeout");
var _a15;
var JWSSignatureVerificationFailed = /* @__PURE__ */ __name((_a15 = class extends JOSEError {
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
}, __publicField(_a15, "code", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"), _a15), "JWSSignatureVerificationFailed");
var invalid = "The input to be decoded is not correctly encoded.";
function decode(input) {
  try {
    return decodeBase64(typeof input == "string" ? input : decoder.decode(input), true);
  } catch (cause) {
    throw new TypeError(invalid, { cause });
  }
}
__name(decode, "decode");
function isObject(input) {
  if (typeof input != "object" || input === null || Object.prototype.toString.call(input) !== "[object Object]")
    return false;
  const prototype = Object.getPrototypeOf(input);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}
__name(isObject, "isObject");
function isJwkSet(input) {
  return isObject(input) && Array.isArray(input.keys) && Array.from(input.keys).every(isObject);
}
__name(isJwkSet, "isJwkSet");
function isDisjoint(...headers) {
  const parameters = /* @__PURE__ */ new Set();
  for (const header of headers)
    if (header)
      for (const parameter of Object.keys(header)) {
        if (parameters.has(parameter))
          return false;
        parameters.add(parameter);
      }
  return true;
}
__name(isDisjoint, "isDisjoint");
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch (cause) {
    throw new ErrorClass(`Failed to base64url decode the ${label}`, { cause });
  }
}
__name(decodeBase64url, "decodeBase64url");
function encodeAsciiMember(value, label, ErrorClass) {
  try {
    return encode(value);
  } catch (cause) {
    throw new ErrorClass(`The ${label} is not a valid base64url string`, { cause });
  }
}
__name(encodeAsciiMember, "encodeAsciiMember");
function parseJoseHeader(encodedProtectedHeader, ErrorClass, message2) {
  let parsed;
  try {
    parsed = JSON.parse(strictDecoder.decode(decode(encodedProtectedHeader)));
  } catch (cause) {
    throw new ErrorClass(message2, { cause });
  }
  if (!isObject(parsed))
    throw new ErrorClass(message2);
  return parsed;
}
__name(parseJoseHeader, "parseJoseHeader");
var JWS_RECOGNIZED = { __proto__: null, b64: true };
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s != "string")))
    throw new TypeError(`"${option}" option must be an array of strings`);
  return algorithms === void 0 ? void 0 : new Set(algorithms);
}
__name(validateAlgorithms, "validateAlgorithms");
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0)
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  if (!protectedHeader || protectedHeader.crit === void 0)
    return [];
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input != "string" || input.length === 0))
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  const recognized = recognizedOption === void 0 ? recognizedDefault : { __proto__: null, ...recognizedOption, ...recognizedDefault };
  for (const parameter of protectedHeader.crit) {
    if (!(parameter in recognized))
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    if (!Object.hasOwn(joseHeader, parameter) || joseHeader[parameter] === void 0)
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    if (recognized[parameter] && (!Object.hasOwn(protectedHeader, parameter) || protectedHeader[parameter] === void 0))
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
  }
  return protectedHeader.crit;
}
__name(validateCrit, "validateCrit");
function validateB64(protectedHeader, extensions) {
  if (extensions.includes("b64")) {
    const b64 = protectedHeader.b64;
    if (typeof b64 != "boolean")
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    return b64;
  }
  return true;
}
__name(validateB64, "validateB64");
var tag = /* @__PURE__ */ __name((key) => key[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((entry, key, usage) => {
  const { alg } = entry;
  if (key.use !== void 0) {
    const expected = usage === "sign" || usage === "verify" ? "sig" : "enc";
    if (key.use !== expected)
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
  }
  if (key.alg !== void 0 && key.alg !== alg)
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  if (Array.isArray(key.key_ops)) {
    const expectedKeyOp = usage === "encrypt" || usage === "decrypt" ? entry.ops?.[usage === "encrypt" ? 0 : 1] : usage;
    if (expectedKeyOp && !key.key_ops.includes(expectedKeyOp))
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
  }
}, "jwkMatchesOp");
async function prepareKey(entry, key, usage) {
  const { alg, secret } = entry, requiresPrivateKey = usage === "decrypt" || usage === "sign";
  if (secret && key instanceof Uint8Array)
    return key;
  let normalized, keyObject;
  if (isObject(key)) {
    if (normalized = normalizeJwk(key), typeof normalized.kty != "string")
      throw invalidKeyType(alg, key, secret);
    if (!(secret ? normalized.kty === "oct" && typeof normalized.k == "string" : normalized.kty !== "oct" && (requiresPrivateKey ? normalized.kty === "AKP" && typeof normalized.priv == "string" || typeof normalized.d == "string" : normalized.d === void 0 && normalized.priv === void 0)))
      throw new TypeError(secret ? 'JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present' : `JSON Web Key for this operation must be a ${requiresPrivateKey ? "private" : "public"} JWK`);
    if (jwkMatchesOp(entry, normalized, usage), normalized.kty === "oct")
      return decode(normalized.k);
    if (!Object.isFrozen(key)) {
      const { key_ops } = key;
      Array.isArray(key_ops) && Object.freeze(key_ops), Object.freeze(key);
    }
  } else {
    if (!isKeyLike(key))
      throw invalidKeyType(alg, key, secret);
    const expectedType = secret ? "secret" : requiresPrivateKey ? "private" : "public";
    if (key.type !== expectedType && (secret || ["secret", "public", "private"].includes(key.type)))
      throw new TypeError(`${tag(key)} instances must be of type "${expectedType}" for the ${alg} algorithm`);
    if (isCryptoKey(key))
      return key;
    if (keyObject = key, keyObject.type === "secret")
      return keyObject.export();
  }
  cache ||= /* @__PURE__ */ new WeakMap();
  const cacheKey = key;
  let cached = cache.get(cacheKey);
  if (cached?.[alg])
    return cached[alg];
  if (cached || cache.set(cacheKey, cached = {}), keyObject && typeof keyObject.toCryptoKey == "function") {
    const isPublic = keyObject.type === "public", crv = nist[keyObject.asymmetricKeyDetails?.namedCurve], params = entry.resolve?.({ crv, asymmetricKeyType: keyObject.asymmetricKeyType }) ?? entry.subtle;
    return cached[alg] = keyObject.toCryptoKey(params, isPublic, entry.usages[isPublic ? 0 : 1]);
  }
  return normalized ??= keyObject.export({ format: "jwk" }), normalized.alg = alg, cached[alg] = await jwkToKey(entry, normalized);
}
__name(prepareKey, "prepareKey");
var cache;
var nist = {
  __proto__: null,
  prime256v1: "P-256",
  secp384r1: "P-384",
  secp521r1: "P-521"
};
var isCryptoKey = /* @__PURE__ */ __name((key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
}, "isCryptoKey");
var isKeyObject = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag] === "KeyObject", "isKeyObject");
var isKeyLike = /* @__PURE__ */ __name((key) => isCryptoKey(key) || isKeyObject(key), "isKeyLike");
function message(msg, actual, ...types) {
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else
    types.length === 2 ? msg += `one of type ${types[0]} or ${types[1]}.` : msg += `of type ${types[0]}.`;
  return actual == null ? msg += ` Received ${actual}` : typeof actual == "function" && actual.name ? msg += ` Received function ${actual.name}` : typeof actual == "object" && actual != null && actual.constructor?.name && (msg += ` Received an instance of ${actual.constructor.name}`), msg;
}
__name(message, "message");
function invalidKeyType(alg, actual, secret) {
  const types = ["CryptoKey", "KeyObject", "JSON Web Key"];
  return secret && types.push("Uint8Array"), new TypeError(message(`Key for the ${alg} algorithm must be `, actual, ...types));
}
__name(invalidKeyType, "invalidKeyType");
var unusable = /* @__PURE__ */ __name((name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`), "unusable");
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage))
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
}
__name(checkUsage, "checkUsage");
function checkModulusLength(alg, key) {
  const { modulusLength } = key.algorithm;
  if (typeof modulusLength != "number" || modulusLength < 2048)
    throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
}
__name(checkModulusLength, "checkModulusLength");
function checkCryptoKey(key, expected, usage) {
  const algorithm = key.algorithm;
  if (algorithm.name !== expected.name)
    throw unusable(expected.name);
  if (expected.hash && algorithm.hash?.name !== expected.hash)
    throw unusable(expected.hash, "algorithm.hash");
  if (expected.namedCurve && algorithm.namedCurve !== expected.namedCurve)
    throw unusable(expected.namedCurve, "algorithm.namedCurve");
  if (expected.length !== void 0 && algorithm.length !== expected.length)
    throw unusable(expected.length, "algorithm.length");
  checkUsage(key, usage);
}
__name(checkCryptoKey, "checkCryptoKey");
function snapshotJwk(jwk) {
  return { __proto__: null, ...jwk };
}
__name(snapshotJwk, "snapshotJwk");
function normalizeJwk(jwk) {
  const normalized = snapshotJwk(jwk);
  if (normalized.ext !== void 0 && typeof normalized.ext != "boolean")
    throw new TypeError('"ext" (Extractable) Parameter must be a boolean');
  if (normalized.key_ops !== void 0) {
    const value = normalized.key_ops, keyOps = Array.isArray(value) ? [...value] : void 0;
    if (!keyOps || keyOps.some((operation) => typeof operation != "string") || new Set(keyOps).size !== keyOps.length)
      throw new TypeError('"key_ops" (Key Operations) Parameter must be an array of unique strings');
    normalized.key_ops = keyOps;
  }
  return normalized;
}
__name(normalizeJwk, "normalizeJwk");
async function jwkToKey(entry, jwk, extractable) {
  if (!entry.kty.includes(jwk.kty))
    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  const algorithm = entry.resolve?.({ kty: jwk.kty, crv: jwk.crv }) ?? entry.subtle, isPrivate = !!(jwk.d || jwk.priv), keyData = { ...jwk, ext: extractable ?? jwk.ext };
  return keyData.kty !== "AKP" && delete keyData.alg, delete keyData.use, crypto.subtle.importKey("jwk", keyData, algorithm, keyData.ext ?? !isPrivate, jwk.key_ops ?? entry.usages[isPrivate ? 1 : 0]);
}
__name(jwkToKey, "jwkToKey");
async function rawKey(key, expected, usage, extractable = false) {
  return key instanceof Uint8Array && (key = await crypto.subtle.importKey("raw", key, expected, extractable, [usage])), checkCryptoKey(key, expected, usage), key;
}
__name(rawKey, "rawKey");
function table3(entries) {
  const out = { __proto__: null };
  for (const alg in entries)
    out[alg] = { ...entries[alg], alg };
  return out;
}
__name(table3, "table");
var sig = [["verify"], ["sign"]];
function hmac(bits) {
  const subtle = { name: "HMAC", hash: `SHA-${bits}` };
  return { kty: ["oct"], secret: true, subtle, signing: subtle, usages: sig };
}
__name(hmac, "hmac");
function rsa(bits, saltLength) {
  const subtle = { name: saltLength ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: `SHA-${bits}` };
  return {
    kty: ["RSA"],
    subtle,
    signing: saltLength ? { ...subtle, saltLength } : subtle,
    usages: sig,
    minRsaBits: 2048
  };
}
__name(rsa, "rsa");
function ecdsa(crv, bits) {
  return {
    kty: ["EC"],
    crv,
    subtle: { name: "ECDSA", namedCurve: crv },
    signing: { name: "ECDSA", hash: `SHA-${bits}` },
    usages: sig
  };
}
__name(ecdsa, "ecdsa");
function eddsa() {
  const subtle = { name: "Ed25519" };
  return {
    kty: ["OKP"],
    crv: "Ed25519",
    subtle,
    signing: subtle,
    usages: sig
  };
}
__name(eddsa, "eddsa");
function mldsa(parameterSet) {
  const subtle = { name: `ML-DSA-${parameterSet}` };
  return {
    kty: ["AKP"],
    subtle,
    signing: subtle,
    usages: sig
  };
}
__name(mldsa, "mldsa");
var JWS = table3({
  HS256: hmac(256),
  HS384: hmac(384),
  HS512: hmac(512),
  RS256: rsa(256),
  RS384: rsa(384),
  RS512: rsa(512),
  PS256: rsa(256, 32),
  PS384: rsa(384, 48),
  PS512: rsa(512, 64),
  ES256: ecdsa("P-256", 256),
  ES384: ecdsa("P-384", 384),
  ES512: ecdsa("P-521", 512),
  EdDSA: eddsa(),
  Ed25519: eddsa(),
  "ML-DSA-44": mldsa(44),
  "ML-DSA-65": mldsa(65),
  "ML-DSA-87": mldsa(87)
});
function jwsAlgorithm(alg) {
  const entry = typeof alg == "string" ? JWS[alg] : void 0;
  if (!entry)
    throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  return entry;
}
__name(jwsAlgorithm, "jwsAlgorithm");
function prepareVerify(options) {
  return [options && validateAlgorithms("algorithms", options.algorithms), options?.crit];
}
__name(prepareVerify, "prepareVerify");
function parseProtectedHeader(encodedProtectedHeader) {
  return encodedProtectedHeader === void 0 ? {} : parseJoseHeader(encodedProtectedHeader, JWSInvalid, "JWS Protected Header is invalid");
}
__name(parseProtectedHeader, "parseProtectedHeader");
function encodeCompactUnencodedPayload(payload) {
  try {
    return encode(payload);
  } catch (cause) {
    throw new JWSInvalid("JWS Compact Serialization payload must use only ASCII characters", {
      cause
    });
  }
}
__name(encodeCompactUnencodedPayload, "encodeCompactUnencodedPayload");
async function verifySignature(jws, shared, key, encodeUnencodedPayload, parsedProtected) {
  const { protected: encodedProtectedHeader, header, payload: inputPayload } = jws, protectedHeader = parsedProtected ?? parseProtectedHeader(encodedProtectedHeader);
  if (!isDisjoint(protectedHeader, header))
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  const joseHeader = { ...protectedHeader, ...header }, b64 = validateB64(protectedHeader, validateCrit(JWSInvalid, JWS_RECOGNIZED, shared[1], protectedHeader, joseHeader)), { alg } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  if (shared[0] && !shared[0].has(alg))
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  if (b64) {
    if (typeof inputPayload != "string")
      throw new JWSInvalid("JWS Payload must be a string");
  } else if (typeof inputPayload != "string" && !(inputPayload instanceof Uint8Array))
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  const signingPayload = b64 || typeof inputPayload != "string" ? inputPayload : encodeUnencodedPayload(inputPayload);
  let resolvedKey = false;
  typeof key == "function" && (key = await key(protectedHeader, jws), resolvedKey = true);
  const entry = jwsAlgorithm(alg), signingInput = concat(encodedProtectedHeader !== void 0 ? encode(encodedProtectedHeader) : new Uint8Array(), encode("."), typeof signingPayload == "string" ? shared[2] ??= encodeAsciiMember(signingPayload, "payload", JWSInvalid) : signingPayload), signature = decodeBase64url(jws.signature, "signature", JWSInvalid), verificationKey = await prepareKey(entry, key, "verify"), cryptoKey = await rawKey(verificationKey, entry.subtle, "verify");
  entry.minRsaBits && checkModulusLength(entry.alg, cryptoKey);
  let verified = false;
  try {
    verified = await crypto.subtle.verify(entry.signing, cryptoKey, signature, signingInput);
  } catch (cause) {
    throw new JWSSignatureVerificationFailed(void 0, { cause });
  }
  if (!verified)
    throw new JWSSignatureVerificationFailed();
  const result = { payload: typeof signingPayload == "string" ? decodeBase64url(signingPayload, "payload", JWSInvalid) : signingPayload };
  return encodedProtectedHeader !== void 0 && (result.protectedHeader = protectedHeader), header !== void 0 && (result.unprotectedHeader = header), resolvedKey ? [{ ...result, key: verificationKey }, b64] : [result, b64];
}
__name(verifySignature, "verifySignature");
async function verifyCompact(jws, shared, key) {
  if (jws instanceof Uint8Array && (jws = decoder.decode(jws)), typeof jws != "string")
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3)
    throw new JWSInvalid("Invalid Compact JWS");
  return verifySignature({ payload, protected: protectedHeader, signature }, shared, key, encodeCompactUnencodedPayload);
}
__name(verifyCompact, "verifyCompact");
var epoch = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "epoch");
var multipliers = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  y: 31557600
};
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var checkFailed = "check_failed";
function invalidDuration() {
  throw new TypeError("Invalid time period format");
}
__name(invalidDuration, "invalidDuration");
function secs(str) {
  typeof str != "string" && invalidDuration();
  const matched = REGEX.exec(str);
  (!matched || matched[4] && matched[1]) && invalidDuration();
  const value = parseFloat(matched[2]), durationSeconds = Math.round(value * multipliers[matched[3][0].toLowerCase()]);
  return Number.isFinite(durationSeconds) || invalidDuration(), matched[1] === "-" || matched[4] === "ago" ? -durationSeconds : durationSeconds;
}
__name(secs, "secs");
function validateInput(label, input) {
  if (!Number.isFinite(input))
    throw new TypeError(`Invalid ${label} input`);
  return input;
}
__name(validateInput, "validateInput");
var normalizeTyp = /* @__PURE__ */ __name((value) => {
  const normalized = value.toLowerCase();
  return value.includes("/") ? normalized : `application/${normalized}`;
}, "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => typeof audPayload == "string" ? audOption.includes(audPayload) : Array.isArray(audPayload) ? audOption.some((aud) => audPayload.includes(aud)) : false, "checkAudiencePresence");
function validateNumericDate(claimsSet, claim, required = false) {
  const value = claimsSet[claim];
  if (!(value === void 0 && !required)) {
    if (typeof value != "number")
      throw new JWTClaimValidationFailed(`"${claim}" claim must be a number`, claimsSet, claim, "invalid");
    return value;
  }
}
__name(validateNumericDate, "validateNumericDate");
function unexpectedClaim(claimsSet, claim) {
  throw new JWTClaimValidationFailed(`unexpected "${claim}" claim value`, claimsSet, claim, checkFailed);
}
__name(unexpectedClaim, "unexpectedClaim");
function validateClaimsSet(protectedHeader, claimsSetBytes, options = {}) {
  let claimsSet;
  try {
    claimsSet = JSON.parse(strictDecoder.decode(claimsSetBytes));
  } catch (cause) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object", { cause });
  }
  if (!isObject(claimsSet))
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  const { typ } = options;
  if (typ !== void 0 && (typeof protectedHeader.typ != "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ)))
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', claimsSet, "typ", checkFailed);
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options, presenceCheck = [...requiredClaims];
  maxTokenAge !== void 0 && presenceCheck.push("iat"), audience !== void 0 && presenceCheck.push("aud"), subject !== void 0 && presenceCheck.push("sub"), issuer !== void 0 && presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse()))
    if (!Object.hasOwn(claimsSet, claim))
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, claimsSet, claim, "missing");
  issuer !== void 0 && !(Array.isArray(issuer) ? issuer : [issuer]).includes(claimsSet.iss) && unexpectedClaim(claimsSet, "iss"), subject !== void 0 && claimsSet.sub !== subject && unexpectedClaim(claimsSet, "sub"), audience !== void 0 && !checkAudiencePresence(claimsSet.aud, typeof audience == "string" ? [audience] : audience) && unexpectedClaim(claimsSet, "aud");
  const { clockTolerance } = options;
  let tolerance = 0;
  if (typeof clockTolerance == "string")
    tolerance = secs(clockTolerance);
  else if (clockTolerance !== void 0) {
    if (typeof clockTolerance != "number")
      throw new TypeError("Invalid clockTolerance option type");
    tolerance = clockTolerance;
  }
  validateInput("clockTolerance option", tolerance);
  const { currentDate } = options, now = validateInput("currentDate option", epoch(currentDate === void 0 ? /* @__PURE__ */ new Date() : currentDate)), iat = validateNumericDate(claimsSet, "iat", maxTokenAge !== void 0), nbf = validateNumericDate(claimsSet, "nbf");
  if (nbf !== void 0 && nbf > now + tolerance)
    throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', claimsSet, "nbf", checkFailed);
  const exp = validateNumericDate(claimsSet, "exp");
  if (exp !== void 0 && exp <= now - tolerance)
    throw new JWTExpired('"exp" claim timestamp check failed', claimsSet, "exp", checkFailed);
  if (maxTokenAge !== void 0) {
    const age = now - iat, max = validateInput("maxTokenAge option", typeof maxTokenAge == "number" ? maxTokenAge : secs(maxTokenAge));
    if (age - tolerance > max)
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', claimsSet, "iat", checkFailed);
    if (age < -tolerance)
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', claimsSet, "iat", checkFailed);
  }
  return claimsSet;
}
__name(validateClaimsSet, "validateClaimsSet");
async function jwtVerify(jwt, key, options) {
  const [verified, b64] = await verifyCompact(jwt, prepareVerify(options), key);
  if (!b64)
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  return { ...verified, payload };
}
__name(jwtVerify, "jwtVerify");
function isUsableJWK(jwk, entry, alg, kid) {
  const { kty, key_ops: keyOps, ext, kid: jwkKid, alg: jwkAlg, use, crv } = jwk;
  return (ext === void 0 || typeof ext == "boolean") && (keyOps === void 0 || Array.isArray(keyOps) && keyOps.every((operation, index) => typeof operation == "string" && keyOps.indexOf(operation) === index) && keyOps.includes("verify")) && entry.kty.includes(kty) && (kid === void 0 || typeof kid == "string" && kid === jwkKid) && (jwkAlg === void 0 ? kty !== "AKP" : alg === jwkAlg) && (use === void 0 || use === "sig") && (!entry.crv || crv === entry.crv);
}
__name(isUsableJWK, "isUsableJWK");
async function importWithAlgCache(cache2, jwk, entry) {
  const cached = cache2.get(jwk) || cache2.set(jwk, {}).get(jwk), { alg } = entry;
  if (cached[alg] === void 0) {
    const pending = jwkToKey(entry, jwk, true).then((key) => {
      if (key.type !== "public")
        throw new JWKSInvalid("JSON Web Key Set members must be public keys");
      return cached[alg] = key, key;
    }).catch((error3) => {
      throw cached[alg] === pending && delete cached[alg], error3;
    });
    cached[alg] = pending;
  }
  return cached[alg];
}
__name(importWithAlgCache, "importWithAlgCache");
function createLocalJWKSet(jwks) {
  let snapshot;
  try {
    snapshot = structuredClone(jwks);
  } catch (cause) {
    throw new JWKSInvalid("JSON Web Key Set malformed", { cause });
  }
  if (!isJwkSet(snapshot))
    throw new JWKSInvalid("JSON Web Key Set malformed");
  const metadata = snapshot.keys.map((jwk) => {
    const normalized = snapshotJwk(jwk);
    return Array.isArray(normalized.key_ops) && (normalized.key_ops = [...normalized.key_ops]), normalized;
  }), cached = /* @__PURE__ */ new WeakMap();
  return Object.defineProperty(async (protectedHeader, token) => {
    const { alg, kid } = { ...protectedHeader, ...token?.header }, entry = typeof alg == "string" ? JWS[alg] : void 0;
    if (!entry || entry.secret)
      throw new JOSENotSupported('Unsupported "alg" value for a JSON Web Key Set');
    const candidates = snapshot.keys.filter((_, index) => isUsableJWK(metadata[index], entry, alg, kid)), { 0: jwk, length } = candidates;
    if (!length)
      throw new JWKSNoMatchingKey();
    if (length !== 1) {
      const error3 = new JWKSMultipleMatchingKeys();
      throw error3[Symbol.asyncIterator] = async function* () {
        for (const jwk2 of candidates)
          try {
            yield await importWithAlgCache(cached, jwk2, entry);
          } catch {
          }
      }, error3;
    }
    return importWithAlgCache(cached, jwk, entry);
  }, "jwks", {
    value: () => structuredClone(snapshot)
  });
}
__name(createLocalJWKSet, "createLocalJWKSet");
function isCloudflareWorkers() {
  return typeof WebSocketPair < "u" || typeof navigator < "u" && true || typeof EdgeRuntime < "u" && EdgeRuntime === "vercel";
}
__name(isCloudflareWorkers, "isCloudflareWorkers");
var USER_AGENT;
(typeof navigator > "u" || !"Cloudflare-Workers"?.startsWith?.("Mozilla/5.0 ")) && (USER_AGENT = "jose/v6.2.13");
var customFetch = /* @__PURE__ */ Symbol();
async function fetchJwks(url, headers, signal, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    method: "GET",
    signal,
    redirect: "manual",
    headers
  }).catch((err2) => {
    throw err2.name === "TimeoutError" ? new JWKSTimeout(void 0, { cause: err2 }) : err2;
  });
  if (response.status !== 200)
    throw new JOSEError("Expected 200 OK from the JSON Web Key Set HTTP response");
  try {
    return await response.json();
  } catch (cause) {
    throw new JOSEError("Failed to parse the JSON Web Key Set HTTP response as JSON", { cause });
  }
}
__name(fetchJwks, "fetchJwks");
var jwksCache = /* @__PURE__ */ Symbol();
function isFreshFor(timestamp, duration) {
  return Number.isFinite(timestamp) && Date.now() < timestamp + duration;
}
__name(isFreshFor, "isFreshFor");
function validateDuration(value, fallback, option) {
  if (Number.isNaN(value))
    throw new TypeError(`"${option}" option must not be NaN`);
  return typeof value == "number" ? value : fallback;
}
__name(validateDuration, "validateDuration");
function createRemoteJWKSet(url, options) {
  if (!(url instanceof URL))
    throw new TypeError("url must be an instance of URL");
  const href = new URL(url.href).href, opts = options ?? {}, timeoutOption = opts.timeoutDuration;
  if (typeof timeoutOption == "number" && (!Number.isInteger(timeoutOption) || timeoutOption < 0))
    throw new TypeError('"timeoutDuration" option must be a non-negative integer');
  const timeoutDuration = typeof timeoutOption == "number" ? timeoutOption : 5e3, cooldownDuration = validateDuration(opts.cooldownDuration, 3e4, "cooldownDuration"), cacheMaxAge = validateDuration(opts.cacheMaxAge, 6e5, "cacheMaxAge"), headers = new Headers(opts.headers);
  USER_AGENT && !headers.has("User-Agent") && headers.set("User-Agent", USER_AGENT), headers.has("accept") || headers.set("accept", "application/json, application/jwk-set+json");
  const fetchImpl = opts[customFetch], cache2 = opts[jwksCache];
  let jwksTimestamp, pendingFetch, reloadSequence = 0, appliedSequence = 0, local;
  if (cache2 && typeof cache2 == "object") {
    const { uat, jwks } = cache2;
    isFreshFor(uat, cacheMaxAge) && isJwkSet(jwks) && (jwksTimestamp = uat, local = createLocalJWKSet(jwks));
  }
  const reload = /* @__PURE__ */ __name(async () => {
    if (pendingFetch && isCloudflareWorkers() && (pendingFetch = void 0), !pendingFetch) {
      const sequence = ++reloadSequence, current = pendingFetch = fetchJwks(href, headers, AbortSignal.timeout(timeoutDuration), fetchImpl).then((json3) => {
        const next = createLocalJWKSet(json3);
        if (sequence <= appliedSequence)
          return;
        local = next;
        const updatedAt = Date.now();
        cache2 && (cache2.uat = updatedAt, cache2.jwks = json3), jwksTimestamp = updatedAt, appliedSequence = sequence;
      }).finally(() => {
        pendingFetch === current && (pendingFetch = void 0);
      });
    }
    await pendingFetch;
  }, "reload");
  return Object.defineProperties(async (protectedHeader, token) => {
    (!local || !isFreshFor(jwksTimestamp, cacheMaxAge)) && await reload();
    try {
      return await local(protectedHeader, token);
    } catch (err2) {
      if (err2 instanceof JWKSNoMatchingKey && !isFreshFor(jwksTimestamp, cooldownDuration))
        return await reload(), local(protectedHeader, token);
      throw err2;
    }
  }, {
    coolingDown: {
      get: () => isFreshFor(jwksTimestamp, cooldownDuration),
      enumerable: true
    },
    fresh: {
      get: () => isFreshFor(jwksTimestamp, cacheMaxAge),
      enumerable: true
    },
    reload: {
      value: reload,
      enumerable: true
    },
    reloading: {
      get: () => !!pendingFetch,
      enumerable: true
    },
    jwks: {
      value: () => local?.jwks(),
      enumerable: true
    }
  });
}
__name(createRemoteJWKSet, "createRemoteJWKSet");
var DEFAULT_ISSUER = "https://freebuff.com/oidc";
var AUTH_ROUTE_PREFIX = "/auth/freebuff";
var TRANSACTION_TTL = 600;
var SESSION_COOKIE_TTL = 30 * 86400;
var REFRESH_SKEW_SECONDS = 30;
var MAX_COOKIE_LENGTH = 4e3;
var FETCH_TIMEOUT_MS = 8e3;
var LOOPBACK = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "[::1]"]);
var ALL_SCOPES = ["openid", "email", "profile"];
var PROMPTS = /* @__PURE__ */ new Set(["login", "consent", "select_account"]);
var NO_STORE = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff"
};
function checkedUrl(value, allowLoopback, what) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${what} must be an absolute URL.`);
  }
  const loopbackHttp = allowLoopback && LOOPBACK.has(url.hostname) && url.protocol === "http:";
  if (url.protocol !== "https:" && !loopbackHttp || url.username || url.password || url.search || url.hash) {
    throw new Error(`${what} must be an https URL without credentials, query or fragment (http is allowed only for localhost with allowInsecureLocalhost).`);
  }
  return url;
}
__name(checkedUrl, "checkedUrl");
function base64url(bytes) {
  let binary = "";
  for (const byte of bytes)
    binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64url, "base64url");
function randomToken() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}
__name(randomToken, "randomToken");
async function pkceChallenge(verifier) {
  const bytes = new TextEncoder().encode(verifier);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)));
}
__name(pkceChallenge, "pkceChallenge");
function isSameOriginRequest(request, origin) {
  const header = request.headers.get("origin");
  if (header && header !== "null")
    return header === origin;
  return request.headers.get("sec-fetch-site") === "same-origin";
}
__name(isSameOriginRequest, "isSameOriginRequest");
function timingSafeEqual(left, right) {
  if (left.length !== right.length)
    return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++)
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
function readCookie(header, name) {
  const values = (header ?? "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  if (values.length !== 1)
    return null;
  const value = values[0].slice(name.length + 1);
  return value && value.length <= MAX_COOKIE_LENGTH ? value : null;
}
__name(readCookie, "readCookie");
function safeReturnTo(value) {
  if (!value || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) {
    return "/";
  }
  const base = "https://return-to.invalid";
  let url;
  try {
    url = new URL(value, base);
  } catch {
    return "/";
  }
  if (url.origin !== base || url.pathname === AUTH_ROUTE_PREFIX || url.pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)) {
    return "/";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
__name(safeReturnTo, "safeReturnTo");
function userFrom(claims, scopes) {
  if (typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 255)
    return null;
  const user = { sub: claims.sub };
  if (scopes.includes("email")) {
    if (typeof claims.email === "string" && claims.email.length <= 320)
      user.email = claims.email;
    if (typeof claims.email_verified === "boolean")
      user.email_verified = claims.email_verified;
  }
  if (scopes.includes("profile")) {
    if (typeof claims.name === "string" && claims.name.length <= 200)
      user.name = claims.name;
    if (typeof claims.picture === "string" && claims.picture.startsWith("https://") && claims.picture.length <= 1024) {
      user.picture = claims.picture;
    }
  }
  return user;
}
__name(userFrom, "userFrom");
function json(body, status = 200, cookies = []) {
  const headers = new Headers({ ...NO_STORE, "Content-Type": "application/json; charset=utf-8" });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}
__name(json, "json");
function redirect(location, cookies = []) {
  const headers = new Headers({ ...NO_STORE, Location: location });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}
__name(redirect, "redirect");
function problem(status, message2, cookies = []) {
  const headers = new Headers({ ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(message2, { status, headers });
}
__name(problem, "problem");
async function readJson(response) {
  const text = await response.text();
  if (text.length > 65536)
    throw new Error("Freebuff response too large");
  const value = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Unexpected Freebuff response");
  return value;
}
__name(readJson, "readJson");
function createFreebuffAuth(options) {
  const allowLoopback = options.allowInsecureLocalhost === true;
  const issuer = (options.issuer ?? DEFAULT_ISSUER).replace(/\/$/, "");
  const issuerUrl = checkedUrl(issuer, allowLoopback, "issuer");
  const base = checkedUrl(options.baseUrl, allowLoopback, "baseUrl");
  if (base.pathname !== "/")
    throw new Error("baseUrl must be an origin, without a path.");
  const origin = base.origin;
  const clientId = options.clientId;
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(clientId ?? "")) {
    throw new Error("clientId is missing or malformed; use the ID from Freebuff provisioning.");
  }
  const scopes = ALL_SCOPES.filter((scope) => scope === "openid" || (options.scopes ?? ALL_SCOPES).includes(scope));
  const now = options.now ?? Date.now;
  const fetcher = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const secure = base.protocol === "https:";
  const cookiePrefix = secure ? "__Host-" : "";
  const sessionCookie = `${cookiePrefix}freebuff_session`;
  const transactionCookie = /* @__PURE__ */ __name((state) => `${cookiePrefix}freebuff_txn-${state.slice(0, 16)}`, "transactionCookie");
  const callbackUrl = `${origin}${AUTH_ROUTE_PREFIX}/callback`;
  const setCookie = /* @__PURE__ */ __name((name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`, "setCookie");
  const clearCookie = /* @__PURE__ */ __name((name) => setCookie(name, "", 0), "clearCookie");
  const sessionCookieFor = /* @__PURE__ */ __name((session) => {
    const value = `v1~${session.accessToken}~${session.refreshToken}`;
    if (value.length > MAX_COOKIE_LENGTH)
      throw new Error("Freebuff session is too large for a cookie");
    return setCookie(sessionCookie, value, SESSION_COOKIE_TTL);
  }, "sessionCookieFor");
  async function freebuffFetch(input, init = {}) {
    const response = await fetcher(input, {
      ...init,
      // Workers rejects redirect: 'error'. Never follow redirects carrying codes
      // or refresh tokens; reject them explicitly on every provider request.
      redirect: "manual",
      credentials: "omit",
      signal: init.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      throw new Error("Freebuff endpoint returned a redirect");
    }
    return response;
  }
  __name(freebuffFetch, "freebuffFetch");
  let discovery;
  function endpoints() {
    discovery ??= (async () => {
      const response = await freebuffFetch(`${issuer}/.well-known/openid-configuration`, {
        headers: { accept: "application/json" }
      });
      if (!response.ok)
        throw new Error(`Freebuff discovery failed: ${response.status}`);
      const document = await readJson(response);
      if (document.issuer !== issuer)
        throw new Error("Freebuff discovery named a different issuer");
      const endpoint = /* @__PURE__ */ __name((name, required = true) => {
        const value = document[name];
        if (typeof value !== "string") {
          if (required)
            throw new Error(`Freebuff discovery is missing ${name}`);
          return null;
        }
        const url = checkedUrl(value, allowLoopback, name);
        if (url.origin !== issuerUrl.origin)
          throw new Error(`Freebuff ${name} left the issuer origin`);
        return url.href;
      }, "endpoint");
      return {
        authorization: endpoint("authorization_endpoint"),
        token: endpoint("token_endpoint"),
        revocation: endpoint("revocation_endpoint", false),
        keys: createRemoteJWKSet(new URL(endpoint("jwks_uri")), {
          [customFetch]: (url, init) => freebuffFetch(url, init),
          timeoutDuration: FETCH_TIMEOUT_MS
        })
      };
    })().catch((error3) => {
      discovery = void 0;
      throw error3;
    });
    return discovery;
  }
  __name(endpoints, "endpoints");
  function readSession(request) {
    const value = readCookie(request.headers.get("cookie"), sessionCookie);
    const match = value ? /^v1~([A-Za-z0-9._-]+)~(fbrt_[A-Za-z0-9_-]+)$/.exec(value) : null;
    return match ? { accessToken: match[1], refreshToken: match[2] } : null;
  }
  __name(readSession, "readSession");
  async function verifyAccessToken(token) {
    try {
      const { payload } = await jwtVerify(token, (await endpoints()).keys, {
        issuer,
        audience: clientId,
        algorithms: ["RS256"],
        typ: "at+jwt",
        requiredClaims: ["sub", "exp", "iat", "client_id"],
        clockTolerance: 5,
        currentDate: new Date(now())
      });
      if (payload.client_id !== clientId)
        return null;
      const user = userFrom(payload, scopes);
      if (!user)
        return null;
      if (payload.exp <= Math.floor(now() / 1e3) + REFRESH_SKEW_SECONDS)
        return "expired";
      return { user, expiresAt: payload.exp };
    } catch (error3) {
      return error3 instanceof errors_exports.JWTExpired ? "expired" : null;
    }
  }
  __name(verifyAccessToken, "verifyAccessToken");
  async function refresh(refreshToken) {
    let response;
    try {
      response = await freebuffFetch((await endpoints()).token, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
        body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, refresh_token: refreshToken })
      });
    } catch {
      return "unavailable";
    }
    const body = await readJson(response).catch(() => null);
    if (!response.ok) {
      return body?.error === "invalid_grant" || body?.error === "invalid_client" ? "invalid" : "unavailable";
    }
    if (typeof body?.access_token !== "string" || typeof body.refresh_token !== "string")
      return "unavailable";
    const verified = await verifyAccessToken(body.access_token);
    if (!verified || verified === "expired")
      return "unavailable";
    return { accessToken: body.access_token, refreshToken: body.refresh_token, user: verified.user };
  }
  __name(refresh, "refresh");
  async function authenticate(request) {
    const session = readSession(request);
    if (!session)
      return { user: null, cookies: [] };
    const verified = await verifyAccessToken(session.accessToken);
    if (verified && verified !== "expired")
      return { user: verified.user, cookies: [] };
    if (verified === null) {
      return { user: null, cookies: [] };
    }
    const refreshed = await refresh(session.refreshToken);
    if (refreshed === "invalid")
      return { user: null, cookies: [clearCookie(sessionCookie)] };
    if (refreshed === "unavailable")
      return { user: null, cookies: [] };
    return { user: refreshed.user, cookies: [sessionCookieFor(refreshed)] };
  }
  __name(authenticate, "authenticate");
  const contexts = /* @__PURE__ */ new WeakMap();
  async function getUser(request) {
    const context2 = contexts.get(request);
    if (context2) {
      context2.result ??= authenticate(request);
      return (await context2.result).user;
    }
    const session = readSession(request);
    if (!session)
      return null;
    const verified = await verifyAccessToken(session.accessToken);
    return verified && verified !== "expired" ? verified.user : null;
  }
  __name(getUser, "getUser");
  async function signIn(url) {
    let authorization;
    try {
      authorization = (await endpoints()).authorization;
    } catch {
      return problem(503, "Sign in with Freebuff is temporarily unavailable. Please try again.");
    }
    const state = randomToken();
    const nonce = randomToken();
    const verifier = randomToken();
    const target = new URL(authorization);
    target.search = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: scopes.join(" "),
      state,
      nonce,
      code_challenge: await pkceChallenge(verifier),
      code_challenge_method: "S256"
    }).toString();
    const prompt = url.searchParams.get("prompt");
    if (prompt && PROMPTS.has(prompt))
      target.searchParams.set("prompt", prompt);
    const transaction = base64url(new TextEncoder().encode(JSON.stringify({ s: state, n: nonce, v: verifier, r: safeReturnTo(url.searchParams.get("returnTo")) })));
    return redirect(target.href, [setCookie(transactionCookie(state), transaction, TRANSACTION_TTL)]);
  }
  __name(signIn, "signIn");
  function readTransaction(request, state) {
    const raw = readCookie(request.headers.get("cookie"), transactionCookie(state));
    if (!raw)
      return null;
    try {
      const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))));
      if (typeof decoded.s !== "string" || typeof decoded.n !== "string" || typeof decoded.v !== "string" || !timingSafeEqual(decoded.s, state)) {
        return null;
      }
      return { nonce: decoded.n, verifier: decoded.v, returnTo: safeReturnTo(typeof decoded.r === "string" ? decoded.r : "/") };
    } catch {
      return null;
    }
  }
  __name(readTransaction, "readTransaction");
  async function callback(request, url) {
    const params = url.searchParams;
    const state = params.get("state") ?? "";
    if (!/^[A-Za-z0-9_-]{43}$/.test(state) || [...params.keys()].some((key) => params.getAll(key).length > 1)) {
      return problem(400, "This sign-in link is invalid. Please sign in again.");
    }
    const transaction = readTransaction(request, state);
    const clearTransaction = clearCookie(transactionCookie(state));
    if (!transaction) {
      return problem(400, "This sign-in expired or was started in another browser. Please sign in again.", [clearTransaction]);
    }
    if (params.get("iss") !== issuer) {
      return problem(400, "Sign-in response came from an unexpected issuer.", [clearTransaction]);
    }
    const error3 = params.get("error");
    if (error3) {
      if (error3 === "access_denied")
        return redirect(transaction.returnTo, [clearTransaction]);
      return problem(400, "Sign in with Freebuff did not complete. Please try again.", [clearTransaction]);
    }
    const code = params.get("code");
    if (!code || code.length > 512) {
      return problem(400, "This sign-in link is invalid. Please sign in again.", [clearTransaction]);
    }
    try {
      const { token, keys } = await endpoints();
      const response = await freebuffFetch(token, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          code,
          redirect_uri: callbackUrl,
          code_verifier: transaction.verifier
        })
      });
      const tokens = await readJson(response);
      if (!response.ok || typeof tokens.id_token !== "string" || typeof tokens.access_token !== "string" || typeof tokens.refresh_token !== "string") {
        throw new Error("token exchange failed");
      }
      const { payload } = await jwtVerify(tokens.id_token, keys, {
        issuer,
        audience: clientId,
        algorithms: ["RS256"],
        requiredClaims: ["sub", "exp", "iat", "nonce"],
        maxTokenAge: TRANSACTION_TTL,
        clockTolerance: 5,
        currentDate: new Date(now())
      });
      if (typeof payload.nonce !== "string" || !timingSafeEqual(payload.nonce, transaction.nonce) || payload.azp !== void 0 && payload.azp !== clientId) {
        throw new Error("ID token is not bound to this sign-in");
      }
      const access = await verifyAccessToken(tokens.access_token);
      if (!access || access === "expired" || access.user.sub !== payload.sub) {
        throw new Error("access token does not match the ID token");
      }
      return redirect(transaction.returnTo, [
        sessionCookieFor({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token }),
        clearTransaction
      ]);
    } catch {
      return problem(400, "Sign in with Freebuff could not be completed. Please try again.", [clearTransaction]);
    }
  }
  __name(callback, "callback");
  async function signOut(request, url) {
    if (!isSameOriginRequest(request, origin)) {
      return problem(403, "Sign-out must be submitted from this site.");
    }
    const session = readSession(request);
    if (session) {
      try {
        const { revocation } = await endpoints();
        if (revocation) {
          await freebuffFetch(revocation, {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: clientId, token: session.refreshToken, token_type_hint: "refresh_token" })
          });
        }
      } catch {
      }
    }
    let returnTo = url.searchParams.get("returnTo");
    const type = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (!returnTo && type === "application/x-www-form-urlencoded") {
      const text = await request.text().catch(() => "");
      if (text.length <= 4096)
        returnTo = new URLSearchParams(text).get("returnTo");
    }
    return redirect(safeReturnTo(returnTo), [clearCookie(sessionCookie)]);
  }
  __name(signOut, "signOut");
  async function handle(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`))
      return null;
    const route = url.pathname.slice(AUTH_ROUTE_PREFIX.length);
    const method = request.method;
    switch (route) {
      case "/signin":
        return method === "GET" ? signIn(url) : problem(405, "Use GET.");
      case "/callback":
        return method === "GET" ? callback(request, url) : problem(405, "Use GET.");
      case "/signout":
        return method === "POST" ? signOut(request, url) : problem(405, "Use POST.");
      case "/session": {
        if (method !== "GET")
          return problem(405, "Use GET.");
        const { user, cookies } = await authenticate(request);
        return json({ user }, 200, cookies);
      }
      default:
        return null;
    }
  }
  __name(handle, "handle");
  function wrap(handler) {
    return async (request, ...rest) => {
      const own = await handle(request);
      if (own)
        return own;
      const context2 = {};
      contexts.set(request, context2);
      const response = await handler(request, ...rest);
      const cookies = context2.result ? (await context2.result).cookies : [];
      if (cookies.length === 0 || response.status === 101)
        return response;
      const headers = new Headers(response.headers);
      for (const cookie of cookies)
        headers.append("Set-Cookie", cookie);
      headers.set("Cache-Control", "private, no-store");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    };
  }
  __name(wrap, "wrap");
  return { issuer, clientId, handle, authenticate, getUser, wrap };
}
__name(createFreebuffAuth, "createFreebuffAuth");
var schema_default = "-- ElimuTrack Enterprise \u2014 D1 schema\n-- Every tenant-scoped table carries tenant_id; the API always filters by the\n-- authenticated user's tenant, never by a client-supplied id.\n\nCREATE TABLE IF NOT EXISTS tenants (\n  id          TEXT PRIMARY KEY,\n  name        TEXT NOT NULL,\n  owner_sub   TEXT NOT NULL,\n  plan        TEXT NOT NULL DEFAULT 'trial',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\nCREATE TABLE IF NOT EXISTS learners (\n  id             TEXT PRIMARY KEY,\n  tenant_id      TEXT NOT NULL,\n  name           TEXT NOT NULL,\n  gender         TEXT NOT NULL DEFAULT 'Male',\n  stream         TEXT NOT NULL,\n  grade_level    TEXT NOT NULL,\n  admission_no   TEXT NOT NULL,\n  nemis_upi      TEXT,\n  knec_no        TEXT,\n  guardian_phone TEXT,\n  fee_total      INTEGER NOT NULL DEFAULT 0,\n  fee_paid       INTEGER NOT NULL DEFAULT 0,\n  attendance_pct INTEGER NOT NULL DEFAULT 100,\n  created_at     TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_learners_tenant_adm\n  ON learners (tenant_id, admission_no);\nCREATE INDEX IF NOT EXISTS idx_learners_tenant_stream\n  ON learners (tenant_id, stream);\n\nCREATE TABLE IF NOT EXISTS marks (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  score       INTEGER NOT NULL,\n  rubric      TEXT NOT NULL,\n  points      INTEGER NOT NULL,\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_marks_unique\n  ON marks (tenant_id, learner_id, subject_id);\nCREATE INDEX IF NOT EXISTS idx_marks_tenant_subject\n  ON marks (tenant_id, subject_id);\n\nCREATE TABLE IF NOT EXISTS attendance (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  day         TEXT NOT NULL,\n  status      TEXT NOT NULL,\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique\n  ON attendance (tenant_id, learner_id, day);\nCREATE INDEX IF NOT EXISTS idx_attendance_tenant_day\n  ON attendance (tenant_id, day);\n\nCREATE TABLE IF NOT EXISTS observations (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  day         TEXT NOT NULL,\n  note        TEXT NOT NULL,\n  author      TEXT NOT NULL DEFAULT '',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_obs_tenant ON observations (tenant_id, created_at);\n\nCREATE TABLE IF NOT EXISTS payments (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  amount      INTEGER NOT NULL,\n  phone       TEXT,\n  reference   TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments (tenant_id, created_at);\n\n-- School staff accounts: the admin creates each teacher's initial login.\n-- Usernames are globally unique so a teacher session can be resolved before\n-- the tenant is known; passwords are never stored in plaintext (PBKDF2).\nCREATE TABLE IF NOT EXISTS staff (\n  id                TEXT PRIMARY KEY,\n  tenant_id         TEXT NOT NULL,\n  name              TEXT NOT NULL,\n  username          TEXT NOT NULL,\n  password_hash     TEXT NOT NULL,\n  salt              TEXT NOT NULL,\n  must_change_login INTEGER NOT NULL DEFAULT 1,\n  active            INTEGER NOT NULL DEFAULT 1,\n  created_at        TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_staff_username ON staff (username);\nCREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff (tenant_id, name);\n\n-- The classes (streams) an admin puts a teacher in charge of. A teacher's\n-- class selector and every query they can run is limited to these rows.\nCREATE TABLE IF NOT EXISTS staff_classes (\n  staff_id  TEXT NOT NULL,\n  tenant_id TEXT NOT NULL,\n  stream    TEXT NOT NULL,\n  PRIMARY KEY (staff_id, stream)\n);\n\n-- The services (modules) an admin grants a teacher. This is exactly what the\n-- teacher sees on their dashboard navigation.\nCREATE TABLE IF NOT EXISTS staff_services (\n  staff_id  TEXT NOT NULL,\n  tenant_id TEXT NOT NULL,\n  service   TEXT NOT NULL,\n  PRIMARY KEY (staff_id, service)\n);\n\n-- Teacher sign-in sessions (admin signs in with Sign in with Freebuff).\n-- Only the SHA-256 of the cookie token is stored.\nCREATE TABLE IF NOT EXISTS staff_sessions (\n  token_hash TEXT PRIMARY KEY,\n  staff_id   TEXT NOT NULL,\n  expires_at TEXT NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_staff_sessions_staff ON staff_sessions (staff_id);\n\n-- The school's standard lesson plan: sections are a JSON array of\n-- {key,label} written by the admin (keys are positional: sec1..secN).\nCREATE TABLE IF NOT EXISTS lesson_plan_templates (\n  tenant_id  TEXT PRIMARY KEY,\n  name       TEXT NOT NULL,\n  sections   TEXT NOT NULL,\n  updated_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\n-- Lesson plans themselves. `content` is JSON keyed by section key, so the\n-- end-of-lesson remarks and every other block are stored per lesson.\nCREATE TABLE IF NOT EXISTS lesson_plans (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  stream      TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  lesson_date TEXT NOT NULL,\n  topic       TEXT NOT NULL,\n  content     TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_lp_tenant_date ON lesson_plans (tenant_id, lesson_date);\nCREATE INDEX IF NOT EXISTS idx_lp_tenant_stream ON lesson_plans (tenant_id, stream);\n\nCREATE TABLE IF NOT EXISTS sms_log (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  phone       TEXT NOT NULL,\n  message     TEXT NOT NULL,\n  status      TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_sms_tenant ON sms_log (tenant_id, created_at);\n\n-- WhatsApp outbox, sent through Evolution API (POST /message/sendText/{instance}).\n-- sms_log above is kept for history only \u2014 it is no longer written.\nCREATE TABLE IF NOT EXISTS whatsapp_log (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  phone       TEXT NOT NULL,\n  message     TEXT NOT NULL,\n  status      TEXT NOT NULL,\n  error       TEXT,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_wa_tenant ON whatsapp_log (tenant_id, created_at);\n\n-- Schemes of work: one row per class/subject/term/week, matching the KICD\n-- scheme format. Teachers write rows for their assigned classes; admins write\n-- any. `staff_id` is the author's staff row ('' when an admin wrote it).\nCREATE TABLE IF NOT EXISTS scheme_rows (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  stream      TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  term        TEXT NOT NULL,\n  week        INTEGER NOT NULL,\n  strand      TEXT NOT NULL DEFAULT '',\n  sub_strand  TEXT NOT NULL DEFAULT '',\n  outcomes    TEXT NOT NULL DEFAULT '',\n  experiences TEXT NOT NULL DEFAULT '',\n  inquiry     TEXT NOT NULL DEFAULT '',\n  resources   TEXT NOT NULL DEFAULT '',\n  assessment  TEXT NOT NULL DEFAULT '',\n  remarks     TEXT NOT NULL DEFAULT '',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_scheme_unique\n  ON scheme_rows (tenant_id, stream, subject_id, term, week);\nCREATE INDEX IF NOT EXISTS idx_scheme_tenant ON scheme_rows (tenant_id, stream);\n\n-- Timetable: the admin defines teaching periods and places lessons in the\n-- grid, assigning each to a teacher (staff_id). Teachers read their own rows.\nCREATE TABLE IF NOT EXISTS timetable_periods (\n  tenant_id  TEXT NOT NULL,\n  position   INTEGER NOT NULL,\n  label      TEXT NOT NULL,\n  starts_at  TEXT NOT NULL,\n  ends_at    TEXT NOT NULL,\n  PRIMARY KEY (tenant_id, position)\n);\n\nCREATE TABLE IF NOT EXISTS timetable_entries (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  day          TEXT NOT NULL,\n  period       INTEGER NOT NULL,\n  stream       TEXT NOT NULL,\n  subject_id   TEXT NOT NULL,\n  staff_id     TEXT NOT NULL DEFAULT '',\n  room         TEXT NOT NULL DEFAULT '',\n  created_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_tt_unique\n  ON timetable_entries (tenant_id, day, period);\nCREATE INDEX IF NOT EXISTS idx_tt_tenant ON timetable_entries (tenant_id, day);\nCREATE INDEX IF NOT EXISTS idx_tt_staff ON timetable_entries (staff_id);\n\n-- Record of work: what actually got taught (scheme vs reality, absences,\n-- homework, end-of-lesson remarks). Teacher-authored, class-scoped.\nCREATE TABLE IF NOT EXISTS record_of_work (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  stream      TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  day         TEXT NOT NULL,\n  topic       TEXT NOT NULL,\n  strand      TEXT NOT NULL DEFAULT '',\n  class_size  INTEGER NOT NULL DEFAULT 0,\n  absences    TEXT NOT NULL DEFAULT '',\n  homework    TEXT NOT NULL DEFAULT '',\n  remarks     TEXT NOT NULL DEFAULT '',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_row_tenant ON record_of_work (tenant_id, day);\nCREATE INDEX IF NOT EXISTS idx_row_stream ON record_of_work (tenant_id, stream);\n\n-- Learners' progress records: narrative competency snapshots per learner.\nCREATE TABLE IF NOT EXISTS progress_records (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  subject_id  TEXT NOT NULL,\n  term        TEXT NOT NULL DEFAULT '',\n  day         TEXT NOT NULL,\n  stage       TEXT NOT NULL,\n  note        TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_progress_learner ON progress_records (learner_id, created_at);\nCREATE INDEX IF NOT EXISTS idx_progress_tenant ON progress_records (tenant_id, created_at);\n\n-- KICD curriculum designs: the official framework strands teachers pick from\n-- when writing schemes and lesson plans. Category separates the Regular and\n-- SNE designs; admins maintain the library, teachers browse it.\nCREATE TABLE IF NOT EXISTS kicd_designs (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  category     TEXT NOT NULL,\n  level        TEXT NOT NULL,\n  grade        TEXT NOT NULL DEFAULT '',\n  subject_id   TEXT NOT NULL,\n  strand       TEXT NOT NULL,\n  sub_strand   TEXT NOT NULL DEFAULT '',\n  outcomes     TEXT NOT NULL DEFAULT '',\n  competencies TEXT NOT NULL DEFAULT '',\n  standards    TEXT NOT NULL DEFAULT '',\n  inquiry      TEXT NOT NULL DEFAULT '',\n  resources    TEXT NOT NULL DEFAULT '',\n  inclusive    TEXT NOT NULL DEFAULT '',\n  created_at   TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_kicd_tenant ON kicd_designs (tenant_id, category, level);\n";
var PRIMARY_SUBJECTS = [
  { id: "math_p", name: "Mathematics", code: "MAT001", level: "Primary" },
  { id: "eng_p", name: "English Language", code: "ENG002", level: "Primary" },
  { id: "kis_p", name: "Kiswahili / KSL", code: "KIS003", level: "Primary" },
  { id: "env_p", name: "Environmental Activities", code: "ENV004", level: "Primary" },
  { id: "rel_p", name: "Religious Education", code: "CRE005", level: "Primary" },
  { id: "crt_p", name: "Creative Arts & Movement", code: "CAM006", level: "Primary" }
];
var JSS_SUBJECTS = [
  { id: "eng", name: "English Language", code: "ENG101", level: "JSS" },
  { id: "kis", name: "Kiswahili", code: "KIS102", level: "JSS" },
  { id: "math", name: "Mathematics", code: "MAT103", level: "JSS" },
  { id: "isci", name: "Integrated Science", code: "SCI104", level: "JSS" },
  { id: "sost", name: "Social Studies", code: "SST105", level: "JSS" },
  { id: "agri", name: "Agriculture & Nutrition", code: "AGN106", level: "JSS" },
  { id: "ptech", name: "Pre-Technical Studies", code: "PTS107", level: "JSS" },
  { id: "arts", name: "Creative Arts & Sports", code: "CAS108", level: "JSS" },
  { id: "reled", name: "Religious Education (CRE)", code: "CRE109", level: "JSS" }
];
var ALL_SUBJECTS = [...PRIMARY_SUBJECTS, ...JSS_SUBJECTS];
var SUBJECT_BY_ID = Object.fromEntries(ALL_SUBJECTS.map((s) => [s.id, s]));
var PRIMARY_GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
function subjectsForGrade(gradeLevel) {
  return PRIMARY_GRADES.includes(gradeLevel) ? PRIMARY_SUBJECTS : JSS_SUBJECTS;
}
__name(subjectsForGrade, "subjectsForGrade");
function rubricFor(score) {
  if (score >= 80)
    return { rubric: "EE", points: 4 };
  if (score >= 60)
    return { rubric: "ME", points: 3 };
  if (score >= 40)
    return { rubric: "AE", points: 2 };
  return { rubric: "BE", points: 1 };
}
__name(rubricFor, "rubricFor");
var PLAN_SPECS = {
  trial: { name: "Starter Trial", maxLearners: 60, whatsapp: false, exportCsv: false, streams: 1 },
  standard: { name: "School Standard", maxLearners: 600, whatsapp: true, exportCsv: true, streams: 6 },
  premium: { name: "Campus Premium", maxLearners: 1e5, whatsapp: true, exportCsv: true, streams: 99 }
};
var auth;
var app;
var schemaReady = false;
var json2 = /* @__PURE__ */ __name((body, init = {}) => new Response(JSON.stringify(body), {
  headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store", ...init.headers },
  ...init
}), "json2");
var err = /* @__PURE__ */ __name((status, code, message2) => json2({ error: message2, code }, { status }), "err");
var uuid = /* @__PURE__ */ __name(() => crypto.randomUUID(), "uuid");
function planOf(tenant) {
  return PLAN_SPECS[tenant.plan] || PLAN_SPECS.trial;
}
__name(planOf, "planOf");
var SERVICES = [
  "dashboard",
  "marks",
  "lesson_plans",
  "attendance",
  "observations",
  "broadsheet",
  "learners",
  "reportcards",
  "pathways",
  "fees",
  "whatsapp",
  "schemes",
  "timetable",
  "recordwork",
  "progress",
  "kicd"
];
var SERVICE_BY_PATH = {
  "/api/dashboard": "dashboard",
  "/api/marks": "marks",
  "/api/attendance": "attendance",
  "/api/observations": "observations",
  "/api/broadsheet": "broadsheet",
  "/api/learners": "learners",
  "/api/payments": "fees",
  "/api/whatsapp": "whatsapp",
  "/api/schemes": "schemes",
  "/api/timetable": "timetable",
  "/api/timetable/entry": "timetable",
  "/api/timetable/periods": "timetable",
  "/api/recordwork": "recordwork",
  "/api/progress": "progress",
  "/api/kicd": "kicd",
  "/api/lesson-plans": "lesson_plans",
  "/api/reportcards": "reportcards",
  "/api/pathways": "pathways"
};
var ADMIN_PATHS = ["/api/staff", "/api/plan", "/api/seed"];
var STAFF_COOKIE = "elmt_staff";
var SESSION_DAYS = 7;
var te = new TextEncoder();
var hexOf = /* @__PURE__ */ __name((buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""), "hexOf");
var unhex = /* @__PURE__ */ __name((s) => Uint8Array.from((s.match(/.{1,2}/g) || []).map((h) => parseInt(h, 16))), "unhex");
var nowIso = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString(), "nowIso");
async function sha256Hex(text) {
  return hexOf(await crypto.subtle.digest("SHA-256", te.encode(text)));
}
__name(sha256Hex, "sha256Hex");
async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", te.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: unhex(saltHex), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return hexOf(bits);
}
__name(hashPassword, "hashPassword");
var PBKDF2_ITERATIONS = 6e4;
var newSalt = /* @__PURE__ */ __name(() => hexOf(crypto.getRandomValues(new Uint8Array(16))), "newSalt");
var newToken = /* @__PURE__ */ __name(() => hexOf(crypto.getRandomValues(new Uint8Array(32))), "newToken");
function cookiesOf(request) {
  const out = {};
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0)
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
__name(cookiesOf, "cookiesOf");
function staffCookie(token, env2) {
  const secure = /^https:/.test(env2.APP_ORIGIN || "") ? "; Secure" : "";
  return `${STAFF_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}
__name(staffCookie, "staffCookie");
function clearStaffCookie(env2) {
  const secure = /^https:/.test(env2.APP_ORIGIN || "") ? "; Secure" : "";
  return `${STAFF_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}
__name(clearStaffCookie, "clearStaffCookie");
function jsonWithCookie(body, cookie, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      "Set-Cookie": cookie
    }
  });
}
__name(jsonWithCookie, "jsonWithCookie");
async function teacherAccess(env2, staff) {
  const tenant = await env2.DB.prepare("SELECT * FROM tenants WHERE id = ?").bind(staff.tenant_id).first();
  if (!tenant)
    return null;
  const [classes, services] = await Promise.all([
    env2.DB.prepare("SELECT stream FROM staff_classes WHERE staff_id = ? ORDER BY stream").bind(staff.id).all(),
    env2.DB.prepare("SELECT service FROM staff_services WHERE staff_id = ?").bind(staff.id).all()
  ]);
  return {
    tenant,
    spec: planOf(tenant),
    role: "teacher",
    staff,
    streams: classes.results.map((r) => r.stream),
    services: new Set(services.results.map((r) => r.service))
  };
}
__name(teacherAccess, "teacherAccess");
async function accessFor(env2, user, request) {
  const staff = await staffFromRequest(env2, request);
  if (staff) {
    if (!staff.active)
      return null;
    return teacherAccess(env2, staff);
  }
  if (user) {
    const tenant = await ensureTenant(env2, user);
    return {
      tenant,
      spec: planOf(tenant),
      role: "admin",
      staff: null,
      streams: null,
      // null = every class in the school
      services: new Set(SERVICES)
    };
  }
  return null;
}
__name(accessFor, "accessFor");
async function staffFromRequest(env2, request) {
  const token = cookiesOf(request)[STAFF_COOKIE];
  if (!token)
    return null;
  const tokenHash = await sha256Hex(token);
  const row = await env2.DB.prepare(
    `SELECT s.id, s.tenant_id, s.name, s.username, s.must_change_login, s.active, x.expires_at
       FROM staff_sessions x JOIN staff s ON s.id = x.staff_id
      WHERE x.token_hash = ?`
  ).bind(tokenHash).first();
  if (!row)
    return null;
  if (row.expires_at <= nowIso()) {
    await env2.DB.prepare("DELETE FROM staff_sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    username: row.username,
    must_change_login: row.must_change_login,
    active: row.active
  };
}
__name(staffFromRequest, "staffFromRequest");
function sessionPayload(access, user) {
  if (!access) {
    return {
      authenticated: false,
      user: null,
      tenant: null,
      role: "guest",
      services: [],
      streams: null,
      staff: null
    };
  }
  const tenant = {
    id: access.tenant.id,
    name: access.tenant.name,
    plan: access.tenant.plan,
    owner_sub: access.tenant.owner_sub
  };
  if (access.role === "teacher") {
    return {
      authenticated: true,
      user: { sub: `staff:${access.staff.id}`, name: access.staff.name, email: access.staff.username },
      tenant,
      role: "teacher",
      services: SERVICES.filter((s) => access.services.has(s)),
      streams: access.streams,
      staff: {
        id: access.staff.id,
        name: access.staff.name,
        username: access.staff.username,
        mustChangeLogin: !!access.staff.must_change_login
      }
    };
  }
  return {
    authenticated: true,
    user: { sub: user.sub, name: user.name || "", email: user.email || "" },
    tenant,
    role: "admin",
    services: SERVICES,
    streams: null,
    staff: null
  };
}
__name(sessionPayload, "sessionPayload");
function scopeClause(access, alias = "") {
  if (access.role === "admin")
    return { clause: "", binds: [] };
  if (!access.streams.length)
    return { clause: " AND 1 = 0 ", binds: [] };
  const ph = access.streams.map(() => "?").join(",");
  return { clause: ` AND ${alias}stream IN (${ph})`, binds: [...access.streams] };
}
__name(scopeClause, "scopeClause");
async function assertLearnersInScope(env2, access, ids) {
  if (access.role === "admin")
    return null;
  const unique = [...new Set((ids || []).map(String))];
  if (!unique.length)
    return null;
  if (!access.streams.length)
    return err(403, "NO_CLASSES", "You have no classes assigned yet");
  const idPh = unique.map(() => "?").join(",");
  const stPh = access.streams.map(() => "?").join(",");
  const res = await env2.DB.prepare(
    `SELECT id FROM learners WHERE tenant_id = ? AND id IN (${idPh}) AND stream IN (${stPh})`
  ).bind(access.tenant.id, ...unique, ...access.streams).all();
  if (res.results.length !== unique.length) {
    return err(403, "OUT_OF_SCOPE", "That learner is outside your assigned classes");
  }
  return null;
}
__name(assertLearnersInScope, "assertLearnersInScope");
async function ensureSchema(env2) {
  if (schemaReady)
    return;
  const sql = schema_default.split("\n").filter((line) => !line.trim().startsWith("--")).join("\n");
  const statements = sql.split(";").map((s) => s.trim()).filter(Boolean);
  await env2.DB.batch(statements.map((s) => env2.DB.prepare(s)));
  schemaReady = true;
}
__name(ensureSchema, "ensureSchema");
async function ensureTenant(env2, user) {
  const existing = await env2.DB.prepare("SELECT * FROM tenants WHERE owner_sub = ?").bind(user.sub).first();
  if (existing)
    return existing;
  const base = (user.name || user.email || "My School").split("@")[0].trim() || "My School";
  const tenant = {
    id: uuid(),
    name: `${base}'s School`,
    owner_sub: user.sub,
    plan: "trial"
  };
  try {
    await env2.DB.prepare(
      "INSERT INTO tenants (id, name, owner_sub, plan) VALUES (?, ?, ?, ?)"
    ).bind(tenant.id, tenant.name, tenant.owner_sub, tenant.plan).run();
  } catch {
    return env2.DB.prepare("SELECT * FROM tenants WHERE owner_sub = ?").bind(user.sub).first();
  }
  return tenant;
}
__name(ensureTenant, "ensureTenant");
async function listLearners(env2, access) {
  const scope = scopeClause(access);
  const res = await env2.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct
       FROM learners WHERE tenant_id = ?${scope.clause} ORDER BY stream, name`
  ).bind(access.tenant.id, ...scope.binds).all();
  return res.results.map((r) => ({
    id: r.id,
    name: r.name,
    gender: r.gender,
    stream: r.stream,
    gradeLevel: r.grade_level,
    admissionNo: r.admission_no,
    nemisUpi: r.nemis_upi || "",
    knecNo: r.knec_no || "",
    guardianPhone: r.guardian_phone || "",
    feeTotal: r.fee_total,
    feePaid: r.fee_paid,
    feeBalance: Math.max(0, r.fee_total - r.fee_paid),
    attendancePct: r.attendance_pct
  }));
}
__name(listLearners, "listLearners");
async function listMarks(env2, access, { stream, learnerId }) {
  const clauses = ["m.tenant_id = ?"];
  const binds = [access.tenant.id];
  if (learnerId) {
    clauses.push("m.learner_id = ?");
    binds.push(learnerId);
  }
  if (stream) {
    clauses.push("l.stream = ?");
    binds.push(stream);
  }
  const scope = scopeClause(access, "l.");
  if (scope.clause) {
    clauses.push(`l.stream IN (${access.streams.map(() => "?").join(",")})`);
    binds.push(...scope.binds);
  }
  const res = await env2.DB.prepare(
    `SELECT m.learner_id, m.subject_id, m.score, m.rubric, m.points
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE ${clauses.join(" AND ")}`
  ).bind(...binds).all();
  return res.results.map((r) => ({
    learnerId: r.learner_id,
    subjectId: r.subject_id,
    score: r.score,
    rubric: r.rubric,
    points: r.points
  }));
}
__name(listMarks, "listMarks");
async function dashboard(env2, access, stream) {
  const tenantId = access.tenant.id;
  const scope = scopeClause(access);
  const learnerRes = await env2.DB.prepare(
    `SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?${scope.clause}`
  ).bind(tenantId, ...scope.binds).first();
  const markClause = stream ? "AND l.stream = ?" : "";
  const markBinds = stream ? [tenantId, stream] : [tenantId];
  const mScope = scopeClause(access, "l.");
  const means = await env2.DB.prepare(
    `SELECT m.subject_id AS sid, AVG(m.score) AS mean
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE m.tenant_id = ? ${markClause}${mScope.clause} GROUP BY m.subject_id`
  ).bind(...markBinds, ...mScope.binds).all();
  const rubric = await env2.DB.prepare(
    `SELECT m.rubric AS band, COUNT(*) AS count
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE m.tenant_id = ? ${markClause}${mScope.clause} GROUP BY m.rubric`
  ).bind(...markBinds, ...mScope.binds).all();
  const attClause = stream ? "AND l.stream = ?" : "";
  const attBinds = stream ? [tenantId, stream] : [tenantId];
  const att = await env2.DB.prepare(
    `SELECT
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present,
        COUNT(*) AS total,
        COUNT(DISTINCT a.day) AS days
       FROM attendance a JOIN learners l ON l.id = a.learner_id
      WHERE a.tenant_id = ? ${attClause}${mScope.clause}`
  ).bind(...attBinds, ...mScope.binds).first();
  const feeClause = stream ? "AND stream = ?" : "";
  const feeBinds = stream ? [tenantId, stream] : [tenantId];
  const fees = await env2.DB.prepare(
    `SELECT COALESCE(SUM(MAX(fee_total - fee_paid, 0)), 0) AS outstanding
       FROM learners WHERE tenant_id = ? ${feeClause}${scope.clause}`
  ).bind(...feeBinds, ...scope.binds).first();
  return {
    learners: learnerRes?.n ?? 0,
    subjects: (means.results || []).filter((m) => SUBJECT_BY_ID[m.sid]).map((m) => ({
      code: SUBJECT_BY_ID[m.sid].code,
      name: SUBJECT_BY_ID[m.sid].name,
      mean: Math.round(m.mean || 0)
    })),
    rubric: ["EE", "ME", "AE", "BE"].map((band) => ({
      band,
      count: (rubric.results || []).find((r) => r.band === band)?.count || 0
    })),
    attendancePct: att && att.total ? Math.round(att.present / att.total * 100) : 0,
    presentDays: att?.days ?? 0,
    totalDays: att?.days ?? 0,
    outstandingFees: fees?.outstanding ?? 0
  };
}
__name(dashboard, "dashboard");
async function createLearner(env2, access, body, spec) {
  const name = String(body.name || "").trim();
  const admissionNo = String(body.admissionNo || "").trim();
  if (!name || !admissionNo)
    return err(400, "VALIDATION", "Learner name and admission number are required");
  const stream = String(body.stream || "Grade 7 Eta");
  if (access.role === "teacher" && !access.streams.includes(stream)) {
    return err(403, "OUT_OF_SCOPE", "You can only add learners to your assigned classes");
  }
  const tenant = access.tenant;
  const count3 = await env2.DB.prepare("SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?").bind(tenant.id).first();
  if ((count3?.n ?? 0) >= spec.maxLearners) {
    return err(403, "PLAN_LEARNER_LIMIT", `Your plan allows up to ${spec.maxLearners} learners`);
  }
  const gradeLevel = String(body.gradeLevel || stream.split(" ").slice(0, 2).join(" "));
  const id = `lrn_${uuid()}`;
  const totalFee = PRIMARY_OR_JSS_FEE(gradeLevel);
  try {
    await env2.DB.prepare(
      `INSERT INTO learners (id, tenant_id, name, gender, stream, grade_level, admission_no,
                             nemis_upi, knec_no, guardian_phone, fee_total, fee_paid, attendance_pct)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 100)`
    ).bind(
      id,
      tenant.id,
      name,
      String(body.gender || "Male"),
      stream,
      gradeLevel,
      admissionNo,
      String(body.nemisUpi || ""),
      String(body.knecNo || ""),
      String(body.guardianPhone || ""),
      totalFee
    ).run();
  } catch (e) {
    const msg = String(e && e.message);
    if (msg.includes("UNIQUE"))
      return err(409, "DUPLICATE_ADMISSION", "That admission number already exists in this school");
    throw e;
  }
  const row = await env2.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct
       FROM learners WHERE id = ? AND tenant_id = ?`
  ).bind(id, tenant.id).first();
  return json2({
    learner: {
      id: row.id,
      name: row.name,
      gender: row.gender,
      stream: row.stream,
      gradeLevel: row.grade_level,
      admissionNo: row.admission_no,
      nemisUpi: row.nemis_upi || "",
      knecNo: row.knec_no || "",
      guardianPhone: row.guardian_phone || "",
      feeTotal: row.fee_total,
      feePaid: row.fee_paid,
      feeBalance: Math.max(0, row.fee_total - row.fee_paid),
      attendancePct: row.attendance_pct
    }
  }, { status: 201 });
}
__name(createLearner, "createLearner");
function PRIMARY_OR_JSS_FEE(gradeLevel) {
  return ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"].includes(gradeLevel) ? 32e3 : 45e3;
}
__name(PRIMARY_OR_JSS_FEE, "PRIMARY_OR_JSS_FEE");
async function saveMarks(env2, access, items) {
  if (!Array.isArray(items) || items.length === 0)
    return err(400, "VALIDATION", "No marks supplied");
  const denied = await assertLearnersInScope(env2, access, items.map((i) => i.learnerId));
  if (denied)
    return denied;
  const tenant = access.tenant;
  const stmts = [];
  for (const item of items) {
    const score = Number(item.score);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return err(400, "VALIDATION", "Scores must be whole numbers between 0 and 100");
    }
    if (!SUBJECT_BY_ID[item.subjectId])
      return err(400, "VALIDATION", "Unknown learning area");
    const { rubric, points } = rubricFor(score);
    stmts.push(
      env2.DB.prepare(
        `INSERT INTO marks (tenant_id, learner_id, subject_id, score, rubric, points)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id, learner_id, subject_id)
         DO UPDATE SET score = excluded.score, rubric = excluded.rubric,
                       points = excluded.points, updated_at = datetime('now')`
      ).bind(tenant.id, String(item.learnerId), item.subjectId, score, rubric, points)
    );
  }
  await env2.DB.batch(stmts);
  return json2({ saved: stmts.length });
}
__name(saveMarks, "saveMarks");
async function saveAttendance(env2, access, items) {
  if (!Array.isArray(items) || items.length === 0)
    return err(400, "VALIDATION", "No attendance supplied");
  const denied = await assertLearnersInScope(env2, access, items.map((i) => i.learnerId));
  if (denied)
    return denied;
  const tenant = access.tenant;
  const stmts = [];
  for (const item of items) {
    const status = item.status === "absent" ? "absent" : "present";
    stmts.push(
      env2.DB.prepare(
        `INSERT INTO attendance (tenant_id, learner_id, day, status)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(tenant_id, learner_id, day)
         DO UPDATE SET status = excluded.status, updated_at = datetime('now')`
      ).bind(tenant.id, String(item.learnerId), String(item.day), status)
    );
  }
  await env2.DB.batch(stmts);
  return json2({ saved: stmts.length });
}
__name(saveAttendance, "saveAttendance");
async function saveObservations(env2, access, authorName, items) {
  if (!Array.isArray(items) || items.length === 0)
    return err(400, "VALIDATION", "No observations supplied");
  const denied = await assertLearnersInScope(env2, access, items.map((i) => i.learnerId));
  if (denied)
    return denied;
  const tenant = access.tenant;
  const stmts = [];
  let n = 0;
  for (const item of items) {
    const note = String(item.note || "").trim();
    if (!note)
      continue;
    stmts.push(
      env2.DB.prepare(
        "INSERT INTO observations (id, tenant_id, learner_id, day, note, author) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(uuid(), tenant.id, String(item.learnerId), String(item.day || ""), note, authorName || "teacher")
    );
    n++;
  }
  if (!n)
    return err(400, "VALIDATION", "Observation notes cannot be blank");
  await env2.DB.batch(stmts);
  return json2({ saved: n });
}
__name(saveObservations, "saveObservations");
async function postPayment(env2, access, body) {
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0)
    return err(400, "VALIDATION", "Payment amount must be a positive whole number");
  const learnerId = String(body.learnerId || "");
  const tenant = access.tenant;
  const denied = await assertLearnersInScope(env2, access, [learnerId]);
  if (denied)
    return denied;
  const learner = await env2.DB.prepare("SELECT id, fee_total, fee_paid FROM learners WHERE id = ? AND tenant_id = ?").bind(learnerId, tenant.id).first();
  if (!learner)
    return err(404, "NOT_FOUND", "Learner not found");
  const reference = `MPE${Date.now().toString().slice(-9)}`;
  await env2.DB.batch([
    env2.DB.prepare(
      "INSERT INTO payments (tenant_id, learner_id, amount, phone, reference) VALUES (?, ?, ?, ?, ?)"
    ).bind(tenant.id, learnerId, amount, String(body.phone || ""), reference),
    env2.DB.prepare(
      "UPDATE learners SET fee_paid = fee_paid + ? WHERE id = ? AND tenant_id = ?"
    ).bind(amount, learnerId, tenant.id)
  ]);
  const paid = learner.fee_paid + amount;
  return json2({ reference, feePaid: paid, feeBalance: Math.max(0, learner.fee_total - paid) }, { status: 201 });
}
__name(postPayment, "postPayment");
function evolutionConfig(env2) {
  const baseUrl = String(env2.EVOLUTION_BASE_URL || "").replace(/\/+$/, "");
  const apiKey = String(env2.EVOLUTION_API_KEY || "");
  const instance = String(env2.EVOLUTION_INSTANCE || "");
  return { baseUrl, apiKey, instance, configured: !!(baseUrl && apiKey && instance) };
}
__name(evolutionConfig, "evolutionConfig");
function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits)
    return "";
  if (digits.startsWith("0"))
    return `254${digits.slice(1)}`;
  return digits;
}
__name(normalizePhone, "normalizePhone");
async function sendWhatsapp(env2, access, body, spec) {
  if (!spec.whatsapp) {
    return err(403, "PLAN_WHATSAPP_LOCKED", "WhatsApp messaging is not included in your plan");
  }
  const message2 = String(body.message || "").trim();
  const learnerId = String(body.learnerId || "");
  if (!message2 || !learnerId)
    return err(400, "VALIDATION", "Choose a recipient and write a message");
  const tenant = access.tenant;
  const denied = await assertLearnersInScope(env2, access, [learnerId]);
  if (denied)
    return denied;
  const learner = await env2.DB.prepare(
    "SELECT id, name, guardian_phone FROM learners WHERE id = ? AND tenant_id = ?"
  ).bind(learnerId, tenant.id).first();
  if (!learner)
    return err(404, "NOT_FOUND", "Learner not found");
  if (!learner.guardian_phone)
    return err(400, "NO_PHONE", "This learner has no guardian phone number");
  const cfg = evolutionConfig(env2);
  if (!cfg.configured) {
    return err(
      503,
      "NOT_CONFIGURED",
      "WhatsApp is not configured yet \u2014 set EVOLUTION_BASE_URL, EVOLUTION_API_KEY and EVOLUTION_INSTANCE in Sites \u2192 Secrets, then deploy once"
    );
  }
  const phone = normalizePhone(learner.guardian_phone);
  if (!phone)
    return err(400, "NO_PHONE", "This guardian phone number contains no digits");
  const id = `wa_${uuid()}`;
  let status = "SENT";
  let failure = "";
  try {
    const res = await fetch(`${cfg.baseUrl}/message/sendText/${encodeURIComponent(cfg.instance)}`, {
      method: "POST",
      headers: { "apikey": cfg.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ number: phone, text: message2 }),
      signal: AbortSignal.timeout(15e3)
    });
    if (!res.ok) {
      status = "FAILED";
      failure = String(await res.text()).slice(0, 300);
    }
  } catch (e) {
    status = "FAILED";
    failure = String(e && e.message || "Evolution API unreachable").slice(0, 300);
  }
  await env2.DB.prepare(
    "INSERT INTO whatsapp_log (id, tenant_id, learner_id, phone, message, status, error) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, tenant.id, learnerId, phone, message2, status, failure || null).run();
  if (status === "FAILED") {
    return err(502, "WHATSAPP_FAILED", `WhatsApp send failed: ${failure.slice(0, 200)}`);
  }
  return json2({
    message: {
      id,
      learnerId,
      learnerName: learner.name,
      phone,
      message: message2,
      status,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  }, { status: 201 });
}
__name(sendWhatsapp, "sendWhatsapp");
async function seedDemo(env2, tenant) {
  const existing = await env2.DB.prepare("SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?").bind(tenant.id).first();
  if ((existing?.n ?? 0) > 0)
    return err(409, "ALREADY_SEEDED", "This school already has learners");
  const first = [
    "Amina",
    "Brian",
    "Chloe",
    "David",
    "Emmanuel",
    "Faith",
    "Gideon",
    "Hassan",
    "Irene",
    "Joseph",
    "Kevin",
    "Lucy",
    "Mercy",
    "Nathan",
    "Olivia",
    "Peter",
    "Queenie",
    "Rashid",
    "Sarah",
    "Thomas",
    "Valarie",
    "William",
    "Zipporah",
    "Baraka",
    "Cynthia"
  ];
  const middle = [
    "Wanjiku",
    "Kipruto",
    "Mwende",
    "Ochieng",
    "Achieng",
    "Kipkorir",
    "Njeri",
    "Omondi",
    "Chebet",
    "Kamau",
    "Mutua",
    "Atieno",
    "Kigen",
    "Nyambura",
    "Odhiambo"
  ];
  const last = [
    "Mohamed",
    "Bett",
    "Muthoni",
    "Otieno",
    "Kariuki",
    "Oduor",
    "Ndirangu",
    "Koech",
    "Simiyu",
    "Musyoka",
    "Maina",
    "Chepkorir",
    "Juma",
    "Wekesa",
    "Ndwiga"
  ];
  const cohorts = [
    { stream: "Grade 4 Delta", level: "Grade 4", prefix: 4e3 },
    { stream: "Grade 7 Eta", level: "Grade 7", prefix: 7e3 }
  ];
  const learnerStmts = [];
  const markStmts = [];
  const learners = [];
  let idx = 0;
  for (const cohort of cohorts) {
    const subjects = subjectsForGrade(cohort.level);
    for (let i = 1; i <= 25; i++) {
      idx++;
      const id = `lrn_seed_${cohort.prefix}_${i}`;
      const name = `${first[(i - 1) % first.length]} ${middle[(i + idx) % middle.length]} ${last[(i * 3 + idx) % last.length]}`;
      const gender = i % 2 === 0 ? "Female" : "Male";
      const feeTotal = cohort.prefix < 7e3 ? 32e3 : 45e3;
      const feePaid = 15e3 + i * 700 % 25e3;
      const admissionNo = String(cohort.prefix + i);
      learnerStmts.push(
        env2.DB.prepare(
          `INSERT INTO learners (id, tenant_id, name, gender, stream, grade_level, admission_no,
                                 nemis_upi, knec_no, guardian_phone, fee_total, fee_paid, attendance_pct)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          tenant.id,
          name,
          gender,
          cohort.stream,
          cohort.level,
          admissionNo,
          `NEM-${cohort.prefix + 1e3 + i}`,
          `KNC-2026-${String(idx).padStart(4, "0")}`,
          `+2547${String(1e7 + idx * 13579).slice(0, 8)}`,
          feeTotal,
          Math.min(feePaid, feeTotal),
          88 + i % 12
        )
      );
      learners.push({ id, stream: cohort.stream, i, idx });
      for (const s of subjects) {
        const score = 48 + (i * 17 + idx * 11) % 51;
        const { rubric, points } = rubricFor(score);
        markStmts.push(
          env2.DB.prepare(
            "INSERT INTO marks (tenant_id, learner_id, subject_id, score, rubric, points) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(tenant.id, id, s.id, score, rubric, points)
        );
      }
    }
  }
  const days = [];
  const cursor = /* @__PURE__ */ new Date();
  while (days.length < 10) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6)
      days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() - 1);
  }
  days.reverse();
  const attStmts = [];
  for (const l of learners) {
    for (let d = 0; d < days.length; d++) {
      const absent = (l.i + d + l.idx) % 13 === 0;
      attStmts.push(
        env2.DB.prepare(
          "INSERT INTO attendance (tenant_id, learner_id, day, status) VALUES (?, ?, ?, ?)"
        ).bind(tenant.id, l.id, days[d], absent ? "absent" : "present")
      );
    }
  }
  await env2.DB.batch([...learnerStmts, ...markStmts, ...attStmts]);
  return json2({ seeded: learners.length });
}
__name(seedDemo, "seedDemo");
function toCsv(rows) {
  return rows.map((r) => r.map((cell) => {
    const v = cell === null || cell === void 0 ? "" : String(cell);
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(",")).join("\r\n");
}
__name(toCsv, "toCsv");
async function broadsheetCsv(env2, access, stream, spec) {
  if (!spec.exportCsv)
    return err(403, "PLAN_EXPORT_LOCKED", "CSV export is not included in your plan");
  const learners = (await listLearners(env2, access)).filter((l) => !stream || l.stream === stream);
  const marks = await listMarks(env2, access, { stream });
  const byLearner = {};
  for (const m of marks) {
    byLearner[m.learnerId] = byLearner[m.learnerId] || {};
    byLearner[m.learnerId][m.subjectId] = m;
  }
  const subjectIds = [...new Set(marks.map((m) => m.subjectId))].filter((id) => SUBJECT_BY_ID[id]);
  const header = [
    "Rank",
    "Admission No",
    "Learner",
    "Stream",
    "Gender",
    ...subjectIds.flatMap((id) => [`${SUBJECT_BY_ID[id].code} Score`, `${SUBJECT_BY_ID[id].code} Band`]),
    "Average",
    "Attendance %",
    "Fee Balance KES"
  ];
  const rows = learners.map((l) => {
    const lm = byLearner[l.id] || {};
    const scores = subjectIds.map((id) => lm[id]?.score).filter((s) => typeof s === "number");
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : "";
    return {
      l,
      avg: typeof avg === "number" ? avg : -1,
      cells: [
        "",
        l.admissionNo,
        l.name,
        l.stream,
        l.gender,
        ...subjectIds.flatMap((id) => [
          lm[id] ? lm[id].score : "",
          lm[id] ? lm[id].rubric : ""
        ]),
        avg,
        l.attendancePct,
        l.feeBalance
      ]
    };
  }).sort((a, b) => b.avg - a.avg).map((r, i) => [i + 1, ...r.cells.slice(1)]).map((cells) => cells);
  const csv = toCsv([header, ...rows]);
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="elimutrack-broadsheet-${stream || "all"}.csv"`,
      "Cache-Control": "private, no-store"
    }
  });
}
__name(broadsheetCsv, "broadsheetCsv");
var USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
async function staffWithGrants(env2, tenantId) {
  const res = await env2.DB.prepare(
    `SELECT id, name, username, must_change_login, active, created_at
       FROM staff WHERE tenant_id = ? ORDER BY name`
  ).bind(tenantId).all();
  const staff = res.results.map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    mustChangeLogin: !!r.must_change_login,
    active: !!r.active,
    createdAt: r.created_at,
    classes: [],
    services: []
  }));
  if (!staff.length)
    return staff;
  const [classes, services] = await Promise.all([
    env2.DB.prepare("SELECT staff_id, stream FROM staff_classes WHERE tenant_id = ?").bind(tenantId).all(),
    env2.DB.prepare("SELECT staff_id, service FROM staff_services WHERE tenant_id = ?").bind(tenantId).all()
  ]);
  const byId = Object.fromEntries(staff.map((s) => [s.id, s]));
  for (const c of classes.results)
    if (byId[c.staff_id])
      byId[c.staff_id].classes.push(c.stream);
  for (const s of services.results)
    if (byId[s.staff_id])
      byId[s.staff_id].services.push(s.service);
  return staff;
}
__name(staffWithGrants, "staffWithGrants");
function validateStaffInput(body) {
  const name = String(body.name || "").trim();
  const username = String(body.username || "").trim().toLowerCase();
  if (!name)
    return { error: err(400, "VALIDATION", "Teacher name is required") };
  if (!USERNAME_RE.test(username)) {
    return { error: err(400, "VALIDATION", "Username must be 3-32 characters: letters, numbers, dot, dash or underscore") };
  }
  const services = Array.isArray(body.services) ? [...new Set(body.services.map(String))] : [];
  const classes = Array.isArray(body.classes) ? [...new Set(body.classes.map(String))] : [];
  const badService = services.find((s) => !SERVICES.includes(s));
  if (badService)
    return { error: err(400, "VALIDATION", `Unknown service: ${badService}`) };
  return { name, username, services, classes };
}
__name(validateStaffInput, "validateStaffInput");
async function setStaffGrants(env2, tenant, staffId, services, classes) {
  const stmts = [
    env2.DB.prepare("DELETE FROM staff_services WHERE staff_id = ?").bind(staffId),
    env2.DB.prepare("DELETE FROM staff_classes WHERE staff_id = ?").bind(staffId)
  ];
  for (const s of services) {
    stmts.push(env2.DB.prepare(
      "INSERT OR IGNORE INTO staff_services (staff_id, tenant_id, service) VALUES (?, ?, ?)"
    ).bind(staffId, tenant.id, s));
  }
  for (const c of classes) {
    stmts.push(env2.DB.prepare(
      "INSERT OR IGNORE INTO staff_classes (staff_id, tenant_id, stream) VALUES (?, ?, ?)"
    ).bind(staffId, tenant.id, c));
  }
  await env2.DB.batch(stmts);
}
__name(setStaffGrants, "setStaffGrants");
async function createStaff(env2, access, body) {
  const input = validateStaffInput(body);
  if (input.error)
    return input.error;
  const password = String(body.password || "");
  if (password.length < 6)
    return err(400, "VALIDATION", "Initial password must be at least 6 characters");
  if (!input.services.length)
    return err(400, "VALIDATION", "Choose at least one service for this teacher");
  if (!input.classes.length)
    return err(400, "VALIDATION", "Assign at least one class to this teacher");
  const id = `stf_${uuid()}`;
  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  try {
    await env2.DB.prepare(
      `INSERT INTO staff (id, tenant_id, name, username, password_hash, salt, must_change_login, active)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1)`
    ).bind(id, access.tenant.id, input.name, input.username, hash, salt).run();
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) {
      return err(409, "DUPLICATE_USERNAME", "That username is already taken \u2014 choose another");
    }
    throw e;
  }
  await setStaffGrants(env2, access.tenant, id, input.services, input.classes);
  const all = await staffWithGrants(env2, access.tenant.id);
  return json2({ staff: all.find((s) => s.id === id) || null }, { status: 201 });
}
__name(createStaff, "createStaff");
async function updateStaff(env2, access, body) {
  const id = String(body.id || "");
  const existing = await env2.DB.prepare("SELECT id FROM staff WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing)
    return err(404, "NOT_FOUND", "Teacher not found");
  const stmts = [];
  if (body.name !== void 0) {
    const name = String(body.name || "").trim();
    if (!name)
      return err(400, "VALIDATION", "Teacher name cannot be empty");
    stmts.push(env2.DB.prepare("UPDATE staff SET name = ? WHERE id = ?").bind(name, id));
  }
  if (body.active !== void 0) {
    stmts.push(env2.DB.prepare("UPDATE staff SET active = ? WHERE id = ?").bind(body.active ? 1 : 0, id));
    if (!body.active) {
      stmts.push(env2.DB.prepare("DELETE FROM staff_sessions WHERE staff_id = ?").bind(id));
    }
  }
  if (stmts.length)
    await env2.DB.batch(stmts);
  if (Array.isArray(body.services) || Array.isArray(body.classes)) {
    const input = validateStaffInput({
      name: "x",
      username: "x",
      services: body.services || [],
      classes: body.classes || []
    });
    if (input.error)
      return input.error;
    if (!input.services.length)
      return err(400, "VALIDATION", "A teacher must keep at least one service");
    if (!input.classes.length)
      return err(400, "VALIDATION", "A teacher must keep at least one class");
    await setStaffGrants(env2, access.tenant, id, input.services, input.classes);
  }
  const all = await staffWithGrants(env2, access.tenant.id);
  return json2({ staff: all.find((s) => s.id === id) || null });
}
__name(updateStaff, "updateStaff");
async function resetStaffLogin(env2, access, body) {
  const id = String(body.id || "");
  const password = String(body.password || "");
  if (password.length < 6)
    return err(400, "VALIDATION", "New password must be at least 6 characters");
  const existing = await env2.DB.prepare("SELECT id FROM staff WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing)
    return err(404, "NOT_FOUND", "Teacher not found");
  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  await env2.DB.batch([
    env2.DB.prepare(
      "UPDATE staff SET password_hash = ?, salt = ?, must_change_login = 1 WHERE id = ?"
    ).bind(hash, salt, id),
    // Existing sessions die so the new password takes effect immediately.
    env2.DB.prepare("DELETE FROM staff_sessions WHERE staff_id = ?").bind(id)
  ]);
  return json2({ reset: true });
}
__name(resetStaffLogin, "resetStaffLogin");
async function staffLogin(env2, request, body) {
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!username || !password)
    return err(400, "VALIDATION", "Enter your username and password");
  try {
    const staff = await env2.DB.prepare(
      "SELECT * FROM staff WHERE username = ? AND active = 1"
    ).bind(username).first();
    const invalid2 = err(401, "BAD_CREDENTIALS", "Username or password is incorrect");
    if (!staff) {
      await hashPassword(password, "00");
      return invalid2;
    }
    const hash = await hashPassword(password, staff.salt);
    if (hash !== staff.password_hash)
      return invalid2;
    const token = newToken();
    const tokenHash = await sha256Hex(token);
    const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
    await env2.DB.batch([
      env2.DB.prepare("DELETE FROM staff_sessions WHERE expires_at <= ?").bind(nowIso()),
      env2.DB.prepare("INSERT INTO staff_sessions (token_hash, staff_id, expires_at) VALUES (?, ?, ?)").bind(tokenHash, staff.id, expires)
    ]);
    const access = await teacherAccess(env2, staff);
    if (!access)
      return err(500, "NO_TENANT", "This school workspace is not ready yet");
    return jsonWithCookie(sessionPayload(access, null), staffCookie(token, env2));
  } catch (e) {
    console.error("staff login failed:", e && e.message);
    return err(500, "LOGIN_FAILED", "Sign-in could not be completed \u2014 try again");
  }
}
__name(staffLogin, "staffLogin");
async function staffLogout(env2, request) {
  const token = cookiesOf(request)[STAFF_COOKIE];
  if (token) {
    await env2.DB.prepare("DELETE FROM staff_sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
  }
  return jsonWithCookie({ ok: true }, clearStaffCookie(env2));
}
__name(staffLogout, "staffLogout");
async function changeOwnLogin(env2, access, body) {
  if (access.role !== "teacher")
    return err(403, "FORBIDDEN", "Only teachers sign in with a school login");
  const current = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const newUsername = String(body.username || "").trim().toLowerCase();
  const staff = await env2.DB.prepare("SELECT * FROM staff WHERE id = ?").bind(access.staff.id).first();
  if (!staff)
    return err(404, "NOT_FOUND", "Account not found");
  const hash = await hashPassword(current, staff.salt);
  if (hash !== staff.password_hash)
    return err(401, "BAD_CREDENTIALS", "Your current password is incorrect");
  if (newPassword.length < 6)
    return err(400, "VALIDATION", "New password must be at least 6 characters");
  if (newUsername && !USERNAME_RE.test(newUsername)) {
    return err(400, "VALIDATION", "Username must be 3-32 characters: letters, numbers, dot, dash or underscore");
  }
  const salt = newSalt();
  const nextHash = await hashPassword(newPassword, salt);
  const targetUsername = newUsername || staff.username;
  try {
    await env2.DB.prepare(
      "UPDATE staff SET username = ?, password_hash = ?, salt = ?, must_change_login = 0 WHERE id = ?"
    ).bind(targetUsername, nextHash, salt, staff.id).run();
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) {
      return err(409, "DUPLICATE_USERNAME", "That username is already taken \u2014 choose another");
    }
    throw e;
  }
  return json2({ ok: true, username: targetUsername });
}
__name(changeOwnLogin, "changeOwnLogin");
var DEFAULT_LESSON_TEMPLATE = {
  name: "Standard Lesson Plan",
  sections: [
    { key: "sec1", label: "Learning Objectives" },
    { key: "sec2", label: "Prior Knowledge & Introduction" },
    { key: "sec3", label: "Learning Experiences & Activities" },
    { key: "sec4", label: "Learning Resources & Materials" },
    { key: "sec5", label: "Assessment / Evidence of Learning" },
    { key: "sec6", label: "Remedial & Enrichment" },
    { key: "sec7", label: "End-of-Lesson Remarks / Comments" }
  ]
};
async function getTemplate(env2, tenantId) {
  const row = await env2.DB.prepare("SELECT name, sections FROM lesson_plan_templates WHERE tenant_id = ?").bind(tenantId).first();
  if (row) {
    try {
      const sections = JSON.parse(row.sections);
      if (Array.isArray(sections) && sections.length)
        return { name: row.name, sections };
    } catch {
    }
  }
  const fresh = {
    name: DEFAULT_LESSON_TEMPLATE.name,
    sections: DEFAULT_LESSON_TEMPLATE.sections
  };
  await env2.DB.prepare(
    `INSERT INTO lesson_plan_templates (tenant_id, name, sections) VALUES (?, ?, ?)
     ON CONFLICT(tenant_id) DO NOTHING`
  ).bind(tenantId, fresh.name, JSON.stringify(fresh.sections)).run();
  return fresh;
}
__name(getTemplate, "getTemplate");
async function saveTemplate(env2, tenantId, body) {
  const name = String(body.name || "").trim();
  const raw = Array.isArray(body.sections) ? body.sections : [];
  if (!name)
    return err(400, "VALIDATION", "The lesson plan needs a name");
  if (raw.length < 2 || raw.length > 12) {
    return err(400, "VALIDATION", "A standard lesson plan needs between 2 and 12 sections");
  }
  const sections = raw.map((s, i) => ({ key: `sec${i + 1}`, label: String(s && s.label || "").trim() }));
  if (sections.some((s) => !s.label))
    return err(400, "VALIDATION", "Every section needs a heading");
  await env2.DB.prepare(
    `INSERT INTO lesson_plan_templates (tenant_id, name, sections, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(tenant_id) DO UPDATE SET name = excluded.name, sections = excluded.sections,
                                          updated_at = datetime('now')`
  ).bind(tenantId, name, JSON.stringify(sections)).run();
  return json2({ template: { name, sections } });
}
__name(saveTemplate, "saveTemplate");
function parseContent(value) {
  const content = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      const text = String(v || "").trim();
      if (text)
        content[String(k).slice(0, 32)] = text.slice(0, 5e3);
    }
  }
  return content;
}
__name(parseContent, "parseContent");
async function listLessonPlans(env2, access) {
  const scope = scopeClause(access);
  const res = await env2.DB.prepare(
    `SELECT id, staff_id, author, stream, subject_id, lesson_date, topic, content, updated_at
       FROM lesson_plans WHERE tenant_id = ?${scope.clause}
      ORDER BY lesson_date DESC, stream, topic LIMIT 300`
  ).bind(access.tenant.id, ...scope.binds).all();
  return res.results.map((r) => ({
    id: r.id,
    staffId: r.staff_id,
    author: r.author,
    stream: r.stream,
    subjectId: r.subject_id,
    lessonDate: r.lesson_date,
    topic: r.topic,
    content: parseContent(JSON.parse(r.content || "{}")),
    updatedAt: r.updated_at
  }));
}
__name(listLessonPlans, "listLessonPlans");
async function saveLessonPlan(env2, access, user, body) {
  const stream = String(body.stream || "");
  const subjectId = String(body.subjectId || "");
  const lessonDate = String(body.lessonDate || "");
  const topic = String(body.topic || "").trim();
  if (!stream || !lessonDate || !topic)
    return err(400, "VALIDATION", "Class, date and topic are required");
  if (!SUBJECT_BY_ID[subjectId])
    return err(400, "VALIDATION", "Choose a learning area");
  if (access.role === "teacher" && !access.streams.includes(stream)) {
    return err(403, "OUT_OF_SCOPE", "You can only write lesson plans for your assigned classes");
  }
  const content = parseContent(body.content);
  if (!Object.keys(content).length)
    return err(400, "VALIDATION", "Fill in at least one lesson plan section");
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  const id = `lp_${uuid()}`;
  await env2.DB.prepare(
    `INSERT INTO lesson_plans (id, tenant_id, staff_id, author, stream, subject_id, lesson_date, topic, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    access.tenant.id,
    access.staff ? access.staff.id : "",
    author,
    stream,
    subjectId,
    lessonDate,
    topic,
    JSON.stringify(content)
  ).run();
  return json2({ plan: { id, stream, subjectId, lessonDate, topic, author, content } }, { status: 201 });
}
__name(saveLessonPlan, "saveLessonPlan");
async function updateLessonPlan(env2, access, user, body) {
  const id = String(body.id || "");
  const scope = scopeClause(access);
  const existing = await env2.DB.prepare(
    `SELECT id, staff_id, stream FROM lesson_plans WHERE id = ? AND tenant_id = ?${scope.clause}`
  ).bind(id, access.tenant.id, ...scope.binds).first();
  if (!existing)
    return err(404, "NOT_FOUND", "Lesson plan not found");
  if (access.role === "teacher" && existing.staff_id !== access.staff.id) {
    return err(403, "FORBIDDEN", "You can only edit your own lesson plans");
  }
  const stream = body.stream !== void 0 ? String(body.stream || "") : existing.stream;
  if (access.role === "teacher" && !access.streams.includes(stream)) {
    return err(403, "OUT_OF_SCOPE", "You can only write lesson plans for your assigned classes");
  }
  const fields = [];
  const binds = [];
  if (body.stream !== void 0) {
    fields.push("stream = ?");
    binds.push(stream);
  }
  if (body.subjectId !== void 0) {
    if (!SUBJECT_BY_ID[String(body.subjectId)])
      return err(400, "VALIDATION", "Choose a learning area");
    fields.push("subject_id = ?");
    binds.push(String(body.subjectId));
  }
  if (body.lessonDate !== void 0) {
    fields.push("lesson_date = ?");
    binds.push(String(body.lessonDate));
  }
  if (body.topic !== void 0) {
    const topic = String(body.topic || "").trim();
    if (!topic)
      return err(400, "VALIDATION", "Topic cannot be empty");
    fields.push("topic = ?");
    binds.push(topic);
  }
  if (body.content !== void 0) {
    const content = parseContent(body.content);
    if (!Object.keys(content).length)
      return err(400, "VALIDATION", "Fill in at least one lesson plan section");
    fields.push("content = ?");
    binds.push(JSON.stringify(content));
  }
  if (!fields.length)
    return json2({ ok: true });
  fields.push("updated_at = datetime('now')");
  await env2.DB.prepare(`UPDATE lesson_plans SET ${fields.join(", ")} WHERE id = ? AND tenant_id = ?`).bind(...binds, id, access.tenant.id).run();
  return json2({ ok: true });
}
__name(updateLessonPlan, "updateLessonPlan");
async function deleteLessonPlan(env2, access, body) {
  const id = String(body.id || "");
  const scope = scopeClause(access);
  const existing = await env2.DB.prepare(
    `SELECT id, staff_id FROM lesson_plans WHERE id = ? AND tenant_id = ?${scope.clause}`
  ).bind(id, access.tenant.id, ...scope.binds).first();
  if (!existing)
    return err(404, "NOT_FOUND", "Lesson plan not found");
  if (access.role === "teacher" && existing.staff_id !== access.staff.id) {
    return err(403, "FORBIDDEN", "You can only delete your own lesson plans");
  }
  await env2.DB.prepare("DELETE FROM lesson_plans WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
__name(deleteLessonPlan, "deleteLessonPlan");
function canTouchStream(access, stream) {
  if (access.role === "admin")
    return true;
  return access.streams.includes(String(stream));
}
__name(canTouchStream, "canTouchStream");
function canEditRow(access, row) {
  if (access.role === "admin")
    return true;
  if (!canTouchStream(access, row.stream))
    return false;
  return !row.staff_id || row.staff_id === access.staff.id;
}
__name(canEditRow, "canEditRow");
var parseList = /* @__PURE__ */ __name((raw) => {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}, "parseList");
var toJsonList = /* @__PURE__ */ __name((value) => Array.isArray(value) ? JSON.stringify(value.map((v) => String(v))) : String(value || ""), "toJsonList");
function schemeToJson(r) {
  return {
    id: r.id,
    staffId: r.staff_id,
    author: r.author,
    stream: r.stream,
    subjectId: r.subject_id,
    term: r.term,
    week: r.week,
    strand: r.strand,
    subStrand: r.sub_strand,
    outcomes: r.outcomes,
    experiences: r.experiences,
    inquiry: r.inquiry,
    resources: r.resources,
    assessment: r.assessment,
    remarks: r.remarks,
    updatedAt: r.updated_at
  };
}
__name(schemeToJson, "schemeToJson");
async function listSchemes(env2, access, q) {
  const clauses = ["tenant_id = ?"];
  const binds = [access.tenant.id];
  if (q.get("stream")) {
    clauses.push("stream = ?");
    binds.push(q.get("stream"));
  }
  if (q.get("subject")) {
    clauses.push("subject_id = ?");
    binds.push(q.get("subject"));
  }
  if (q.get("term")) {
    clauses.push("term = ?");
    binds.push(q.get("term"));
  }
  const scope = scopeClause(access);
  if (scope.clause) {
    clauses.push(scope.clause.replace(/^\s*AND\s+/, "").trim());
    binds.push(...scope.binds);
  }
  const res = await env2.DB.prepare(
    `SELECT * FROM scheme_rows WHERE ${clauses.join(" AND ")} ORDER BY stream, subject_id, term, week`
  ).bind(...binds).all();
  return res.results.map(schemeToJson);
}
__name(listSchemes, "listSchemes");
async function saveScheme(env2, access, user, body, isUpdate) {
  const stream = String(body.stream || "");
  const subjectId = String(body.subjectId || "");
  const term = String(body.term || "").trim();
  const week = Number(body.week);
  if (!stream || !subjectId || !term || !Number.isInteger(week) || week < 1 || week > 40) {
    return err(400, "VALIDATION", "Class, learning area, term and a week (1-40) are required");
  }
  if (!canTouchStream(access, stream)) {
    return err(403, "OUT_OF_SCOPE", "You can only write schemes for your assigned classes");
  }
  const fields = {
    strand: String(body.strand || ""),
    sub_strand: String(body.subStrand || ""),
    outcomes: String(body.outcomes || ""),
    experiences: String(body.experiences || ""),
    inquiry: String(body.inquiry || ""),
    resources: String(body.resources || ""),
    assessment: String(body.assessment || ""),
    remarks: String(body.remarks || "")
  };
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  const staffId = access.staff ? access.staff.id : "";
  if (isUpdate) {
    const id2 = String(body.id || "");
    const existing = await env2.DB.prepare("SELECT id, stream, staff_id FROM scheme_rows WHERE id = ? AND tenant_id = ?").bind(id2, access.tenant.id).first();
    if (!existing)
      return err(404, "NOT_FOUND", "Scheme row not found");
    if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
      return err(403, "FORBIDDEN", "You can only edit your own scheme rows");
    }
    await env2.DB.prepare(
      `UPDATE scheme_rows SET week = ?, strand = ?, sub_strand = ?, outcomes = ?, experiences = ?,
              inquiry = ?, resources = ?, assessment = ?, remarks = ?, updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?`
    ).bind(
      week,
      fields.strand,
      fields.sub_strand,
      fields.outcomes,
      fields.experiences,
      fields.inquiry,
      fields.resources,
      fields.assessment,
      fields.remarks,
      id2,
      access.tenant.id
    ).run();
    return json2({ ok: true });
  }
  const id = `sch_${uuid()}`;
  try {
    await env2.DB.prepare(
      `INSERT INTO scheme_rows (id, tenant_id, staff_id, author, stream, subject_id, term, week,
              strand, sub_strand, outcomes, experiences, inquiry, resources, assessment, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      access.tenant.id,
      staffId,
      author,
      stream,
      subjectId,
      term,
      week,
      fields.strand,
      fields.sub_strand,
      fields.outcomes,
      fields.experiences,
      fields.inquiry,
      fields.resources,
      fields.assessment,
      fields.remarks
    ).run();
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) {
      return err(409, "DUPLICATE_WEEK", "That week already has a scheme row for this class and learning area");
    }
    throw e;
  }
  return json2({ row: { id, stream, subjectId, term, week, ...fields } }, { status: 201 });
}
__name(saveScheme, "saveScheme");
async function deleteScheme(env2, access, body) {
  const id = String(body.id || "");
  const existing = await env2.DB.prepare("SELECT id, stream, staff_id FROM scheme_rows WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing)
    return err(404, "NOT_FOUND", "Scheme row not found");
  if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
    return err(403, "FORBIDDEN", "You can only delete your own scheme rows");
  }
  await env2.DB.prepare("DELETE FROM scheme_rows WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
__name(deleteScheme, "deleteScheme");
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
async function timetableData(env2, access) {
  const periodRes = await env2.DB.prepare(
    "SELECT position, label, starts_at, ends_at FROM timetable_periods WHERE tenant_id = ? ORDER BY position"
  ).bind(access.tenant.id).all();
  const periods = periodRes.results.map((p) => ({
    position: p.position,
    label: p.label,
    startsAt: p.starts_at,
    endsAt: p.ends_at
  }));
  let entries;
  if (access.role === "teacher") {
    const res = await env2.DB.prepare(
      `SELECT id, day, period, stream, subject_id, staff_id, room FROM timetable_entries
        WHERE tenant_id = ? AND staff_id = ?`
    ).bind(access.tenant.id, access.staff.id).all();
    entries = res.results;
  } else {
    const res = await env2.DB.prepare(
      `SELECT id, day, period, stream, subject_id, staff_id, room FROM timetable_entries
        WHERE tenant_id = ? ORDER BY day, period`
    ).bind(access.tenant.id).all();
    entries = res.results;
  }
  let staff = [];
  if (access.role === "admin") {
    staff = await staffWithGrants(env2, access.tenant.id);
  }
  return {
    periods,
    days: DAYS,
    entries: entries.map((e) => ({
      id: e.id,
      day: e.day,
      period: e.period,
      stream: e.stream,
      subjectId: e.subject_id,
      staffId: e.staff_id,
      room: e.room
    })),
    staff: staff.map((s) => ({ id: s.id, name: s.name }))
  };
}
__name(timetableData, "timetableData");
async function saveTimetableEntry(env2, access, body) {
  if (access.role !== "admin")
    return err(403, "FORBIDDEN", "Only the administrator edits the timetable");
  const day = String(body.day || "");
  const period = Number(body.period);
  const stream = String(body.stream || "");
  const subjectId = String(body.subjectId || "");
  if (!DAYS.includes(day) || !Number.isInteger(period) || period < 1 || !stream || !subjectId) {
    return err(400, "VALIDATION", "Day, period, class and learning area are required");
  }
  const staffId = String(body.staffId || "");
  if (staffId) {
    const exists = await env2.DB.prepare("SELECT id FROM staff WHERE id = ? AND tenant_id = ?").bind(staffId, access.tenant.id).first();
    if (!exists)
      return err(404, "NOT_FOUND", "Teacher not found");
  }
  await env2.DB.prepare(
    `INSERT INTO timetable_entries (id, tenant_id, day, period, stream, subject_id, staff_id, room)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(tenant_id, day, period) DO UPDATE SET
       stream = excluded.stream, subject_id = excluded.subject_id,
       staff_id = excluded.staff_id, room = excluded.room`
  ).bind(`tt_${uuid()}`, access.tenant.id, day, period, stream, subjectId, staffId, String(body.room || "")).run();
  return json2({ ok: true }, { status: 201 });
}
__name(saveTimetableEntry, "saveTimetableEntry");
async function saveTimetablePeriods(env2, access, body) {
  if (access.role !== "admin")
    return err(403, "FORBIDDEN", "Only the administrator edits timetable periods");
  const list = Array.isArray(body.periods) ? body.periods : [];
  if (list.length < 1 || list.length > 16)
    return err(400, "VALIDATION", "Keep between 1 and 16 periods");
  const stmts = [env2.DB.prepare("DELETE FROM timetable_periods WHERE tenant_id = ?").bind(access.tenant.id)];
  for (let i = 0; i < list.length; i++) {
    const p = list[i] || {};
    const label = String(p.label || `Period ${i + 1}`).slice(0, 40);
    const startsAt = String(p.startsAt || "").slice(0, 8);
    const endsAt = String(p.endsAt || "").slice(0, 8);
    if (!startsAt || !endsAt)
      return err(400, "VALIDATION", "Every period needs a start and end time");
    stmts.push(env2.DB.prepare(
      "INSERT INTO timetable_periods (tenant_id, position, label, starts_at, ends_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(access.tenant.id, i + 1, label, startsAt, endsAt));
  }
  await env2.DB.batch(stmts);
  return json2({ ok: true, saved: list.length });
}
__name(saveTimetablePeriods, "saveTimetablePeriods");
async function deleteTimetableEntry(env2, access, body) {
  if (access.role !== "admin")
    return err(403, "FORBIDDEN", "Only the administrator edits the timetable");
  const id = String(body.id || "");
  await env2.DB.prepare("DELETE FROM timetable_entries WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
__name(deleteTimetableEntry, "deleteTimetableEntry");
function rowToJson(r) {
  return {
    id: r.id,
    staffId: r.staff_id,
    author: r.author,
    stream: r.stream,
    subjectId: r.subject_id,
    day: r.day,
    topic: r.topic,
    strand: r.strand,
    classSize: r.class_size,
    absences: r.absences,
    homework: r.homework,
    remarks: r.remarks,
    updatedAt: r.updated_at
  };
}
__name(rowToJson, "rowToJson");
async function listRecordOfWork(env2, access, q) {
  const clauses = ["tenant_id = ?"];
  const binds = [access.tenant.id];
  if (q.get("stream")) {
    clauses.push("stream = ?");
    binds.push(q.get("stream"));
  }
  const scope = scopeClause(access);
  if (scope.clause) {
    clauses.push(scope.clause.replace(/^\s*AND\s+/, "").trim());
    binds.push(...scope.binds);
  }
  const res = await env2.DB.prepare(
    `SELECT * FROM record_of_work WHERE ${clauses.join(" AND ")} ORDER BY day DESC, stream LIMIT 300`
  ).bind(...binds).all();
  return res.results.map(rowToJson);
}
__name(listRecordOfWork, "listRecordOfWork");
async function saveRecordOfWork(env2, access, user, body, isUpdate) {
  const stream = String(body.stream || "");
  const subjectId = String(body.subjectId || "");
  const day = String(body.day || "");
  const topic = String(body.topic || "").trim();
  if (!stream || !subjectId || !day || !topic) {
    return err(400, "VALIDATION", "Class, learning area, date and topic are required");
  }
  if (!canTouchStream(access, stream)) {
    return err(403, "OUT_OF_SCOPE", "You can only record work for your assigned classes");
  }
  const classSize = Number(body.classSize || 0);
  const values = [
    topic,
    String(body.strand || ""),
    Number.isInteger(classSize) && classSize > 0 ? classSize : 0,
    String(body.absences || ""),
    String(body.homework || ""),
    String(body.remarks || "")
  ];
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  const staffId = access.staff ? access.staff.id : "";
  if (isUpdate) {
    const id2 = String(body.id || "");
    const existing = await env2.DB.prepare("SELECT id, stream, staff_id FROM record_of_work WHERE id = ? AND tenant_id = ?").bind(id2, access.tenant.id).first();
    if (!existing)
      return err(404, "NOT_FOUND", "Entry not found");
    if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
      return err(403, "FORBIDDEN", "You can only edit your own entries");
    }
    await env2.DB.prepare(
      `UPDATE record_of_work SET day = ?, topic = ?, strand = ?, class_size = ?, absences = ?,
              homework = ?, remarks = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
    ).bind(day, ...values, id2, access.tenant.id).run();
    return json2({ ok: true });
  }
  const id = `row_${uuid()}`;
  await env2.DB.prepare(
    `INSERT INTO record_of_work (id, tenant_id, staff_id, author, stream, subject_id, day, topic,
            strand, class_size, absences, homework, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    access.tenant.id,
    staffId,
    author,
    stream,
    subjectId,
    day,
    values[0],
    values[1],
    values[2],
    values[3],
    values[4],
    values[5]
  ).run();
  return json2({ row: { id, stream, subjectId, day, topic } }, { status: 201 });
}
__name(saveRecordOfWork, "saveRecordOfWork");
async function deleteRecordOfWork(env2, access, body) {
  const id = String(body.id || "");
  const existing = await env2.DB.prepare("SELECT id, stream, staff_id FROM record_of_work WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing)
    return err(404, "NOT_FOUND", "Entry not found");
  if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
    return err(403, "FORBIDDEN", "You can only delete your own entries");
  }
  await env2.DB.prepare("DELETE FROM record_of_work WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
__name(deleteRecordOfWork, "deleteRecordOfWork");
var PROGRESS_STAGES = ["Beginning", "Developing", "Secure", "Exceeding"];
async function listProgress(env2, access, q) {
  const clauses = ["p.tenant_id = ?"];
  const binds = [access.tenant.id];
  const learnerId = q.get("learner") || "";
  if (learnerId) {
    clauses.push("p.learner_id = ?");
    binds.push(learnerId);
  }
  const scope = scopeClause(access, "l.");
  if (scope.clause) {
    clauses.push(scope.clause.replace(/^\s*AND\s+/, "").trim());
    binds.push(...scope.binds);
  }
  const where = clauses.filter(Boolean).join(" AND ");
  const res = await env2.DB.prepare(
    `SELECT p.id, p.learner_id, p.staff_id, p.author, p.subject_id, p.term, p.day, p.stage, p.note,
            p.created_at, l.name AS learner_name, l.stream
       FROM progress_records p JOIN learners l ON l.id = p.learner_id
      WHERE ${where} ORDER BY p.created_at DESC LIMIT 300`
  ).bind(...binds).all();
  return res.results.map((r) => ({
    id: r.id,
    learnerId: r.learner_id,
    learnerName: r.learner_name,
    stream: r.stream,
    staffId: r.staff_id,
    author: r.author,
    subjectId: r.subject_id,
    term: r.term,
    day: r.day,
    stage: r.stage,
    note: r.note,
    createdAt: r.created_at
  }));
}
__name(listProgress, "listProgress");
async function addProgress(env2, access, user, body) {
  const learnerId = String(body.learnerId || "");
  const stage = String(body.stage || "");
  const note = String(body.note || "").trim();
  const day = String(body.day || "");
  if (!learnerId || !day || !note)
    return err(400, "VALIDATION", "Learner, date and note are required");
  if (!PROGRESS_STAGES.includes(stage))
    return err(400, "VALIDATION", "Choose a progress stage");
  const denied = await assertLearnersInScope(env2, access, [learnerId]);
  if (denied)
    return denied;
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  const id = `prg_${uuid()}`;
  await env2.DB.prepare(
    `INSERT INTO progress_records (id, tenant_id, learner_id, staff_id, author, subject_id, term, day, stage, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    access.tenant.id,
    learnerId,
    access.staff ? access.staff.id : "",
    author,
    String(body.subjectId || ""),
    String(body.term || ""),
    day,
    stage,
    note
  ).run();
  return json2({ record: { id, learnerId, day, stage, note } }, { status: 201 });
}
__name(addProgress, "addProgress");
async function deleteProgress(env2, access, body) {
  const id = String(body.id || "");
  const existing = await env2.DB.prepare("SELECT id, staff_id FROM progress_records WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing)
    return err(404, "NOT_FOUND", "Record not found");
  if (access.role !== "admin" && existing.staff_id !== access.staff.id) {
    return err(403, "FORBIDDEN", "You can only delete your own records");
  }
  await env2.DB.prepare("DELETE FROM progress_records WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
__name(deleteProgress, "deleteProgress");
var KICD_LEVELS = ["Pre-Primary", "Lower Primary", "Upper Primary", "Junior School"];
function starterDesigns(tenantId) {
  const CBC_COMPETENCIES = JSON.stringify([
    "Critical Thinking & Problem Solving",
    "Creativity & Innovation",
    "Communication & Collaboration",
    "Citizenship",
    "Digital Literacy",
    "Learning to Learn",
    "Self-Efficacy"
  ]);
  const BANDS = JSON.stringify([
    "Exceeding Expectations (EE)",
    "Meeting Expectations (ME)",
    "Approaching Expectations (AE)",
    "Below Expectations (BE)"
  ]);
  const rows = [
    [
      "regular",
      "Lower Primary",
      "Grade 1",
      "math_p",
      "Numbers",
      "Numeration & Place Value",
      ["Count quantities up to 1000 using objects and pictures", "Read and write numbers up to 1000 in words and figures", "Identify place value of digits in 3-digit numbers"],
      ["Sort, classify and order objects while counting", "Represent numbers using place value blocks and charts"],
      ["How do we know how many things we have?", "Where do digits get their value?"],
      ["Counting sticks, bead strings, place value charts, locally made counters"],
      ""
    ],
    [
      "regular",
      "Lower Primary",
      "Grade 1",
      "math_p",
      "Measurement",
      "Length, Mass & Capacity",
      ["Compare and order objects by length, mass and capacity", "Measure length using non-standard then standard units (cm, m)"],
      ["Measure classroom objects with rulers and metre sticks", "Estimate and verify everyday quantities"],
      ["How do we compare how long or heavy things are?", "What units help us measure fairly?"],
      ["Rulers, measuring tapes, balances, containers"],
      ""
    ],
    [
      "regular",
      "Lower Primary",
      "Grade 1",
      "eng_p",
      "Listening & Speaking",
      "Oral Language Skills",
      ["Greet others and take turns in conversation", "Retell a short heard story in sequence"],
      ["Pair discussions, choral responding, story retelling"],
      ["How do we help each other understand when we talk?"],
      ["Picture cards, storybooks, charts"],
      ""
    ],
    [
      "regular",
      "Upper Primary",
      "Grade 4",
      "math_p",
      "Fractions",
      "Equivalent Fractions & Operations",
      ["Identify and generate equivalent fractions", "Add and subtract fractions with like denominators"],
      ["Fold paper strips to find equivalents", "Solve money and measure problems using fractions"],
      ["How can two different fractions name the same amount?"],
      ["Fraction strips, number lines, real-life shopping contexts"],
      ""
    ],
    [
      "regular",
      "Upper Primary",
      "Grade 4",
      "env_p",
      "Environmental Care",
      "Soil & Water Conservation",
      ["Explain why soil and water need conservation", "Practise terracing, mulching and clean water handling at school"],
      ["School compound survey, simple terrace model making"],
      ["How does our school protect the soil and water around it?"],
      ["Garden tools, charts, local water sources"],
      ""
    ],
    [
      "regular",
      "Junior School",
      "Grade 7",
      "math",
      "Algebra",
      "Linear Expressions & Equations",
      ["Simplify algebraic expressions", "Solve one-step and two-step linear equations"],
      ["Pattern generalisation, balance-scale model of equations"],
      ["How can a pattern be written as a general rule?"],
      ["Multi-board, manila papers, simple balance scale"],
      ""
    ],
    [
      "regular",
      "Junior School",
      "Grade 7",
      "isci",
      "Scientific Investigation",
      "Scientific Enquiry Skills",
      ["Formulate testable questions and hypotheses", "Conduct fair tests and record observations"],
      ["Investigating factors that affect dissolving; reporting findings"],
      ["What makes a test fair and trustworthy?"],
      ["Laboratory apparatus, measurement instruments"],
      ""
    ],
    [
      "regular",
      "Junior School",
      "Grade 8",
      "sost",
      "Governance",
      "Democracy & Participation",
      ["Explain the features of democratic governance", "Describe ways learners participate in school governance"],
      ["Class election simulation, school government case study"],
      ["Why do communities organise themselves through government?"],
      ["Constitution extracts, current affairs clips"],
      ""
    ],
    [
      "sne",
      "Lower Primary",
      "Grade 1",
      "math_p",
      "Numbers",
      "Numeration \u2014 Adapted for Visual Impairment",
      ["Count and identify numbers up to 100 using tactile materials"],
      ["Tactile counting frames, raised-line writing boards, verbal narration"],
      ["How do we count things we cannot see?"],
      ["Tactile numerals, braille slates, abacus"],
      "Use tactile manipulatives, verbal description of every step, enlarged or braille print, and allow extra response time."
    ],
    [
      "sne",
      "Lower Primary",
      "Grade 1",
      "eng_p",
      "Listening & Speaking \u2014 Adapted for Hearing Impairment",
      ["Respond to simple instructions using sign and gesture", "Express basic needs using sign, gesture or speech"],
      ["Facing-class instruction, visual cues, paired peer support"],
      ["How do we make sure everyone can follow along?"],
      ["Picture cards, sign language charts, visual timetables"],
      "Position the learner for lip-reading, pair with a peer buddy, reinforce verbally with visuals, and involve the interpreter consistently."
    ],
    [
      "sne",
      "Upper Primary",
      "Grade 4",
      "math_p",
      "Measurement \u2014 Adapted for Learners with Intellectual Impairment",
      ["Measure everyday lengths using a ruler with support"],
      ["Task analysis with matching, grading and practical life contexts"],
      ["Which tool matches this job?"],
      ["Concrete measuring tools, matching cards"],
      "Break tasks into small steps, repeat with varied concrete materials, and reduce content load while keeping the same strand."
    ],
    [
      "sne",
      "Junior School",
      "Grade 7",
      "math",
      "Numbers \u2014 Adapted for Autism",
      ["Perform operations with whole numbers following a consistent routine"],
      ["Structured timetable, visual schedule, predictable lesson sequence"],
      ["How does a predictable routine help us learn?"],
      ["Visual schedule boards, timers, structured work folders"],
      "Keep routines consistent, use visual schedules and advance notice of transitions, and reduce sensory distractions in the workspace."
    ]
  ];
  return rows.map((r, i) => ({
    id: `kicd_starter_${i + 1}`,
    tenant_id: tenantId,
    category: r[0],
    level: r[1],
    grade: r[2],
    subject_id: r[3],
    strand: r[4],
    sub_strand: r[5],
    outcomes: JSON.stringify(r[6]),
    competencies: CBC_COMPETENCIES,
    standards: BANDS,
    inquiry: JSON.stringify(r[7]),
    resources: JSON.stringify(r[8]),
    inclusive: r[9] || ""
  }));
}
__name(starterDesigns, "starterDesigns");
async function ensureKicdLibrary(env2, tenantId) {
  const count3 = await env2.DB.prepare("SELECT COUNT(*) AS n FROM kicd_designs WHERE tenant_id = ?").bind(tenantId).first();
  if ((count3?.n ?? 0) > 0)
    return;
  await env2.DB.batch(starterDesigns(tenantId).map((d) => env2.DB.prepare(
    `INSERT OR IGNORE INTO kicd_designs
       (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
        outcomes, competencies, standards, inquiry, resources, inclusive)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    d.id,
    d.tenant_id,
    d.category,
    d.level,
    d.grade,
    d.subject_id,
    d.strand,
    d.sub_strand,
    d.outcomes,
    d.competencies,
    d.standards,
    d.inquiry,
    d.resources,
    d.inclusive
  )));
}
__name(ensureKicdLibrary, "ensureKicdLibrary");
function designToJson(r) {
  return {
    id: r.id,
    category: r.category,
    level: r.level,
    grade: r.grade,
    subjectId: r.subject_id,
    strand: r.strand,
    subStrand: r.sub_strand,
    outcomes: parseList(r.outcomes),
    competencies: parseList(r.competencies),
    standards: parseList(r.standards),
    inquiry: parseList(r.inquiry),
    resources: parseList(r.resources),
    inclusive: r.inclusive || ""
  };
}
__name(designToJson, "designToJson");
async function listKicd(env2, access, q) {
  await ensureKicdLibrary(env2, access.tenant.id);
  const clauses = ["tenant_id = ?"];
  const binds = [access.tenant.id];
  const category = q.get("category") || "regular";
  clauses.push("category = ?");
  binds.push(category);
  if (q.get("level")) {
    clauses.push("level = ?");
    binds.push(q.get("level"));
  }
  if (q.get("grade")) {
    clauses.push("grade = ?");
    binds.push(q.get("grade"));
  }
  if (q.get("subject")) {
    clauses.push("subject_id = ?");
    binds.push(q.get("subject"));
  }
  const res = await env2.DB.prepare(
    `SELECT * FROM kicd_designs WHERE ${clauses.join(" AND ")} ORDER BY level, subject_id, strand`
  ).bind(...binds).all();
  return {
    levels: KICD_LEVELS,
    designs: res.results.map(designToJson)
  };
}
__name(listKicd, "listKicd");
async function saveKicd(env2, access, body, isUpdate) {
  if (access.role !== "admin")
    return err(403, "FORBIDDEN", "Only the administrator maintains the KICD library");
  const category = String(body.category || "regular");
  if (!["regular", "sne"].includes(category))
    return err(400, "VALIDATION", "Category must be regular or sne");
  const level = String(body.level || "");
  const subjectId = String(body.subjectId || "");
  const strand = String(body.strand || "").trim();
  if (!KICD_LEVELS.includes(level) || !subjectId || !strand) {
    return err(400, "VALIDATION", "Level, learning area and strand are required");
  }
  const values = [
    level,
    String(body.grade || ""),
    subjectId,
    strand,
    String(body.subStrand || ""),
    toJsonList(body.outcomes),
    toJsonList(body.competencies),
    toJsonList(body.standards),
    toJsonList(body.inquiry),
    toJsonList(body.resources),
    String(body.inclusive || "")
  ];
  if (isUpdate) {
    const id2 = String(body.id || "");
    await env2.DB.prepare(
      `UPDATE kicd_designs SET category = ?, level = ?, grade = ?, subject_id = ?, strand = ?,
              sub_strand = ?, outcomes = ?, competencies = ?, standards = ?, inquiry = ?,
              resources = ?, inclusive = ?, updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?`
    ).bind(category, ...values, id2, access.tenant.id).run();
    return json2({ ok: true });
  }
  const id = `kicd_${uuid()}`;
  await env2.DB.prepare(
    `INSERT INTO kicd_designs
       (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
        outcomes, competencies, standards, inquiry, resources, inclusive)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, access.tenant.id, category, ...values).run();
  return json2({ design: { id } }, { status: 201 });
}
__name(saveKicd, "saveKicd");
async function deleteKicd(env2, access, body) {
  if (access.role !== "admin")
    return err(403, "FORBIDDEN", "Only the administrator maintains the KICD library");
  const id = String(body.id || "");
  await env2.DB.prepare("DELETE FROM kicd_designs WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
__name(deleteKicd, "deleteKicd");
async function handleApi(request, env2, user) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const mutating = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
  if (mutating && !isSameOriginRequest(request, env2.APP_ORIGIN)) {
    return err(403, "BAD_ORIGIN", "Cross-origin request rejected");
  }
  const body = mutating ? await request.json().catch(() => ({})) : {};
  const q = url.searchParams;
  if (path === "/api/session") {
    const access2 = await accessFor(env2, user, request);
    return json2(sessionPayload(access2, user));
  }
  if (path === "/api/auth/login" && method === "POST")
    return staffLogin(env2, request, body);
  if (path === "/api/auth/logout" && method === "POST")
    return staffLogout(env2, request);
  const access = await accessFor(env2, user, request);
  if (!access)
    return err(401, "UNAUTHENTICATED", "Sign in required");
  const tenant = access.tenant;
  const spec = access.spec;
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  if (path === "/api/auth/change-login" && method === "POST")
    return changeOwnLogin(env2, access, body);
  if (access.staff && access.staff.must_change_login) {
    return err(403, "MUST_CHANGE_LOGIN", "Change your initial login before continuing");
  }
  if (ADMIN_PATHS.includes(path) && access.role !== "admin") {
    return err(403, "FORBIDDEN", "Administrator access required");
  }
  if (path === "/api/staff" && method === "GET")
    return json2({ staff: await staffWithGrants(env2, tenant.id) });
  if (path === "/api/staff" && method === "POST")
    return createStaff(env2, access, body);
  if (path === "/api/staff" && method === "PUT")
    return updateStaff(env2, access, body);
  if (path === "/api/staff/reset" && method === "POST")
    return resetStaffLogin(env2, access, body);
  if (path === "/api/lesson-plans/template" && method === "PUT") {
    if (access.role !== "admin")
      return err(403, "FORBIDDEN", "Administrator access required");
    return saveTemplate(env2, tenant.id, body);
  }
  if (path === "/api/plan" && method === "POST") {
    const plan = String(body.plan || "");
    if (!PLAN_SPECS[plan])
      return err(400, "VALIDATION", "Unknown plan");
    await env2.DB.prepare("UPDATE tenants SET plan = ? WHERE id = ?").bind(plan, tenant.id).run();
    return json2({ plan, planSpec: PLAN_SPECS[plan] });
  }
  if (path === "/api/seed" && method === "POST")
    return seedDemo(env2, tenant);
  const LEARNER_ROSTER = [
    "learners",
    "marks",
    "attendance",
    "observations",
    "fees",
    "whatsapp",
    "reportcards",
    "broadsheet",
    "progress"
  ];
  const required = path === "/api/learners" ? null : SERVICE_BY_PATH[path];
  if (access.role === "teacher") {
    if (path === "/api/learners" && !LEARNER_ROSTER.some((s) => access.services.has(s))) {
      return err(403, "SERVICE_DENIED", "This module is not enabled for your account");
    }
    if (required && !access.services.has(required)) {
      return err(403, "SERVICE_DENIED", "This module is not enabled for your account");
    }
  }
  if (path === "/api/lesson-plans") {
    if (method === "GET") {
      const template = await getTemplate(env2, tenant.id);
      return json2({ template, plans: await listLessonPlans(env2, access) });
    }
    if (method === "POST")
      return saveLessonPlan(env2, access, user, body);
    if (method === "PUT")
      return updateLessonPlan(env2, access, user, body);
    if (method === "DELETE")
      return deleteLessonPlan(env2, access, body);
  }
  if (path === "/api/schemes") {
    if (method === "GET")
      return json2({ rows: await listSchemes(env2, access, q) });
    if (method === "POST")
      return saveScheme(env2, access, user, body, false);
    if (method === "PUT")
      return saveScheme(env2, access, user, body, true);
    if (method === "DELETE")
      return deleteScheme(env2, access, body);
  }
  if (path === "/api/timetable" && method === "GET")
    return json2(await timetableData(env2, access));
  if (path === "/api/timetable/entry" && method === "POST")
    return saveTimetableEntry(env2, access, body);
  if (path === "/api/timetable/entry" && method === "DELETE")
    return deleteTimetableEntry(env2, access, body);
  if (path === "/api/timetable/periods" && method === "PUT")
    return saveTimetablePeriods(env2, access, body);
  if (path === "/api/recordwork") {
    if (method === "GET")
      return json2({ rows: await listRecordOfWork(env2, access, q) });
    if (method === "POST")
      return saveRecordOfWork(env2, access, user, body, false);
    if (method === "PUT")
      return saveRecordOfWork(env2, access, user, body, true);
    if (method === "DELETE")
      return deleteRecordOfWork(env2, access, body);
  }
  if (path === "/api/progress") {
    if (method === "GET")
      return json2({ records: await listProgress(env2, access, q) });
    if (method === "POST")
      return addProgress(env2, access, user, body);
    if (method === "DELETE")
      return deleteProgress(env2, access, body);
  }
  if (path === "/api/kicd") {
    if (method === "GET")
      return json2(await listKicd(env2, access, q));
    if (method === "POST")
      return saveKicd(env2, access, body, false);
    if (method === "PUT")
      return saveKicd(env2, access, body, true);
    if (method === "DELETE")
      return deleteKicd(env2, access, body);
  }
  if (path === "/api/learners" && method === "GET")
    return json2({ learners: await listLearners(env2, access) });
  if (path === "/api/learners" && method === "POST")
    return createLearner(env2, access, body, spec);
  if (path === "/api/marks" && method === "GET") {
    return json2({ marks: await listMarks(env2, access, { stream: q.get("stream") || "", learnerId: q.get("learner") || "" }) });
  }
  if (path === "/api/marks" && method === "PUT")
    return saveMarks(env2, access, body.items);
  if (path === "/api/attendance" && method === "GET") {
    const scope = scopeClause(access, "l.");
    const res = await env2.DB.prepare(
      `SELECT a.learner_id, a.day, a.status
         FROM attendance a JOIN learners l ON l.id = a.learner_id
        WHERE a.tenant_id = ?${scope.clause}`
    ).bind(tenant.id, ...scope.binds).all();
    return json2({ records: res.results.map((r) => ({ learnerId: r.learner_id, day: r.day, status: r.status })) });
  }
  if (path === "/api/attendance" && method === "POST")
    return saveAttendance(env2, access, body.items);
  if (path === "/api/observations" && method === "GET") {
    const scope = scopeClause(access, "l.");
    const res = await env2.DB.prepare(
      `SELECT o.id, o.learner_id, o.day, o.note, o.author, o.created_at, l.name AS learner_name, l.stream
         FROM observations o JOIN learners l ON l.id = o.learner_id
        WHERE o.tenant_id = ?${scope.clause} ORDER BY o.created_at DESC LIMIT 100`
    ).bind(tenant.id, ...scope.binds).all();
    return json2({
      observations: res.results.map((r) => ({
        id: r.id,
        learnerId: r.learner_id,
        learnerName: r.learner_name,
        stream: r.stream,
        day: r.day,
        note: r.note,
        author: r.author,
        createdAt: r.created_at
      }))
    });
  }
  if (path === "/api/observations" && method === "POST")
    return saveObservations(env2, access, author, body.items);
  if (path === "/api/payments" && method === "GET") {
    const scope = scopeClause(access, "l.");
    const res = await env2.DB.prepare(
      `SELECT p.id, p.learner_id, p.amount, p.phone, p.reference, p.created_at, l.name AS learner_name
         FROM payments p JOIN learners l ON l.id = p.learner_id
        WHERE p.tenant_id = ?${scope.clause} ORDER BY p.created_at DESC LIMIT 100`
    ).bind(tenant.id, ...scope.binds).all();
    return json2({
      payments: res.results.map((r) => ({
        id: r.id,
        learnerId: r.learner_id,
        learnerName: r.learner_name,
        amount: r.amount,
        phone: r.phone,
        reference: r.reference,
        createdAt: r.created_at
      }))
    });
  }
  if (path === "/api/payments" && method === "POST")
    return postPayment(env2, access, body);
  if (path === "/api/whatsapp" && method === "GET") {
    const cfg = evolutionConfig(env2);
    const scope = scopeClause(access, "l.");
    const res = await env2.DB.prepare(
      `SELECT w.id, w.learner_id, w.phone, w.message, w.status, w.error, w.created_at, l.name AS learner_name
         FROM whatsapp_log w JOIN learners l ON l.id = w.learner_id
        WHERE w.tenant_id = ?${scope.clause} ORDER BY w.created_at DESC LIMIT 100`
    ).bind(tenant.id, ...scope.binds).all();
    return json2({
      configured: cfg.configured,
      messages: res.results.map((r) => ({
        id: r.id,
        learnerId: r.learner_id,
        learnerName: r.learner_name,
        phone: r.phone,
        message: r.message,
        status: r.status,
        error: r.error || "",
        createdAt: r.created_at
      }))
    });
  }
  if (path === "/api/whatsapp" && method === "POST")
    return sendWhatsapp(env2, access, body, spec);
  if (path === "/api/dashboard" && method === "GET") {
    return json2(await dashboard(env2, access, q.get("stream") || ""));
  }
  if (path === "/api/broadsheet/csv" && method === "GET") {
    return broadsheetCsv(env2, access, q.get("stream") || "", spec);
  }
  return err(404, "NOT_FOUND", `No route for ${method} ${path}`);
}
__name(handleApi, "handleApi");
var index_default = {
  async fetch(request, env2) {
    auth ??= createFreebuffAuth({
      clientId: env2.FREEBUFF_CLIENT_ID,
      issuer: env2.FREEBUFF_ISSUER,
      baseUrl: env2.APP_ORIGIN,
      // Development only: the local wrangler preview serves http://localhost.
      // The deployed site is https, so this flag stays false there.
      allowInsecureLocalhost: /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/?$/.test(env2.APP_ORIGIN || "")
    });
    app ??= auth.wrap(async (request2, env22) => {
      const url = new URL(request2.url);
      if (url.pathname.startsWith("/api/")) {
        await ensureSchema(env22);
        const user = await auth.getUser(request2);
        return handleApi(request2, env22, user);
      }
      const res = await env22.ASSETS.fetch(request2);
      if (res.status === 404 && !url.pathname.startsWith("/auth/")) {
        return env22.ASSETS.fetch(new Request(new URL("/", url.origin)));
      }
      return res;
    });
    return app(request, env2);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-p6Xbe5/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-p6Xbe5/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
