function WieldyObservable(value) {
    var data, listeners = new Set();

    function updateValue (value, dontSet, metaData) {
        listeners.forEach(listener => listener(value, metaData || null));
        if (!dontSet) { data = value; }
    }

    function observable(value) {
        var arrayOperations = ['push','pop','shift','unshift','slice','splice'];
        if (Array.isArray(value)) {
            arrayOperations.forEach(operation => {
                observable[operation] = (...args) => {
                    data[operation](...args);
                    updateValue(value, true, {method:operation, args: args});
                };
            });
            observable.set = (index,value) => {
                data[index] = value;
                updateValue(data, true, {method: "set", args: [index, value]});
            };
            updateValue(value);
        } else if ("function" === typeof value) {
            observable = function (v) {
                if (v != undefined) {
                    updateValue(value(v));
                } else {
                    return data;
                }
            };
            observable.observe = listener => { listeners.add(listener); return listener; };
            observable.ignore = listener => listeners.delete(listener);
            observable.refresh = () => updateValue(observable(),true);
        } else if ("object" === typeof value) {
            data = {};
            for (let k in value) {
                data[k] = new Observable(value[k]);
                data[k].observe(v => updateValue(data, true, {key: k, value: v}));
            }
            observable.set = (key,value) => {
                data[key] = value;
                updateValue(data, true, {method: "set", key, value});
            };
            observable.delete = key => {
                delete data[key];
                updateValue(data, true, {method: "delete", key});
            };
            observable.objectLiteral = function () {
                let result = {};
                for (let k in data) {
                    result[k] = data[k]();
                }
                return result;
            };
            updateValue(data);
        } else if (value != undefined) {
            updateValue(value);
        }
        if (!Array.isArray(data)) {
            arrayOperations.forEach(operation => observable[operation] = undefined);
            observable.set = undefined;
        } else if ("object" != typeof data) {
            observable.objectLiteral = undefined;
            observable.set = undefined;
        }
        return data;
    }

    observable.observe = listener => { listeners.add(listener); return listener; };
    observable.ignore = listener => listeners.delete(listener);
    observable.refresh = () => updateValue(observable(),true);
    observable(value);
    return observable;

}

function Wieldy(model, target) {
    var supportedEvents = ['blur','change','input','click','dblclick','mouseover',
        'mouseout','mouseenter','mouseleave','keyup','keydown','keypress'];
    var supportedProperties = ['innerHTML','textContent','html','text','style','value'];
    var propertyMap = {html:'innerHTML', text:'textContent'};
    var templates = {};
    for (var k in model) {
        model[k] = new WieldyObservable(model[k]);
    }
    function renderTemplate(element, data) {
        if (!templates[element]) {
            templates[element] = element.innerHTML;
        }
        var output = "", template = templates[element];
        if (Array.isArray(data)) {
            data.forEach(function (item, index){
                var temp = template;
                if ('object' === typeof item) {
                    for (var k in item) {
                        temp = temp.split("{{" + k + "}}").join('function' === typeof item[k] ? item[k]() : item[k]);
                    }
                } else {
                    temp = temp.split("{{value}}").join(item);
                }
                output += temp.split("{{index}}").join(index);
            });
        } else if ("object" === typeof data) {
            var temp = template;
            for (let k in data) {
                temp = temp.split("{{"+k+"}}").join('function' === typeof data[k] ? data[k]() : data[k]);
            }
            output = temp;
        }
        element.innerHTML = output;
        activate(element);
    }
    function activate(dom) {
        var _args = [];
        var _values = [];
        for (var k in model){
            _args.push(k);
            _values.push(model[k]);
        }
        dom.querySelectorAll("[data-bind]").forEach(function (element){
            let elementBindings = element.getAttribute('data-bind');
            if (elementBindings !== null) {
                elementBindings = elementBindings.split(".").join("().");
                elementBindings = (new Function(..._args,"return ({"+elementBindings+"})"))(..._values);
                for (let binding in elementBindings) {
                    let ob = elementBindings[binding];
                    if (supportedEvents.includes(binding)) {
                        let tag = element.tagName.toLowerCase();
                        if ((['input','select','textarea']).includes(tag)) {
                            element.addEventListener(binding, function (){
                                ob(element.value);
                            });
                            ob.observe(function (data) {
                                element.value = data;
                            });
                            element.value = ob();
                        } else {
                            element.addEventListener(binding, function (ev) {
                                ob(element.getAttribute('value') || ev);
                            });
                        }
                    } else if (supportedProperties.includes(binding)) {
                        binding = propertyMap[binding] || binding;
                        ob.observe(function (data) {
                            element[binding] = data;
                        });
                        element[binding] = ob();
                    } else if (binding == "render") {
                        ob.observe(function (data) {
                            renderTemplate(element, data);
                        });
                    } else {
                        ob.observe(function (data) {
                            element.setAttribute(binding, data);
                        });
                        element.setAttribute(binding, ob());
                    }
                    ob.refresh();
                }
            }
        });
    }
    activate(document || target);
    return model;
}

