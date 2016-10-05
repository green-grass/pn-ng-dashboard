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
                noCreate: '&',
                createUrl: '@',
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

    module.directive('pnListMasterDetailsAddForm', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                emptyList: '&',
                emptyListMessage: '@'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-list-master-details-add-form.html'
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

    module.directive('pnFlextableTextInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                inputClass: '@',
                placeholder: '@',
                ngModel: '=',
                focusIf: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-flextable-text-input.html',
            compile: function (element, attrs) {
                var input = $('input', element);

                if (angular.isDefined(attrs.password)) {
                    input.attr('type', 'password');
                } else {
                    input.attr('type', 'text');
                }
            }
        };
    });

    module.directive('pnFlextableCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                ngModel: '='
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-flextable-checkbox-input.html'
        };
    });

    module.directive('pnFlextableDateInput', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                inputClass: '@',
                placeholder: '@',
                ngModel: '=',
                focusIf: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-flextable-date-input.html',
            link: function (scope, element) {
                var input = $('input', element);
                input.datepicker('setUTCDate', scope.ngModel);
                input.datepicker('update');
                input.datepicker()
                     .on('changeDate', function (e) {
                         if (input.datepicker('getUTCDate').toString() === scope.ngModel.toString()) {
                             return;
                         }
                         $timeout(function () {
                             scope.ngModel = input.datepicker('getUTCDate');
                         });
                     });
                scope.$watch('ngModel', function () {
                    if (input.datepicker('getUTCDate').toString() === scope.ngModel.toString()) {
                        return;
                    }
                    input.datepicker('setUTCDate', scope.ngModel);
                    input.datepicker('update');
                });
            }
        };
    }]);

    module.directive('pnFlextableSubmitReset', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                submitIcon: '@'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-flextable-submit-reset.html'
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-table-bool-display.html'
        };
    });

    module.directive('pnTableTextInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                inputClass: '@',
                placeholder: '@',
                ngModel: '=',
                focusIf: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-table-text-input.html',
            compile: function (element, attrs) {
                var input = $('input', element);

                if (angular.isDefined(attrs.password)) {
                    input.attr('type', 'password');
                } else {
                    input.attr('type', 'text');
                }
            }
        };
    });

    module.directive('pnTableCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                ngModel: '='
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-table-checkbox-input.html'
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-table-edit-delete.html'
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-table-update-cancel.html'
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

})();
