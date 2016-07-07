 (function(){
	'use strict';
	
	// Key codes
	var keys = {
		enter : 13,
		esc   : 27,
		left  : 37,
		right : 39
	};

	angular
	.module('thatisuday.ng-image-gallery', [])
	.directive('ngImageGallery', ['$timeout', '$document', function($timeout, $document){
		return {
			replace : true,
			transclude : false,
			restrict : 'AE',
			scope : {
				images : '=',
				methods : '=?',
				onOpen : '&?',
				onClose : '&?'
			},
			template : 	'<div class="ng-image-gallery hidden" ng-cloak>' +
							'<div class="ng-image-gallery-backdrop"></div>'+
							'<div class="ng-image-gallery-content">'+
								'<div class="close" ng-click="methods.close();"></div>'+
								'<div class="prev" ng-click="methods.prev();"></div>'+
								'<div class="next" ng-click="methods.next();"></div>'+
								'<div class="galleria">'+
									'<div class="galleria-images">'+
										'<img ng-repeat="image in images" ng-show="activeImg == image" ng-src="{{image.url}}" />'+
									'</div>'+
									'<div class="galleria-thumbs"></div>'+
								'</div>'+
							'</div>'+
						'</div>',
			link : function(scope, elem, attr){
				
				// Modify scope models
				scope.images = (scope.images) ? scope.images : [];
				scope.methods = (scope.methods) ? scope.methods : {};
				scope.onOpen = (scope.onOpen) ? scope.onOpen : angular.noop;
				scope.onClose = (scope.onClose) ? scope.onClose : angular.noop;

				// Gallery states
				scope.activeImageIndex = 0;
				scope.$watch('activeImageIndex', function(newIndex){
					scope.activeImg = scope.images[newIndex];
				})
				

				/***************************************************/

				/*
				 *	Methods
				**/

				// Open modal
				scope.methods.open = function(){
					elem.removeClass('hidden fadeOut').addClass('fadeIn');
					scope.onOpen(); // call open event
				}


				// Close modal
				scope.methods.close = function(){
					elem.removeClass('visible fadeIn').addClass('fadeOut');
					$timeout(function(){
						elem.addClass('hidden');
						scope.onClose(); // call close event
					},350);
				}

				// Change image to next
				scope.methods.next = function(){
					if(scope.activeImageIndex == (scope.images.length - 1)){
						scope.activeImageIndex = 0;
					}
					else{
						scope.activeImageIndex = scope.activeImageIndex + 1;
					}
				}

				// Change image to prev
				scope.methods.prev = function(){
					if(scope.activeImageIndex == 0){
						scope.activeImageIndex = scope.images.length - 1;
					}
					else{
						scope.activeImageIndex--;
					}
				}

				/***************************************************/

				/*
				 *	Interactions
				**/
				$document.bind('keyup', function(event){
					if(event.which == keys.right){
						$timeout(function(){
							scope.methods.next();
						});
					}
					else if(event.which == keys.left){
						$timeout(function(){
							scope.methods.prev();
						});
					}
					else if(event.which == keys.esc){
						$timeout(function(){
							scope.methods.close();
						});
					}
				});


			}
		}
	}]);
 })();