(function () {

    'use strict';

    PN.namespace('PN.AngularDashboard.List');

    PN.AngularDashboard.List.GroupedListControllerScope = PN.AngularDashboard.List.ListControllerScope.extend({
        scopeData: { groupId: null },
        groups: [],
        groupsWithItems: [],

        init: function ($scope, factory, $filter, groupFactory, groupWithItemsFactory) {
            this._super($scope, factory, $filter);

            $scope.$watch('scopeData.groupId', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.showLoading = true;
                    $scope._loadModels();
                    $scope.$broadcast('GroupChanged');
                }
            });

            $scope.$watch('models', function (newValue, oldValue) {
                $scope._loadGroupsWithItems(groupWithItemsFactory);
            });

            groupFactory.query(function (groups) {
                $scope.groups = groups;
            });

            $scope._loadGroupsWithItems(groupWithItemsFactory);
        },

        _loadGroupsWithItems: function (resource) {
            var that = this;
            resource.query(function (groups) {
                that.groupsWithItems = groups;
                //if (that.scopeData.groupId === null && that.groupsWithItems.length > 0) {
                //    that.scopeData.groupId = that.groupsWithItems[0].Id;
                //}
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
