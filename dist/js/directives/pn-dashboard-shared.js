(function () {

    'use strict';

    var DEFAULT_EVENT_NAMESPACE = '.dashboardshared';

    var module = angular.module('pnDashboardShared');

    module.directive('pnLoading', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {},
            template: '<div class="navbar-fixed-top">' +
                      '    <div class="container container-fluid-spacious">' +
                      '        <div class="alert alert-info text-center center-block text-nowrap" role="alert" style="display: table" ng-transclude></div>' +
                      '    </div>' +
                      '</div>'
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-errors.html'
        };
    });

    module.directive('pnDeleteConfirmation', function () {
        var link = function (scope, iElement, iAttrs, controller, transcludeFn) {
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-delete-confirmation.html',
            link: link
        };
    });

    module.directive('pnConfirmLink', function () {
        var link = function (scope, iElement, iAttrs, controller, transcludeFn) {

            iElement.on('click', function (event) {
                if (!scope.required()) {
                    return;
                }

                if (scope.modalId) {
                    event.preventDefault();

                    var modal = $('#' + scope.modalId),
                        message = $('.message', modal),
                        submit = $('[type=submit]', modal);

                    submit
                        .off('click' + DEFAULT_EVENT_NAMESPACE)
                        .on('click' + DEFAULT_EVENT_NAMESPACE, function () {
                            window.location = iElement.attr('href');
                        });

                    modal
                        .off('keypress' + DEFAULT_EVENT_NAMESPACE)
                        .on('keypress' + DEFAULT_EVENT_NAMESPACE, function (e) {
                            switch (e.keyCode) {
                                case 13:
                                    submit.click();
                                    break;
                                default:
                                    break;
                            }
                        });

                    message.html(scope.message);
                    modal.modal('show');
                } else {
                    if (!window.confirm(scope.message)) {
                        event.preventDefault();
                    }
                }
            });
        };

        return {
            restrict: 'A',
            scope: {
                message: '@',
                modalId: '@',
                required: '&'
            },
            link: link
        };
    });

    module.directive('pnCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                inline: '&',
                label: '@',
                ngModel: '='
            },
            template: '<div class="custom-control custom-checkbox" ng-class="inline() ? \'checkbox-inline\' : \'checkbox\'">' +
                      '    <label>' +
                      '        <input type="checkbox" ng-model="ngModel">' +
                      '        <span class="custom-control-indicator"></span>' +
                      '        {{label}}' +
                      '    </label>' +
                      '</div>'
        };
    });

    module.directive('pnIconTextInput', function () {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput', 'pnInputGroup', 'pnInputGroupAddon'], iAttrs);
        };

        var compile = function (tElement, tAttrs) {
            var input = $('input', tElement);

            PN.assignDirectiveAttrs(input, 'pnInput', tAttrs, false);
            PN.assignDirectiveAttrs($('.input-group', tElement), 'pnInputGroup', tAttrs, false);
            PN.assignDirectiveAttrs($('.input-group-addon', tElement), 'pnInputGroupAddon', tAttrs, false);

            if (angular.isDefined(tAttrs.password)) {
                input.attr('type', 'password');
            } else {
                input.attr('type', 'text');
            }

            return { pre: preLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                leftText: '@',
                rightText: '@',
                leftIcon: '@',
                rightIcon: '@',
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div>' +
                      '    <input class="form-control" ng-model="ngModel" focus-if="focusIf()" ng-hide="leftText || rightText || leftIcon || rightIcon" />' +
                      '    <div class="input-group" ng-show="leftText || rightText || leftIcon || rightIcon">' +
                      '        <span class="input-group-addon" ng-if="leftText || leftIcon">' +
                      '            <span class="icon" ng-if="leftIcon"><span class="{{leftIcon}}"></span></span>' +
                      '            <span class="icon" ng-if="leftText">{{leftText}}</span>' +
                      '        </span>' +
                      '        <input class="form-control" ng-model="ngModel" focus-if="focusIf()" />' +
                      '        <span class="input-group-addon" ng-if="rightText || rightIcon">' +
                      '            <span class="icon" ng-if="rightIcon"><span class="{{rightIcon}}"></span></span>' +
                      '            <span class="icon" ng-if="rightText">{{rightText}}</span>' +
                      '        </span>' +
                      '    </div>' +
                      '</div>',
            compile: compile
        };
    });

    module.directive('pnDateInput', ['$timeout', function ($timeout) {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput'], iAttrs);
        };

        var postLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            var input = $('input', iElement);
            input.datepicker('setUTCDate', scope.ngModel);
            input.datepicker('update');
            input.datepicker()
                 .on('changeDate', function (e) {
                     var date = input.datepicker('getUTCDate');
                     if (date == scope.ngModel ||
                         date && scope.ngModel && date.toString() === scope.ngModel.toString()) {
                         return;
                     }

                     $timeout(function () {
                         scope.ngModel = date;
                     });
                 });
            scope.$watch('ngModel', function () {
                var date = input.datepicker('getUTCDate');
                if (date == scope.ngModel ||
                    date && scope.ngModel && date.toString() === scope.ngModel.toString()) {
                    return;
                }

                input.datepicker('setUTCDate', scope.ngModel);
                input.datepicker('update');
            });
        };

        var compile = function (tElement, tAttrs) {
            PN.assignDirectiveAttrs($('input', tElement), 'pnInput', tAttrs, false);
            return { pre: preLink, post: postLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div class="input-group">' +
                      '    <span class="input-group-addon">' +
                      '        <span class="icon icon-calendar"></span>' +
                      '    </span>' +
                      '    <input type="text" class="form-control" data-provide="datepicker" ng-model="modelAsText" focus-if="focusIf()">' +
                      '</div>',
            compile: compile
        };
    }]);

    module.directive('pnAutoComplete', function () {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput'], iAttrs);
        };

        var postLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            scope.itemsFixed = false;
            scope.items = [];
            scope.model = { selected: null };

            controller.$formatters.push(function (modelValue) {
                return modelValue;
            });

            controller.$parsers.push(function (viewValue) {
                return viewValue;
            });

            scope.$watch('model.selected', function () {
                controller.$setViewValue(scope.model.selected);
            });

            controller.$render = function () {
                scope.model.selected = controller.$viewValue;
            };

            scope.refreshItems = function (search) {
                if (scope.itemsFixed) {
                    return;
                }

                if (search.length < (scope.minSearchLength() || 1)) {
                    scope.items = [];
                    return;
                }

                var factory = scope.factory();
                if (factory) {
                    if ($.isArray(factory)) {
                        scope.items = factory;
                    } else {
                        var token = new Date().valueOf().toString(),
                            queryData = scope.createQueryData({ token: token, search: search }) ||
                                        { token: token, search: search };
                        factory.latestToken = token;

                        factory.query(queryData, function (models, responseHeaders) {
                            if (responseHeaders('fixed')) {
                                scope.itemsFixed = true;
                            } else if (responseHeaders('token') !== factory.latestToken) {
                                return;
                            }

                            scope.items = models;
                        });
                    }
                }
            };

            if (scope.clearOn) {
                scope.$on(scope.clearOn, function () {
                    scope.items = [];
                });
            }
        };

        var compile = function (tElement, tAttrs) {
            var uiSelect = $('ui-select', tElement),
                uiSelectMatch = $('ui-select-match', tElement);

            PN.assignDirectiveAttrs(uiSelect, 'pnInput', tAttrs, false);

            if (angular.isDefined(tAttrs.multiple)) {
                uiSelect.attr('multiple', 'multiple');
            } else {
                uiSelect.attr('reset-search-input', 'false');
            }

            if (angular.isDefined(tAttrs.tagging)) {
                uiSelect.attr('tagging', tAttrs.tagging);
            }

            if (angular.isDefined(tAttrs.allowClear)) {
                uiSelectMatch.attr('allow-clear', tAttrs.allowClear);
            }

            return { pre: preLink, post: postLink };
        };

        return {
            restrict: 'EA',
            require: 'ngModel',
            replace: true,
            transclude: true,
            scope: {
                placeholder: '@',
                taggingLabel: '@',
                focusOn: '@',
                clearOn: '@',
                matchDisplay: '&',
                factory: '&',
                minSearchLength: '&',
                createQueryData: '&'
            },
            template: '<div>' +
                      '    <ui-select ng-model="model.selected" theme="bootstrap" focus-on="{{focusOn}}" clear-on="{{clearOn}}" tagging-label="{{taggingLabel}}">' +
                      '        <ui-select-match placeholder="{{placeholder}}">{{matchDisplay({$select: $select, $item: $item})}}</ui-select-match>' +
                      '        <ui-select-choices repeat="item in items | filter: $select.search" refresh="refreshItems($select.search)" refresh-delay="0">' +
                      '            <div ng-transclude></div>' +
                      '        </ui-select-choices>' +
                      '    </ui-select>' +
                      '</div>',
            compile: compile
        };
    });

    module.directive('pnFlextableTextInput', function () {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput'], iAttrs);
        };

        var compile = function (tElement, tAttrs) {
            var input = $('[pn-icon-text-input]', tElement);

            PN.assignDirectiveAttrs(input, 'pnInput', tAttrs, true);

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
            template: '<div class="flextable-item">' +
                      '    <div pn-icon-text-input ng-model="ngModel" focus-if="focusIf()"></div>' +
                      '</div>',
            compile: compile
        };
    });

    module.directive('pnFlextableCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div class="flextable-item">' +
                      '    <div pn-checkbox-input label="{{label}}" ng-model="ngModel" focus-if="focusIf()"></div>' +
                      '</div>'
        };
    });

    module.directive('pnFlextableDateInput', ['$timeout', function ($timeout) {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput'], iAttrs);
        };

        var compile = function (tElement, tAttrs) {
            PN.assignDirectiveAttrs($('[pn-date-input]', tElement), 'pnInput', tAttrs, true);
            return { pre: preLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div class="flextable-item">' +
                      '    <div pn-date-input ng-model="ngModel" focus-if="focusIf()"></div>' +
                      '</div>',
            compile: compile
        };
    }]);

    module.directive('pnFlextableSubmitReset', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                submitIcon: '@'
            },
            template: '<div class="flextable-item">' +
                      '    <div class="btn-group m-l-0">' +
                      '        <button type="submit" class="btn btn-primary-outline">' +
                      '            <span class="icon" ng-class="submitIcon || \'icon-plus\'"></span>' +
                      '        </button>' +
                      '        <button type="reset" class="btn btn-danger-outline">' +
                      '            <span class="icon icon-cross"></span>' +
                      '        </button>' +
                      '    </div>' +
                      '</div>'
        };
    });

    module.directive('pnHorizontalGroupStaticText', function () {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnDisplay'], iAttrs);
        };

        var compile = function (tElement, tAttrs) {
            PN.assignDirectiveAttrs($('p', tElement), 'pnDisplay', tAttrs, false);
            return { pre: preLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                ngBind: '=pnBind'
            },
            template: '<div class="form-group">' +
                      '    <label class="col-md-2 control-label">{{label}}</label>' +
                      '    <div class="col-md-10">' +
                      '        <p class="form-control-static" ng-bind="ngBind"></p>' +
                      '    </div>' +
                      '</div>',
            compile: compile
        };
    });

    module.directive('pnHorizontalGroupTextInput', function () {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput', 'pnIconTextInput'], iAttrs);
        };

        var postLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            scope.fieldName = new Date().valueOf().toString();
        };

        var compile = function (tElement, tAttrs) {
            var input = $('[pn-icon-text-input]', tElement);

            PN.assignDirectiveAttrs(input, 'pnInput', tAttrs, true);
            PN.assignDirectiveAttrs(input, 'pnIconTextInput', tAttrs, false);

            return { pre: preLink, post: postLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div class="form-group">' +
                      '    <label class="col-md-2 control-label" for="{{fieldName}}">{{label}}</label>' +
                      '    <div class="col-md-10">' +
                      '        <div pn-icon-text-input pn-input-id="{{fieldName}}" ng-model="ngModel" focus-if="focusIf()"></div>' +
                      '    </div>' +
                      '</div>',
            compile: compile
        };
    });

    module.directive('pnHorizontalGroupTextArea', function () {
        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput'], iAttrs);
        };

        var postLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            scope.fieldName = new Date().valueOf().toString();
        };

        var compile = function (tElement, tAttrs) {
            PN.assignDirectiveAttrs($('textarea', tElement), 'pnInput', tAttrs, false);
            return { pre: preLink, post: postLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div class="form-group">' +
                      '    <label class="col-md-2 control-label" for="{{fieldName}}">{{label}}</label>' +
                      '    <div class="col-md-10">' +
                      '        <textarea id="{{fieldName}}" class="form-control" ng-model="ngModel" focus-if="focusIf()" />' +
                      '    </div>' +
                      '</div>',
            compile: compile
        };
    });

    module.directive('pnHorizontalGroupContenteditable', function () {

        var TOOLBAR_TEMPLATE = '\
<div>\
    <div class="buttons">\
        <button type="button" class="btn btn-xs btn-link" data-command="justifyleft"><span class="fa fa-align-left"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="justifycenter"><span class="fa fa-align-center"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="justifyright"><span class="fa fa-align-right"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="justifyfull"><span class="fa fa-align-justify"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="bold"><span class="fa fa-bold"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="italic"><span class="fa fa-italic"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="underline"><span class="fa fa-underline"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="createlink"><span class="fa fa-link"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="unlink"><span class="fa fa-unlink"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="insertImage"><span class="fa fa-photo"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="youtube" data-custom="true"><span class="fa fa-youtube"></span></button>\
        <button type="button" class="btn btn-xs btn-link" data-command="removeformat"><span class="fa fa-eraser"></span></button>\
        <button type="button" class="btn btn-xs btn-link raw-editor-toggler"><span class="fa fa-code"></span></button>\
    </div>\
    <div class="raw-editor">\
        &lt;HTML&gt;\
        <textarea class="form-control" style="min-height: 350px;"></textarea>\
    </div>\
</div>\
';

        var IMAGE_TEMPLATE = '<img class="img-responsive" src="{src}" />';

        var YOUTUBE_TEMPLATE = '\
<div class="embed-responsive embed-responsive-16by9">\
    <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/{src}" allowfullscreen></iframe>\
</div>';

        var preLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            PN.observeDirectiveAttrs(scope, ['pnInput'], iAttrs);
        };

        var postLink = function (scope, iElement, iAttrs, controller, transcludeFn) {
            scope.fieldName = new Date().valueOf().toString();
        };

        var compile = function (tElement, tAttrs) {
            PN.assignDirectiveAttrs($('[contenteditable]', tElement), 'pnInput', tAttrs, false);

            tAttrs.defaultToolbarTemplate = TOOLBAR_TEMPLATE;
            tAttrs.defaultImageTemplate = IMAGE_TEMPLATE;
            tAttrs.defaultYoutubeTemplate = YOUTUBE_TEMPLATE;

            return { pre: preLink, post: postLink };
        };

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                defaultToolbarTemplate: '@',
                defaultImageTemplate: '@',
                defaultYoutubeTemplate: '@',
                toolbarTemplate: '&',
                imageTemplate: '&',
                youtubeTemplate: '&',
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div class="form-group">' +
                      '    <label class="col-md-2 control-label" for="{{fieldName}}">{{label}}</label>' +
                      '    <div class="col-md-10">' +
                      '        <div contenteditable id="{{fieldName}}" class="form-control"' +
                      '             toolbar-template="toolbarTemplate() || defaultToolbarTemplate"' +
                      '             image-template="imageTemplate() || defaultImageTemplate"' +
                      '             youtube-template="youtubeTemplate() || defaultYoutubeTemplate"' +
                      '             ng-model="ngModel" focus-if="focusIf()">' +
                      '    </div>' +
                      '</div>',
            compile: compile
        };
    });

    module.directive('pnHorizontalGroupCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                ngModel: '=',
                focusIf: '&'
            },
            template: '<div class="form-group">' +
                      '    <div class="col-md-offset-2 col-md-10">' +
                      '        <div pn-checkbox-input label="{{label}}" ng-model="ngModel" focus-if="focusIf()"></div>' +
                      '    </div>' +
                      '</div>'
        };
    });

})();
