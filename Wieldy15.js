// This version of Wieldy has support for ECMA 2015
var _typeof =
  typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function(obj) {
        return typeof obj;
      }
    : function(obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };

// (any)
// v: any value you want to wield
var Wieldable = function Wieldable(v) {
  var d,
    l = [],
    t = function t() {
      for (var i = 0; i < l.length; i++) {
        if (typeof l[i] === "function") {
          l[i](d);
        }
      }
    };
  // (any)
  // v: any value you want to wield
  var wieldable = function wieldable(v) {
    if (v != undefined) {
      d = v;
      if (v instanceof Array) {
        var arrayFunc = function arrayFunc(func) {
          var _d;

          for (
            var _len = arguments.length,
              params = Array(_len > 1 ? _len - 1 : 0),
              _key = 1;
            _key < _len;
            _key++
          ) {
            params[_key - 1] = arguments[_key];
          }

          var r = (_d = d)[func].apply(_d, params);
          t();
          return r;
        };

        wieldable.push = function() {
          for (
            var _len2 = arguments.length, params = Array(_len2), _key2 = 0;
            _key2 < _len2;
            _key2++
          ) {
            params[_key2] = arguments[_key2];
          }

          return arrayFunc.apply(undefined, ["push"].concat(params));
        };
        wieldable.pop = function() {
          for (
            var _len3 = arguments.length, params = Array(_len3), _key3 = 0;
            _key3 < _len3;
            _key3++
          ) {
            params[_key3] = arguments[_key3];
          }

          return arrayFunc.apply(undefined, ["pop"].concat(params));
        };
        wieldable.shift = function() {
          for (
            var _len4 = arguments.length, params = Array(_len4), _key4 = 0;
            _key4 < _len4;
            _key4++
          ) {
            params[_key4] = arguments[_key4];
          }

          return arrayFunc.apply(undefined, ["shift"].concat(params));
        };
        wieldable.unshift = function() {
          for (
            var _len5 = arguments.length, params = Array(_len5), _key5 = 0;
            _key5 < _len5;
            _key5++
          ) {
            params[_key5] = arguments[_key5];
          }

          return arrayFunc.apply(undefined, ["unshift"].concat(params));
        };
        wieldable.splice = function() {
          for (
            var _len6 = arguments.length, params = Array(_len6), _key6 = 0;
            _key6 < _len6;
            _key6++
          ) {
            params[_key6] = arguments[_key6];
          }

          return arrayFunc.apply(undefined, ["splice"].concat(params));
        };
        wieldable.slice = function() {
          for (
            var _len7 = arguments.length, params = Array(_len7), _key7 = 0;
            _key7 < _len7;
            _key7++
          ) {
            params[_key7] = arguments[_key7];
          }

          return arrayFunc.apply(undefined, ["slice"].concat(params));
        };
        Object.defineProperty(wieldable, "length", {
          get: function get() {
            return d.length;
          }
        });
      } else if (
        (typeof v === "undefined" ? "undefined" : _typeof(v)) === "object"
      ) {
        for (var k in v) {
          wieldable[k] = new Wieldable(v[k]);
        }
      } else {
        // Clear out helper functions if there
        if (wieldable.push) {
          delete wieldable.push;
        }
        if (wieldable.pop) {
          delete wieldable.pop;
        }
        if (wieldable.shift) {
          delete wieldable.shift;
        }
        if (wieldable.unshift) {
          delete wieldable.unshift;
        }
        if (wieldable.splice) {
          delete wieldable.splice;
        }
        if (wieldable.slice) {
          delete wieldable.slice;
        }
      }
      t();
    }
    if (
      "object" === (typeof d === "undefined" ? "undefined" : _typeof(d)) &&
      !(d instanceof Array)
    ) {
      var o = {};
      for (var k in wieldable) {
        if (
          "function" === typeof wieldable[k] &&
          wieldable[k].name == "wieldable"
        ) {
          o[k] = wieldable[k]();
        }
      }
      return o;
    }
    return d;
  };
  // (function)
  // f: function to run when the value of the wieldable changes
  wieldable.observe = function(f) {
    if ("function" === typeof f) {
      l.push(f);
      return {
        stop: function stop() {
          l.splice(l.indexOf(f), 1);
        },
        start: function start() {
          return l.push(f);
        }
      };
    }
  };
  // (DOM Element, String, Boolean)
  // element: DOM Element to bind the wieldable to
  // param: Name of event (if input is true) to update on, or DOM Element property to set when updated
  // input: wheather you are setting the wieldable on an event or getting it when changed
  wieldable.bind = function(element, param, input) {
    if (input) {
      element.addEventListener(param, function(e) {
        wieldable(element.value);
      });
      if (element.value) wieldable(element.value);
      return wieldable.observe(function(text) {
        element.value = text;
      });
    } else {
      wieldable.template = element[param];
      var observer = wieldable.observe(function(text) {
        if (d instanceof Array && wieldable.template) {
          element[param] = "";
          d.forEach(function(el, index) {
            var str = wieldable.template;
            if (
              "object" ===
              (typeof el === "undefined" ? "undefined" : _typeof(el))
            ) {
              for (k in el) {
                str = str.split("${" + k + "}").join(el[k]);
              }
            } else {
              str = str.split("${index}").join(index);
              str = str.split("${value}").join(el);
            }
            element[param] += str;
          });
        } else {
          element[param] = text;
        }
      });
      element[param] = d;
      return observer;
    }
  };
  wieldable(v);
  return wieldable;
};

// (DOM Element, Object)
// tar: target element to bind the scope to
// model: an object of wieldable values inside the bound scope
function WieldyScope(tar, model) {
  var scope = this;
  scope.debug = false;
  scope.run = function(target) {
    target.querySelectorAll("[bind]").forEach(function(e) {
      var bindings = e.getAttribute("bind"),
        input = false;
      if (!!bindings) {
        bindings = bindings.split(",");
        bindings.forEach(function(params) {
          if (params.match(":") !== null) {
            params = params.split(":");
            var binding = params[0];
            var param = params[1];
            if (!!binding && !!param) {
              if (binding.match("-on") !== null) {
                binding = binding.replace("-on", "");
                input = true;
              }
              scope[binding] = scope[binding] || new Wieldable();
              if (input) {
                scope[binding].bind(e, param, true);
                scope.debug ? console.log(e, param, true) : null;
              } else {
                scope[binding](!!e[param] ? e[param] : "");
                scope[binding].bind(e, param);
                if (e[param].match(/\$\{.*}/g) != null) {
                  scope[binding]([]);
                }
                scope.debug ? console.log(e, param) : null;
                return scope;
              }
            } else {
              console.log("No bindings were defined");
              return false;
            }
          } else {
            console.log("No bindings were defined");
            return false;
          }
        });
      } else {
        console.error("No bindings were defined");
        return false;
      }
    });
  };
  if (model) {
    for (var k in model) {
      scope[k] = new Wieldable(model[k]);
    }
  }
  if (tar) {
    scope.run(tar);
  }
}
