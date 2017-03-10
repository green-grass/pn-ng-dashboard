(function () {

    'use strict';

    var module = angular.module('pnDashboardList', []);

    module.directive('pnListDashhead', function () {
        var link = function (scope, iElement, iAttrs, controller, transcludeFn) {
            scope.onSearchKeypress = function (e) {
                switch (e.keyCode) {
                    case 27:
                        scope.searchTerms = '';
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
            link: link
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
        var link = function (scope, iElement, iAttrs, controller, transcludeFn) {
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
        };

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
            link: link
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
        var link = function (scope, iElement, iAttrs, controller, transcludeFn) {
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
        };

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
            link: link
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

    module.directive('pnTableTextInput', ['$parse', function ($parse) {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput', 'pnIconTextInput'], iAttrs);
        };

        var compile = function (tElement, tAttrs) {
            var input = $('[pn-icon-text-input]', tElement);

            PN.assignDirectiveAttrs(input, 'pnInput', tAttrs, true);
            PN.assignDirectiveAttrs(input, 'pnIconTextInput', tAttrs, false);

            if (angular.isDefined(tAttrs.password)) {
                input.attr('password', '');
            }

            return { pre: preLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                ngModel: '=',
                focusIf: '&'
            },
            template: '<td>' +
                      '    <div pn-icon-text-input pn-input-class="input-xs" pn-input-group-class="input-group-xs" pn-input-group-addon-class="input-xs" ng-model="ngModel" focus-if="focusIf()"></div>' +
                      '</td>',
            compile: compile
        };
    }]);

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
        var link = function (scope, iElement, iAttrs, controller, transcludeFn) {
            scope.goToPage = function (pageNumber) {
                scope.pageNumber = pageNumber;
            };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                pageCount: '&',
                pageNumber: '=',
                maxPageLength: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-buttons-pagination.html',
            link: link
        };
    });

    module.directive('pnCombinedPagination', ['$animate', function ($animate) {
        var link = function (scope, iElement, iAttrs, controller, transcludeFn) {
            scope.showPageJumper = false;
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                pageCount: '&',
                pageNumber: '=',
                maxPageLength: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-combined-pagination.html',
            link: link
        };
    }]);

})();
