(function () {

    'use strict';

    PN.namespace('PN.AngularDashboard.List');

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
