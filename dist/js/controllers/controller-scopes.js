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

    PN.AngularDashboard.BackEndDataControllerScope = PN.AngularDashboard.ControllerScope.extend({
        _factory: null,

        locale: {},
        errorMessage: '',
        errors: [],
        showLoading: false,
        showSaving: false,

        init: function ($scope, factory) {
            this._factory = factory;

            this._super($scope);
        },

        __clearErrors: function () {
            this.errorMessage = '';
            this.errors = [];
        },

        _displayErrors: function (message, respond) {
            this.errorMessage = message;
            this.errors = respond.result.errors;
        },

        _createQueryData: function () {
            var token = new Date().valueOf().toString();
            this._factory.latestToken = token;
            return {
                token: token
            };
        },

        _prepareModelForUpdating: function (model) {
            return model;
        }
    });

    PN.namespace('PN.AngularDashboard.Edit');

    PN.AngularDashboard.Edit.EditControllerScopeBase = PN.AngularDashboard.BackEndDataControllerScope.extend({
        model: {},

        __save: function (model) {
            this.clearErrors();
            this.showSaving = true;

            var that = this,
                newModel = this._prepareModelForUpdating(new this._factory(model));

            newModel.$save(function (respond) {
                that.showSaving = false;
                if (respond.result.succeeded) {
                    that._loadModel();
                } else {
                    that._displayErrors(that.locale.updateError, respond);
                }
            });
        },

        _loadModel: function () {
            var that = this;

            this._factory.get(this._createQueryData(), function (model, responseHeaders) {
                var returnedToken = responseHeaders('token');
                if (returnedToken !== that._factory.latestToken) {
                    return;
                }

                model = that._prepareModelForDisplaying(model);

                that.showLoading = false;
                that.model = model;
            });
        },

        _prepareModelForDisplaying: function (model) {
            return model;
        }
    });

    PN.AngularDashboard.Edit.SingleEditControllerScope = PN.AngularDashboard.Edit.EditControllerScopeBase.extend({
        model: {},

        init: function ($scope, factory) {
            this._super($scope, factory);

            $scope._loadModel();
        }
    });

    PN.AngularDashboard.Edit.MultipleEditControllerScope = PN.AngularDashboard.Edit.EditControllerScopeBase.extend({
        showRedirecting: false,
        scopeData: {
            modelId: null,
            listUrl: null
        },
        deleteConfirmationModalAccessor: {},

        init: function ($scope, factory) {
            this._super($scope, factory);

            $scope.$watch('scopeData.modelId', function (newValue, oldValue) {
                if (newValue !== null) {
                    $scope.showLoading = true;
                    $scope._loadModel();
                }
            });
        },

        __confirmDelete: function () {
            this.deleteConfirmationModalAccessor.show();
        },

        __delete: function () {
            this.clearErrors();

            var that = this;
            this.model.$delete(function (respond) {
                if (respond.result.succeeded) {
                    that.showRedirecting = true;
                    window.location = that.scopeData.listUrl;
                } else {
                    that._displayErrors(that.locale.deleteError, respond);
                }
            });
        },

        _createQueryData: function () {
            var data = this._super();
            data.id = this.scopeData.modelId;
            return data;
        }
    });

    PN.namespace('PN.AngularDashboard.List');

    PN.AngularDashboard.List.ListControllerScope = PN.AngularDashboard.BackEndDataControllerScope.extend({
        _$filter: null,

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
            this._$filter = $filter;

            this._super($scope, factory);

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
            this.showSaving = true;

            var that = this,
                newModel = this._prepareModelForAdding(new this._factory(model));

            newModel.$save(function (respond) {
                that.showSaving = false;
                if (respond.result.succeeded) {
                    that.focusAddFormInput = true;
                    that._resetNewModel();
                    that._loadModels();
                } else {
                    that._displayErrors(that.locale.createError, respond);
                }
            });
        },

        __edit: function (model) {
            this.editModel = $.extend({}, model);
        },

        __update: function (model, currentModel) {
            this.clearErrors();
            this.showSaving = true;

            var that = this,
                newModel = this._prepareModelForUpdating(new this._factory(model));

            newModel.$save(function (respond) {
                that.showSaving = false;
                if (respond.result.succeeded) {
                    $.extend(currentModel, model);
                    that.editModel = {};
                    that._loadModels();
                } else {
                    that._displayErrors(that.locale.updateError, respond);
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
            this.showSaving = true;

            var that = this;
            model.$delete(function (respond) {
                that.showSaving = false;
                if (!respond.result.succeeded) {
                    that._displayErrors(that.locale.deleteError, respond);
                }
                that._loadModels();
            });
        },

        __sort: function (expression, reverse) {
            this.sortExpression = expression;
            this.sortReverse = reverse;
            this.models = this._$filter('orderBy')(this.models, expression, reverse);
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

        _loadModels: function () {
            this.focusAddFormInput = false;

            var that = this;

            this._factory.query(this._createQueryData(), function (models, responseHeaders) {
                var returnedToken = responseHeaders('token');
                if (returnedToken !== that._factory.latestToken) {
                    return;
                }

                models = that._prepareModelsForDisplaying(models);

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

        _performSearch: function (search) {
            this.searchFilter = search;
            this.filteredCount = this._$filter('search')(this.models, this.searchFilter).length;
        },

        _resetNewModel: function () {
            this.newModel = {};
            this.$broadcast('NewModelReset');
        },

        _prepareModelsForDisplaying: function (models) {
            return models;
        },

        _prepareModelForAdding: function (model) {
            return model;
        }
    });

    PN.AngularDashboard.List.PagedListControllerScope = PN.AngularDashboard.List.ListControllerScope.extend({
        _$timeout: null,

        pageSize: 30,
        pageNumber: 1,
        pageCount: 1,
        maxPageLength: 11,
        showPaginationUtilities: false,
        performSearchTimeoutPromise: null,

        init: function ($scope, factory, $filter, $timeout) {
            this._$timeout = $timeout;
            this._super($scope, factory, $filter);

            $scope.$watch('pageNumber', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.showLoading = true;
                    $scope._loadModels();
                    window.scrollTo(0, 0);
                }
            });

            $scope.$watch('pageSize', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    if ($scope.pageNumber === 1) {
                        $scope.showLoading = true;
                        $scope._loadModels();
                        window.scrollTo(0, 0);
                    } else {
                        $scope.pageNumber = 1;
                    }
                }
            });
        },

        __sort: function (expression, reverse) {
            this.sortExpression = expression;
            this.sortReverse = reverse;
            this.pageNumber = 1;
            this.showLoading = true;
            this._loadModels();
        },

        _loadModels: function () {
            this.focusAddFormInput = false;

            var that = this,
                token = new Date().valueOf().toString();

            this._factory.latestToken = token;
            this._factory.query(this._createQueryData(), function (models, responseHeaders) {
                var returnedToken = responseHeaders('token');
                if (returnedToken !== that._factory.latestToken) {
                    return;
                }

                models = that._prepareModelsForDisplaying(models);

                that.showLoading = false;
                that.models = models;
                that.totalCount = Number(responseHeaders('total-count'));
                that.filteredCount = Number(responseHeaders('filtered-count'));
                that.pageCount = Math.max(Math.ceil(that.filteredCount / that.pageSize), 1);
                if (that.totalCount === 0) {
                    that.showAddForm = true;
                    that.focusAddFormInput = true;
                }
            });
        },

        _createQueryData: function () {
            var token = new Date().valueOf().toString();
            this._factory.latestToken = token;
            return {
                token: token,
                search: this.search,
                pageNumber: this.pageNumber,
                pageSize: this.pageSize,
                sort: this.sortExpression,
                reverse: this.sortReverse,
            };
        },

        _performSearch: function (search) {
            if (this.performSearchTimeoutPromise !== null) {
                this._$timeout.cancel(this.performSearchTimeoutPromise);
            }

            var that = this;
            this.performSearchTimeoutPromise = this._$timeout(function () {
                that.performSearchTimeoutPromise = null;
                that.pageNumber = 1;
                that.showLoading = true;
                that._loadModels();
            }, 500);
        }
    });

    PN.AngularDashboard.List.GroupedListControllerScope = PN.AngularDashboard.List.ListControllerScope.extend({
        groupFactory: null,
        scopeData: {
            groupId: null,
            group: {}
        },
        groups: [],
        groupsWithItems: [],

        init: function ($scope, factory, $filter, groupFactory, groupWithItemsFactory, preloadGroups) {
            this.groupFactory = groupFactory;
            this._super($scope, factory, $filter);

            $scope.$watch('scopeData.groupId', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.showLoading = true;
                    $scope._loadModels();
                    $scope.$broadcast('GroupChanged');
                }
            });

            $scope.$watch('scopeData.group', function (newValue, oldValue) {
                $scope.scopeData.groupId = newValue ? newValue.id : null;
            });

            if (groupWithItemsFactory) {
                $scope.$watch('models', function (newValue, oldValue) {
                    if ((newValue.length === 0 || oldValue.length === 0) && newValue.length !== oldValue.length) {
                        $scope._loadGroupsWithItems(groupWithItemsFactory);
                    }
                });
            }

            if (preloadGroups) {
                groupFactory.query(function (groups) {
                    $scope.groups = groups;
                });
            }

            if (groupWithItemsFactory) {
                $scope._loadGroupsWithItems(groupWithItemsFactory);
            }
        },

        _loadGroupsWithItems: function (resource) {
            var that = this;
            resource.query(function (groups) {
                that.groupsWithItems = groups;
            });
        },

        _loadModels: function () {
            if (this.scopeData.groupId) {
                this._super();
            } else {
                this.showLoading = false;
                this.models = [];
                this.totalCount = 0;
                this.filteredCount = 0;
                this.focusAddFormInput = this.showAddForm = true;
                this.addFormRendered = true;
            }
        },

        _createQueryData: function () {
            var data = this._super();
            data.groupId = this.scopeData.groupId;
            return data;
        }
    });

})();
