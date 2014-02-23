/**
 *	In-place content entry and editing directive
 */
angular.module('fnInplaceEdit', []).directive('fnEditable', function($timeout, $document){
	return {
        restrict: 'AC',
		scope: {
            value: '=ngModel', //model value to edit
            permission: '&', //method to call to check for permissions,
            save: '=', //method to call on enter
            remove: '&', //method to call when the user wants to remove the item bound
            containerClass: '@' //optional class to add to the parent container when the input is visible - defaults to shown
        },
        template: '<span ng-click="toggleInput()">{{value}}</span>'+
                '<div ng-show="showInput"><input type="text" value="" ng-model="draft" />'+
        		'<div><button ng-click="saveEdit()">Save</button>'+
        		'<button ng-click="cancelEdit()">Cancel</button>' +
        		'<button ng-click="removeEditable()" ng-show="showRemove">Remove</button></div></div>',
        replace: false,
        link: function(scope, element, attrs) {
        	element.addClass('fn-editable-wrap');

        	scope.showRemove = angular.isFunction(scope.remove);
            scope.draft = scope.value;
		    scope.showInput = false;

            var hasPermission = true, //track if the user has perssion
                containerClass = angular.isString(scope.containerClass) ? scope.containerClass : 'shown';

            /**
             * Optional method to call if we wanted to remove the entire container or something
             * @return {void}
             */
		    scope.removeEditable = function(){
		    	if(angular.isFunction(scope.remove)){
			    	scope.remove();
		    	}
		    };

            /**
             * Write the draft value to the parent scope (value)
             * @return {void}
             */
            scope.saveEdit = function(){
                if(hasPermission){
                     if(angular.isFunction(scope.save)){
                        scope.save(scope.draft);
                    } else {
                        scope.value = scope.draft;
                    }
                    // writeDisplay(scope.draft);
                    scope.showInput = false;
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
       					var inp = element.find('input')[0];
       					inp.focus();
       					inp.select();
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
                        scope.$apply(scope.saveEdit);
	            	}
	            }
            }).bind('click', function(e){
            	e.stopPropagation();
            });

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
             * If we are clicking anywhere outside of the in-place editing box, we want to
             * hide the input
             */
        	var docListener = $document.bind('click', hideInput);

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
        }
     }
});