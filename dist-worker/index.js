// worker/src/index.js
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var JOSEError = class extends Error {
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
  }
};
var JWTClaimValidationFailed = class extends JOSEError {
  static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
};
var JWTExpired = class extends JOSEError {
  static code = "ERR_JWT_EXPIRED";
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
};
var JOSEAlgNotAllowed = class extends JOSEError {
  static code = "ERR_JOSE_ALG_NOT_ALLOWED";
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
};
var JOSENotSupported = class extends JOSEError {
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWEDecryptionFailed = class extends JOSEError {
  static code = "ERR_JWE_DECRYPTION_FAILED";
  code = "ERR_JWE_DECRYPTION_FAILED";
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
  }
};
var JWEInvalid = class extends JOSEError {
  static code = "ERR_JWE_INVALID";
  code = "ERR_JWE_INVALID";
};
var JWSInvalid = class extends JOSEError {
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};
var JWKInvalid = class extends JOSEError {
  static code = "ERR_JWK_INVALID";
  code = "ERR_JWK_INVALID";
};
var JWKSInvalid = class extends JOSEError {
  static code = "ERR_JWKS_INVALID";
  code = "ERR_JWKS_INVALID";
};
var JWKSNoMatchingKey = class extends JOSEError {
  static code = "ERR_JWKS_NO_MATCHING_KEY";
  code = "ERR_JWKS_NO_MATCHING_KEY";
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
  }
};
var JWKSMultipleMatchingKeys = class extends JOSEError {
  [Symbol.asyncIterator] = async function* () {
  };
  static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
  }
};
var JWKSTimeout = class extends JOSEError {
  static code = "ERR_JWKS_TIMEOUT";
  code = "ERR_JWKS_TIMEOUT";
  constructor(message2 = "request timed out", options) {
    super(message2, options);
  }
};
var JWSSignatureVerificationFailed = class extends JOSEError {
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
};
var invalid = "The input to be decoded is not correctly encoded.";
function decode(input) {
  try {
    return decodeBase64(typeof input == "string" ? input : decoder.decode(input), true);
  } catch (cause) {
    throw new TypeError(invalid, { cause });
  }
}
function isObject(input) {
  if (typeof input != "object" || input === null || Object.prototype.toString.call(input) !== "[object Object]")
    return false;
  const prototype = Object.getPrototypeOf(input);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}
function isJwkSet(input) {
  return isObject(input) && Array.isArray(input.keys) && Array.from(input.keys).every(isObject);
}
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
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch (cause) {
    throw new ErrorClass(`Failed to base64url decode the ${label}`, { cause });
  }
}
function encodeAsciiMember(value, label, ErrorClass) {
  try {
    return encode(value);
  } catch (cause) {
    throw new ErrorClass(`The ${label} is not a valid base64url string`, { cause });
  }
}
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
var JWS_RECOGNIZED = { __proto__: null, b64: true };
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s != "string")))
    throw new TypeError(`"${option}" option must be an array of strings`);
  return algorithms === void 0 ? void 0 : new Set(algorithms);
}
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
function validateB64(protectedHeader, extensions) {
  if (extensions.includes("b64")) {
    const b64 = protectedHeader.b64;
    if (typeof b64 != "boolean")
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    return b64;
  }
  return true;
}
var tag = (key) => key[Symbol.toStringTag];
var jwkMatchesOp = (entry, key, usage) => {
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
};
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
var cache;
var nist = {
  __proto__: null,
  prime256v1: "P-256",
  secp384r1: "P-384",
  secp521r1: "P-521"
};
var isCryptoKey = (key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
};
var isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
var isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);
function message(msg, actual, ...types) {
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else types.length === 2 ? msg += `one of type ${types[0]} or ${types[1]}.` : msg += `of type ${types[0]}.`;
  return actual == null ? msg += ` Received ${actual}` : typeof actual == "function" && actual.name ? msg += ` Received function ${actual.name}` : typeof actual == "object" && actual != null && actual.constructor?.name && (msg += ` Received an instance of ${actual.constructor.name}`), msg;
}
function invalidKeyType(alg, actual, secret) {
  const types = ["CryptoKey", "KeyObject", "JSON Web Key"];
  return secret && types.push("Uint8Array"), new TypeError(message(`Key for the ${alg} algorithm must be `, actual, ...types));
}
var unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage))
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
}
function checkModulusLength(alg, key) {
  const { modulusLength } = key.algorithm;
  if (typeof modulusLength != "number" || modulusLength < 2048)
    throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
}
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
function snapshotJwk(jwk) {
  return { __proto__: null, ...jwk };
}
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
async function jwkToKey(entry, jwk, extractable) {
  if (!entry.kty.includes(jwk.kty))
    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  const algorithm = entry.resolve?.({ kty: jwk.kty, crv: jwk.crv }) ?? entry.subtle, isPrivate = !!(jwk.d || jwk.priv), keyData = { ...jwk, ext: extractable ?? jwk.ext };
  return keyData.kty !== "AKP" && delete keyData.alg, delete keyData.use, crypto.subtle.importKey("jwk", keyData, algorithm, keyData.ext ?? !isPrivate, jwk.key_ops ?? entry.usages[isPrivate ? 1 : 0]);
}
async function rawKey(key, expected, usage, extractable = false) {
  return key instanceof Uint8Array && (key = await crypto.subtle.importKey("raw", key, expected, extractable, [usage])), checkCryptoKey(key, expected, usage), key;
}
function table(entries) {
  const out = { __proto__: null };
  for (const alg in entries)
    out[alg] = { ...entries[alg], alg };
  return out;
}
var sig = [["verify"], ["sign"]];
function hmac(bits) {
  const subtle = { name: "HMAC", hash: `SHA-${bits}` };
  return { kty: ["oct"], secret: true, subtle, signing: subtle, usages: sig };
}
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
function ecdsa(crv, bits) {
  return {
    kty: ["EC"],
    crv,
    subtle: { name: "ECDSA", namedCurve: crv },
    signing: { name: "ECDSA", hash: `SHA-${bits}` },
    usages: sig
  };
}
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
function mldsa(parameterSet) {
  const subtle = { name: `ML-DSA-${parameterSet}` };
  return {
    kty: ["AKP"],
    subtle,
    signing: subtle,
    usages: sig
  };
}
var JWS = table({
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
function prepareVerify(options) {
  return [options && validateAlgorithms("algorithms", options.algorithms), options?.crit];
}
function parseProtectedHeader(encodedProtectedHeader) {
  return encodedProtectedHeader === void 0 ? {} : parseJoseHeader(encodedProtectedHeader, JWSInvalid, "JWS Protected Header is invalid");
}
function encodeCompactUnencodedPayload(payload) {
  try {
    return encode(payload);
  } catch (cause) {
    throw new JWSInvalid("JWS Compact Serialization payload must use only ASCII characters", {
      cause
    });
  }
}
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
async function verifyCompact(jws, shared, key) {
  if (jws instanceof Uint8Array && (jws = decoder.decode(jws)), typeof jws != "string")
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3)
    throw new JWSInvalid("Invalid Compact JWS");
  return verifySignature({ payload, protected: protectedHeader, signature }, shared, key, encodeCompactUnencodedPayload);
}
var epoch = (date) => Math.floor(date.getTime() / 1e3);
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
function secs(str) {
  typeof str != "string" && invalidDuration();
  const matched = REGEX.exec(str);
  (!matched || matched[4] && matched[1]) && invalidDuration();
  const value = parseFloat(matched[2]), durationSeconds = Math.round(value * multipliers[matched[3][0].toLowerCase()]);
  return Number.isFinite(durationSeconds) || invalidDuration(), matched[1] === "-" || matched[4] === "ago" ? -durationSeconds : durationSeconds;
}
function validateInput(label, input) {
  if (!Number.isFinite(input))
    throw new TypeError(`Invalid ${label} input`);
  return input;
}
var normalizeTyp = (value) => {
  const normalized = value.toLowerCase();
  return value.includes("/") ? normalized : `application/${normalized}`;
};
var checkAudiencePresence = (audPayload, audOption) => typeof audPayload == "string" ? audOption.includes(audPayload) : Array.isArray(audPayload) ? audOption.some((aud) => audPayload.includes(aud)) : false;
function validateNumericDate(claimsSet, claim, required = false) {
  const value = claimsSet[claim];
  if (!(value === void 0 && !required)) {
    if (typeof value != "number")
      throw new JWTClaimValidationFailed(`"${claim}" claim must be a number`, claimsSet, claim, "invalid");
    return value;
  }
}
function unexpectedClaim(claimsSet, claim) {
  throw new JWTClaimValidationFailed(`unexpected "${claim}" claim value`, claimsSet, claim, checkFailed);
}
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
async function jwtVerify(jwt, key, options) {
  const [verified, b64] = await verifyCompact(jwt, prepareVerify(options), key);
  if (!b64)
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  return { ...verified, payload };
}
function isUsableJWK(jwk, entry, alg, kid) {
  const { kty, key_ops: keyOps, ext, kid: jwkKid, alg: jwkAlg, use, crv } = jwk;
  return (ext === void 0 || typeof ext == "boolean") && (keyOps === void 0 || Array.isArray(keyOps) && keyOps.every((operation, index) => typeof operation == "string" && keyOps.indexOf(operation) === index) && keyOps.includes("verify")) && entry.kty.includes(kty) && (kid === void 0 || typeof kid == "string" && kid === jwkKid) && (jwkAlg === void 0 ? kty !== "AKP" : alg === jwkAlg) && (use === void 0 || use === "sig") && (!entry.crv || crv === entry.crv);
}
async function importWithAlgCache(cache2, jwk, entry) {
  const cached = cache2.get(jwk) || cache2.set(jwk, {}).get(jwk), { alg } = entry;
  if (cached[alg] === void 0) {
    const pending = jwkToKey(entry, jwk, true).then((key) => {
      if (key.type !== "public")
        throw new JWKSInvalid("JSON Web Key Set members must be public keys");
      return cached[alg] = key, key;
    }).catch((error) => {
      throw cached[alg] === pending && delete cached[alg], error;
    });
    cached[alg] = pending;
  }
  return cached[alg];
}
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
      const error = new JWKSMultipleMatchingKeys();
      throw error[Symbol.asyncIterator] = async function* () {
        for (const jwk2 of candidates)
          try {
            yield await importWithAlgCache(cached, jwk2, entry);
          } catch {
          }
      }, error;
    }
    return importWithAlgCache(cached, jwk, entry);
  }, "jwks", {
    value: () => structuredClone(snapshot)
  });
}
function isCloudflareWorkers() {
  return typeof WebSocketPair < "u" || typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime < "u" && EdgeRuntime === "vercel";
}
var USER_AGENT;
(typeof navigator > "u" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) && (USER_AGENT = "jose/v6.2.13");
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
var jwksCache = /* @__PURE__ */ Symbol();
function isFreshFor(timestamp, duration) {
  return Number.isFinite(timestamp) && Date.now() < timestamp + duration;
}
function validateDuration(value, fallback, option) {
  if (Number.isNaN(value))
    throw new TypeError(`"${option}" option must not be NaN`);
  return typeof value == "number" ? value : fallback;
}
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
  const reload = async () => {
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
  };
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
function base64url(bytes) {
  let binary = "";
  for (const byte of bytes)
    binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomToken() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}
async function pkceChallenge(verifier) {
  const bytes = new TextEncoder().encode(verifier);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)));
}
function isSameOriginRequest(request, origin) {
  const header = request.headers.get("origin");
  if (header && header !== "null")
    return header === origin;
  return true;
}
function timingSafeEqual(left, right) {
  if (left.length !== right.length)
    return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++)
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}
function readCookie(header, name) {
  const values = (header ?? "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  if (values.length !== 1)
    return null;
  const value = values[0].slice(name.length + 1);
  return value && value.length <= MAX_COOKIE_LENGTH ? value : null;
}
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
function json(body, status = 200, cookies = []) {
  const headers = new Headers({ ...NO_STORE, "Content-Type": "application/json; charset=utf-8" });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}
function redirect(location, cookies = []) {
  const headers = new Headers({ ...NO_STORE, Location: location });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}
function problem(status, message2, cookies = []) {
  const headers = new Headers({ ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(message2, { status, headers });
}
async function readJson(response) {
  const text = await response.text();
  if (text.length > 65536)
    throw new Error("Freebuff response too large");
  const value = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Unexpected Freebuff response");
  return value;
}
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
  const transactionCookie = (state) => `${cookiePrefix}freebuff_txn-${state.slice(0, 16)}`;
  const callbackUrl = `${origin}${AUTH_ROUTE_PREFIX}/callback`;
  const setCookie = (name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; SameSite=None; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
  const clearCookie = (name) => setCookie(name, "", 0);
  const sessionCookieFor = (session) => {
    const value = `v1~${session.accessToken}~${session.refreshToken}`;
    if (value.length > MAX_COOKIE_LENGTH)
      throw new Error("Freebuff session is too large for a cookie");
    return setCookie(sessionCookie, value, SESSION_COOKIE_TTL);
  };
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
      const endpoint = (name, required = true) => {
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
      };
      return {
        authorization: endpoint("authorization_endpoint"),
        token: endpoint("token_endpoint"),
        revocation: endpoint("revocation_endpoint", false),
        keys: createRemoteJWKSet(new URL(endpoint("jwks_uri")), {
          [customFetch]: (url, init) => freebuffFetch(url, init),
          timeoutDuration: FETCH_TIMEOUT_MS
        })
      };
    })().catch((error) => {
      discovery = void 0;
      throw error;
    });
    return discovery;
  }
  function readSession(request) {
    const value = readCookie(request.headers.get("cookie"), sessionCookie);
    const match = value ? /^v1~([A-Za-z0-9._-]+)~(fbrt_[A-Za-z0-9_-]+)$/.exec(value) : null;
    return match ? { accessToken: match[1], refreshToken: match[2] } : null;
  }
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
    } catch (error) {
      return error instanceof errors_exports.JWTExpired ? "expired" : null;
    }
  }
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
  const contexts = /* @__PURE__ */ new WeakMap();
  async function getUser(request) {
    const context = contexts.get(request);
    if (context) {
      context.result ??= authenticate(request);
      return (await context.result).user;
    }
    const session = readSession(request);
    if (!session)
      return null;
    const verified = await verifyAccessToken(session.accessToken);
    return verified && verified !== "expired" ? verified.user : null;
  }
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
    const error = params.get("error");
    if (error) {
      if (error === "access_denied")
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
  function wrap(handler) {
    return async (request, ...rest) => {
      const own = await handle(request);
      if (own)
        return own;
      const context = {};
      contexts.set(request, context);
      const response = await handler(request, ...rest);
      const cookies = context.result ? (await context.result).cookies : [];
      if (cookies.length === 0 || response.status === 101)
        return response;
      const headers = new Headers(response.headers);
      for (const cookie of cookies)
        headers.append("Set-Cookie", cookie);
      headers.set("Cache-Control", "private, no-store");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    };
  }
  return { issuer, clientId, handle, authenticate, getUser, wrap };
}
var schema_default = "-- ElimuTrack Enterprise \u2014 D1 schema\n-- Every tenant-scoped table carries tenant_id; the API always filters by the\n-- authenticated user's tenant, never by a client-supplied id.\n\nCREATE TABLE IF NOT EXISTS tenants (\n  id          TEXT PRIMARY KEY,\n  name        TEXT NOT NULL,\n  owner_sub   TEXT NOT NULL,\n  plan        TEXT NOT NULL DEFAULT 'trial',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\nCREATE TABLE IF NOT EXISTS learners (\n  id             TEXT PRIMARY KEY,\n  tenant_id      TEXT NOT NULL,\n  name           TEXT NOT NULL,\n  gender         TEXT NOT NULL DEFAULT 'Male',\n  stream         TEXT NOT NULL,\n  grade_level    TEXT NOT NULL,\n  admission_no   TEXT NOT NULL,\n  nemis_upi      TEXT,\n  knec_no        TEXT,\n  guardian_phone TEXT,\n  fee_total      INTEGER NOT NULL DEFAULT 0,\n  fee_paid       INTEGER NOT NULL DEFAULT 0,\n  attendance_pct INTEGER NOT NULL DEFAULT 100,\n  boarding       INTEGER NOT NULL DEFAULT 0,\n  admission_fee_paid INTEGER NOT NULL DEFAULT 0,\n  additional_fees INTEGER NOT NULL DEFAULT 0,\n  created_at     TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_learners_tenant_adm\n  ON learners (tenant_id, admission_no);\nCREATE INDEX IF NOT EXISTS idx_learners_tenant_stream\n  ON learners (tenant_id, stream);\n\nCREATE TABLE IF NOT EXISTS marks (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  score       INTEGER NOT NULL,\n  rubric      TEXT NOT NULL,\n  points      INTEGER NOT NULL,\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_marks_unique\n  ON marks (tenant_id, learner_id, subject_id);\nCREATE INDEX IF NOT EXISTS idx_marks_tenant_subject\n  ON marks (tenant_id, subject_id);\n\nCREATE TABLE IF NOT EXISTS attendance (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  day         TEXT NOT NULL,\n  status      TEXT NOT NULL,\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique\n  ON attendance (tenant_id, learner_id, day);\nCREATE INDEX IF NOT EXISTS idx_attendance_tenant_day\n  ON attendance (tenant_id, day);\n\nCREATE TABLE IF NOT EXISTS observations (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  day         TEXT NOT NULL,\n  note        TEXT NOT NULL,\n  author      TEXT NOT NULL DEFAULT '',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_obs_tenant ON observations (tenant_id, created_at);\n\nCREATE TABLE IF NOT EXISTS payments (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  amount      INTEGER NOT NULL,\n  phone       TEXT,\n  reference   TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments (tenant_id, created_at);\n\n-- School staff accounts: the admin creates each teacher's initial login.\n-- Usernames are globally unique so a teacher session can be resolved before\n-- the tenant is known; passwords are never stored in plaintext (PBKDF2).\nCREATE TABLE IF NOT EXISTS staff (\n  id                TEXT PRIMARY KEY,\n  tenant_id         TEXT NOT NULL,\n  name              TEXT NOT NULL,\n  username          TEXT NOT NULL,\n  password_hash     TEXT NOT NULL,\n  salt              TEXT NOT NULL,\n  must_change_login INTEGER NOT NULL DEFAULT 1,\n  active            INTEGER NOT NULL DEFAULT 1,\n  created_at        TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_staff_username ON staff (username);\nCREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff (tenant_id, name);\n\n-- The classes (streams) an admin puts a teacher in charge of. A teacher's\n-- class selector and every query they can run is limited to these rows.\nCREATE TABLE IF NOT EXISTS staff_classes (\n  staff_id  TEXT NOT NULL,\n  tenant_id TEXT NOT NULL,\n  stream    TEXT NOT NULL,\n  PRIMARY KEY (staff_id, stream)\n);\n\n-- The services (modules) an admin grants a teacher. This is exactly what the\n-- teacher sees on their dashboard navigation.\nCREATE TABLE IF NOT EXISTS staff_services (\n  staff_id  TEXT NOT NULL,\n  tenant_id TEXT NOT NULL,\n  service   TEXT NOT NULL,\n  PRIMARY KEY (staff_id, service)\n);\n\n-- Teacher sign-in sessions (admin signs in with Sign in with Freebuff).\n-- Only the SHA-256 of the cookie token is stored.\nCREATE TABLE IF NOT EXISTS staff_sessions (\n  token_hash TEXT PRIMARY KEY,\n  staff_id   TEXT NOT NULL,\n  expires_at TEXT NOT NULL,\n  created_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_staff_sessions_staff ON staff_sessions (staff_id);\n\n-- The school's standard lesson plan: sections are a JSON array of\n-- {key,label} written by the admin (keys are positional: sec1..secN).\nCREATE TABLE IF NOT EXISTS lesson_plan_templates (\n  tenant_id  TEXT PRIMARY KEY,\n  name       TEXT NOT NULL,\n  sections   TEXT NOT NULL,\n  updated_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\n-- Lesson plans themselves. `content` is JSON keyed by section key, so the\n-- end-of-lesson remarks and every other block are stored per lesson.\nCREATE TABLE IF NOT EXISTS lesson_plans (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  stream      TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  lesson_date TEXT NOT NULL,\n  topic       TEXT NOT NULL,\n  sub_strand  TEXT NOT NULL DEFAULT '',\n  content     TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_lp_tenant_date ON lesson_plans (tenant_id, lesson_date);\nCREATE INDEX IF NOT EXISTS idx_lp_tenant_stream ON lesson_plans (tenant_id, stream);\n\nCREATE TABLE IF NOT EXISTS sms_log (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  phone       TEXT NOT NULL,\n  message     TEXT NOT NULL,\n  status      TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_sms_tenant ON sms_log (tenant_id, created_at);\n\n-- WhatsApp outbox, sent through Evolution API (POST /message/sendText/{instance}).\n-- sms_log above is kept for history only \u2014 it is no longer written.\nCREATE TABLE IF NOT EXISTS whatsapp_log (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  phone       TEXT NOT NULL,\n  message     TEXT NOT NULL,\n  status      TEXT NOT NULL,\n  error       TEXT,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_wa_tenant ON whatsapp_log (tenant_id, created_at);\n\n-- Schemes of work: one row per class/subject/term/week, matching the KICD\n-- scheme format. Teachers write rows for their assigned classes; admins write\n-- any. `staff_id` is the author's staff row ('' when an admin wrote it).\nCREATE TABLE IF NOT EXISTS scheme_rows (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  stream      TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  term        TEXT NOT NULL,\n  week        INTEGER NOT NULL,\n  strand      TEXT NOT NULL DEFAULT '',\n  sub_strand  TEXT NOT NULL DEFAULT '',\n  outcomes    TEXT NOT NULL DEFAULT '',\n  experiences TEXT NOT NULL DEFAULT '',\n  inquiry     TEXT NOT NULL DEFAULT '',\n  resources   TEXT NOT NULL DEFAULT '',\n  assessment  TEXT NOT NULL DEFAULT '',\n  remarks     TEXT NOT NULL DEFAULT '',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_scheme_unique\n  ON scheme_rows (tenant_id, stream, subject_id, term, week);\nCREATE INDEX IF NOT EXISTS idx_scheme_tenant ON scheme_rows (tenant_id, stream);\n\n-- Timetable: the admin defines teaching periods and places lessons in the\n-- grid, assigning each to a teacher (staff_id). Teachers read their own rows.\nCREATE TABLE IF NOT EXISTS timetable_periods (\n  tenant_id  TEXT NOT NULL,\n  position   INTEGER NOT NULL,\n  label      TEXT NOT NULL,\n  starts_at  TEXT NOT NULL,\n  ends_at    TEXT NOT NULL,\n  PRIMARY KEY (tenant_id, position)\n);\n\nCREATE TABLE IF NOT EXISTS timetable_entries (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  day          TEXT NOT NULL,\n  period       INTEGER NOT NULL,\n  stream       TEXT NOT NULL,\n  subject_id   TEXT NOT NULL,\n  staff_id     TEXT NOT NULL DEFAULT '',\n  room         TEXT NOT NULL DEFAULT '',\n  created_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_tt_unique\n  ON timetable_entries (tenant_id, day, period, stream);\nCREATE INDEX IF NOT EXISTS idx_tt_tenant ON timetable_entries (tenant_id, day);\nCREATE INDEX IF NOT EXISTS idx_tt_staff ON timetable_entries (staff_id);\n\n-- Record of work: what actually got taught (scheme vs reality, absences,\n-- homework, end-of-lesson remarks). Teacher-authored, class-scoped.\nCREATE TABLE IF NOT EXISTS record_of_work (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  stream      TEXT NOT NULL,\n  subject_id  TEXT NOT NULL,\n  day         TEXT NOT NULL,\n  topic       TEXT NOT NULL,\n  strand      TEXT NOT NULL DEFAULT '',\n  class_size  INTEGER NOT NULL DEFAULT 0,\n  absences    TEXT NOT NULL DEFAULT '',\n  homework    TEXT NOT NULL DEFAULT '',\n  remarks     TEXT NOT NULL DEFAULT '',\n  created_at  TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_row_tenant ON record_of_work (tenant_id, day);\nCREATE INDEX IF NOT EXISTS idx_row_stream ON record_of_work (tenant_id, stream);\n\n-- Learners' progress records: narrative competency snapshots per learner.\nCREATE TABLE IF NOT EXISTS progress_records (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  learner_id  TEXT NOT NULL,\n  staff_id    TEXT NOT NULL DEFAULT '',\n  author      TEXT NOT NULL DEFAULT '',\n  subject_id  TEXT NOT NULL,\n  strand      TEXT NOT NULL DEFAULT '',\n  sub_strand  TEXT NOT NULL DEFAULT '',\n  term        TEXT NOT NULL DEFAULT '',\n  day         TEXT NOT NULL,\n  stage       TEXT NOT NULL,\n  note        TEXT NOT NULL,\n  created_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_progress_learner ON progress_records (learner_id, created_at);\nCREATE INDEX IF NOT EXISTS idx_progress_tenant ON progress_records (tenant_id, created_at);\n\n-- Fee configuration per grade level (boarding/day differentiation)\nCREATE TABLE IF NOT EXISTS fee_config (\n  id          TEXT PRIMARY KEY,\n  tenant_id   TEXT NOT NULL,\n  grade_level TEXT NOT NULL,\n  fee_amount  INTEGER NOT NULL DEFAULT 0,\n  boarding_fee INTEGER NOT NULL DEFAULT 0,\n  day_fee     INTEGER NOT NULL DEFAULT 0,\n  admission_fee INTEGER NOT NULL DEFAULT 0,\n  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_fee_config_unique ON fee_config (tenant_id, grade_level);\n\n-- KICD curriculum designs: the official framework strands teachers pick from\n-- when writing schemes and lesson plans. Category separates the Regular and\n-- SNE designs; admins maintain the library, teachers browse it.\nCREATE TABLE IF NOT EXISTS kicd_designs (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  category     TEXT NOT NULL,\n  level        TEXT NOT NULL,\n  grade        TEXT NOT NULL DEFAULT '',\n  subject_id   TEXT NOT NULL,\n  strand       TEXT NOT NULL,\n  sub_strand   TEXT NOT NULL DEFAULT '',\n  outcomes     TEXT NOT NULL DEFAULT '',\n  experiences  TEXT NOT NULL DEFAULT '',\n  competencies TEXT NOT NULL DEFAULT '',\n  standards    TEXT NOT NULL DEFAULT '',\n  inquiry      TEXT NOT NULL DEFAULT '',\n  resources    TEXT NOT NULL DEFAULT '',\n  inclusive    TEXT NOT NULL DEFAULT '',\n  -- Provenance: where this design came from and when it was last verified.\n  origin       TEXT NOT NULL DEFAULT 'school',   -- kicd | school | sample\n  source_url   TEXT NOT NULL DEFAULT '',\n  source_title TEXT NOT NULL DEFAULT '',\n  version_label TEXT NOT NULL DEFAULT '',\n  version_date TEXT NOT NULL DEFAULT '',\n  last_checked_at TEXT NOT NULL DEFAULT '',\n  status       TEXT NOT NULL DEFAULT 'active',   -- active | disabled\n  created_at   TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_kicd_tenant ON kicd_designs (tenant_id, category, level);\n\n-- Approved KICD course and complementary materials, held as a reference index.\n-- Only bibliographic metadata and a link back to KICD is stored: approval to\n-- use a book in schools does not grant the right to redistribute the file.\nCREATE TABLE IF NOT EXISTS approved_resources (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  category     TEXT NOT NULL,             -- curriculum_design | course_book | complementary | teacher | parent\n  title        TEXT NOT NULL,\n  publisher    TEXT NOT NULL DEFAULT '',\n  level        TEXT NOT NULL DEFAULT '',\n  grade        TEXT NOT NULL DEFAULT '',\n  learning_area TEXT NOT NULL DEFAULT '',\n  approval_note TEXT NOT NULL DEFAULT '',\n  source_url   TEXT NOT NULL DEFAULT '',\n  version_date TEXT NOT NULL DEFAULT '',\n  last_checked_at TEXT NOT NULL DEFAULT '',\n  status       TEXT NOT NULL DEFAULT 'active',\n  created_at   TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_resources_tenant ON approved_resources (tenant_id, status, level);\n\n-- School settings\nCREATE TABLE IF NOT EXISTS school_settings (\n  tenant_id TEXT PRIMARY KEY,\n  school_type TEXT NOT NULL DEFAULT 'both', -- 'boarding' | 'day' | 'both'\n  streams_config TEXT NOT NULL DEFAULT '[]',\n  updated_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\n-- KLB Books (licensed textbooks)\nCREATE TABLE IF NOT EXISTS klb_books (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  publisher    TEXT NOT NULL DEFAULT '',\n  book_title   TEXT NOT NULL,\n  grade        TEXT NOT NULL,\n  level        TEXT NOT NULL DEFAULT '',\n  subject_id   TEXT NOT NULL,\n  edition      TEXT NOT NULL DEFAULT '',\n  year         TEXT NOT NULL DEFAULT '',\n  isbn         TEXT NOT NULL DEFAULT '',\n  license_info TEXT NOT NULL DEFAULT '',\n  permitted_usage TEXT NOT NULL DEFAULT '',\n  source_doc   TEXT NOT NULL DEFAULT '',\n  version      TEXT NOT NULL DEFAULT '1.0',\n  status       TEXT NOT NULL DEFAULT 'active',\n  created_at   TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_klb_books_tenant ON klb_books (tenant_id, grade, subject_id);\n\n-- KLB Topics/Lessons\nCREATE TABLE IF NOT EXISTS klb_topics (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  book_id      TEXT NOT NULL,\n  grade        TEXT NOT NULL,\n  subject_id   TEXT NOT NULL,\n  term         TEXT NOT NULL DEFAULT '',\n  topic        TEXT NOT NULL,\n  subtopic     TEXT NOT NULL DEFAULT '',\n  lesson_seq   INTEGER NOT NULL DEFAULT 0,\n  strand       TEXT NOT NULL DEFAULT '',\n  sub_strand   TEXT NOT NULL DEFAULT '',\n  outcomes     TEXT NOT NULL DEFAULT '',\n  activities   TEXT NOT NULL DEFAULT '',\n  experiences  TEXT NOT NULL DEFAULT '',\n  resources    TEXT NOT NULL DEFAULT '',\n  assessment   TEXT NOT NULL DEFAULT '',\n  page_refs    TEXT NOT NULL DEFAULT '',\n  week         INTEGER,\n  created_at   TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_klb_topics_tenant ON klb_topics (tenant_id, grade, subject_id, term);\nCREATE INDEX IF NOT EXISTS idx_klb_topics_book ON klb_topics (book_id);\n\n-- Mapping between KICD sub-strands and KLB topics\nCREATE TABLE IF NOT EXISTS kicd_klb_mapping (\n  id           TEXT PRIMARY KEY,\n  tenant_id    TEXT NOT NULL,\n  kicd_design_id TEXT NOT NULL,\n  klb_topic_id TEXT NOT NULL,\n  confidence   INTEGER NOT NULL DEFAULT 100,\n  created_at   TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE UNIQUE INDEX IF NOT EXISTS idx_kicd_klb_map ON kicd_klb_mapping (tenant_id, kicd_design_id, klb_topic_id);\n\n\n";
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
function rubricFor(score) {
  if (score >= 80) return { rubric: "EE", points: 4 };
  if (score >= 60) return { rubric: "ME", points: 3 };
  if (score >= 40) return { rubric: "AE", points: 2 };
  return { rubric: "BE", points: 1 };
}
var PLAN_SPECS = {
  trial: { name: "Starter Trial", maxLearners: 60, whatsapp: false, exportCsv: false, streams: 1 },
  standard: { name: "School Standard", maxLearners: 600, whatsapp: true, exportCsv: true, streams: 6 },
  premium: { name: "Campus Premium", maxLearners: 1e5, whatsapp: true, exportCsv: true, streams: 99 }
};
var schemaReady = false;
var json2 = (body, init = {}) => new Response(JSON.stringify(body), {
  headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store", ...init.headers },
  ...init
});
var err = (status, code, message2) => json2({ error: message2, code }, { status });
var uuid = () => crypto.randomUUID();
function planOf(tenant) {
  return PLAN_SPECS[tenant.plan] || PLAN_SPECS.trial;
}
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
  "/api/broadsheet/csv": "broadsheet",
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
  "/api/resources": "kicd",
  "/api/klb/books": "kicd",
  "/api/klb/topics": "kicd",
  "/api/lesson-plans": "lesson_plans",
  "/api/reportcards": "reportcards",
  "/api/pathways": "pathways"
};
var ADMIN_PATHS = ["/api/staff", "/api/plan", "/api/seed"];
var STAFF_COOKIE = "elmt_staff";
var SESSION_DAYS = 7;
var te = new TextEncoder();
var hexOf = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
var unhex = (s) => Uint8Array.from((s.match(/.{1,2}/g) || []).map((h) => parseInt(h, 16)));
var nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
async function sha256Hex(text) {
  return hexOf(await crypto.subtle.digest("SHA-256", te.encode(text)));
}
async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", te.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: unhex(saltHex), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return hexOf(bits);
}
var PBKDF2_ITERATIONS = 6e4;
var newSalt = () => hexOf(crypto.getRandomValues(new Uint8Array(16)));
var newToken = () => hexOf(crypto.getRandomValues(new Uint8Array(32)));
function cookiesOf(request) {
  const out = {};
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function staffCookie(token, env) {
  const secure = /^https:/.test(env.APP_ORIGIN || "") ? "; Secure" : "";
  return `${STAFF_COOKIE}=${token}; HttpOnly; SameSite=None; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}
function clearStaffCookie(env) {
  const secure = /^https:/.test(env.APP_ORIGIN || "") ? "; Secure" : "";
  return `${STAFF_COOKIE}=; HttpOnly; SameSite=None; Path=/; Max-Age=0${secure}`;
}
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
async function teacherAccess(env, staff) {
  const tenant = await env.DB.prepare("SELECT * FROM tenants WHERE id = ?").bind(staff.tenant_id).first();
  if (!tenant) return null;
  const [classes, services] = await Promise.all([
    env.DB.prepare("SELECT stream FROM staff_classes WHERE staff_id = ? ORDER BY stream").bind(staff.id).all(),
    env.DB.prepare("SELECT service FROM staff_services WHERE staff_id = ?").bind(staff.id).all()
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
async function accessFor(env, user, request) {
  const staff = await staffFromRequest(env, request);
  if (staff) {
    if (!staff.active) return null;
    return teacherAccess(env, staff);
  }
  if (user) {
    const tenant = await ensureTenant(env, user);
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
async function staffFromRequest(env, request) {
  const token = cookiesOf(request)[STAFF_COOKIE];
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT s.id, s.tenant_id, s.name, s.username, s.must_change_login, s.active, x.expires_at
       FROM staff_sessions x JOIN staff s ON s.id = x.staff_id
      WHERE x.token_hash = ?`
  ).bind(tokenHash).first();
  if (!row) return null;
  if (row.expires_at <= nowIso()) {
    await env.DB.prepare("DELETE FROM staff_sessions WHERE token_hash = ?").bind(tokenHash).run();
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
function scopeClause(access, alias = "") {
  if (access.role === "admin") return { clause: "", binds: [] };
  if (!access.streams.length) return { clause: " AND 1 = 0 ", binds: [] };
  const ph = access.streams.map(() => "?").join(",");
  return { clause: ` AND ${alias}stream IN (${ph})`, binds: [...access.streams] };
}
async function assertLearnersInScope(env, access, ids) {
  if (access.role === "admin") return null;
  const unique = [...new Set((ids || []).map(String))];
  if (!unique.length) return null;
  if (!access.streams.length) return err(403, "NO_CLASSES", "You have no classes assigned yet");
  const idPh = unique.map(() => "?").join(",");
  const stPh = access.streams.map(() => "?").join(",");
  const res = await env.DB.prepare(
    `SELECT id FROM learners WHERE tenant_id = ? AND id IN (${idPh}) AND stream IN (${stPh})`
  ).bind(access.tenant.id, ...unique, ...access.streams).all();
  if (res.results.length !== unique.length) {
    return err(403, "OUT_OF_SCOPE", "That learner is outside your assigned classes");
  }
  return null;
}
var COLUMN_MIGRATIONS = [
  ["learners", "boarding", "INTEGER NOT NULL DEFAULT 0"],
  ["learners", "admission_fee_paid", "INTEGER NOT NULL DEFAULT 0"],
  ["learners", "additional_fees", "INTEGER NOT NULL DEFAULT 0"],
  ["fee_config", "fee_amount", "INTEGER NOT NULL DEFAULT 0"],
  ["fee_config", "boarding_fee", "INTEGER NOT NULL DEFAULT 0"],
  ["fee_config", "day_fee", "INTEGER NOT NULL DEFAULT 0"],
  ["fee_config", "admission_fee", "INTEGER NOT NULL DEFAULT 0"],
  ["lesson_plans", "sub_strand", "TEXT NOT NULL DEFAULT ''"],
  ["kicd_designs", "experiences", "TEXT NOT NULL DEFAULT ''"],
  // Curriculum provenance: whether a design is official KICD content, school
  // entered, or (until verified) sample data — plus where it came from.
  ["kicd_designs", "origin", "TEXT NOT NULL DEFAULT 'school'"],
  ["kicd_designs", "source_url", "TEXT NOT NULL DEFAULT ''"],
  ["kicd_designs", "source_title", "TEXT NOT NULL DEFAULT ''"],
  ["kicd_designs", "version_label", "TEXT NOT NULL DEFAULT ''"],
  ["kicd_designs", "version_date", "TEXT NOT NULL DEFAULT ''"],
  ["kicd_designs", "last_checked_at", "TEXT NOT NULL DEFAULT ''"],
  ["kicd_designs", "status", "TEXT NOT NULL DEFAULT 'active'"],
  // Marks that a tenant seeded before the Grade 1 pilot existed has been
  // backfilled, so the one-time backfill never resurrects deleted rows.
  ["tenants", "kicd_pilot_backfilled", "INTEGER NOT NULL DEFAULT 0"],
  ["progress_records", "strand", "TEXT NOT NULL DEFAULT ''"],
  ["progress_records", "sub_strand", "TEXT NOT NULL DEFAULT ''"]
];
async function ensureSchema(env) {
  if (schemaReady) return;
  const sql = schema_default.split("\n").filter((line) => !line.trim().startsWith("--")).join("\n");
  const statements = sql.split(";").map((s) => s.trim()).filter(Boolean);
  await env.DB.batch(statements.map((s) => env.DB.prepare(s)));
  for (const [table2, column, definition] of COLUMN_MIGRATIONS) {
    try {
      await env.DB.prepare(`ALTER TABLE ${table2} ADD COLUMN ${column} ${definition}`).run();
    } catch {
    }
  }
  try {
    await env.DB.prepare("DROP INDEX IF EXISTS idx_tt_unique").run();
    await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_tt_unique ON timetable_entries (tenant_id, day, period, stream)").run();
  } catch {
  }
  schemaReady = true;
}
async function ensureTenant(env, user) {
  const existing = await env.DB.prepare("SELECT * FROM tenants WHERE owner_sub = ?").bind(user.sub).first();
  if (existing) return existing;
  const base = (user.name || user.email || "My School").split("@")[0].trim() || "My School";
  const tenant = {
    id: uuid(),
    name: `${base}'s School`,
    owner_sub: user.sub,
    plan: "trial"
  };
  try {
    await env.DB.prepare(
      "INSERT INTO tenants (id, name, owner_sub, plan) VALUES (?, ?, ?, ?)"
    ).bind(tenant.id, tenant.name, tenant.owner_sub, tenant.plan).run();
  } catch {
    return env.DB.prepare("SELECT * FROM tenants WHERE owner_sub = ?").bind(user.sub).first();
  }
  return tenant;
}
async function listLearners(env, access) {
  const scope = scopeClause(access);
  const res = await env.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees
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
    attendancePct: r.attendance_pct,
    boarding: r.boarding === 1 || r.boarding === true,
    admissionFeePaid: r.admission_fee_paid === 1 || r.admission_fee_paid === true,
    additionalFees: r.additional_fees || 0
  }));
}
async function listMarks(env, access, { stream, learnerId }) {
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
  const res = await env.DB.prepare(
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
async function dashboard(env, access, stream) {
  const tenantId = access.tenant.id;
  const scope = scopeClause(access);
  const learnerRes = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?${scope.clause}`
  ).bind(tenantId, ...scope.binds).first();
  const markClause = stream ? "AND l.stream = ?" : "";
  const markBinds = stream ? [tenantId, stream] : [tenantId];
  const mScope = scopeClause(access, "l.");
  const means = await env.DB.prepare(
    `SELECT m.subject_id AS sid, AVG(m.score) AS mean
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE m.tenant_id = ? ${markClause}${mScope.clause} GROUP BY m.subject_id`
  ).bind(...markBinds, ...mScope.binds).all();
  const rubric = await env.DB.prepare(
    `SELECT m.rubric AS band, COUNT(*) AS count
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE m.tenant_id = ? ${markClause}${mScope.clause} GROUP BY m.rubric`
  ).bind(...markBinds, ...mScope.binds).all();
  const attClause = stream ? "AND l.stream = ?" : "";
  const attBinds = stream ? [tenantId, stream] : [tenantId];
  const att = await env.DB.prepare(
    `SELECT
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present,
        COUNT(*) AS total,
        COUNT(DISTINCT a.day) AS days
       FROM attendance a JOIN learners l ON l.id = a.learner_id
      WHERE a.tenant_id = ? ${attClause}${mScope.clause}`
  ).bind(...attBinds, ...mScope.binds).first();
  const feeClause = stream ? "AND stream = ?" : "";
  const feeBinds = stream ? [tenantId, stream] : [tenantId];
  const fees = await env.DB.prepare(
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
async function createLearner(env, access, body, spec) {
  const name = String(body.name || "").trim();
  const admissionNo = String(body.admissionNo || "").trim();
  if (!name || !admissionNo) return err(400, "VALIDATION", "Learner name and admission number are required");
  const stream = String(body.stream || "Grade 7 Eta");
  if (access.role === "teacher" && !access.streams.includes(stream)) {
    return err(403, "OUT_OF_SCOPE", "You can only add learners to your assigned classes");
  }
  const tenant = access.tenant;
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?").bind(tenant.id).first();
  if ((count?.n ?? 0) >= spec.maxLearners) {
    return err(403, "PLAN_LEARNER_LIMIT", `Your plan allows up to ${spec.maxLearners} learners`);
  }
  const gradeLevel = String(body.gradeLevel || stream.split(" ").slice(0, 2).join(" "));
  const id = `lrn_${uuid()}`;
  const isBoarding = body.boarding === true || body.isBoarding === true || body.boarding === 1;
  const admissionFeePaid = body.admissionFeePaid === true || body.admissionFeePaid === 1;
  const additionalFees = Number(body.additionalFees || body.additional_fees || 0) || 0;
  const baseFee = await PRIMARY_OR_JSS_FEE(env, tenant.id, gradeLevel, isBoarding);
  const totalFee = baseFee + additionalFees;
  try {
    await env.DB.prepare(
      `INSERT INTO learners (id, tenant_id, name, gender, stream, grade_level, admission_no,
                             nemis_upi, knec_no, guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 100, ?, ?, ?)`
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
      totalFee,
      isBoarding ? 1 : 0,
      admissionFeePaid ? 1 : 0,
      additionalFees
    ).run();
  } catch (e) {
    const msg = String(e && e.message);
    if (msg.includes("UNIQUE")) return err(409, "DUPLICATE_ADMISSION", "That admission number already exists in this school");
    throw e;
  }
  const row = await env.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees
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
      attendancePct: row.attendance_pct,
      boarding: row.boarding === 1 || row.boarding === true,
      admissionFeePaid: row.admission_fee_paid === 1 || row.admission_fee_paid === true,
      additionalFees: row.additional_fees || 0
    }
  }, { status: 201 });
}
async function getFeeConfig(env, tenantId) {
  const res = await env.DB.prepare(
    "SELECT grade_level, fee_amount, boarding_fee, day_fee, admission_fee FROM fee_config WHERE tenant_id = ?"
  ).bind(tenantId).all();
  const config = {};
  for (const row of res.results) {
    config[row.grade_level] = {
      feeAmount: row.fee_amount || 0,
      boardingFee: row.boarding_fee || 0,
      dayFee: row.day_fee || 0,
      admissionFee: row.admission_fee || 0
    };
  }
  const defaults = {
    "Grade 1": { feeAmount: 32e3, dayFee: 32e3, boardingFee: 45e3, admissionFee: 2e3 },
    "Grade 2": { feeAmount: 32e3, dayFee: 32e3, boardingFee: 45e3, admissionFee: 2e3 },
    "Grade 3": { feeAmount: 32e3, dayFee: 32e3, boardingFee: 45e3, admissionFee: 2e3 },
    "Grade 4": { feeAmount: 32e3, dayFee: 32e3, boardingFee: 45e3, admissionFee: 2e3 },
    "Grade 5": { feeAmount: 32e3, dayFee: 32e3, boardingFee: 45e3, admissionFee: 2e3 },
    "Grade 6": { feeAmount: 32e3, dayFee: 32e3, boardingFee: 45e3, admissionFee: 2e3 },
    "Grade 7": { feeAmount: 45e3, dayFee: 45e3, boardingFee: 55e3, admissionFee: 2500 },
    "Grade 8": { feeAmount: 45e3, dayFee: 45e3, boardingFee: 55e3, admissionFee: 2500 },
    "Grade 9": { feeAmount: 45e3, dayFee: 45e3, boardingFee: 55e3, admissionFee: 2500 }
  };
  for (const [grade, def] of Object.entries(defaults)) {
    if (!config[grade]) config[grade] = def;
  }
  return config;
}
async function saveFeeConfig(env, access, body) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator can configure fees");
  const tenantId = access.tenant.id;
  const configs = Array.isArray(body.configs) ? body.configs : [];
  const stmts = [];
  for (const cfg of configs) {
    const gradeLevel = String(cfg.gradeLevel || "");
    if (!gradeLevel) continue;
    const id = `fee_${tenantId}_${gradeLevel.replace(/\s+/g, "_")}`;
    stmts.push(
      env.DB.prepare(
        `INSERT INTO fee_config (id, tenant_id, grade_level, fee_amount, boarding_fee, day_fee, admission_fee)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id, grade_level)
         DO UPDATE SET fee_amount = excluded.fee_amount, boarding_fee = excluded.boarding_fee,
                       day_fee = excluded.day_fee, admission_fee = excluded.admission_fee,
                       updated_at = datetime('now')`
      ).bind(
        id,
        tenantId,
        gradeLevel,
        Number(cfg.feeAmount || 0),
        Number(cfg.boardingFee || 0),
        Number(cfg.dayFee || 0),
        Number(cfg.admissionFee || 0)
      )
    );
  }
  if (stmts.length) await env.DB.batch(stmts);
  return json2({ ok: true, saved: stmts.length });
}
async function PRIMARY_OR_JSS_FEE(env, tenantId, gradeLevel, isBoarding) {
  const config = await getFeeConfig(env, tenantId);
  const grade = config[gradeLevel] || config[Object.keys(config)[0]];
  if (!grade) return 45e3;
  if (isBoarding) return grade.boardingFee || grade.feeAmount || 45e3;
  return grade.dayFee || grade.feeAmount || 45e3;
}
async function saveMarks(env, access, items) {
  if (!Array.isArray(items) || items.length === 0) return err(400, "VALIDATION", "No marks supplied");
  const denied = await assertLearnersInScope(env, access, items.map((i) => i.learnerId));
  if (denied) return denied;
  const tenant = access.tenant;
  const stmts = [];
  for (const item of items) {
    const score = Number(item.score);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return err(400, "VALIDATION", "Scores must be whole numbers between 0 and 100");
    }
    if (!SUBJECT_BY_ID[item.subjectId]) return err(400, "VALIDATION", "Unknown learning area");
    const { rubric, points } = rubricFor(score);
    stmts.push(
      env.DB.prepare(
        `INSERT INTO marks (tenant_id, learner_id, subject_id, score, rubric, points)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id, learner_id, subject_id)
         DO UPDATE SET score = excluded.score, rubric = excluded.rubric,
                       points = excluded.points, updated_at = datetime('now')`
      ).bind(tenant.id, String(item.learnerId), item.subjectId, score, rubric, points)
    );
  }
  await env.DB.batch(stmts);
  return json2({ saved: stmts.length });
}
async function saveAttendance(env, access, items) {
  if (!Array.isArray(items) || items.length === 0) return err(400, "VALIDATION", "No attendance supplied");
  const denied = await assertLearnersInScope(env, access, items.map((i) => i.learnerId));
  if (denied) return denied;
  const tenant = access.tenant;
  const stmts = [];
  for (const item of items) {
    const status = item.status === "absent" ? "absent" : "present";
    stmts.push(
      env.DB.prepare(
        `INSERT INTO attendance (tenant_id, learner_id, day, status)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(tenant_id, learner_id, day)
         DO UPDATE SET status = excluded.status, updated_at = datetime('now')`
      ).bind(tenant.id, String(item.learnerId), String(item.day), status)
    );
  }
  await env.DB.batch(stmts);
  return json2({ saved: stmts.length });
}
async function saveObservations(env, access, authorName, items) {
  if (!Array.isArray(items) || items.length === 0) return err(400, "VALIDATION", "No observations supplied");
  const denied = await assertLearnersInScope(env, access, items.map((i) => i.learnerId));
  if (denied) return denied;
  const tenant = access.tenant;
  const stmts = [];
  let n = 0;
  for (const item of items) {
    const note = String(item.note || "").trim();
    if (!note) continue;
    stmts.push(
      env.DB.prepare(
        "INSERT INTO observations (id, tenant_id, learner_id, day, note, author) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(uuid(), tenant.id, String(item.learnerId), String(item.day || ""), note, authorName || "teacher")
    );
    n++;
  }
  if (!n) return err(400, "VALIDATION", "Observation notes cannot be blank");
  await env.DB.batch(stmts);
  return json2({ saved: n });
}
async function postPayment(env, access, body) {
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0) return err(400, "VALIDATION", "Payment amount must be a positive whole number");
  const learnerId = String(body.learnerId || "");
  const tenant = access.tenant;
  const denied = await assertLearnersInScope(env, access, [learnerId]);
  if (denied) return denied;
  const learner = await env.DB.prepare("SELECT id, fee_total, fee_paid FROM learners WHERE id = ? AND tenant_id = ?").bind(learnerId, tenant.id).first();
  if (!learner) return err(404, "NOT_FOUND", "Learner not found");
  const reference = `MPE${Date.now().toString().slice(-9)}`;
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO payments (tenant_id, learner_id, amount, phone, reference) VALUES (?, ?, ?, ?, ?)"
    ).bind(tenant.id, learnerId, amount, String(body.phone || ""), reference),
    env.DB.prepare(
      "UPDATE learners SET fee_paid = fee_paid + ? WHERE id = ? AND tenant_id = ?"
    ).bind(amount, learnerId, tenant.id)
  ]);
  const paid = learner.fee_paid + amount;
  return json2({ reference, feePaid: paid, feeBalance: Math.max(0, learner.fee_total - paid) }, { status: 201 });
}
function evolutionConfig(env) {
  const baseUrl = String(env.EVOLUTION_BASE_URL || "").replace(/\/+$/, "");
  const apiKey = String(env.EVOLUTION_API_KEY || "");
  const instance = String(env.EVOLUTION_INSTANCE || "");
  return { baseUrl, apiKey, instance, configured: !!(baseUrl && apiKey && instance) };
}
function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}
async function sendWhatsapp(env, access, body, spec) {
  if (!spec.whatsapp) {
    return err(403, "PLAN_WHATSAPP_LOCKED", "WhatsApp messaging is not included in your plan");
  }
  const message2 = String(body.message || "").trim();
  const learnerId = String(body.learnerId || "");
  if (!message2 || !learnerId) return err(400, "VALIDATION", "Choose a recipient and write a message");
  const tenant = access.tenant;
  const denied = await assertLearnersInScope(env, access, [learnerId]);
  if (denied) return denied;
  const learner = await env.DB.prepare(
    "SELECT id, name, guardian_phone FROM learners WHERE id = ? AND tenant_id = ?"
  ).bind(learnerId, tenant.id).first();
  if (!learner) return err(404, "NOT_FOUND", "Learner not found");
  if (!learner.guardian_phone) return err(400, "NO_PHONE", "This learner has no guardian phone number");
  const cfg = evolutionConfig(env);
  if (!cfg.configured) {
    return err(
      503,
      "NOT_CONFIGURED",
      "WhatsApp is not configured yet \u2014 set EVOLUTION_BASE_URL, EVOLUTION_API_KEY and EVOLUTION_INSTANCE in Sites \u2192 Secrets, then deploy once"
    );
  }
  const phone = normalizePhone(learner.guardian_phone);
  if (!phone) return err(400, "NO_PHONE", "This guardian phone number contains no digits");
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
  await env.DB.prepare(
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
async function seedDemo(env, tenant) {
  const existing = await env.DB.prepare("SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?").bind(tenant.id).first();
  if ((existing?.n ?? 0) > 0) return err(409, "ALREADY_SEEDED", "This school already has learners");
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
        env.DB.prepare(
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
          env.DB.prepare(
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
    if (dow !== 0 && dow !== 6) days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() - 1);
  }
  days.reverse();
  const attStmts = [];
  for (const l of learners) {
    for (let d = 0; d < days.length; d++) {
      const absent = (l.i + d + l.idx) % 13 === 0;
      attStmts.push(
        env.DB.prepare(
          "INSERT INTO attendance (tenant_id, learner_id, day, status) VALUES (?, ?, ?, ?)"
        ).bind(tenant.id, l.id, days[d], absent ? "absent" : "present")
      );
    }
  }
  await env.DB.batch([...learnerStmts, ...markStmts, ...attStmts]);
  return json2({ seeded: learners.length });
}
function toCsv(rows) {
  return rows.map((r) => r.map((cell) => {
    const v = cell === null || cell === void 0 ? "" : String(cell);
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(",")).join("\r\n");
}
async function broadsheetCsv(env, access, stream, spec) {
  if (!spec.exportCsv) return err(403, "PLAN_EXPORT_LOCKED", "CSV export is not included in your plan");
  const learners = (await listLearners(env, access)).filter((l) => !stream || l.stream === stream);
  const marks = await listMarks(env, access, { stream });
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
var USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
async function staffWithGrants(env, tenantId) {
  const res = await env.DB.prepare(
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
  if (!staff.length) return staff;
  const [classes, services] = await Promise.all([
    env.DB.prepare("SELECT staff_id, stream FROM staff_classes WHERE tenant_id = ?").bind(tenantId).all(),
    env.DB.prepare("SELECT staff_id, service FROM staff_services WHERE tenant_id = ?").bind(tenantId).all()
  ]);
  const byId = Object.fromEntries(staff.map((s) => [s.id, s]));
  for (const c of classes.results) if (byId[c.staff_id]) byId[c.staff_id].classes.push(c.stream);
  for (const s of services.results) if (byId[s.staff_id]) byId[s.staff_id].services.push(s.service);
  return staff;
}
function validateStaffInput(body) {
  const name = String(body.name || "").trim();
  const username = String(body.username || "").trim().toLowerCase();
  if (!name) return { error: err(400, "VALIDATION", "Teacher name is required") };
  if (!USERNAME_RE.test(username)) {
    return { error: err(400, "VALIDATION", "Username must be 3-32 characters: letters, numbers, dot, dash or underscore") };
  }
  const services = Array.isArray(body.services) ? [...new Set(body.services.map(String))] : [];
  const classes = Array.isArray(body.classes) ? [...new Set(body.classes.map(String))] : [];
  const badService = services.find((s) => !SERVICES.includes(s));
  if (badService) return { error: err(400, "VALIDATION", `Unknown service: ${badService}`) };
  return { name, username, services, classes };
}
async function setStaffGrants(env, tenant, staffId, services, classes) {
  const stmts = [
    env.DB.prepare("DELETE FROM staff_services WHERE staff_id = ?").bind(staffId),
    env.DB.prepare("DELETE FROM staff_classes WHERE staff_id = ?").bind(staffId)
  ];
  for (const s of services) {
    stmts.push(env.DB.prepare(
      "INSERT OR IGNORE INTO staff_services (staff_id, tenant_id, service) VALUES (?, ?, ?)"
    ).bind(staffId, tenant.id, s));
  }
  for (const c of classes) {
    stmts.push(env.DB.prepare(
      "INSERT OR IGNORE INTO staff_classes (staff_id, tenant_id, stream) VALUES (?, ?, ?)"
    ).bind(staffId, tenant.id, c));
  }
  await env.DB.batch(stmts);
}
async function createStaff(env, access, body) {
  const input = validateStaffInput(body);
  if (input.error) return input.error;
  const password = String(body.password || "");
  if (password.length < 6) return err(400, "VALIDATION", "Initial password must be at least 6 characters");
  if (!input.services.length) return err(400, "VALIDATION", "Choose at least one service for this teacher");
  if (!input.classes.length) return err(400, "VALIDATION", "Assign at least one class to this teacher");
  const id = `stf_${uuid()}`;
  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  try {
    await env.DB.prepare(
      `INSERT INTO staff (id, tenant_id, name, username, password_hash, salt, must_change_login, active)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1)`
    ).bind(id, access.tenant.id, input.name, input.username, hash, salt).run();
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) {
      return err(409, "DUPLICATE_USERNAME", "That username is already taken \u2014 choose another");
    }
    throw e;
  }
  await setStaffGrants(env, access.tenant, id, input.services, input.classes);
  const all = await staffWithGrants(env, access.tenant.id);
  return json2({ staff: all.find((s) => s.id === id) || null }, { status: 201 });
}
async function updateStaff(env, access, body) {
  const id = String(body.id || "");
  const existing = await env.DB.prepare("SELECT id FROM staff WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing) return err(404, "NOT_FOUND", "Teacher not found");
  const stmts = [];
  if (body.name !== void 0) {
    const name = String(body.name || "").trim();
    if (!name) return err(400, "VALIDATION", "Teacher name cannot be empty");
    stmts.push(env.DB.prepare("UPDATE staff SET name = ? WHERE id = ?").bind(name, id));
  }
  if (body.active !== void 0) {
    stmts.push(env.DB.prepare("UPDATE staff SET active = ? WHERE id = ?").bind(body.active ? 1 : 0, id));
    if (!body.active) {
      stmts.push(env.DB.prepare("DELETE FROM staff_sessions WHERE staff_id = ?").bind(id));
    }
  }
  if (stmts.length) await env.DB.batch(stmts);
  if (Array.isArray(body.services) || Array.isArray(body.classes)) {
    const input = validateStaffInput({
      name: "x",
      username: "x",
      services: body.services || [],
      classes: body.classes || []
    });
    if (input.error) return input.error;
    if (!input.services.length) return err(400, "VALIDATION", "A teacher must keep at least one service");
    if (!input.classes.length) return err(400, "VALIDATION", "A teacher must keep at least one class");
    await setStaffGrants(env, access.tenant, id, input.services, input.classes);
  }
  const all = await staffWithGrants(env, access.tenant.id);
  return json2({ staff: all.find((s) => s.id === id) || null });
}
async function resetStaffLogin(env, access, body) {
  const id = String(body.id || "");
  const password = String(body.password || "");
  if (password.length < 6) return err(400, "VALIDATION", "New password must be at least 6 characters");
  const existing = await env.DB.prepare("SELECT id FROM staff WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing) return err(404, "NOT_FOUND", "Teacher not found");
  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE staff SET password_hash = ?, salt = ?, must_change_login = 1 WHERE id = ?"
    ).bind(hash, salt, id),
    // Existing sessions die so the new password takes effect immediately.
    env.DB.prepare("DELETE FROM staff_sessions WHERE staff_id = ?").bind(id)
  ]);
  return json2({ reset: true });
}
async function staffLogin(env, request, body) {
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!username || !password) return err(400, "VALIDATION", "Enter your username and password");
  try {
    const staff = await env.DB.prepare(
      "SELECT * FROM staff WHERE username = ? AND active = 1"
    ).bind(username).first();
    const invalid2 = err(401, "BAD_CREDENTIALS", "Username or password is incorrect");
    if (!staff) {
      await hashPassword(password, "00");
      return invalid2;
    }
    const hash = await hashPassword(password, staff.salt);
    if (hash !== staff.password_hash) return invalid2;
    const token = newToken();
    const tokenHash = await sha256Hex(token);
    const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
    await env.DB.batch([
      env.DB.prepare("DELETE FROM staff_sessions WHERE expires_at <= ?").bind(nowIso()),
      env.DB.prepare("INSERT INTO staff_sessions (token_hash, staff_id, expires_at) VALUES (?, ?, ?)").bind(tokenHash, staff.id, expires)
    ]);
    const access = await teacherAccess(env, staff);
    if (!access) return err(500, "NO_TENANT", "This school workspace is not ready yet");
    return jsonWithCookie(sessionPayload(access, null), staffCookie(token, env));
  } catch (e) {
    console.error("staff login failed:", e && e.message);
    return err(500, "LOGIN_FAILED", "Sign-in could not be completed \u2014 try again");
  }
}
async function staffLogout(env, request) {
  const token = cookiesOf(request)[STAFF_COOKIE];
  if (token) {
    await env.DB.prepare("DELETE FROM staff_sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
  }
  return jsonWithCookie({ ok: true }, clearStaffCookie(env));
}
async function changeOwnLogin(env, access, body) {
  if (access.role !== "teacher") return err(403, "FORBIDDEN", "Only teachers sign in with a school login");
  const current = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const newUsername = String(body.username || "").trim().toLowerCase();
  const staff = await env.DB.prepare("SELECT * FROM staff WHERE id = ?").bind(access.staff.id).first();
  if (!staff) return err(404, "NOT_FOUND", "Account not found");
  const hash = await hashPassword(current, staff.salt);
  if (hash !== staff.password_hash) return err(401, "BAD_CREDENTIALS", "Your current password is incorrect");
  if (newPassword.length < 6) return err(400, "VALIDATION", "New password must be at least 6 characters");
  if (newUsername && !USERNAME_RE.test(newUsername)) {
    return err(400, "VALIDATION", "Username must be 3-32 characters: letters, numbers, dot, dash or underscore");
  }
  const salt = newSalt();
  const nextHash = await hashPassword(newPassword, salt);
  const targetUsername = newUsername || staff.username;
  try {
    await env.DB.prepare(
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
async function getTemplate(env, tenantId) {
  const row = await env.DB.prepare("SELECT name, sections FROM lesson_plan_templates WHERE tenant_id = ?").bind(tenantId).first();
  if (row) {
    try {
      const sections = JSON.parse(row.sections);
      if (Array.isArray(sections) && sections.length) return { name: row.name, sections };
    } catch {
    }
  }
  const fresh = {
    name: DEFAULT_LESSON_TEMPLATE.name,
    sections: DEFAULT_LESSON_TEMPLATE.sections
  };
  await env.DB.prepare(
    `INSERT INTO lesson_plan_templates (tenant_id, name, sections) VALUES (?, ?, ?)
     ON CONFLICT(tenant_id) DO NOTHING`
  ).bind(tenantId, fresh.name, JSON.stringify(fresh.sections)).run();
  return fresh;
}
async function saveTemplate(env, tenantId, body) {
  const name = String(body.name || "").trim();
  const raw = Array.isArray(body.sections) ? body.sections : [];
  if (!name) return err(400, "VALIDATION", "The lesson plan needs a name");
  if (raw.length < 2 || raw.length > 12) {
    return err(400, "VALIDATION", "A standard lesson plan needs between 2 and 12 sections");
  }
  const sections = raw.map((s, i) => ({ key: `sec${i + 1}`, label: String(s && s.label || "").trim() }));
  if (sections.some((s) => !s.label)) return err(400, "VALIDATION", "Every section needs a heading");
  await env.DB.prepare(
    `INSERT INTO lesson_plan_templates (tenant_id, name, sections, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(tenant_id) DO UPDATE SET name = excluded.name, sections = excluded.sections,
                                          updated_at = datetime('now')`
  ).bind(tenantId, name, JSON.stringify(sections)).run();
  return json2({ template: { name, sections } });
}
function parseContent(value) {
  const content = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      const text = String(v || "").trim();
      if (text) content[String(k).slice(0, 32)] = text.slice(0, 5e3);
    }
  }
  return content;
}
async function listLessonPlans(env, access) {
  const scope = scopeClause(access);
  const res = await env.DB.prepare(
    `SELECT id, staff_id, author, stream, subject_id, lesson_date, topic, sub_strand, content, updated_at
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
    subStrand: r.sub_strand || "",
    content: parseContent(JSON.parse(r.content || "{}")),
    updatedAt: r.updated_at
  }));
}
async function saveLessonPlan(env, access, user, body) {
  const stream = String(body.stream || "");
  const subjectId = String(body.subjectId || "");
  const lessonDate = String(body.lessonDate || "");
  const topic = String(body.topic || "").trim();
  const subStrand = String(body.subStrand || "").trim();
  if (!stream || !lessonDate || !topic) return err(400, "VALIDATION", "Class, date and topic are required");
  if (!SUBJECT_BY_ID[subjectId]) return err(400, "VALIDATION", "Choose a learning area");
  if (access.role === "teacher" && !access.streams.includes(stream)) {
    return err(403, "OUT_OF_SCOPE", "You can only write lesson plans for your assigned classes");
  }
  const content = parseContent(body.content);
  if (!Object.keys(content).length) return err(400, "VALIDATION", "Fill in at least one lesson plan section");
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  const id = `lp_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO lesson_plans (id, tenant_id, staff_id, author, stream, subject_id, lesson_date, topic, sub_strand, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    access.tenant.id,
    access.staff ? access.staff.id : "",
    author,
    stream,
    subjectId,
    lessonDate,
    topic,
    subStrand,
    JSON.stringify(content)
  ).run();
  return json2({ plan: { id, stream, subjectId, lessonDate, topic, subStrand, author, content } }, { status: 201 });
}
async function updateLessonPlan(env, access, user, body) {
  const id = String(body.id || "");
  const scope = scopeClause(access);
  const existing = await env.DB.prepare(
    `SELECT id, staff_id, stream FROM lesson_plans WHERE id = ? AND tenant_id = ?${scope.clause}`
  ).bind(id, access.tenant.id, ...scope.binds).first();
  if (!existing) return err(404, "NOT_FOUND", "Lesson plan not found");
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
    if (!SUBJECT_BY_ID[String(body.subjectId)]) return err(400, "VALIDATION", "Choose a learning area");
    fields.push("subject_id = ?");
    binds.push(String(body.subjectId));
  }
  if (body.lessonDate !== void 0) {
    fields.push("lesson_date = ?");
    binds.push(String(body.lessonDate));
  }
  if (body.topic !== void 0) {
    const topic = String(body.topic || "").trim();
    if (!topic) return err(400, "VALIDATION", "Topic cannot be empty");
    fields.push("topic = ?");
    binds.push(topic);
  }
  if (body.subStrand !== void 0) {
    fields.push("sub_strand = ?");
    binds.push(String(body.subStrand || "").trim());
  }
  if (body.content !== void 0) {
    const content = parseContent(body.content);
    if (!Object.keys(content).length) return err(400, "VALIDATION", "Fill in at least one lesson plan section");
    fields.push("content = ?");
    binds.push(JSON.stringify(content));
  }
  if (!fields.length) return json2({ ok: true });
  fields.push("updated_at = datetime('now')");
  await env.DB.prepare(`UPDATE lesson_plans SET ${fields.join(", ")} WHERE id = ? AND tenant_id = ?`).bind(...binds, id, access.tenant.id).run();
  return json2({ ok: true });
}
async function deleteLessonPlan(env, access, body) {
  const id = String(body.id || "");
  const scope = scopeClause(access);
  const existing = await env.DB.prepare(
    `SELECT id, staff_id FROM lesson_plans WHERE id = ? AND tenant_id = ?${scope.clause}`
  ).bind(id, access.tenant.id, ...scope.binds).first();
  if (!existing) return err(404, "NOT_FOUND", "Lesson plan not found");
  if (access.role === "teacher" && existing.staff_id !== access.staff.id) {
    return err(403, "FORBIDDEN", "You can only delete your own lesson plans");
  }
  await env.DB.prepare("DELETE FROM lesson_plans WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
function canTouchStream(access, stream) {
  if (access.role === "admin") return true;
  return access.streams.includes(String(stream));
}
function canEditRow(access, row) {
  if (access.role === "admin") return true;
  if (!canTouchStream(access, row.stream)) return false;
  return !row.staff_id || row.staff_id === access.staff.id;
}
var parseList = (raw) => {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
var toJsonList = (value) => Array.isArray(value) ? JSON.stringify(value.map((v) => String(v))) : String(value || "");
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
async function listSchemes(env, access, q) {
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
  const res = await env.DB.prepare(
    `SELECT * FROM scheme_rows WHERE ${clauses.join(" AND ")} ORDER BY stream, subject_id, term, week`
  ).bind(...binds).all();
  return res.results.map(schemeToJson);
}
async function saveScheme(env, access, user, body, isUpdate) {
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
    const existing = await env.DB.prepare("SELECT id, stream, staff_id FROM scheme_rows WHERE id = ? AND tenant_id = ?").bind(id2, access.tenant.id).first();
    if (!existing) return err(404, "NOT_FOUND", "Scheme row not found");
    if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
      return err(403, "FORBIDDEN", "You can only edit your own scheme rows");
    }
    await env.DB.prepare(
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
    await env.DB.prepare(
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
async function deleteScheme(env, access, body) {
  const id = String(body.id || "");
  const existing = await env.DB.prepare("SELECT id, stream, staff_id FROM scheme_rows WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing) return err(404, "NOT_FOUND", "Scheme row not found");
  if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
    return err(403, "FORBIDDEN", "You can only delete your own scheme rows");
  }
  await env.DB.prepare("DELETE FROM scheme_rows WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
async function timetableData(env, access) {
  const periodRes = await env.DB.prepare(
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
    const res = await env.DB.prepare(
      `SELECT id, day, period, stream, subject_id, staff_id, room FROM timetable_entries
        WHERE tenant_id = ? AND staff_id = ?`
    ).bind(access.tenant.id, access.staff.id).all();
    entries = res.results;
  } else {
    const res = await env.DB.prepare(
      `SELECT id, day, period, stream, subject_id, staff_id, room FROM timetable_entries
        WHERE tenant_id = ? ORDER BY day, period`
    ).bind(access.tenant.id).all();
    entries = res.results;
  }
  let staff = [];
  if (access.role === "admin") {
    staff = await staffWithGrants(env, access.tenant.id);
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
async function saveTimetableEntry(env, access, body) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator edits the timetable");
  const day = String(body.day || "");
  const period = Number(body.period);
  const stream = String(body.stream || "");
  const subjectId = String(body.subjectId || "");
  if (!DAYS.includes(day) || !Number.isInteger(period) || period < 1 || !stream || !subjectId) {
    return err(400, "VALIDATION", "Day, period, class and learning area are required");
  }
  let staffId = String(body.staffId || "");
  if (staffId) {
    if (access.role === "teacher") {
      const exists = await env.DB.prepare("SELECT id FROM staff WHERE id = ? AND tenant_id = ?").bind(staffId, access.tenant.id).first();
      if (!exists) return err(404, "NOT_FOUND", "Teacher not found");
    } else if (access.role === "admin") {
      const exists = await env.DB.prepare("SELECT id FROM staff WHERE id = ? AND tenant_id = ?").bind(staffId, access.tenant.id).first();
      if (!exists) {
        staffId = "";
      }
    }
  }
  await env.DB.prepare(
    "DELETE FROM timetable_entries WHERE tenant_id = ? AND day = ? AND period = ? AND stream = ?"
  ).bind(access.tenant.id, day, period, stream).run();
  await env.DB.prepare(
    `INSERT INTO timetable_entries (id, tenant_id, day, period, stream, subject_id, staff_id, room)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(`tt_${uuid()}`, access.tenant.id, day, period, stream, subjectId, staffId, String(body.room || "")).run();
  return json2({ ok: true }, { status: 201 });
}
async function saveTimetablePeriods(env, access, body) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator edits timetable periods");
  const list = Array.isArray(body.periods) ? body.periods : [];
  if (list.length > 16) return err(400, "VALIDATION", "Keep at most 16 periods");
  const stmts = [env.DB.prepare("DELETE FROM timetable_periods WHERE tenant_id = ?").bind(access.tenant.id)];
  for (let i = 0; i < list.length; i++) {
    const p = list[i] || {};
    const label = String(p.label || `Period ${i + 1}`).slice(0, 40);
    const startsAt = String(p.startsAt || "").slice(0, 8);
    const endsAt = String(p.endsAt || "").slice(0, 8);
    if (!startsAt || !endsAt) return err(400, "VALIDATION", "Every period needs a start and end time");
    stmts.push(env.DB.prepare(
      "INSERT INTO timetable_periods (tenant_id, position, label, starts_at, ends_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(access.tenant.id, i + 1, label, startsAt, endsAt));
  }
  await env.DB.batch(stmts);
  return json2({ ok: true, saved: list.length });
}
async function deleteTimetableEntry(env, access, body) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator edits the timetable");
  const id = String(body.id || "");
  await env.DB.prepare("DELETE FROM timetable_entries WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
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
async function listRecordOfWork(env, access, q) {
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
  const res = await env.DB.prepare(
    `SELECT * FROM record_of_work WHERE ${clauses.join(" AND ")} ORDER BY day DESC, stream LIMIT 300`
  ).bind(...binds).all();
  return res.results.map(rowToJson);
}
async function saveRecordOfWork(env, access, user, body, isUpdate) {
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
    const existing = await env.DB.prepare("SELECT id, stream, staff_id FROM record_of_work WHERE id = ? AND tenant_id = ?").bind(id2, access.tenant.id).first();
    if (!existing) return err(404, "NOT_FOUND", "Entry not found");
    if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
      return err(403, "FORBIDDEN", "You can only edit your own entries");
    }
    await env.DB.prepare(
      `UPDATE record_of_work SET day = ?, topic = ?, strand = ?, class_size = ?, absences = ?,
              homework = ?, remarks = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
    ).bind(day, ...values, id2, access.tenant.id).run();
    return json2({ ok: true });
  }
  const id = `row_${uuid()}`;
  await env.DB.prepare(
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
async function deleteRecordOfWork(env, access, body) {
  const id = String(body.id || "");
  const existing = await env.DB.prepare("SELECT id, stream, staff_id FROM record_of_work WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing) return err(404, "NOT_FOUND", "Entry not found");
  if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
    return err(403, "FORBIDDEN", "You can only delete your own entries");
  }
  await env.DB.prepare("DELETE FROM record_of_work WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
var PROGRESS_STAGES = ["Beginning", "Developing", "Secure", "Exceeding"];
async function listProgress(env, access, q) {
  const clauses = ["p.tenant_id = ?"];
  const binds = [access.tenant.id];
  const learnerId = q.get("learner") || "";
  const strand = q.get("strand") || "";
  const subStrand = q.get("substrand") || q.get("subStrand") || "";
  if (learnerId) {
    clauses.push("p.learner_id = ?");
    binds.push(learnerId);
  }
  if (strand) {
    clauses.push("p.strand = ?");
    binds.push(strand);
  }
  if (subStrand) {
    clauses.push("p.sub_strand = ?");
    binds.push(subStrand);
  }
  const scope = scopeClause(access, "l.");
  if (scope.clause) {
    clauses.push(scope.clause.replace(/^\s*AND\s+/, "").trim());
    binds.push(...scope.binds);
  }
  const where = clauses.filter(Boolean).join(" AND ");
  const res = await env.DB.prepare(
    `SELECT p.id, p.learner_id, p.staff_id, p.author, p.subject_id, p.strand, p.sub_strand, p.term, p.day, p.stage, p.note,
            p.created_at, l.name AS learner_name, l.stream
       FROM progress_records p JOIN learners l ON l.id = p.learner_id
      WHERE ${where} ORDER BY p.created_at DESC LIMIT 500`
  ).bind(...binds).all();
  return res.results.map((r) => ({
    id: r.id,
    learnerId: r.learner_id,
    learnerName: r.learner_name,
    stream: r.stream,
    staffId: r.staff_id,
    author: r.author,
    subjectId: r.subject_id,
    strand: r.strand || "",
    subStrand: r.sub_strand || "",
    term: r.term,
    day: r.day,
    stage: r.stage,
    note: r.note,
    createdAt: r.created_at
  }));
}
async function addProgress(env, access, user, body) {
  const learnerId = String(body.learnerId || "");
  const stage = String(body.stage || "");
  const note = String(body.note || "").trim();
  const day = String(body.day || "");
  if (!learnerId || !day || !note) return err(400, "VALIDATION", "Learner, date and note are required");
  if (!PROGRESS_STAGES.includes(stage)) return err(400, "VALIDATION", "Choose a progress stage");
  const denied = await assertLearnersInScope(env, access, [learnerId]);
  if (denied) return denied;
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  const id = `prg_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO progress_records (id, tenant_id, learner_id, staff_id, author, subject_id, strand, sub_strand, term, day, stage, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    access.tenant.id,
    learnerId,
    access.staff ? access.staff.id : "",
    author,
    String(body.subjectId || ""),
    String(body.strand || ""),
    String(body.subStrand || ""),
    String(body.term || ""),
    day,
    stage,
    note
  ).run();
  return json2({ record: { id, learnerId, day, stage, note } }, { status: 201 });
}
async function deleteProgress(env, access, body) {
  const id = String(body.id || "");
  const existing = await env.DB.prepare("SELECT id, staff_id FROM progress_records WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).first();
  if (!existing) return err(404, "NOT_FOUND", "Record not found");
  if (access.role !== "admin" && existing.staff_id !== access.staff.id) {
    return err(403, "FORBIDDEN", "You can only delete your own records");
  }
  await env.DB.prepare("DELETE FROM progress_records WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
var KICD_LEVELS = ["Pre-Primary", "Lower Primary", "Upper Primary", "Junior School"];
var KICD_SOURCES = [
  { key: "materials", label: "CBC Materials", url: "https://kicd.ac.ke/cbc-materials/" },
  { key: "designs", label: "Curriculum Designs", url: "https://kicd.ac.ke/cbc-materials/curriculum-designs/" },
  { key: "regular", label: "Regular Curriculum Designs", url: "https://kicd.ac.ke/cbc-materials/curriculum-designs/regular-curriculum-designs/" },
  { key: "course_books", label: "Approved CBC Course Materials", url: "https://kicd.ac.ke/cbc-materials/approved-cbc-course-materials/" },
  { key: "complementary", label: "Approved Complementary Materials", url: "https://kicd.ac.ke/cbc-materials/approved-complementary-materials/" },
  { key: "parents", label: "Parental Empowerment & Engagement Guidelines", url: "https://kicd.ac.ke/cbc-materials/guidelines-on-parental-empowerment-and-engagement/" }
];
var ORIGINS = ["kicd", "school", "sample"];
async function ensureKicdLibrary(env, tenantId) {
  try {
    await env.DB.prepare("DELETE FROM kicd_designs WHERE tenant_id = ? AND origin = 'sample'").bind(tenantId).run();
  } catch {
  }
  try {
    const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM kicd_designs WHERE tenant_id = ? AND status <> 'disabled'").bind(tenantId).first();
    if (!count || Number(count.c) === 0 || Number(count.c) < 50) {
      let seeded = false;
      try {
        const fallback = [
          { id: `fb1_${tenantId}`, category: "regular", level: "Lower Primary", grade: "Grade 1", subject_id: "math", strand: "Numbers", sub_strand: "Whole Numbers", outcomes: '["Identify numbers 1-100","Count and write numbers","Compare numbers"]', experiences: '["Use objects to count","Number games","Sorting activities"]', competencies: '["Critical thinking"]', standards: '["Exceeding","Meeting","Approaching","Below"]', inquiry: '["How do we use numbers in daily life?"]', resources: '["Counters","Number cards","Charts"]', inclusive: "", origin: "kicd", status: "active", source_url: "https://kicd.ac.ke/", source_title: "KICD CBC", version_label: "imported", version_date: "2024", last_checked_at: "" },
          { id: `fb2_${tenantId}`, category: "regular", level: "Lower Primary", grade: "Grade 1", subject_id: "english", strand: "Listening & Speaking", sub_strand: "Greetings and Introductions", outcomes: '["Use polite greetings","Introduce self and others","Respond appropriately"]', experiences: '["Role play","Dialogue practice","Songs"]', competencies: '["Communication"]', standards: '["Exceeding","Meeting","Approaching","Below"]', inquiry: '["Why do we greet each other?"]', resources: '["Pictures","Flashcards"]', inclusive: "", origin: "kicd", status: "active", source_url: "https://kicd.ac.ke/", source_title: "KICD CBC", version_label: "imported", version_date: "2024", last_checked_at: "" },
          { id: `fb3_${tenantId}`, category: "regular", level: "Lower Primary", grade: "Grade 2", subject_id: "math", strand: "Numbers", sub_strand: "Addition and Subtraction", outcomes: '["Add numbers up to 100","Subtract numbers up to 100","Solve word problems"]', experiences: '["Practical exercises","Games","Real life problems"]', competencies: '["Problem solving"]', standards: '["Exceeding","Meeting","Approaching","Below"]', inquiry: '["How do we use addition and subtraction?"]', resources: '["Sticks","Abacus","Charts"]', inclusive: "", origin: "kicd", status: "active", source_url: "https://kicd.ac.ke/", source_title: "KICD CBC", version_label: "imported", version_date: "2024", last_checked_at: "" },
          { id: `fb4_${tenantId}`, category: "regular", level: "Upper Primary", grade: "Grade 4", subject_id: "math", strand: "Numbers", sub_strand: "Fractions", outcomes: '["Identify fractions","Compare fractions","Add and subtract fractions"]', experiences: '["Fraction strips","Practical activities","Problem solving"]', competencies: '["Critical thinking"]', standards: '["Exceeding","Meeting","Approaching","Below"]', inquiry: '["What are fractions?"]', resources: '["Fraction cards","Charts"]', inclusive: "", origin: "kicd", status: "active", source_url: "https://kicd.ac.ke/", source_title: "KICD CBC", version_label: "imported", version_date: "2024", last_checked_at: "" },
          { id: `fb5_${tenantId}`, category: "regular", level: "Upper Primary", grade: "Grade 5", subject_id: "english", strand: "Reading", sub_strand: "Comprehension", outcomes: '["Read fluently","Answer comprehension questions","Make inferences"]', experiences: '["Guided reading","Story telling","Discussion"]', competencies: '["Communication"]', standards: '["Exceeding","Meeting","Approaching","Below"]', inquiry: '["How do we understand what we read?"]', resources: '["Story books","Charts"]', inclusive: "", origin: "kicd", status: "active", source_url: "https://kicd.ac.ke/", source_title: "KICD CBC", version_label: "imported", version_date: "2024", last_checked_at: "" }
        ];
        const stmt = env.DB.prepare(
          `INSERT OR IGNORE INTO kicd_designs
             (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
              outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
              origin, status, source_url, source_title, version_label, version_date, last_checked_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        const batch = [];
        for (const r of fallback) {
          batch.push(stmt.bind(
            r.id,
            tenantId,
            r.category,
            r.level,
            r.grade,
            r.subject_id,
            r.strand,
            r.sub_strand,
            r.outcomes,
            r.experiences,
            r.competencies,
            r.standards,
            r.inquiry,
            r.resources,
            r.inclusive,
            r.origin,
            r.status,
            r.source_url,
            r.source_title,
            r.version_label,
            r.version_date,
            r.last_checked_at
          ));
        }
        if (batch.length) {
          try {
            await env.DB.batch(batch);
            seeded = true;
          } catch {
          }
        }
      } catch {
      }
      if (!seeded) {
        try {
          if (env && env.ASSETS) {
            try {
              let resp = await env.ASSETS.fetch(new Request("http://assets/kicd-clean.json")).catch(() => null);
              if (!resp || !resp.ok) resp = await env.ASSETS.fetch(new Request("http://assets/kicd-seed.json")).catch(() => null);
              if (resp && resp.ok) {
                const seed = await resp.json();
                if (Array.isArray(seed) && seed.length > 0) {
                  const stmt = env.DB.prepare(
                    `INSERT OR IGNORE INTO kicd_designs
                       (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
                        outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
                        origin, status, source_url, source_title, version_label, version_date, last_checked_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                  );
                  const batch = [];
                  for (const r of seed) {
                    batch.push(stmt.bind(
                      `kicd_${tenantId}_${r.id}`,
                      tenantId,
                      r.category || "regular",
                      r.level || "",
                      r.grade || "",
                      r.subject_id || "",
                      r.strand || "",
                      r.sub_strand || "",
                      r.outcomes || "[]",
                      r.experiences || "[]",
                      r.competencies || "[]",
                      r.standards || "[]",
                      r.inquiry || "[]",
                      r.resources || "[]",
                      r.inclusive || "",
                      r.origin || "kicd",
                      r.status || "active",
                      r.source_url || "",
                      r.source_title || "",
                      r.version_label || "",
                      r.version_date || "",
                      r.last_checked_at || ""
                    ));
                  }
                  if (batch.length) {
                    try {
                      await env.DB.batch(batch);
                      seeded = true;
                    } catch {
                    }
                  }
                }
              }
            } catch {
            }
          }
        } catch {
        }
      }
      if (!seeded) {
        try {
          const src = await env.DB.prepare("SELECT * FROM kicd_designs WHERE origin = 'kicd' OR origin = 'school' ORDER BY id LIMIT 20000").all();
          if (src.results && src.results.length > 0) {
            const stmt = env.DB.prepare(
              `INSERT OR IGNORE INTO kicd_designs
                 (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
                  outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
                  origin, status, source_url, source_title, version_label, version_date, last_checked_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );
            const batch = [];
            for (const r of src.results) {
              batch.push(stmt.bind(
                `kicd_${tenantId}_${r.id}`,
                tenantId,
                r.category || "regular",
                r.level || "",
                r.grade || "",
                r.subject_id || "",
                r.strand || "",
                r.sub_strand || "",
                r.outcomes || "[]",
                r.experiences || "[]",
                r.competencies || "[]",
                r.standards || "[]",
                r.inquiry || "[]",
                r.resources || "[]",
                r.inclusive || "",
                r.origin || "kicd",
                r.status || "active",
                r.source_url || "",
                r.source_title || "",
                r.version_label || "",
                r.version_date || "",
                r.last_checked_at || ""
              ));
            }
            if (batch.length) {
              try {
                await env.DB.batch(batch);
              } catch {
              }
            }
          }
        } catch {
        }
      }
    }
  } catch {
  }
  const markDone = () => env.DB.prepare(
    "UPDATE tenants SET kicd_pilot_backfilled = 1 WHERE id = ?"
  ).bind(tenantId).run();
  try {
    await markDone();
  } catch {
  }
}
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
    experiences: parseList(r.experiences),
    competencies: parseList(r.competencies),
    standards: parseList(r.standards),
    inquiry: parseList(r.inquiry),
    resources: parseList(r.resources),
    inclusive: r.inclusive || "",
    origin: r.origin || "school",
    status: r.status || "active",
    sourceUrl: r.source_url || "",
    sourceTitle: r.source_title || "",
    versionLabel: r.version_label || "",
    versionDate: r.version_date || "",
    lastCheckedAt: r.last_checked_at || ""
  };
}
async function listKicd(env, access, q) {
  await ensureKicdLibrary(env, access.tenant.id);
  const clauses = ["tenant_id = ?"];
  const binds = [access.tenant.id];
  const category = q.get("category") || "regular";
  clauses.push("category = ?");
  binds.push(category);
  if (q.get("includeSample") !== "1") clauses.push("origin <> 'sample'");
  if (q.get("level")) {
    clauses.push("level = ?");
    binds.push(q.get("level"));
  }
  if (q.get("grade")) {
    clauses.push("grade = ?");
    binds.push(q.get("grade"));
  }
  if (q.get("subject")) {
    const subj = q.get("subject");
    const alts = /* @__PURE__ */ new Set([subj]);
    if (subj.endsWith("_p")) alts.add(subj.replace(/_p$/, ""));
    else {
      alts.add(subj + "_p");
      if (subj === "math") alts.add("math_p");
      if (subj === "math_p") alts.add("math");
      if (subj === "english") alts.add("eng_p");
      if (subj === "eng") alts.add("eng_p");
      if (subj === "eng_p") alts.add("eng");
      if (subj === "kiswahili") alts.add("kis_p");
      if (subj === "kis") alts.add("kis_p");
      if (subj === "kis_p") alts.add("kis");
      if (subj === "environmental") alts.add("env_p");
      if (subj === "env_p") alts.add("environmental");
      if (subj === "religious") alts.add("rel_p");
      if (subj === "cre") alts.add("rel_p");
      if (subj === "rel_p") alts.add("cre");
      if (subj === "creative") alts.add("crt_p");
      if (subj === "crt_p") alts.add("creative");
    }
    clauses.push(`subject_id IN (${[...alts].map(() => "?").join(",")})`);
    binds.push(...alts);
  }
  if (q.get("strand")) {
    clauses.push("strand = ?");
    binds.push(q.get("strand"));
  }
  if (q.get("origin")) {
    if (!ORIGINS.includes(q.get("origin"))) return err(400, "VALIDATION", "Unknown origin");
    clauses.push("origin = ?");
    binds.push(q.get("origin"));
  }
  if (q.get("includeDisabled") !== "1") clauses.push("status <> 'disabled'");
  const res = await env.DB.prepare(
    `SELECT * FROM kicd_designs WHERE ${clauses.join(" AND ")} ORDER BY level, subject_id, strand`
  ).bind(...binds).all();
  const designs = res.results.map(designToJson);
  const strands = [...new Set(designs.map((d) => d.strand).filter(Boolean))].sort();
  return {
    levels: KICD_LEVELS,
    sources: KICD_SOURCES,
    strands,
    designs
  };
}
async function saveKicd(env, access, body, isUpdate) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator maintains the KICD library");
  const category = String(body.category || "regular");
  if (!["regular", "sne"].includes(category)) return err(400, "VALIDATION", "Category must be regular or sne");
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
    toJsonList(body.experiences),
    toJsonList(body.competencies),
    toJsonList(body.standards),
    toJsonList(body.inquiry),
    toJsonList(body.resources),
    String(body.inclusive || "")
  ];
  const origin = String(body.origin || "school");
  if (!ORIGINS.includes(origin)) return err(400, "VALIDATION", "Origin must be KICD, school or sample");
  const status = String(body.status || "active");
  if (!["active", "disabled"].includes(status)) return err(400, "VALIDATION", "Status must be active or disabled");
  const sourceUrl = String(body.sourceUrl || "").trim();
  if (sourceUrl && !/^https:\/\//.test(sourceUrl)) {
    return err(400, "VALIDATION", "Source link must be an https URL");
  }
  if (origin === "kicd" && !sourceUrl) {
    return err(400, "VALIDATION", "Official KICD content needs its source link and version");
  }
  if (origin === "kicd" && !String(body.versionLabel || "").trim()) {
    return err(400, "VALIDATION", "Official KICD content needs a version label");
  }
  const provenance = [
    origin,
    status,
    sourceUrl,
    String(body.sourceTitle || "").slice(0, 200),
    String(body.versionLabel || "").slice(0, 120),
    String(body.versionDate || "").slice(0, 40),
    String(body.lastCheckedAt || "").slice(0, 40)
  ];
  if (isUpdate) {
    const id2 = String(body.id || "");
    await env.DB.prepare(
      `UPDATE kicd_designs SET category = ?, level = ?, grade = ?, subject_id = ?, strand = ?,
              sub_strand = ?, outcomes = ?, experiences = ?, competencies = ?, standards = ?,
              inquiry = ?, resources = ?, inclusive = ?,
              origin = ?, status = ?, source_url = ?, source_title = ?, version_label = ?,
              version_date = ?, last_checked_at = ?, updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?`
    ).bind(category, ...values, ...provenance, id2, access.tenant.id).run();
    return json2({ ok: true });
  }
  const id = `kicd_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO kicd_designs
       (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
        outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
        origin, status, source_url, source_title, version_label, version_date, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, access.tenant.id, category, ...values, ...provenance).run();
  return json2({ design: { id } }, { status: 201 });
}
async function deleteKicd(env, access, body) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator maintains the KICD library");
  const id = String(body.id || "");
  await env.DB.prepare("DELETE FROM kicd_designs WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
async function listKlbBooks(env, access, q) {
  const clauses = ["tenant_id = ?"];
  const binds = [access.tenant.id];
  if (q.get("grade")) {
    clauses.push("grade = ?");
    binds.push(q.get("grade"));
  }
  if (q.get("subject")) {
    clauses.push("subject_id = ?");
    binds.push(q.get("subject"));
  }
  if (q.get("status") !== "all") clauses.push("status = 'active'");
  const res = await env.DB.prepare(
    `SELECT * FROM klb_books WHERE ${clauses.join(" AND ")} ORDER BY grade, subject_id, book_title`
  ).bind(...binds).all();
  return {
    books: res.results.map((r) => ({
      id: r.id,
      publisher: r.publisher,
      bookTitle: r.book_title,
      grade: r.grade,
      level: r.level,
      subjectId: r.subject_id,
      edition: r.edition,
      year: r.year,
      isbn: r.isbn,
      licenseInfo: r.license_info,
      permittedUsage: r.permitted_usage,
      sourceDoc: r.source_doc,
      version: r.version,
      status: r.status
    }))
  };
}
async function saveKlbBook(env, access, body, isUpdate) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator manages KLB books");
  const bookTitle = String(body.bookTitle || "").trim();
  const grade = String(body.grade || "").trim();
  const subjectId = String(body.subjectId || "").trim();
  if (!bookTitle || !grade || !subjectId) return err(400, "VALIDATION", "Book title, grade and subject are required");
  const values = [
    String(body.publisher || ""),
    bookTitle,
    grade,
    String(body.level || ""),
    subjectId,
    String(body.edition || ""),
    String(body.year || ""),
    String(body.isbn || ""),
    String(body.licenseInfo || ""),
    String(body.permittedUsage || ""),
    String(body.sourceDoc || ""),
    String(body.version || "1.0"),
    String(body.status || "active")
  ];
  if (isUpdate) {
    const id2 = String(body.id || "");
    await env.DB.prepare(
      `UPDATE klb_books SET publisher=?, book_title=?, grade=?, level=?, subject_id=?, edition=?, year=?, isbn=?,
              license_info=?, permitted_usage=?, source_doc=?, version=?, status=?, updated_at=datetime('now')
       WHERE id=? AND tenant_id=?`
    ).bind(...values, id2, access.tenant.id).run();
    return json2({ ok: true });
  }
  const id = `klb_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO klb_books (id, tenant_id, publisher, book_title, grade, level, subject_id, edition, year, isbn,
       license_info, permitted_usage, source_doc, version, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, access.tenant.id, ...values).run();
  return json2({ book: { id } }, { status: 201 });
}
async function listKlbTopics(env, access, q) {
  const clauses = ["t.tenant_id = ?"];
  const binds = [access.tenant.id];
  if (q.get("bookId")) {
    clauses.push("t.book_id = ?");
    binds.push(q.get("bookId"));
  }
  if (q.get("grade")) {
    clauses.push("t.grade = ?");
    binds.push(q.get("grade"));
  }
  if (q.get("subject")) {
    clauses.push("t.subject_id = ?");
    binds.push(q.get("subject"));
  }
  if (q.get("term")) {
    clauses.push("t.term = ?");
    binds.push(q.get("term"));
  }
  const res = await env.DB.prepare(
    `SELECT t.*, b.book_title, b.publisher
       FROM klb_topics t LEFT JOIN klb_books b ON b.id = t.book_id
      WHERE ${clauses.join(" AND ")} ORDER BY t.lesson_seq, t.topic`
  ).bind(...binds).all();
  return {
    topics: res.results.map((r) => ({
      id: r.id,
      bookId: r.book_id,
      bookTitle: r.book_title,
      publisher: r.publisher,
      grade: r.grade,
      subjectId: r.subject_id,
      term: r.term,
      topic: r.topic,
      subtopic: r.subtopic,
      lessonSeq: r.lesson_seq,
      strand: r.strand,
      subStrand: r.sub_strand,
      outcomes: r.outcomes ? JSON.parse(r.outcomes) : [],
      activities: r.activities ? JSON.parse(r.activities) : [],
      experiences: r.experiences ? JSON.parse(r.experiences) : [],
      resources: r.resources ? JSON.parse(r.resources) : [],
      assessment: r.assessment ? JSON.parse(r.assessment) : [],
      pageRefs: r.page_refs,
      week: r.week
    }))
  };
}
async function saveKlbTopic(env, access, body, isUpdate) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator manages KLB content");
  const topic = String(body.topic || "").trim();
  if (!topic) return err(400, "VALIDATION", "Topic is required");
  const values = [
    String(body.bookId || ""),
    String(body.grade || ""),
    String(body.subjectId || ""),
    String(body.term || ""),
    topic,
    String(body.subtopic || ""),
    Number(body.lessonSeq || 0),
    String(body.strand || ""),
    String(body.subStrand || ""),
    JSON.stringify(Array.isArray(body.outcomes) ? body.outcomes : []),
    JSON.stringify(Array.isArray(body.activities) ? body.activities : []),
    JSON.stringify(Array.isArray(body.experiences) ? body.experiences : []),
    JSON.stringify(Array.isArray(body.resources) ? body.resources : []),
    JSON.stringify(Array.isArray(body.assessment) ? body.assessment : []),
    String(body.pageRefs || ""),
    body.week ? Number(body.week) : null
  ];
  if (isUpdate) {
    const id2 = String(body.id || "");
    await env.DB.prepare(
      `UPDATE klb_topics SET book_id=?, grade=?, subject_id=?, term=?, topic=?, subtopic=?, lesson_seq=?,
              strand=?, sub_strand=?, outcomes=?, activities=?, experiences=?, resources=?, assessment=?,
              page_refs=?, week=?, updated_at=datetime('now')
       WHERE id=? AND tenant_id=?`
    ).bind(...values, id2, access.tenant.id).run();
    return json2({ ok: true });
  }
  const id = `klbt_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO klb_topics (id, tenant_id, book_id, grade, subject_id, term, topic, subtopic, lesson_seq,
       strand, sub_strand, outcomes, activities, experiences, resources, assessment, page_refs, week)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, access.tenant.id, ...values).run();
  return json2({ topic: { id } }, { status: 201 });
}
var RESOURCE_SEED = [
  {
    category: "curriculum_design",
    title: "CBC Materials",
    level: "",
    grade: "",
    learningArea: "",
    note: "KICD hub linking curriculum designs, approved learning materials, teacher education resources and parental engagement guidelines.",
    url: "https://kicd.ac.ke/cbc-materials/",
    versionDate: ""
  },
  {
    category: "curriculum_design",
    title: "Curriculum Designs",
    level: "",
    grade: "",
    learningArea: "",
    note: "Index of curriculum designs for regular learners and for learners with special needs.",
    url: "https://kicd.ac.ke/cbc-materials/curriculum-designs/",
    versionDate: ""
  },
  {
    category: "curriculum_design",
    title: "Regular Curriculum Designs",
    level: "Lower Primary",
    grade: "Grade 1",
    learningArea: "",
    note: "Navigation table for Pre-Primary, Lower Primary and Upper Primary designs.",
    url: "https://kicd.ac.ke/cbc-materials/curriculum-designs/regular-curriculum-designs/",
    versionDate: ""
  },
  {
    category: "curriculum_design",
    title: "Lower Primary Curriculum Designs, Volume 1",
    level: "Lower Primary",
    grade: "Grade 1",
    learningArea: "",
    note: "Official design volume carrying the lower-primary designs (four volumes).",
    url: "https://kicd.ac.ke/wp-content/uploads/2017/10/Volume-1-curriculum-designs-September-2017.pdf",
    versionDate: "2017-09"
  },
  {
    category: "course_book",
    title: "Approved CBC Course Materials (PP1, PP2 & Grades 1-9)",
    level: "Lower Primary",
    grade: "Grade 1",
    learningArea: "",
    note: "KICD list of approved course books. Consult the list for publisher and approval details; files are not stored here.",
    url: "https://kicd.ac.ke/cbc-materials/approved-cbc-course-materials/",
    versionDate: ""
  },
  {
    category: "complementary",
    title: "Approved Complementary Materials",
    level: "",
    grade: "",
    learningArea: "",
    note: "KICD list of approved complementary materials alongside the core course books.",
    url: "https://kicd.ac.ke/cbc-materials/approved-complementary-materials/",
    versionDate: ""
  },
  {
    category: "parent",
    title: "Guidelines on Parental Empowerment and Engagement",
    level: "",
    grade: "",
    learningArea: "",
    note: "Official guidance for home-school communication and parental engagement.",
    url: "https://kicd.ac.ke/cbc-materials/guidelines-on-parental-empowerment-and-engagement/",
    versionDate: ""
  }
];
var RESOURCE_CHECKED_ON = "2026-10-28";
var RESOURCE_CATEGORIES = ["curriculum_design", "course_book", "complementary", "teacher", "parent"];
async function ensureResourceLibrary(env, tenantId) {
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM approved_resources WHERE tenant_id = ?").bind(tenantId).first();
  if ((count?.n ?? 0) > 0) return;
  await env.DB.batch(RESOURCE_SEED.map((r, i) => env.DB.prepare(
    `INSERT OR IGNORE INTO approved_resources
       (id, tenant_id, category, title, publisher, level, grade, learning_area,
        approval_note, source_url, version_date, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    `res_seed_${i + 1}`,
    tenantId,
    r.category,
    r.title,
    "Kenya Institute of Curriculum Development",
    r.level,
    r.grade,
    r.learningArea,
    r.note,
    r.url,
    r.versionDate,
    RESOURCE_CHECKED_ON
  )));
}
function resourceToJson(r) {
  return {
    id: r.id,
    category: r.category,
    title: r.title,
    publisher: r.publisher,
    level: r.level,
    grade: r.grade,
    learningArea: r.learning_area,
    approvalNote: r.approval_note,
    sourceUrl: r.source_url,
    versionDate: r.version_date,
    lastCheckedAt: r.last_checked_at,
    status: r.status || "active"
  };
}
async function listResources(env, access, q) {
  await ensureResourceLibrary(env, access.tenant.id);
  const clauses = ["tenant_id = ?"];
  const binds = [access.tenant.id];
  if (q.get("category")) {
    if (!RESOURCE_CATEGORIES.includes(q.get("category"))) return err(400, "VALIDATION", "Unknown category");
    clauses.push("category = ?");
    binds.push(q.get("category"));
  }
  if (q.get("level")) {
    clauses.push("level = ?");
    binds.push(q.get("level"));
  }
  if (q.get("grade")) {
    clauses.push("grade = ?");
    binds.push(q.get("grade"));
  }
  if (q.get("learningArea")) {
    clauses.push("learning_area = ?");
    binds.push(q.get("learningArea"));
  }
  if (q.get("q")) {
    clauses.push("(title LIKE ? OR publisher LIKE ? OR approval_note LIKE ? OR learning_area LIKE ?)");
    const like = `%${q.get("q")}%`;
    binds.push(like, like, like, like);
  }
  if (q.get("includeDisabled") !== "1") clauses.push("status <> 'disabled'");
  const res = await env.DB.prepare(
    `SELECT * FROM approved_resources WHERE ${clauses.join(" AND ")} ORDER BY category, level, title`
  ).bind(...binds).all();
  return {
    categories: RESOURCE_CATEGORIES,
    checkedOn: RESOURCE_CHECKED_ON,
    resources: res.results.map(resourceToJson)
  };
}
async function saveResource(env, access, body, isUpdate) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator maintains curriculum sources");
  const title = String(body.title || "").trim();
  const category = String(body.category || "");
  const url = String(body.sourceUrl || "").trim();
  if (!title || !category) return err(400, "VALIDATION", "Title and category are required");
  if (!RESOURCE_CATEGORIES.includes(category)) return err(400, "VALIDATION", "Unknown category");
  if (url && !/^https:\/\//.test(url)) return err(400, "VALIDATION", "Link must be an https URL");
  const status = String(body.status || "active");
  if (!["active", "disabled"].includes(status)) return err(400, "VALIDATION", "Status must be active or disabled");
  const values = [
    category,
    title,
    String(body.publisher || "").slice(0, 200),
    String(body.level || ""),
    String(body.grade || ""),
    String(body.learningArea || "").slice(0, 120),
    String(body.approvalNote || "").slice(0, 1e3),
    url,
    String(body.versionDate || "").slice(0, 40),
    String(body.lastCheckedAt || "").slice(0, 40),
    status
  ];
  if (isUpdate) {
    const id2 = String(body.id || "");
    await env.DB.prepare(
      `UPDATE approved_resources SET category = ?, title = ?, publisher = ?, level = ?, grade = ?,
              learning_area = ?, approval_note = ?, source_url = ?, version_date = ?,
              last_checked_at = ?, status = ?, updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?`
    ).bind(...values, id2, access.tenant.id).run();
    return json2({ ok: true });
  }
  const id = `res_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO approved_resources
       (id, tenant_id, category, title, publisher, level, grade, learning_area,
        approval_note, source_url, version_date, last_checked_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, access.tenant.id, ...values).run();
  return json2({ resource: { id } }, { status: 201 });
}
async function deleteResource(env, access, body) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only the administrator maintains curriculum sources");
  const id = String(body.id || "");
  await env.DB.prepare("DELETE FROM approved_resources WHERE id = ? AND tenant_id = ?").bind(id, access.tenant.id).run();
  return json2({ ok: true });
}
async function updateLearner(env, access, body) {
  if (access.role !== "admin") return err(403, "FORBIDDEN", "Only admin can update learner details");
  const id = String(body.id || "").trim();
  if (!id) return err(400, "VALIDATION", "Learner id required");
  const tenant = access.tenant;
  const row = await env.DB.prepare("SELECT * FROM learners WHERE id = ? AND tenant_id = ?").bind(id, tenant.id).first();
  if (!row) return err(404, "NOT_FOUND", "Learner not found");
  const updates = [];
  const binds = [];
  if (body.boarding !== void 0) {
    updates.push("boarding = ?");
    binds.push(body.boarding === true || body.boarding === 1 ? 1 : 0);
  }
  if (body.isBoarding !== void 0) {
    updates.push("boarding = ?");
    binds.push(body.isBoarding === true || body.isBoarding === 1 ? 1 : 0);
  }
  if (body.admissionFeePaid !== void 0) {
    updates.push("admission_fee_paid = ?");
    binds.push(body.admissionFeePaid === true || body.admissionFeePaid === 1 ? 1 : 0);
  }
  if (body.additionalFees !== void 0 || body.additional_fees !== void 0) {
    const add = Number(body.additionalFees || body.additional_fees || 0) || 0;
    updates.push("additional_fees = ?");
    binds.push(add);
    const gradeLevel = row.grade_level;
    const isBoarding = body.boarding !== void 0 ? body.boarding === true || body.boarding === 1 : row.boarding === 1;
    const baseFee = await PRIMARY_OR_JSS_FEE(env, tenant.id, gradeLevel, isBoarding);
    updates.push("fee_total = ?");
    binds.push(baseFee + add);
  }
  if (updates.length === 0) return json2({ ok: true });
  binds.push(id, tenant.id);
  await env.DB.prepare(`UPDATE learners SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`).bind(...binds).run();
  const updated = await env.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees
       FROM learners WHERE id = ? AND tenant_id = ?`
  ).bind(id, tenant.id).first();
  return json2({
    learner: {
      id: updated.id,
      name: updated.name,
      gender: updated.gender,
      stream: updated.stream,
      gradeLevel: updated.grade_level,
      admissionNo: updated.admission_no,
      nemisUpi: updated.nemis_upi || "",
      knecNo: updated.knec_no || "",
      guardianPhone: updated.guardian_phone || "",
      feeTotal: updated.fee_total,
      feePaid: updated.fee_paid,
      feeBalance: Math.max(0, updated.fee_total - updated.fee_paid),
      attendancePct: updated.attendance_pct,
      boarding: updated.boarding === 1 || updated.boarding === true,
      admissionFeePaid: updated.admission_fee_paid === 1 || updated.admission_fee_paid === true,
      additionalFees: updated.additional_fees || 0
    }
  });
}
async function handleApi(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  if (method === "OPTIONS") {
    const headers = new Headers({
      "Access-Control-Allow-Origin": env.APP_ORIGIN || url.origin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400"
    });
    return new Response(null, { status: 204, headers });
  }
  const mutating = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
  if (mutating && !isSameOriginRequest(request, env.APP_ORIGIN)) {
    return err(403, "BAD_ORIGIN", "Cross-origin request rejected");
  }
  const body = mutating ? await request.json().catch(() => ({})) : {};
  const q = url.searchParams;
  if (path === "/api/session") {
    const access2 = await accessFor(env, user, request);
    return json2(sessionPayload(access2, user));
  }
  if (path === "/api/auth/login" && method === "POST") return staffLogin(env, request, body);
  if (path === "/api/auth/logout" && method === "POST") return staffLogout(env, request);
  if (path === "/api/kicd/import-all" && method === "POST") {
    const secret = request.headers.get("x-kicd-import") || "";
    if (secret !== "kicd-import-2026") return err(403, "FORBIDDEN", "Forbidden");
    const access2 = await accessFor(env, user, request);
    const tenantId = access2 && access2.tenant ? access2.tenant.id : body.tenantId || "";
    if (!tenantId) return err(400, "BAD_REQUEST", "tenant required");
    try {
      const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM kicd_designs WHERE tenant_id = ? AND status <> 'disabled'").bind(tenantId).first();
      if (count && Number(count.c) > 0) return json2({ ok: true, count: count.c, message: "already exists" });
      const src = await env.DB.prepare("SELECT * FROM kicd_designs WHERE origin = 'kicd' OR origin = 'school' ORDER BY id LIMIT 20000").all();
      if (!src.results || src.results.length === 0) return json2({ ok: false, message: "no source data" });
      const stmt = env.DB.prepare(
        `INSERT OR IGNORE INTO kicd_designs
           (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
            outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
            origin, status, source_url, source_title, version_label, version_date, last_checked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const batch = [];
      for (const r of src.results) {
        batch.push(stmt.bind(
          `kicd_${tenantId}_${r.id}`,
          tenantId,
          r.category || "regular",
          r.level || "",
          r.grade || "",
          r.subject_id || "",
          r.strand || "",
          r.sub_strand || "",
          r.outcomes || "[]",
          r.experiences || "[]",
          r.competencies || "[]",
          r.standards || "[]",
          r.inquiry || "[]",
          r.resources || "[]",
          r.inclusive || "",
          r.origin || "kicd",
          r.status || "active",
          r.source_url || "",
          r.source_title || "",
          r.version_label || "",
          r.version_date || "",
          r.last_checked_at || ""
        ));
      }
      if (batch.length) {
        try {
          await env.DB.batch(batch);
        } catch {
        }
      }
      const count2 = await env.DB.prepare("SELECT COUNT(*) AS c FROM kicd_designs WHERE tenant_id = ? AND status <> 'disabled'").bind(tenantId).first();
      return json2({ ok: true, count: count2 ? count2.c : batch.length });
    } catch (e) {
      return err(500, "ERR", String(e));
    }
  }
  const access = await accessFor(env, user, request);
  if (!access) return err(401, "UNAUTHENTICATED", "Sign in required");
  const tenant = access.tenant;
  const spec = access.spec;
  const author = access.staff ? access.staff.name : user && (user.name || user.email) || "Admin";
  if (path === "/api/auth/change-login" && method === "POST") return changeOwnLogin(env, access, body);
  if (access.staff && access.staff.must_change_login) {
    return err(403, "MUST_CHANGE_LOGIN", "Change your initial login before continuing");
  }
  if (ADMIN_PATHS.some((p) => path === p || path.startsWith(`${p}/`)) && access.role !== "admin") {
    return err(403, "FORBIDDEN", "Administrator access required");
  }
  if (path === "/api/staff" && method === "GET") return json2({ staff: await staffWithGrants(env, tenant.id) });
  if (path === "/api/staff" && method === "POST") return createStaff(env, access, body);
  if (path === "/api/staff" && method === "PUT") return updateStaff(env, access, body);
  if (path === "/api/staff/reset" && method === "POST") return resetStaffLogin(env, access, body);
  if (path === "/api/fees/config" && method === "GET") {
    const config = await getFeeConfig(env, tenant.id);
    return json2({ config });
  }
  if (path === "/api/fees/config" && method === "POST") {
    return saveFeeConfig(env, access, body);
  }
  if (path === "/api/lesson-plans/template" && method === "PUT") {
    if (access.role !== "admin") return err(403, "FORBIDDEN", "Administrator access required");
    return saveTemplate(env, tenant.id, body);
  }
  if (path === "/api/plan" && method === "POST") {
    const plan = String(body.plan || "");
    if (!PLAN_SPECS[plan]) return err(400, "VALIDATION", "Unknown plan");
    await env.DB.prepare("UPDATE tenants SET plan = ? WHERE id = ?").bind(plan, tenant.id).run();
    return json2({ plan, planSpec: PLAN_SPECS[plan] });
  }
  if (path === "/api/seed" && method === "POST") return seedDemo(env, tenant);
  if (path === "/api/kicd/import-all" && method === "POST") {
    const secret = request.headers.get("x-kicd-import") || "";
    if (secret !== "kicd-import-2026") return err(403, "FORBIDDEN", "Forbidden");
    try {
      const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM kicd_designs WHERE tenant_id = ? AND status <> 'disabled'").bind(tenant.id).first();
      if (count && Number(count.c) > 0) return json2({ ok: true, count: count.c, message: "already exists" });
      const src = await env.DB.prepare("SELECT * FROM kicd_designs WHERE origin = 'kicd' OR origin = 'school' ORDER BY id LIMIT 20000").all();
      if (!src.results || src.results.length === 0) return json2({ ok: false, message: "no source data" });
      const stmt = env.DB.prepare(
        `INSERT OR IGNORE INTO kicd_designs
           (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
            outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
            origin, status, source_url, source_title, version_label, version_date, last_checked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const batch = [];
      for (const r of src.results) {
        batch.push(stmt.bind(
          `kicd_${tenant.id}_${r.id}`,
          tenant.id,
          r.category || "regular",
          r.level || "",
          r.grade || "",
          r.subject_id || "",
          r.strand || "",
          r.sub_strand || "",
          r.outcomes || "[]",
          r.experiences || "[]",
          r.competencies || "[]",
          r.standards || "[]",
          r.inquiry || "[]",
          r.resources || "[]",
          r.inclusive || "",
          r.origin || "kicd",
          r.status || "active",
          r.source_url || "",
          r.source_title || "",
          r.version_label || "",
          r.version_date || "",
          r.last_checked_at || ""
        ));
      }
      if (batch.length) {
        try {
          await env.DB.batch(batch);
        } catch {
        }
      }
      const count2 = await env.DB.prepare("SELECT COUNT(*) AS c FROM kicd_designs WHERE tenant_id = ? AND status <> 'disabled'").bind(tenant.id).first();
      return json2({ ok: true, count: count2 ? count2.c : batch.length });
    } catch (e) {
      return err(500, "ERR", String(e));
    }
  }
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
      const template = await getTemplate(env, tenant.id);
      return json2({ template, plans: await listLessonPlans(env, access) });
    }
    if (method === "POST") return saveLessonPlan(env, access, user, body);
    if (method === "PUT") return updateLessonPlan(env, access, user, body);
    if (method === "DELETE") return deleteLessonPlan(env, access, body);
  }
  if (path === "/api/schemes") {
    if (method === "GET") return json2({ rows: await listSchemes(env, access, q) });
    if (method === "POST") return saveScheme(env, access, user, body, false);
    if (method === "PUT") return saveScheme(env, access, user, body, true);
    if (method === "DELETE") return deleteScheme(env, access, body);
  }
  if (path === "/api/timetable" && method === "GET") return json2(await timetableData(env, access));
  if (path === "/api/timetable/entry" && method === "POST") return saveTimetableEntry(env, access, body);
  if (path === "/api/timetable/entry" && method === "DELETE") return deleteTimetableEntry(env, access, body);
  if (path === "/api/timetable/periods" && method === "PUT") return saveTimetablePeriods(env, access, body);
  if (path === "/api/recordwork") {
    if (method === "GET") return json2({ rows: await listRecordOfWork(env, access, q) });
    if (method === "POST") return saveRecordOfWork(env, access, user, body, false);
    if (method === "PUT") return saveRecordOfWork(env, access, user, body, true);
    if (method === "DELETE") return deleteRecordOfWork(env, access, body);
  }
  if (path === "/api/progress") {
    if (method === "GET") return json2({ records: await listProgress(env, access, q) });
    if (method === "POST") return addProgress(env, access, user, body);
    if (method === "DELETE") return deleteProgress(env, access, body);
  }
  if (path === "/api/kicd") {
    if (method === "GET") {
      try {
        const grade = q.get("grade") || "";
        let subject = q.get("subject") || "";
        if (grade && subject) {
          const subjMap = {
            "math_p": "Mathematics",
            "eng_p": "English Activities",
            "kis_p": "Kiswahili",
            "env_p": "Environmental Activities",
            "rel_p": "CRE",
            "crt_p": "Creative Activities",
            "math": "Mathematics",
            "eng": "English Language",
            "kis": "Kiswahili",
            "isci": "Integrated Science",
            "sost": "Social Studies",
            "agri": "Agriculture",
            "ptech": "Pre-Technical Studies",
            "arts": "Creative Arts",
            "reled": "Religious Education",
            "hre": "HRE",
            "ire": "IRE"
          };
          if (subjMap[subject]) subject = subjMap[subject];
          const res = await env.DB.prepare("SELECT DISTINCT strand, sub_strand FROM kicd_curriculum_items WHERE grade_label = ? AND subject_name = ? AND ((strand IS NOT NULL AND strand <> '') OR (sub_strand IS NOT NULL AND sub_strand <> '')) ORDER BY strand, sub_strand").bind(grade, subject).all();
          const cleanStrand = (s) => {
            if (!s) return "";
            const text = String(s).replace(/\r/g, " ").replace(/\n/g, " ");
            let m = text.match(/([0-9]+\.[0-9]+)\s*:?[\s\-]+([A-Z][A-Z\s&]{2,30})/i);
            if (m) {
              let name = m[2].replace(/Strand/i, "").replace(/\s+/g, " ").trim();
              if (name.length > 2 && name.length < 50) return name.toUpperCase();
            }
            m = text.match(/\b([0-9]+\.[0-9]+)\s+([A-Z]{3,})\b/i);
            if (m) {
              let name = m[2].replace(/Strand/i, "").replace(/\s+/g, " ").trim();
              if (name.length > 2 && name.length < 50) return name.toUpperCase();
            }
            m = text.match(/\b(NUMBERS|MEASUREMENT|GEOMETRY|STATISTICS AND PROBABILITY|STATISTICS|ALGEBRA|RATIO AND PROPORTION|TIME|MONEY|DATA HANDLING|LIVING THINGS|ENVIRONMENT|HUMAN BODY|ENERGY|FORCES|MATTER|PLANTS|ANIMALS)\b/i);
            if (m) return m[1].toUpperCase().replace(/\s+/g, " ");
            return "";
          };
          const strands = [];
          const seen = /* @__PURE__ */ new Set();
          for (const r of res.results || []) {
            const cs = cleanStrand(r.strand);
            if (cs && !seen.has(cs)) {
              seen.add(cs);
              strands.push({ strand: cs, subStrands: [] });
            }
          }
          const subMap = {};
          for (const r of res.results || []) {
            const cs = cleanStrand(r.strand);
            if (cs && r.sub_strand && r.sub_strand.trim()) {
              if (!subMap[cs]) subMap[cs] = /* @__PURE__ */ new Set();
              subMap[cs].add(r.sub_strand.trim());
            }
          }
          for (const s of strands) {
            if (subMap[s.strand]) s.subStrands = Array.from(subMap[s.strand]).filter((x) => x && x.length < 200).sort();
          }
          if (strands.length === 0) {
            const res2 = await env.DB.prepare("SELECT DISTINCT strand, sub_strand FROM kicd_curriculum_items WHERE grade_label = ? AND subject_name = ? AND strand IS NOT NULL AND strand <> '' ORDER BY strand, sub_strand LIMIT 500").bind(grade, subject).all();
            const seen2 = /* @__PURE__ */ new Set();
            for (const r of res2.results || []) {
              const cs = cleanStrand(r.strand);
              if (cs && !seen2.has(cs)) {
                seen2.add(cs);
                strands.push({ strand: cs, subStrands: [] });
              }
            }
            const subMap2 = {};
            for (const r of res2.results || []) {
              const cs = cleanStrand(r.strand);
              if (cs && r.sub_strand && r.sub_strand.trim()) {
                if (!subMap2[cs]) subMap2[cs] = /* @__PURE__ */ new Set();
                subMap2[cs].add(r.sub_strand.trim());
              }
            }
            for (const s of strands) {
              if (subMap2[s.strand]) s.subStrands = Array.from(subMap2[s.strand]).filter((x) => x && x.length < 200).sort();
            }
          }
          return json2({ designs: [], strands });
        }
      } catch {
      }
      return json2(await listKicd(env, access, q));
    }
    if (method === "POST") return saveKicd(env, access, body, false);
    if (method === "PUT") return saveKicd(env, access, body, true);
    if (method === "DELETE") return deleteKicd(env, access, body);
  }
  if (path === "/api/resources") {
    if (method === "GET") return json2(await listResources(env, access, q));
    if (method === "POST") return saveResource(env, access, body, false);
    if (method === "PUT") return saveResource(env, access, body, true);
    if (method === "DELETE") return deleteResource(env, access, body);
  }
  if (path === "/api/klb/books") {
    if (method === "GET") return json2(await listKlbBooks(env, access, q));
    if (method === "POST") return saveKlbBook(env, access, body, false);
    if (method === "PUT") return saveKlbBook(env, access, body, true);
  }
  if (path === "/api/klb/topics") {
    if (method === "GET") return json2(await listKlbTopics(env, access, q));
    if (method === "POST") return saveKlbTopic(env, access, body, false);
    if (method === "PUT") return saveKlbTopic(env, access, body, true);
  }
  if (path === "/api/learners" && method === "GET") return json2({ learners: await listLearners(env, access) });
  if (path === "/api/learners" && method === "POST") return createLearner(env, access, body, spec);
  if ((path === "/api/learners" || path === "/api/learner") && (method === "PUT" || method === "PATCH")) return updateLearner(env, access, body);
  if (path.startsWith("/api/learners/") && (method === "PUT" || method === "PATCH")) {
    const id = path.split("/api/learners/")[1];
    return updateLearner(env, access, { ...body, id });
  }
  if (path === "/api/marks" && method === "GET") {
    return json2({ marks: await listMarks(env, access, { stream: q.get("stream") || "", learnerId: q.get("learner") || "" }) });
  }
  if (path === "/api/marks" && method === "PUT") return saveMarks(env, access, body.items);
  if (path === "/api/attendance" && method === "GET") {
    const scope = scopeClause(access, "l.");
    const res = await env.DB.prepare(
      `SELECT a.learner_id, a.day, a.status
         FROM attendance a JOIN learners l ON l.id = a.learner_id
        WHERE a.tenant_id = ?${scope.clause}`
    ).bind(tenant.id, ...scope.binds).all();
    return json2({ records: res.results.map((r) => ({ learnerId: r.learner_id, day: r.day, status: r.status })) });
  }
  if (path === "/api/attendance" && method === "POST") return saveAttendance(env, access, body.items);
  if (path === "/api/observations" && method === "GET") {
    const scope = scopeClause(access, "l.");
    const res = await env.DB.prepare(
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
  if (path === "/api/observations" && method === "POST") return saveObservations(env, access, author, body.items);
  if (path === "/api/settings" && method === "GET") {
    if (access.role !== "admin") return err(403, "FORBIDDEN", "Admin only");
    const row = await env.DB.prepare("SELECT * FROM school_settings WHERE tenant_id = ?").bind(tenant.id).first();
    return json2({
      schoolType: row?.school_type || "both",
      streams: row?.streams_config ? JSON.parse(row.streams_config || "[]") : []
    });
  }
  if (path === "/api/settings" && method === "POST") {
    if (access.role !== "admin") return err(403, "FORBIDDEN", "Admin only");
    await env.DB.prepare(
      `INSERT INTO school_settings (tenant_id, school_type, streams_config)
       VALUES (?, ?, ?)
       ON CONFLICT(tenant_id) DO UPDATE SET
         school_type = excluded.school_type,
         streams_config = excluded.streams_config,
         updated_at = datetime('now')`
    ).bind(tenant.id, body.schoolType || "both", JSON.stringify(body.streams || [])).run();
    return json2({ ok: true });
  }
  if (path === "/api/payments" && method === "GET") {
    const scope = scopeClause(access, "l.");
    const res = await env.DB.prepare(
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
  if (path === "/api/payments" && method === "POST") return postPayment(env, access, body);
  if (path === "/api/whatsapp" && method === "GET") {
    const cfg = evolutionConfig(env);
    const scope = scopeClause(access, "l.");
    const res = await env.DB.prepare(
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
  if (path === "/api/whatsapp" && method === "POST") return sendWhatsapp(env, access, body, spec);
  if (path === "/api/dashboard" && method === "GET") {
    return json2(await dashboard(env, access, q.get("stream") || ""));
  }
  if (path === "/api/broadsheet/csv" && method === "GET") {
    return broadsheetCsv(env, access, q.get("stream") || "", spec);
  }
  return err(404, "NOT_FOUND", `No route for ${method} ${path}`);
}
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/auth/freebuff/")) {
      try {
        if (env.FREEBUFF_CLIENT_ID && env.FREEBUFF_ISSUER) {
          const a = createFreebuffAuth({
            clientId: env.FREEBUFF_CLIENT_ID,
            issuer: env.FREEBUFF_ISSUER,
            baseUrl: env.APP_ORIGIN || url.origin,
            allowInsecureLocalhost: /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/?$/.test(env.APP_ORIGIN || url.origin)
          });
          if (typeof a.handle === "function") {
            const res = await a.handle(request);
            if (res) return res;
          }
        }
      } catch (e) {
        console.error("auth route error:", e);
      }
    }
    if (url.pathname.startsWith("/api/")) {
      try {
        await ensureSchema(env);
        let user = null;
        try {
          if (env.FREEBUFF_CLIENT_ID && env.FREEBUFF_ISSUER) {
            const a = createFreebuffAuth({
              clientId: env.FREEBUFF_CLIENT_ID,
              issuer: env.FREEBUFF_ISSUER,
              baseUrl: env.APP_ORIGIN || url.origin,
              allowInsecureLocalhost: /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/?$/.test(env.APP_ORIGIN || url.origin)
            });
            user = await a.getUser(request).catch(() => null);
          }
        } catch (_) {
        }
        return await handleApi(request, env, user);
      } catch (e) {
        return json2({ error: "Server error", code: "INTERNAL", message: String(e?.message || e) }, { status: 500 });
      }
    }
    if (env.ASSETS) {
      try {
        const res = await env.ASSETS.fetch(request);
        const urlPath = url.pathname;
        const hasFileExt = /\.[a-zA-Z0-9]+$/.test(urlPath);
        if (hasFileExt) {
          if (res.status === 404) {
            try {
              return await env.ASSETS.fetch(new Request(new URL("/index.html", url.origin)));
            } catch {
            }
            return new Response("Site unavailable", { status: 500 });
          }
          return res;
        }
        if (res.status === 404) {
          try {
            const indexRes = await env.ASSETS.fetch(new Request(new URL("/index.html", url.origin)));
            if (indexRes.status === 200) return indexRes;
          } catch {
          }
          try {
            return await env.ASSETS.fetch(new Request(new URL("/", url.origin)));
          } catch {
          }
        }
        return res;
      } catch (e) {
        const hasFileExt = /\.[a-zA-Z0-9]+$/.test(url.pathname);
        if (!hasFileExt) {
          try {
            return await env.ASSETS.fetch(new Request(new URL("/index.html", url.origin)));
          } catch (_) {
            return new Response("Site unavailable", { status: 500 });
          }
        } else {
          return new Response("Site unavailable", { status: 500 });
        }
      }
    }
    return new Response("Site unavailable", { status: 500 });
  }
};
export {
  index_default as default
};
