fnInplaceEdit
=============

An in-place editing directive for AngularJS with permission checks.

![inplace editing preview](http://frozennode.com/images/inlineEditPreview.jpg)

The directive turns a container into a clickable area that will open up with an input box to edit the content of the area.
It keeps the value of the input box as a draft until the user saves. At that point it will update the value.

##Demo
http://frozennode.com/inline-edit

##Usage

The directive will append the content into the specified container. It is restricted to an attribute or class.
The container which it is used on will have the class 'fn-editable-wrap' added to it.

Add the module dependency to your application
  angular.module('testApp', ['fnInplaceEdit']);

Then use the directive in your template
  <div class="fn-editable" ng-model="exampleValue"></div>

##Options
The property to be edited should be given through the ng-model attribute

**save**
An optional method to call when the user saves the value.
This method will be passed the value the user has entered in the input box.
It is up to this method to determine whether or not to set the parent scope value to that of the directive.
If this is not set, the directive will simply set the scope value to that entered in the input box (draft)

**permission**
A method that will be called to check if the user can edit the content. Should return a boolean

**containerClass**
A class to add to the container when the input box is visible. Defaults to 'shown'

**buttons**
An array of button objects to be added to the template. Example array:

	[
		{
			action: function(){ console.log('call me when the button is clicked'); },
			text: 'Click Me',
			cssClass: 'blue'
		},
		{
			action: function(){ console.log('call me when the second button is clicked'); },
			text: 'Click Me',
			cssClass: 'pink'
		}
	]
