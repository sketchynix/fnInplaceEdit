/**
 *  In-place content entry and editing directive
 */
angular.module('fnInplaceEdit', []).directive('fnEditable', ['$timeout', '$document', function($timeout, $document){
    return {
        restrict: 'AC',
        requires: 'ngModel',
        scope: {
            value: '=ngModel', //model value to edit
            permission: '&', //method to call to check for permissions,
            save: '=', //method to call on enter
            buttons: '=', //Custom buttons to add to the template
            containerClass: '@', //optional class to add to the parent container when the input is visible - defaults to shown
            type: '@fnInputType',
            placeholder: '@fnPlaceholder',
            updateOnKeypress: '=fnUpdateOnKeypress'
        },
        template: '<span ng-click="toggleInput()" ng-show="value.length > 0 && !showInput">{{value}}</span>' +
                '<span ng-click="toggleInput()" ng-show="value.length == 0 && !showInput">{{placeholder}}</span>'+
                '<div ng-show="showInput"><input ng-show="type == \'text\'" type="text" value="" ng-model="draft" />'+
                '<textarea ng-show="type == \'textarea\'" ng-model="draft"></textarea>'+
                '<div ng-show="!!save"><button ng-click="saveEdit()">Save</button>'+
                '<button ng-click="cancelEdit()">Cancel</button>' +
                '<button ng-repeat="button in buttons" ng-click="button.action()" class="{{button.cssClass}}">{{button.text}}</button>'+
                '</div></div>',
        replace: false,
        link: function(scope, element, attrs) {
            element.addClass('fn-editable-wrap');

            scope.draft = scope.value;
            scope.showInput = false;

            var hasPermission = true, //track if the user has perssion
                containerClass = angular.isString(scope.containerClass) ? scope.containerClass : 'shown',
                /**
                * If we are clicking anywhere outside of the in-place editing box, we want to
                * hide the input
                */
                docListener = $document.bind('click', hideInput);

            /**
             * Hide the input and show the span
             * @return {[type]} [description]
             */
            function hideInput(){
                if(scope.showInput){
                    scope.$apply(function(){
                        scope.showInput = false;
                    });
                }
            }
            /**
             * Write the draft value to the parent scope (value)
             * @return {void}
             */
            scope.saveEdit = function(showInput){
                if(hasPermission){
                     if(angular.isFunction(scope.save)){
                        scope.save(scope.draft);
                    } else {
                        scope.value = scope.draft;
                    }
                    if(!showInput){
                        scope.showInput = false;
                    }
                }
            };

            /**
             * Reset the draft to the parent scope value
             * @return {void}
             */
            scope.cancelEdit = function(){
                scope.draft = scope.value;
                //hide the input
                scope.showInput = false;
            };

            /**
             * Toggle the visibility of the input
             * Check for permission and then focus the input
             * @return {void}
             */
            scope.toggleInput = function(){
                if(hasPermission){
                    scope.showInput = true;
                    //wrap in timeout to make sure it is displayed before focusing
                    $timeout(function(){
                        var inp = scope.type === 'textarea' ? false : element.find('input')[0];
                        if(inp){
                            inp.focus();
                            inp.select();
                        }
                    }, 0);
                }
            };

            /**
             * On enter call the internal save method
             * @return {void}
             */
            element.bind('keypress', function(e){
                if(hasPermission){
                   e.stopPropagation();
                    if(e.keyCode === 13 || e.which === 13){
                        e.preventDefault();
                        scope.saveEdit();
                        scope.$digest();
                   }

                   if(scope.updateOnKeypress){
                        scope.saveEdit(true);
                        scope.$digest();
                    }
                }
            }).bind('click', function(e){
                e.stopPropagation();
            });

            /**
             * Remove the event listener when the page changes
             */
            scope.$on('$routeChangeStart', function($scope, next, current){
               $document.unbind('click', hideInput);
            });

            /**
             * watch for a permissions function and if one is set
             * test if content should be editable
             */
            scope.$watch('permission', function(){
                if(angular.isDefined(scope.permission())){
                    hasPermission = scope.permission();
                }
            });

            /**
             * Add/remove the css class from the parent container
             * @return {[type]} [description]
             */
            scope.$watch('showInput', function(){
                if(scope.showInput){
                    element.addClass(containerClass);
                } else {
                    element.removeClass(containerClass);
                }
            });

            scope.$on('$destroy', function(){
                $document.off(docListener);
            })
        }
    }
}]);