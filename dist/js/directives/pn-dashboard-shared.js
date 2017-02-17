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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-loading.html'
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-delete-confirmation.html',
            link: link
        };
    });

    module.directive('pnConfirmLink', function () {
        var link = function (scope, element, attrs) {

            element.on('click', function (event) {
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
                            window.location = element.attr('href');
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-checkbox-input.html'
        };
    });

    module.directive('pnAutoComplete', function () {
        var link = function (scope, element, attrs, controller) {
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

        var compile = function (element, attrs) {
            var uiSelect = $('ui-select', element),
                uiSelectMatch = $('ui-select-match', element);

            if (angular.isDefined(attrs.multiple)) {
                uiSelect.attr('multiple', 'multiple');
            } else {
                uiSelect.attr('reset-search-input', 'false');
            }

            if (angular.isDefined(attrs.tagging)) {
                uiSelect.attr('tagging', attrs.tagging);
            }

            if (angular.isDefined(attrs.allowClear)) {
                uiSelectMatch.attr('allow-clear', attrs.allowClear);
            }

            return link;
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
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-auto-complete.html',
            compile: compile
        };
    });

    module.directive('pnHorizontalGroupStaticText', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                displayClass: '@',
                ngBind: '=pnBind'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-horizontal-group-static-text.html'
        };
    });

    module.directive('pnHorizontalGroupTextInput', function () {
        var link = function (scope) {
            scope.fieldName = new Date().valueOf().toString();
        };

        var compile = function (element, attrs) {
            var input = $('input', element);

            $.each(attrs.$attr, function (key, attr) {
                if (key.startsWith('pnInput')) {
                    var dashedKey = key.replace(/\W+/g, '-')
                                       .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                                       .toLowerCase();
                    input.attr(dashedKey.substr('pn-input-'.length), attrs[key])
                }
            });

            return link;
        }

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                inputClass: '@',
                icon: '@',
                ngModel: '=',
                focusIf: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-horizontal-group-text-input.html',
            compile: compile
        };
    });

    module.directive('pnHorizontalGroupTextArea', function () {
        var link = function (scope) {
            scope.fieldName = new Date().valueOf().toString();
        };

        var compile = function (element, attrs) {
            var input = $('textarea', element);

            $.each(attrs.$attr, function (key, attr) {
                if (key.startsWith('pnInput')) {
                    var dashedKey = key.replace(/\W+/g, '-')
                                       .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                                       .toLowerCase();
                    input.attr(dashedKey.substr('pn-input-'.length), attrs[key])
                }
            });

            return link;
        }

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                inputClass: '@',
                ngModel: '=',
                focusIf: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-horizontal-group-text-area.html',
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

        var link = function (scope) {
            scope.fieldName = new Date().valueOf().toString();
        };

        var compile = function (element, attrs) {
            var contenteditable = $('[contenteditable]', element);

            attrs.defaultToolbarTemplate = TOOLBAR_TEMPLATE;
            attrs.defaultImageTemplate = IMAGE_TEMPLATE;
            attrs.defaultYoutubeTemplate = YOUTUBE_TEMPLATE;

            $.each(['placeholder', 'preserve', 'ignoreBr', 'uncensored', 'singleLine', 'noHtml', 'hasToolbar'], function (index, attr) {
                if (angular.isDefined(attrs[attr])) {
                    var dashedAttr = attr.replace(/\W+/g, '-')
                                         .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                                         .toLowerCase();
                    contenteditable.attr(dashedAttr, attrs[attr]);
                }
            });

            return link;
        }

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                inputClass: '@',
                defaultToolbarTemplate: '@',
                defaultImageTemplate: '@',
                defaultYoutubeTemplate: '@',
                toolbarTemplate: '&',
                imageTemplate: '&',
                youtubeTemplate: '&',
                ngModel: '=',
                focusIf: '&'
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-horizontal-group-contenteditable.html',
            compile: compile
        };
    });

    module.directive('pnHorizontalGroupCheckboxInput', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                label: '@',
                ngModel: '='
            },
            templateUrl: '/assets/_vendors/pn-ng-dashboard/dist/templates/pn-horizontal-group-checkbox-input.html'
        };
    });

})();
