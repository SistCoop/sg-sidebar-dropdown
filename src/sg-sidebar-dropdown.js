(function(){

    var module = angular.module('sgSidebarDropdown', ['RecursionHelper']);

    module.directive('sgSidebarDropdown', ['RecursionHelper',
        function(RecursionHelper) {
            return {
                restrict: 'EA',
                transclude: true,
                scope: {
                    item: '='
                },
                replace: true,
                template:
                    '<li ui-sref-active="active" ng-class="{\'has-sub\' : item.menuItems.length}">' +
                    '<script type="text/ng-template" id="menu-item-link-tpl">' +
                    '<i ng-if="item.icon" class="{{item.icon}}"></i>' +
                    '<span class="title">{{item.title}}</span>' +
                    '<span ng-if="item.label" class="label label-{{item.label.classname}} pull-right" ng-class="{\'hidden-collapsed\': item.label.collapsedHide}">{{item.label.text}}</span>' +
                    '</script>' +

                    '<a href ng-if="item.link" ui-sref="{{item.link}}" ng-include="\'menu-item-link-tpl\'"></a>' +
                    '<a href ng-if="!item.link" sg-sidebar-dropdown-toggle ng-include="\'menu-item-link-tpl\'"></a>' +
                    '<ul ng-if="item.menuItems.length" sg-sidebar-dropdown-toggled>' +
                    '<sg-sidebar-dropdown open-class="expanded" item="subItem" ng-repeat="subItem in item.menuItems"></sg-sidebar-dropdown>' +
                    '</ul>' +
                    '</li>'
                ,
                controller: function($scope, $attrs, $parse, $animate){

                    var self = this;
                    var scope = $scope.$new(); // create a child scope so we are not polluting original one
                    var openClass = $attrs.openClass;
                    var setIsOpen = angular.noop;
                    var toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

                    this.init = function( element ) {
                        self.$element = element;
                    };

                    this.toggle = function( open ) {
                        return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
                    };

                    // Allow other directives to watch status
                    this.isOpen = function() {
                        return scope.isOpen;
                    };

                    scope.getToggleElement = function() {
                        return self.toggleElement;
                    };

                    scope.focusToggleElement = function() {
                        if ( self.toggleElement ) {
                            self.toggleElement[0].focus();
                        }
                    };

                    scope.$watch('isOpen', function( isOpen, wasOpen ) {

                        $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

                        if ( isOpen ) {
                            scope.focusToggleElement();
                            self.toggledElement.addClass('is-visible');
                            self.toggledElement.css('display', 'block');
                        } else {
                            if(self.toggledElement){
                                self.toggledElement.removeClass('is-visible');
                                self.toggledElement.css('display', 'none');
                            }
                        }

                        setIsOpen($scope, isOpen);
                        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                            toggleInvoker($scope, { open: !!isOpen });
                        }

                    });

                    $scope.$on('$locationChangeSuccess', function() {
                        if($scope.closeMode)
                        {
                            scope.isOpen = false;
                        }
                    });

                    $scope.$on('$destroy', function() {
                        scope.$destroy();
                    });

                },
                compile: function(element) {
                    return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){
                        controller.init( iElement );
                    });
                }
            };
        }
    ]);

    module.directive('sgSidebarDropdownToggle', function() {
        return {
            require: '?^sgSidebarDropdown',
            link: function(scope, element, attrs, sidebarDropdownCtrl) {

                if ( !sidebarDropdownCtrl ) {
                    return;
                }

                sidebarDropdownCtrl.toggleElement = element;

                var toggleDropdown = function(event) {
                    event.preventDefault();

                    if ( !element.hasClass('disabled') && !attrs.disabled ) {
                        scope.$apply(function() {
                            sidebarDropdownCtrl.toggle();
                        });
                    }
                };

                element.bind('click', toggleDropdown);

                // WAI-ARIA
                element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
                scope.$watch(sidebarDropdownCtrl.isOpen, function( isOpen ) {
                    element.attr('aria-expanded', !!isOpen);
                });

                scope.$on('$destroy', function() {
                    element.unbind('click', toggleDropdown);
                });
            }
        };
    });

    module.directive('sgSidebarDropdownToggled', function() {
        return {
            require: '?^sgSidebarDropdown',
            link: function(scope, element, attrs, sidebarDropdownCtrl) {

                if ( !sidebarDropdownCtrl ) {
                    return;
                }

                sidebarDropdownCtrl.toggledElement = element;

            }
        };
    });

})();