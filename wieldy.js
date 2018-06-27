
// (any)
// v: any value you want to wield
var Wieldable = function(v){
  var d, l = [], t = () => {
    for (var i = 0; i < l.length; i++) {
      if (typeof l[i] == "function") {
        l[i](d);
      }
    }
  };
  // (any)
  // v: any value you want to wield
  var wieldable = function (v) {
    if (v != undefined) {
      d = v;
      if (v instanceof Array) {
        function arrayFunc(func, ...params) {
          var r = d[func](...params);
          t();
          return r;
        }
        wieldable.push    =  function ( ...params ) { arrayFunc( 'push',    ...params ) }
        wieldable.pop     =  function ( ...params ) { arrayFunc( 'pop',     ...params ) }
        wieldable.shift   =  function ( ...params ) { arrayFunc( 'shift',   ...params ) }
        wieldable.unshift =  function ( ...params ) { arrayFunc( 'unshift', ...params ) }
        wieldable.splice  =  function ( ...params ) { arrayFunc( 'splice',  ...params ) }
        wieldable.slice   =  function ( ...params ) { arrayFunc( 'slice',   ...params ) }
        Object.defineProperty(wieldable, 'length', { get: function() { return d.length; } });
      } else if (typeof v == "object") {
        for (var k in v) {
          d[k] = new Wieldable(v[k]);
        }
        wieldable.object = () => {
          var o = {};
          for (var k in d) {
            o[k] = d[k]();
          }
          return o;
        };
      } else { // Clear out helper functions if there
        delete wieldable.push;
        delete wieldable.pop;
        delete wieldable.shift;
        delete wieldable.unshift;
        delete wieldable.splice;
        delete wieldable.slice;
        delete wieldable.object;
      }
      t();
    }
    return d;
  };
  wieldable.observe = (f) => {
    l.push(f);
    return {
      stop: () => {
        l.splice(l.indexOf(f),1)
      },
      start: () => l.push(f)
    };
  };
  // (DOM Element, String, Boolean) 
  // element: DOM Element to bind the wieldable to
  // param: Name of event (if input is true) to update on, or DOM Element property to set when updated
  // input: wheather you are setting the wieldable on an event or getting it when changed
  wieldable.bind = function (element,param,input) {
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
          d.forEach((el,index) => {
            var str = wieldable.template;
            if ("object" == typeof el) {
              for (k in el) {
                str = str.split("${"+k+"}").join(el[k]);
              }
            } else {
              str = str.split("${index}").join(index);
              str = str.split("${value}").join(el);
            }
            element[param] += str;
          })
        } else {
          element[param] = text;
        }
      });
      element[param] = d;
      return observer;
    }
  }
  wieldable(v);
  return wieldable;
};

// (DOM Element, Object)
// tar: target element to bind the scope to
// model: an object of wieldable values inside the bound scope
function WieldyScope(tar,model) {
  var scope = this;
  scope.debug = false;
  scope.run = function (target) {
    target.querySelectorAll("[bind]").forEach(e=> {
      var bindings = e.getAttribute("bind"), input = false;
      if (!!bindings) {
        bindings = bindings.split(",");
        bindings.forEach(function(params){
          if (params.match(":")!==null) {
            params = params.split(":");
            var binding = params[0];
            var param = params[1];
            if (!!binding && !!param) {
              if (binding.match("-on")!==null) {
                binding = binding.replace("-on","");
                input = true;
              }
              scope[binding] = scope[binding] || new Wieldable();
              if (input) {
                scope[binding].bind(e,param,true);
                scope.debug?console.log(e,param, true):null;
              } else {
                scope[binding](!!e[param]?e[param]:"");
                scope[binding].bind(e,param);
                if (e[param].match(/\$\{.*}/g) != null) {
                  scope[binding]([]);
                }
                scope.debug?console.log(e,param):null;
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
        })
      } else {
        console.error("No bindings were defined");
        return false;
      }
    });
  }
  if (model) {
    for (var k in model) {
      scope[k] = new Wieldable(model[k]);
    }
  }
  if (tar) {
    scope.run(tar);
  }
}
