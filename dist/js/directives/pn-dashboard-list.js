(function () {

    'use strict';

    var module = angular.module('pnDashboardList', []);

    module.directive('pnListDashhead', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                pnTitle: '@',
                subtitle: '@',
                searchPlaceholder: '@',
                searchTerms: '=',
                emptyList: '&',
                noNew: '&',
                newUrl: '@',
                toggleAddForm: '&onToggleAddForm'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-list-dashhead.html',
            link: function (scope, element, attrs) {
                scope.onSearchKeypress = function (e) {
                    switch (e.keyCode) {
                        case 27:
                            scope.searchTerms = '';
                            break;
                        default:
                            break;
                    }
                };
            }
        };
    });

    module.directive('pnListAddForm', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                emptyList: '&',
                emptyListMessage: '@',
                submit: '&onSubmit'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-list-add-form.html'
        };
    });

    module.directive('pnListStandaloneAddMessage', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                message: '@',
                newUrl: '@'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-list-standalone-add-message.html'
        };
    });

    module.directive('pnSearchResultCount', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                count: '&',
                filteredCount: '&',
                zeroMessage: '@',
                singleMessage: '@',
                pluralMessage: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-search-result-count.html'
        };
    });

    module.directive('pnPagedSearchResultCount', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                minPageSize: '&',
                count: '&',
                filteredCount: '&',
                zeroMessage: '@',
                singleMessage: '@',
                pluralMessage: '&',
                pageSize: '=',
                pageNumber: '&',
                pageCount: '&',
                currentPageMessage: '&',
                pageSizeMessage: '&',
                showAllLabel: '&',
                rightAlign: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-paged-search-result-count.html',
            link: function (scope) {
                scope.showPaginationUtilities = false;
                scope.minPageSizeOrDefault = scope.minPageSize() || 30;
                scope.pageSizes = [
                    { value: scope.minPageSizeOrDefault, text: scope.minPageSizeOrDefault.toString() },
                    { value: 50, text: '50' },
                    { value: 100, text: '100' },
                    { value: 200, text: '200' },
                    { value: 500, text: '500' },
                    { value: 1000000, text: scope.showAllLabel() }
                ];

                scope.$watch('minPageSize()', function () {
                    scope.minPageSizeOrDefault = scope.minPageSize() || 30;
                    scope.pageSizes[0].value = scope.minPageSizeOrDefault;
                    scope.pageSizes[0].text = scope.minPageSizeOrDefault.toString();
                });

                scope.$watch('showAllLabel()', function () {
                    scope.pageSizes[scope.pageSizes.length - 1].text = scope.showAllLabel();
                });

                scope.pageSizeMessageStart = function () {
                    return scope.pageSizeMessage().split('{pageSize}')[0];
                };

                scope.pageSizeMessageEnd = function () {
                    return scope.pageSizeMessage().split('{pageSize}')[1];
                };
            }
        };
    });

    module.directive('pnSortableColumn', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                sorted: '&',
                reverse: '&',
                sort: '&onSort'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-sortable-column.html'
        };
    });

    module.directive('pnMultiSortableColumn', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                tableSortExpression: '&',
                sortExpression: '&',
                fixedSortExpression: '&',
                sort: '&onSort'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-multi-sortable-column.html',
            link: function (scope) {
                scope.sorted = function () {
                    try {
                        return scope.tableSortExpression().indexOf(scope.sortExpression()) > -1 ||
                            scope.tableSortExpression().indexOf('-' + scope.sortExpression()) > -1;
                    } catch (e) {
                        return false;
                    }
                };

                scope.reverse = function () {
                    try {
                        return scope.tableSortExpression().indexOf('-' + scope.sortExpression()) > -1;
                    } catch (e) {
                        return false;
                    }
                };

                scope.buildNewSortExpression = function () {
                    var sortArray = [];
                    if (angular.isArray(scope.fixedSortExpression())) {
                        sortArray = sortArray.concat(scope.fixedSortExpression());
                    } else if (scope.fixedSortExpression()) {
                        sortArray.push(scope.fixedSortExpression());
                    }
                    sortArray.push((scope.sorted() && !scope.reverse() ? '-' : '') + scope.sortExpression());
                    return sortArray;
                };
            }
        };
    });

    module.directive('pnTableBoolDisplay', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                value: '&'
            },
            template: '<td class="text-center">' +
                      '    <span class="icon" ng-class="value() ? \'text-success icon-check\' : \'text-danger icon-cross\'"></span>' +
                      '</td>'
        };
    });

    module.directive('pnTableTextInput', function () {
        var compile = function (element, attrs) {
            var input = $('[pn-icon-text-input]', element);

            if (angular.isDefined(attrs.password)) {
                input.attr('password', '');
            }
            if (angular.isDefined(attrs.icon)) {
                input.attr('icon', attrs.icon);
            }

            copyDirectiveAttrs(input, 'pnInput', attrs, true);
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                icon: '@',
                ngModel: '=',
                focusIf: '&'
            },
            template: '<td>' +
                      '    <div pn-icon-text-input pn-input-class="input-block input-sm" ng-model="ngModel" focus-if="focusIf()"></div>' +
                      '</td>',
            compile: compile
        };
    });

    module.directive('pnTableCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                ngModel: '='
            },
            template: '<td class="text-center">' +
                      '    <div pn-checkbox-input inline="true" ng-model="ngModel" style="width: 18px"></div>' +
                      '</td>'
        };
    });

    module.directive('pnTableEditDelete', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                editUrl: '@',
                edit: '&onEdit',
                'delete': '&onDelete'
            },
            template: '<td class="text-tight">' +
                      '    <div class="flextable">' +
                      '        <div class="flextable-item">' +
                      '            <div class="btn-group">' +
                      '                <a class="btn btn-xs btn-default-outline" ng-if="editUrl" href="{{editUrl}}">' +
                      '                    <span class="icon icon-pencil"></span>' +
                      '                </a>' +
                      '                <button type="button" class="btn btn-xs btn-default-outline" ng-if="!editUrl" ng-click="edit()">' +
                      '                    <span class="icon icon-pencil"></span>' +
                      '                </button>' +
                      '                <button type="button" class="btn btn-xs btn-default-outline" ng-click="delete()">' +
                      '                    <span class="icon icon-erase"></span>' +
                      '                </button>' +
                      '            </div>' +
                      '        </div>' +
                      '    </div>' +
                      '</td>'
        };
    });

    module.directive('pnTableUpdateCancel', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                updateIcon: '@',
                update: '&onUpdate',
                cancel: '&onCancel'
            },
            template: '<td class="text-tight">' +
                      '    <div class="flextable">' +
                      '        <div class="flextable-item">' +
                      '            <div class="btn-group">' +
                      '                <button type="button" class="btn btn-xs btn-primary-outline" ng-click="update()">' +
                      '                    <span class="icon" ng-class="updateIcon || \'icon-save\'"></span>' +
                      '                </button>' +
                      '                <button type="button" class="btn btn-xs btn-danger-outline" ng-click="cancel()">' +
                      '                    <span class="icon icon-cross"></span>' +
                      '                </button>' +
                      '            </div>' +
                      '        </div>' +
                      '    </div>' +
                      '</td>'
        };
    });

    module.directive('pnDropdownPagination', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                pageCount: '&',
                pageNumber: '='
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-dropdown-pagination.html'
        };
    });

    module.directive('pnButtonsPagination', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                pageCount: '&',
                pageNumber: '=',
                maxPageLength: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-buttons-pagination.html',
            link: function (scope) {
                scope.goToPage = function (pageNumber) {
                    scope.pageNumber = pageNumber;
                };
            }
        };
    });

    module.directive('pnCombinedPagination', ['$animate', function ($animate) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                pageCount: '&',
                pageNumber: '=',
                maxPageLength: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-combined-pagination.html',
            link: function (scope, element) {
                scope.showPageJumper = false;
            }
        };
    }]);

    // Remember to update in pn-dashboard-shared.js after editing this function
    function copyDirectiveAttrs(element, prefix, attrs, keepPrefix) {
        var dashedPrefix = prefix.replace(/\W+/g, '-')
                                 .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                                 .toLowerCase();

        $.each(attrs.$attr, function (key, attr) {
            if (key.startsWith(prefix)) {
                var dashedKey = key.replace(/\W+/g, '-')
                                   .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                                   .toLowerCase();

                if (!keepPrefix) {
                    dashedKey = dashedKey.substr(dashedPrefix.length + 1);
                }

                if (dashedKey === 'class') {
                    element.addClass(attrs[key]);
                } else if (dashedKey === dashedPrefix + '-class') {
                    element.attr(dashedKey, element.attr(dashedKey) + ' ' + attrs[key])
                } else {
                    element.attr(dashedKey, attrs[key])
                }
            }
        });
    }

})();
