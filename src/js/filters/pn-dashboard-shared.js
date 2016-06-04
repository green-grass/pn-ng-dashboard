(function () {

    'use strict';

    var module = angular.module('pnDashboardShared');

    module.filter("range", function () {
        return function (input, total) {
            total = parseInt(total);

            for (var i = 0; i < total; i++) {
                input.push(i);
            }

            return input;
        };
    });

    module.filter("pageRange", function () {
        var lastPageCount = null,
            lastMaxPageLength = null,
            lastCurrentPage = null,
            pageList = [];

        return function (input, pageCount, maxPageLength, currentPage) {
            pageCount = parseInt(pageCount);

            if (pageCount !== lastPageCount || maxPageLength !== lastMaxPageLength || currentPage !== lastCurrentPage) {
                lastPageCount = pageCount;
                lastMaxPageLength = maxPageLength;
                lastCurrentPage = currentPage;
                pageList = [];

                pageCount = parseInt(pageCount);

                if (!maxPageLength || pageCount <= parseInt(maxPageLength)) {
                    for (var i = 0; i < pageCount; i++) {
                        pageList.push({
                            value: i + 1,
                            text: (i + 1).toString()
                        });
                    }
                } else {
                    maxPageLength = parseInt(maxPageLength);
                    currentPage = parseInt(currentPage);

                    if (currentPage < 1) {
                        currentPage = 1;
                    } else if (currentPage > pageCount) {
                        currentPage = pageCount;
                    }

                    var startPage = currentPage - Math.floor(maxPageLength / 2);
                    if (startPage < 1) {
                        startPage = 1;
                    } else if (startPage + maxPageLength - 1 > pageCount) {
                        startPage = pageCount - maxPageLength + 1;
                    }

                    for (var i = 0; i < maxPageLength; i++) {
                        pageList.push({
                            value: startPage + i,
                            text: (startPage + i).toString()
                        });
                    }

                    if (pageList[0].value > 1) {
                        pageList.splice(0, 0, {
                            value: pageList[0].value - 1,
                            text: '...'
                        });
                    }
                    if (pageList[pageList.length - 1].value < pageCount) {
                        pageList.push({
                            value: pageList[pageList.length - 1].value + 1,
                            text: '...'
                        });
                    }
                }
            }

            return pageList;
        }
    });

})();
