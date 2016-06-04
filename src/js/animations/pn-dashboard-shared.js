(function () {

    'use strict';

    var module = angular.module('pnDashboardShared');

    module.animation('.pn-animate-fade', function () {
        return {
            addClass: function (element, className, done) {
                element
                    .animate({
                        'opacity': 0
                    }, function () {
                        element.css('opacity', '');
                        done();
                    });
            },

            removeClass: function (element, className, done) {
                element
                    .css('opacity', 0)
                    .animate({
                        'opacity': 1
                    }, function () {
                        element.css('opacity', '');
                        done();
                    });
            }
        };
    });

    module.animation('.pn-animate-height', function () {
        return {
            addClass: function (element, className, done) {
                if (element.is('.pn-animate-height-enable-xs') && findBootstrapBreakpoint() !== 'xs') {
                    done();
                    return;
                }

                element
                    .animate({
                        'opacity': 0,
                        'height': 0
                    }, function () {
                        element.css({
                            'opacity': '',
                            'height': ''
                        });
                        done();
                    });
            },

            removeClass: function (element, className, done) {
                if (element.is('.pn-animate-height-enable-xs') && findBootstrapBreakpoint() !== 'xs') {
                    done();
                    return;
                }

                var opacity = element.css('opacity'),
                    height = element.height();

                element
                    .css({
                        'opacity': 0,
                        'height': 0
                    })
                    .animate({
                        'opacity': opacity,
                        'height': height
                    }, function () {
                        element.css({
                            'opacity': '',
                            'height': ''
                        });
                        done();
                    });
            }
        };
    });

    module.animation('.pn-animate-width', function () {
        return {
            addClass: function (element, className, done) {
                if (element.is('.pn-animate-width-disable-xs') && findBootstrapBreakpoint() === 'xs') {
                    done();
                    return;
                }

                var width = element.width(),
                    wrapper = $('<div></div>').css('width', width);

                element
                    .wrapInner(wrapper)
                    .css({
                        'width': width
                    })
                    .animate({
                        'opacity': 0,
                        'width': 0
                    }, function () {
                        element.css({
                            'opacity': '',
                            'width': ''
                        });
                        element.children().first().children().unwrap();
                        done();
                    });
            },

            removeClass: function (element, className, done) {
                if (element.is('.pn-animate-width-disable-xs') && findBootstrapBreakpoint() === 'xs') {
                    done();
                    return;
                }

                var opacity = element.css('opacity'),
                    width = element.width(),
                    wrapper = $('<div></div>').css('width', width);

                element
                    .wrapInner(wrapper)
                    .css({
                        'opacity': 0,
                        'width': 0
                    })
                    .animate({
                        'opacity': opacity,
                        'width': width
                    }, function () {
                        element.css({
                            'opacity': '',
                            'width': ''
                        });
                        element.children().first().children().unwrap();
                        done();
                    });
            }
        };
    });

    module.animation('.pn-animate-rotate', function () {
        return {
            addClass: function (element, className, done) {
                var values = className.split('-'),
                    rotation = Number(values[1]) * (values.length > 2 && values[2] === 'c' ? -1 : 1);

                element
                    .css('display', 'inline-block')
                    .rotate({
                        angle: 0,
                        animateTo: rotation,
                        callback: done
                    });
            },

            removeClass: function (element, className, done) {
                var values = className.split('-'),
                    rotation = Number(values[1]) * (values.length > 2 && values[2] === 'c' ? -1 : 1);

                element.css('display', 'inline-block');
                element.rotate({
                    angle: rotation,
                    animateTo: 0,
                    callback: function () {
                        element.css('display', '');
                        done();
                    }
                });
            }
        };
    });

    function findBootstrapBreakpoint() {
        var breakpoints = ['xs', 'sm', 'md', 'lg'];

        var $el = $('<div>');
        $el.appendTo($('body'));

        for (var i = breakpoints.length - 1; i >= 0; i--) {
            var breakpoint = breakpoints[i];

            $el.addClass('hidden-' + breakpoint);
            if ($el.is(':hidden')) {
                $el.remove();
                return breakpoint;
            }
        }
    }

})();
