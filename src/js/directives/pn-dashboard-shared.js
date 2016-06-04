(function () {

    'use strict';

    var DEFAULT_EVENT_NAMESPACE = '.dashboardshared';

    var module = angular.module('pnDashboardShared');

    module.directive('pnCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                inline: '&',
                label: '@',
                ngModel: '='
            },
            templateUrl: '/assets/pn-ng-dashboard/dist/templates/pn-checkbox-input.html'
        };
    });

    module.directive('pnAutoComplete', function () {
        return {
            restrict: 'EA',
            require: 'ngModel',
            replace: true,
            transclude: true,
            scope: {
                placeholder: '@',
                focusOn: '@',
                clearOn: '@',
                matchDisplay: '&',
                factory: '&',
                minSearchLength: '&',
                createQueryData: '&'
            },
            templateUrl: '/assets/pn-ng-dashboard/dist/templates/pn-auto-complete.html',
            compile: function (element, attrs) {
                if (angular.isDefined(attrs.multiple)) {
                    $('ui-select', element).attr('multiple', 'multiple');
                } else {
                    $('ui-select', element).attr('reset-search-input', 'false');
                }

                return function (scope, element, attrs, ngModelCtrl) {
                    scope.items = [];
                    scope.model = { selected: null };

                    ngModelCtrl.$formatters.push(function (modelValue) {
                        return modelValue;
                    });

                    ngModelCtrl.$parsers.push(function (viewValue) {
                        return viewValue;
                    });

                    scope.$watch('model.selected', function () {
                        ngModelCtrl.$setViewValue(scope.model.selected);
                    });

                    ngModelCtrl.$render = function () {
                        scope.model.selected = ngModelCtrl.$viewValue;
                    };

                    scope.refreshItems = function (search) {
                        if (search.length < (scope.minSearchLength() || 1)) {
                            scope.items = [];
                            return;
                        }

                        var factory = scope.factory(),
                            token = new Date().valueOf().toString(),
                            queryData = scope.createQueryData({ token: token, search: search }) ||
                                        { token: token, search: search };
                        factory.latestToken = token;

                        return factory.query(queryData, function (models, responseHeaders) {
                            var returnedToken = responseHeaders('token');
                            if (returnedToken !== factory.latestToken) {
                                return;
                            }

                            if (angular.isDefined(attrs.multiple) && scope.model.selected && scope.model.selected.length) {
                                for (var i = 0 ; i < scope.model.selected.length; i++) {
                                    var selected = scope.model.selected[i];
                                    for (var j = 0; j < models.length; j++) {
                                        var current = models[j];
                                        if (selected.Id === current.Id) {
                                            models.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                            }

                            scope.items = models;
                        });
                    };

                    if (scope.clearOn) {
                        scope.$on(scope.clearOn, function () {
                            scope.items = [];
                        });
                    }
                };
            }
        };
    });

    module.directive('pnLoading', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {},
            templateUrl: '/assets/pn-ng-dashboard/dist/templates/pn-loading.html'
        };
    });

    module.directive('pnErrors', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                position: '@',
                closeLable: '@',
                message: '&',
                errors: '&',
                clear: '&onClear'
            },
            templateUrl: '/assets/pn-ng-dashboard/dist/templates/pn-errors.html'
        };
    });

    module.directive('pnDeleteConfirmation', function () {
        var link = function (scope, element, attrs) {
            var modal = $('#' + scope.id);
            modal.on('hidden.bs.modal' + DEFAULT_EVENT_NAMESPACE, function () {
                scope.close();
            });

            var accessor = scope.accessor();
            if (accessor) {
                accessor.show = function () {
                    modal.modal('show');
                };
            }

            scope.onKeypress = function (e) {
                switch (e.keyCode) {
                    case 13:
                        modal.modal('hide');
                        scope.confirm();
                        break;
                    default:
                        break;
                }
            };
        };

        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                accessor: '&',
                id: '@',
                closeLabel: '@',
                title: '@',
                deleteLabel: '@',
                cancelLabel: '@',
                confirm: '&onConfirm',
                close: '&onClose'
            },
            templateUrl: '/assets/pn-ng-dashboard/dist/templates/pn-delete-confirmation.html',
            link: link
        };
    });

    // It was decided for 1.3 that ng-trasclude would not pull scope from the directive.
    // Use this work around.
    // https://github.com/angular/angular.js/issues/7874#issuecomment-53450394
    module
        .config(['$provide', function ($provide) {
            $provide.decorator('ngTranscludeDirective', ['$delegate', function ($delegate) {
                // Remove the original directive
                $delegate.shift();
                return $delegate;
            }]);
        }])
        .directive('ngTransclude', function () {
            return {
                restrict: 'EAC',
                link: function ($scope, $element, $attrs, controller, $transclude) {
                    if (!$transclude) {
                        throw minErr('ngTransclude')('orphan',
                         'Illegal use of ngTransclude directive in the template! ' +
                         'No parent directive that requires a transclusion found. ' +
                         'Element: {0}',
                         startingTag($element));
                    }

                    var iScopeType = $attrs['ngTransclude'] || 'sibling';

                    switch (iScopeType) {
                        case 'sibling':
                            $transclude(function (clone) {
                                $element.empty();
                                $element.append(clone);
                            });
                            break;
                        case 'parent':
                            $transclude($scope, function (clone) {
                                $element.empty();
                                $element.append(clone);
                            });
                            break;
                        case 'child':
                            var iChildScope = $scope.$new();
                            $transclude(iChildScope, function (clone) {
                                $element.empty();
                                $element.append(clone);
                                $element.on('$destroy', function () {
                                    iChildScope.$destroy();
                                });
                            });
                            break;
                    }
                }
            }
        });

})();
