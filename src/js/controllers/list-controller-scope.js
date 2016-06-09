(function () {

    'use strict';

    PN.namespace('PN.AngularDashboard.List');

    PN.AngularDashboard.List.ListControllerScope = PN.AngularDashboard.ControllerScope.extend({
        _factory: null,
        _$filter: null,

        locale: {},
        errorMessage: '',
        errors: [],
        showLoading: false,
        models: [],
        totalCount: 0,
        filteredCount: 0,
        search: '',
        searchFilter: '',
        showAddForm: false,
        focusAddFormInput: true,
        addFormRendered: false,
        newModel: {},
        editModel: {},
        deleteConfirmationModalAccessor: {},
        deleteConfirmingModel: {},
        sortExpression: null,
        sortReverse: false,

        init: function ($scope, factory, $filter) {
            this._factory = factory;
            this._$filter = $filter;

            this._super($scope);

            if ($scope.search) {
                $scope._performSearch($scope.search);
            }

            $scope.$watch('search', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope._performSearch(newValue);
                }
            });

            $scope._resetNewModel();
            $scope.showLoading = true;
            $scope._loadModels();
        },

        __add: function (model) {
            this.focusAddFormInput = false;
            this.clearErrors();

            var that = this,
                newModel = new this._factory(this._prepareModelForAdding(model));

            newModel.$save(function (respond) {
                if (respond.Result.Succeeded) {
                    that.focusAddFormInput = true;
                    that._resetNewModel();
                    that._loadModels();
                } else {
                    that._displayErrors(that.locale.CreateError, respond);
                }
            });
        },

        __edit: function (model) {
            this.editModel = $.extend({}, model);
        },

        __update: function (model, currentModel) {
            this.clearErrors();

            var that = this,
                newModel = new this._factory(model);

            newModel.$save(function (respond) {
                if (respond.Result.Succeeded) {
                    $.extend(currentModel, model);
                    that.editModel = {};
                    that._loadModels();
                } else {
                    that._displayErrors(that.locale.UpdateError, respond);
                }
            });
        },

        __cancelUpdate: function () {
            this.clearErrors();
            this.editModel = {};
        },

        __confirmDelete: function (model) {
            this.deleteConfirmingModel = model;
            this.deleteConfirmationModalAccessor.show();
        },

        __delete: function (model) {
            this.clearErrors();

            var that = this;
            model.$delete(function (respond) {
                if (!respond.Result.Succeeded) {
                    that._displayErrors(that.locale.DeleteError, respond);
                }
                that._loadModels();
            });
        },

        __sort: function (expression, reverse) {
            this.sortExpression = expression;
            this.sortReverse = reverse;
            this.models = this._$filter('orderBy')(this.models, expression, reverse);
        },

        __clearErrors: function () {
            this.errorMessage = '';
            this.errors = [];
        },

        __onToggleAdForm: function () {
            this.focusAddFormInput = this.showAddForm = !this.showAddForm;
            this.addFormRendered = true;
        },

        __onEditorKeydown: function (e, model) {
            switch (e.keyCode) {
                case 13:
                    this.update(this.editModel, model);
                    e.preventDefault();
                    break;
                case 27:
                    this.cancelUpdate();
                    e.preventDefault();
                    break;
                default:
                    break;
            }
        },

        __onDeleteConfirmationModalClose: function () {
            this.deleteConfirmingModel = {};
        },

        _displayErrors: function (message, respond) {
            this.errorMessage = message;
            this.errors = respond.Result.Errors;
        },

        _loadModels: function () {
            this.focusAddFormInput = false;

            var that = this;

            this._factory.query(this._createQueryData(), function (models, responseHeaders) {
                var returnedToken = responseHeaders('token');
                if (returnedToken !== that._factory.latestToken) {
                    return;
                }

                that.showLoading = false;
                that.models = that._$filter('orderBy')(models, that.sortExpression, that.sortReverse);
                that.totalCount = models.length;
                that.filteredCount = that._$filter('search')(that.models, that.searchFilter).length;
                if (that.totalCount === 0) {
                    that.focusAddFormInput = that.showAddForm = true;
                    that.addFormRendered = true;
                }
            });
        },

        _createQueryData: function () {
            var token = new Date().valueOf().toString();
            this._factory.latestToken = token;
            return {
                token: token
            };
        },

        _performSearch: function (search) {
            this.searchFilter = search;
            this.filteredCount = this._$filter('search')(this.models, this.searchFilter).length;
        },

        _resetNewModel: function () {
            this.newModel = {};
        },

        _prepareModelForAdding: function (model) {
            return model;
        }
    });

})();
