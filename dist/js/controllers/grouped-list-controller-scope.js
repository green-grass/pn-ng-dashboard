(function () {

    'use strict';

    PN.namespace('PN.AngularDashboard.List');

    PN.AngularDashboard.List.GroupedListControllerScope = PN.AngularDashboard.List.ListControllerScope.extend({
        groupResourceUrl: '',
        groupWithItemsResourceUrl: '',
        scopeData: { groupId: null },
        groups: [],
        groupsWithItems: [],

        init: function ($scope, factory, $filter, $resource) {
            this._super($scope, factory, $filter);

            $scope.$watch('scopeData.groupId', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.showLoading = true;
                    $scope._loadModels();
                }
            });

            $scope.$watch('models', function (newValue, oldValue) {
                $scope._loadGroupsWithItems($resource);
            });

            $resource($scope.groupResourceUrl).query(function (groups) {
                $scope.groups = groups;
            });

            $scope._loadGroupsWithItems($resource);
        },

        _loadGroupsWithItems: function ($resource) {
            var that = this;
            $resource(this.groupWithItemsResourceUrl).query(function (groups) {
                that.groupsWithItems = groups;
                //if (that.scopeData.groupId === null && that.groupsWithItems.length > 0) {
                //    that.scopeData.groupId = that.groupsWithItems[0].Id;
                //}
            });
        },

        _createQueryData: function () {
            var data = this._super();
            data.groupId = this.scopeData.groupId;
            return data;
        }
    });

})();
