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
    angular.module('jabong.carousel', [])
        .directive('carousel', ['$compile', '$timeout', '$q', '$log',
            function($compile, $timeout, $q, $log) {
                return {
                    restrict: 'AE',
                    scope: {
                        carousel: '=',
                        watch: '='
                    },
                    controller: ['$scope', '$element',
                        function($scope, $element) {
                            var defaults = {
                                nextPrevButton: true,
                                itemPerSlide: 4,
                                pagination: true,
                                numberPagination: false,
                                threshold: 75,
                                delay: 200,
                                fadeAnimation: false,
                                type: 'circular', // circular, nonCircular
                                onSlideStart: function() {},
                                onSlideComplete: function() {}
                            };

                            $scope.options = angular.extend({}, defaults, $scope.carousel);
                            $scope.isSlideAnimating = false;

                            if ($scope.watch) {
                                $scope.$watch('watch', function(newVal, oldVal) {
                                    $scope.init();
                                }, true);
                            } else {
                                $scope.init();
                            }
                        }
                    ],
                    link: function($scope, $element, attrs, controller, transclude) {
                        transclude($scope.$parent, function(clone) {
                            $element.append(clone);
                            $compile(clone)($scope);
                        });

                        var $slides = null,
                            $li = null,
                            $pagination = null,
                            slidesLength = 0,
                            slideWidth = 0,
                            scrollWidth = 0,
                            remainingSlides = 0,
                            paginationCount = 0,
                            currentSlide = 0,
                            activePaginationIndex = 0;

                        function setRemainingSlides() {
                            if ((slidesLength - $scope.options.itemPerSlide) < $scope.options.itemPerSlide) {
                                remainingSlides = (2 * $scope.options.itemPerSlide) - slidesLength;
                            }
                        };

                        function addPagination() {
                            var count = 0;

                            if ($scope.options.pagination) {
                                paginationCount = Math.round(slidesLength / $scope.options.itemPerSlide);

                                if ($scope.options.numberPagination) {
                                    $pagination.show().html((currentSlide + 1) + '/' + paginationCount);
                                } else {
                                    while (count < paginationCount) {
                                        $pagination.append('<span data-id="' + count + '"></span>');
                                        count++;
                                    }

                                    $pagination.show().find('span').eq(0).addClass('active');
                                }
                            }
                        }

                        function updatePagination(direction) {
                            if (direction === 'next') {
                                currentSlide++;
                                currentSlide >= paginationCount ? currentSlide = 0 : '';
                            } else {
                                currentSlide--;
                                currentSlide < 0 ? currentSlide = paginationCount - 1 : '';
                            }

                            if ($scope.options.pagination) {
                                if ($scope.options.numberPagination) {
                                    $pagination.show().html((currentSlide + 1) + '/' + paginationCount);
                                } else {
                                    $pagination.find('span').removeClass('active');
                                    $pagination.find('span').eq(currentSlide).addClass('active');
                                }
                            }
                        };

                        function bindEvents() {
                            $pagination.find('span').on('click', $scope.goToSlide);
                        }

                        $scope.goToSlide = function($event) {
                            var $this = angular.element($event.target),
                                paginationLength = $pagination.find('span').length,
                                slideToGo = $this.attr('data-id'),
                                currentSlideId = $pagination.find('span').eq(currentSlide).attr('data-id'),
                                slidesBetween = 0;

                            if (slideToGo !== currentSlideId) {
                                if (slideToGo > currentSlideId) {
                                    slidesBetween = slideToGo - currentSlideId;

                                    for (var j = 0; j < slidesBetween; j++) {
                                        $scope.next();
                                    }
                                } else {
                                    slidesBetween = currentSlideId - slideToGo;

                                    for (var i = 0; i < slidesBetween; i++) {
                                        $scope.prev();
                                    }
                                }

                                showCurrentSlides();
                            }
                        };

                        function getElementsByClassName(cn, rootNode) {
                            if (!rootNode) {
                                rootNode = document;
                            }
                            for (var r = [], e = rootNode.getElementsByTagName('*'), i = e.length; i--;) {
                                if ((' ' + e[i].className + ' ').indexOf(' ' + cn + ' ') > -1) {
                                    r.push(e[i]);
                                }
                            }
                            return r;
                        }

                        $scope.init = function() {
                            $timeout(function() {
                                angular.element(getElementsByClassName('clone', $element[0])).remove();
                                $slides = $element.find('ul');
                                $li = $slides.find('li');
                                $pagination = $element.find('section').find('div').eq(0);
                                slidesLength = $li.length;
                                slideWidth = $li[0].offsetWidth;
                                scrollWidth = $scope.options.itemPerSlide * slideWidth;

                                $li.removeAttr('style');
                                $pagination.html('');
                                setRemainingSlides();
                                addPagination();
                                bindEvents();
                            }, 0);
                        };

                        $scope.slides = [];

                        function showCurrentSlides() {
                            var deffered = $q.defer(),
                                count = 0;

                            for (var i = 0; i < $scope.options.itemPerSlide; i++) {
                                $slides.find('li').eq(i).animate({
                                    opacity: 1
                                }, {
                                    motion: {
                                        duration: 600,
                                        delay: 50 * (i + 1)
                                    },
                                    done: function() {
                                        count++;

                                        if (count >= $scope.options.itemPerSlide) {
                                            deffered.resolve();
                                        }
                                    }
                                });
                            }

                            return deffered.promise;
                        }

                        function adjustSlides(start, howmany) {
                            console.log('adjustSlides');
                            var elm = null,
                                newelm = null,
                                elmScope = null;

                            for (var i = 1; i <= howmany; i++) {
                                elm = $slides.find('li').eq(start);
                                elmScope = elm.scope();
                                newelm = elm.clone().addClass('clone');

                                elm.remove();
                                $slides.append(newelm);
                            }
                        };

                        $scope.next = function() {
                            if (!$scope.isSlideAnimating) {
                                $scope.isSlideAnimating = true;

                                if (!$scope.options.fadeAnimation) {
                                    if (remainingSlides >= 1) {
                                        for (var i = 0; i < remainingSlides; i++) {
                                            $slides.append($slides.find('li').eq(i).clone(true));
                                        }

                                        $slides.css('width', (slidesLength + remainingSlides + 1) * slideWidth);
                                    }

                                    $slides.css('left', -scrollWidth + 'px').find('li').css({
                                        opacity: 0,
                                        filter: 'alpha(opacity=0)'
                                    });

                                    if (remainingSlides) {
                                        adjustSlides(remainingSlides, $scope.options.itemPerSlide - remainingSlides);

                                        for (var i = 1; i <= remainingSlides; i++) {
                                            $slides.find('li').eq(0).remove();
                                        }
                                    } else {
                                        adjustSlides(0, $scope.options.itemPerSlide);
                                    }

                                    $slides.css('left', '0');
                                }

                                updatePagination('next');
                                showCurrentSlides().then(function() {
                                    $scope.isSlideAnimating = false;
                                });
                            }
                        };

                        $scope.prev = function() {
                            if (!$scope.isSlideAnimating) {
                                $scope.isSlideAnimating = true;

                                if (!$scope.options.fadeAnimation) {
                                    for (var i = 1; i <= $scope.options.itemPerSlide; i++) {
                                        $slides.prepend($slides.find('li').eq(slidesLength - 1).clone(true));
                                    }

                                    $slides.css({
                                        width: (slidesLength + $scope.options.itemPerSlide) * slideWidth,
                                        left: -scrollWidth + 'px'
                                    });

                                    $slides.css('left', '0').find('li').css({
                                        opacity: 0,
                                        filter: 'alpha(opacity=0)'
                                    });

                                    for (var i = 1; i <= $scope.options.itemPerSlide; i++) {
                                        $slides.find('li').eq(slidesLength).remove();
                                    }

                                    $slides.css('width', (slidesLength + 1) * slideWidth);
                                }

                                updatePagination('prev');

                                showCurrentSlides().then(function() {
                                    $scope.isSlideAnimating = false;
                                });
                            }
                        };
                    },
                    transclude: true,
                    replace: true,
                    template: '<section class="jabong-slider"></section>'
                };
            }
        ]);
}));