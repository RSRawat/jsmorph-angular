;
(function(global, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return factory();
        });
    } else {
        factory();
    }

}(typeof window !== undefined ? window : this, function() {
    var _defaults = {
        motion: {
            duration: 500,
            delay: 0,
            speed: 1,
            doEnd: true
        },
        easing: null,
        start: function(initProp, dims) {},
        step: function(obj, objStyle, time, frames, objSpeed, jsMorphSpeed, easeingFunction, objCssText) {},
        done: function(obj, time, frames, objSpeed, jsMorphSpeed, objCssText) {}
    };

    function _animate(element, properties, options) {
        options = angular.extend({}, _defaults, options);

        options.done = (function(callback) {
            return function(obj, time, frames, objSpeed, jsMorphSpeed, objCssText) {
                if (angular.isFunction(callback)) {
                    setTimeout(function() {
                        callback(obj, time, frames, objSpeed, jsMorphSpeed, objCssText);
                    }, 5);
                }
            }
        }(options.done));

        if (properties) {
            new jsMorph(element, properties, options.motion, options.easing, options.start, options.step, options.done).start();
        }
    }

    function _css(element, styles) {
        angular.forEach(styles, function(value, key) {
            element.style[key] = value;
        });
    }

    function _done(callback, css) {
        return function(obj, time, frames, objSpeed, jsMorphSpeed, objCssText) {
            _css(obj, css);

            if (angular.isFunction(callback)) {
                callback(obj, time, frames, objSpeed, jsMorphSpeed, objCssText);
            }
        };
    }

    function _step(callback, stepFunction) {
        return function(obj, objStyle, time, frames, objSpeed, jsMorphSpeed, easeingFunction, objCssText) {

            stepFunction(obj, easeingFunction);

            if (angular.isFunction(callback)) {
                callback(obj, objStyle, time, frames, objSpeed, jsMorphSpeed, easeingFunction, objCssText);
            }
        }
    }

    angular.forEach({
        animate: _animate,
        slideDown: function(element, options) {
            var elmHeight = 0;

            _css(element, {
                overflow: 'hidden',
                display: 'inherit'
            });

            elmHeight = element.offsetHeight;

            _css(element, {
                height: 0
            });

            options.done = _done(options.done, {
                overflow: 'inherit',
                height: null
            });

            _animate(element, {
                height: elmHeight + 'px'
            }, options);
        },
        slideUp: function(element, options) {
            _css(element, {
                overflow: 'hidden'
            });

            options.done = _done(options.done, {
                display: 'none',
                overflow: 'inherit',
                height: null
            });

            _animate(element, {
                height: '0px'
            }, options);
        },
        fadeIn: function(element, options) {
            _css(element, {
                opacity: 0,
                filter: 'alpha(opacity=10)',
                display: 'inherit'
            });

            options.step = _step(options.step, function(obj, easeingFunction) {
                _css(obj, {
                    filter: 'alpha(opacity=' + (easeingFunction * 100) + ')'
                });
            });

            _animate(element, {
                opacity: 1
            }, options);
        },
        fadeOut: function(element, options) {
            options.step = _step(options.step, function(obj, easeingFunction) {
                _css(obj, {
                    filter: 'alpha(opacity=' + (100 - (easeingFunction * 100)) + ')'
                });
            });

            options.done = _done(options.done, {
                opacity: null,
                filter: null,
                display: 'none'
            });

            _animate(element, {
                opacity: 0
            }, options);
        },
        show: function(element, options) {
            var elmWidth = 0,
                elmHeight = 0,
                _options = {
                    motion: {}
                };

            _css(element, {
                display: 'inherit',
                overflow: 'hidden'
            });

            if (options) {
                if (typeof options === 'string') {
                    if (options === 'slow') {
                        _options.motion.duration = 1500;
                    } else if (options === 'medium') {
                        _options.motion.duration = 500;
                    } else if (options === 'fast') {
                        _options.motion.duration = 200;
                    }
                } else if (typeof options === 'number') {
                    _options.motion.duration = options;
                }

                options.step = _step(options.step, function(obj, easeingFunction) {
                    _css(obj, {
                        filter: 'alpha(opacity=' + (easeingFunction * 100) + ')'
                    });
                });

                elmWidth = element.offsetWidth;
                elmHeight = element.offsetHeight;

                _css(element, {
                    height: 0,
                    width: 0,
                    opacity: 0,
                    filter: 'alpha(opacity=0)'
                });

                options.done = _done(options.done, {
                    height: null,
                    width: null,
                    opacity: null,
                    filter: null
                });

                _animate(element, {
                    width: elmWidth + 'px',
                    height: elmHeight + 'px',
                    opacity: 1
                }, options);
            }
        },
        hide: function(element, options) {
            var _options = {
                motion: {}
            };

            if (!options) {
                _css(element, {
                    display: 'none'
                });
            } else {
                if (typeof options === 'string') {
                    if (options === 'slow') {
                        _options.motion.duration = 1500;
                    } else if (options === 'medium') {
                        _options.motion.duration = 900;
                    } else if (options === 'fast') {
                        _options.motion.duration = 400;
                    }
                } else if (typeof options === 'number') {
                    _options.motion.duration = options;
                }

                _css(element, {
                    display: 'inherit',
                    opacity: 1,
                    filter: 'alpha(opacity=100)',
                    overflow: 'hidden'
                });

                options.step = _step(options.step, function(obj, easeingFunction) {
                    _css(obj, {
                        filter: 'alpha(opacity=' + (100 - (easeingFunction * 100)) + ')'
                    });
                });

                options.done = _done(options.done, {
                    width: '',
                    height: '',
                    overflow: '',
                    opacity: '',
                    filter: '',
                    display: 'none'
                });

                _animate(element, {
                    width: '0px',
                    height: '0px',
                    opacity: 0
                }, options);
            }
        }
    }, function(fn, name) {
        var jqLite = angular.element;

        jqLite.prototype[name] = function() {
            var value;

            for (var i = 0; i < this.length; i++) {
                if (value === undefined) {
                    Array.prototype.unshift.call(arguments, this[i]);
                    value = fn.apply(null, arguments);
                }
            }

            return value === undefined ? this : value;
        };
    });
}));