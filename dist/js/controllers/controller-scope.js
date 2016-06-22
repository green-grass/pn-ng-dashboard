(function () {

    'use strict';
    
    PN.namespace('PN.AngularDashboard');

    PN.AngularDashboard.ControllerScope = PN.Class.extend({
        init: function (scope) {
            $.extend(scope, this);

            for (var name in scope) {
                if (typeof scope[name] === 'function' && name.indexOf('__') === 0 && name.length > 2 && name[2] !== '_') {
                    scope[name.substr(2)] = (function (name) {
                        return function () {
                            return scope[name].apply(scope, arguments);
                        };
                    })(name);
                }
            }
        }
    });

})();
