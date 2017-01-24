'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _once = require('once');

var _once2 = _interopRequireDefault(_once);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// takes a function or a flat value and returns the resolved value to the callback
// if a fn, it must return a flat value, a promise, or pass something to a callback
var handleAsync = function handleAsync(fn, cb) {
  // flat value
  if (typeof fn !== 'function') return cb(null, fn);

  var wrapped = (0, _once2.default)(cb);

  // call fn w callback
  var res = void 0;
  try {
    res = fn(wrapped);
  } catch (err) {
    return wrapped(err);
  }

  // using a callback, itll call with a response
  if (typeof res === 'undefined') return;

  // using a promise
  if (res != null && (typeof res === 'undefined' ? 'undefined' : (0, _typeof3.default)(res)) === 'object' && typeof res.then === 'function') {
    res.then(function (data) {
      wrapped(null, data);
      return null;
    }).catch(function (err) {
      wrapped(err);
    });
    return;
  }

  // returned a plain value
  wrapped(null, res);
};

exports.default = handleAsync;
module.exports = exports['default'];