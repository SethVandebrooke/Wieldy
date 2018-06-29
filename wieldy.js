// (any)
// v: any value you want to wield
var Wieldable = function(originalValue){
  var data, callbacks = [];
  function broadcast() {
    for (var i = 0; i < callbacks.length; i++) {
      if ("function" === typeof callbacks[i]) {
        callbacks[i](data);
      }
    }
  };
  // (any)
  // v: any value you want to wield
  var wieldable = function (value) {
    if (value != undefined) {
      data = value;
      if (value instanceof Array) {
        function methodWrapper(func, ...params) {
          var result = data[func](...params);
          broadcast();
          return result;
        }
        wieldable.push    =  function ( ...params ) { return methodWrapper( 'push',    ...params ); };
        wieldable.pop     =  function ( ...params ) { return methodWrapper( 'pop',     ...params ); };
        wieldable.shift   =  function ( ...params ) { return methodWrapper( 'shift',   ...params ); };
        wieldable.unshift =  function ( ...params ) { return methodWrapper( 'unshift', ...params ); };
        wieldable.splice  =  function ( ...params ) { return methodWrapper( 'splice',  ...params ); };
        wieldable.slice   =  function ( ...params ) { return methodWrapper( 'slice',   ...params ); };
        Object.defineProperty(wieldable, 'length',  { get: function() { return data.length; } } );
      } else if ("object" === typeof value) {
        for (var key in value) {
          wieldable[key] = new Wieldable(value[key]);
        }
      } else { // Clear out helper functions if there
        if (wieldable.push)    { delete wieldable.push;    }
        if (wieldable.pop)     { delete wieldable.pop;     }
        if (wieldable.shift)   { delete wieldable.shift;   }
        if (wieldable.unshift) { delete wieldable.unshift; }
        if (wieldable.splice)  { delete wieldable.splice;  }
        if (wieldable.slice)   { delete wieldable.slice;   }
      }
      broadcast();
    }
    if (data instanceof Array) {
      var tempArray = [];
      for (var i = 0, callbacks = data.length; i < callbacks; i++) {
        tempArray[i] = data[i];
      }
      return tempArray;
    } else if ("object" === typeof data) {
      var obj = {};
      for (var key in wieldable) {
        if ("function" === typeof wieldable[key] && "wieldable" == wieldable[key].name) {
          obj[key] = wieldable[key]();
        }
      }
      return obj;
    }
    return data;
  };
  // (function)
  // f: function to run when the value of the wieldable changes
  wieldable.observe = function (func) {
    if ("function" === typeof func) {
      callbacks.push(func);
      return {
        stop: function () {
          callbacks.splice(callbacks.indexOf(func),1)
        },
        start: function () { callbacks.push(func) }
      };
    }
  };
  // (DOM Element, String, Boolean)
  // element: DOM Element to bind the wieldable to
  // param: Name of event (if input is true) to update on, or DOM Element property to set when updated
  // input: wheather you are setting the wieldable on an event or getting it when changed
  wieldable.bind = function (element,param,input) {
    if (input) {
      element.addEventListener(param, function () {
        wieldable(element.value);
      });
      if (element.value) wieldable(element.value);
      return wieldable.observe(function(text) {
        element.value = text;
      });
    } else {
      wieldable.template = element[param];
      var observer = wieldable.observe(function (text) {
        if (data instanceof Array && wieldable.template) {
          element[param] = "";
          data.forEach((el,index) => {
            var str = wieldable.template;
            if ("object" === typeof el) {
              for (var key in el) {
                str = str.split("${"+key+"}").join(el[key]);
              }
            } else {
              str = str.split("${value}").join(el);
            }
            str = str.split("${index}").join(index);
            element[param] += str;
          })
        } else {
          element[param] = text;
        }
      });
      element[param] = data;
      return observer;
    }
  }
  wieldable.changed = broadcast();
  wieldable(originalValue);
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
              if (binding.replace(".","")!=binding) {
                binding = eval("scope."+binding);
                if (binding === undefined) {
                  console.error(binding+" does note exist");
                }
              } else {
                binding = scope[binding] = scope[binding] || new Wieldable();
              }
              if (input) {
                binding.bind(e,param,true);
                scope.debug?console.log(e,param, true):null;
              } else {
                binding(!!e[param]?e[param]:"");
                binding.bind(e,param);
                if (e[param].match(/\$\{.*}/g) != null) {
                  binding([]);
                }
                scope.debug?console.log(e,param):null;
                return scope;
              }
            } else {
              console.error("No bindings were defined");
              return false;
            }
          } else {
            console.error("No bindings were defined");
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
