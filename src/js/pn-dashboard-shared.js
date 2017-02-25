(function () {

    'use strict';

    angular.module('pnDashboardShared', [
        'ngSanitize',
        'ui.select',
        'focus-if',
        'ui.utils.masks',
        'pnAnimate',
        'pnContenteditable'
    ]);

    if (window.PN === undefined) {
        window.PN = function () { };
    }
    var PN = window.PN;

    if (PN.assignDirectiveAttrs !== undefined) {
        return;
    }

    PN.assignDirectiveAttrs = function (element, prefix, attrs, preservePrefix) {
        var dashedPrefix = PN.camelToKebabCase(prefix);

        $.each(attrs.$attr, function (attrName, attr) {
            if (attrName.startsWith(prefix)) {
                var dashedKey = PN.camelToKebabCase(attrName);

                if (!preservePrefix) {
                    dashedKey = dashedKey.substr(dashedPrefix.length + 1);
                }

                if (dashedKey === 'class') {
                    element.addClass('{{' + attrName + '}}');
                } else if (dashedKey === dashedPrefix + '-class') {
                    element.attr(dashedKey, element.attr(dashedKey) + '  {{' + attrName + '}}');
                } else {
                    element.attr(dashedKey, '{{' + attrName + '}}');
                }
            }
        });
    }

    PN.observeDirectiveAttrs = function (scope, prefixes, attrs) {
        var removeWatchCollection = [];
        $.each(attrs.$attr, function (attrName, attr) {
            $.each(prefixes, function (prefixIndex, prefix) {
                if (attrName.startsWith(prefix)) {
                    scope[attrName] = attrs[attrName];
                    removeWatchCollection.push(attrs.$observe(attrName, function (value) {
                        if (typeof value === 'string' || typeof value === 'boolean') {
                            scope[attrName] = value;
                        }
                    }));
                    return false;
                }
            });
        });

        if (removeWatchCollection.length > 0) {
            scope.$on('$destroy', function () {
                $.each(removeWatchCollection, function (removeWatchIndex, removeWatch) {
                    removeWatch();
                });
            });
        }
    };

})();
