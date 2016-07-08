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
	.module('thatisuday.ng-image-gallery', ['ngAnimate'])
	.directive('ngImageGallery', ['$timeout', '$document', '$q', function($timeout, $document, $q){
		return {
			replace : true,
			transclude : false,
			restrict : 'AE',
			scope : {
				images : '=',
				methods : '=?',
				thumbnails : '=?',
				onOpen : '&?',
				onClose : '&?'
			},
			template : 	'<div class="ng-image-gallery">'+
							'<div ng-if="thumbnails == true" class="ng-image-gallery-thumbnails">'+
								'<div class="thumb" ng-repeat="image in images" ng-click="methods.open($index);" style="background-image:url({{image.thumbUrl || image.url}});"></div>'+
							'</div>'+
							'<div class="ng-image-gallery-modal" ng-show="opened" ng-cloak>' +
								'<div class="ng-image-gallery-backdrop"></div>'+
								'<div class="ng-image-gallery-content" ng-show="!imgLoading">'+
									'<div class="close" ng-click="methods.close();"></div>'+
									'<div class="prev" ng-click="methods.prev();"></div>'+
									'<div class="next" ng-click="methods.next();"></div>'+
									'<div class="galleria">'+
										'<div class="galleria-images">'+
											'<img ng-repeat="image in images" ng-if="activeImg == image" ng-src="{{image.url}}" />'+
										'</div>'+
										'<div class="galleria-bubbles">'+
											'<span ng-click="setActiveImg(image);" ng-repeat="image in images" ng-class="{active : (activeImg == image)}"></span>'+
										'</div>'+
									'</div>'+
								'</div>'+
								'<div class="ng-image-gallery-loader" ng-show="imgLoading">'+
									'<div class="spinner">'+
										'<div class="rect1"></div>'+
										'<div class="rect2"></div>'+
										'<div class="rect3"></div>'+
										'<div class="rect4"></div>'+
										'<div class="rect5"></div>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>',
			link : function(scope, elem, attr){
				
				/*
				 *	Operational functions
				**/

				// Show gallery loader
				scope.showLoader = function(){
					scope.imgLoading = true;
				}

				// Hide gallery loader
				scope.hideLoader = function(){
					scope.imgLoading = false;
				}

				// Image load complete promise
				scope.loadImg = function(imgObj){
					var deferred =  $q.defer();

					// Show loder
					if(!imgObj.hasOwnProperty('cached')) scope.showLoader();

					// Process image
					var img = new Image();
					img.src = imgObj.url;
					img.onload = function(){
						// Hide loder
						if(!imgObj.hasOwnProperty('cached')) scope.hideLoader();

						// Cache image
						if(!imgObj.hasOwnProperty('cached')) imgObj.cached = true;

						return deferred.resolve(imgObj);
					}

					return deferred.promise;
				}

				scope.setActiveImg = function(imgObj){
					// Load image
					scope.loadImg(imgObj).then(function(imgObj){
						scope.activeImg = imgObj;
					});
				}

				/***************************************************/
				
				/*
				 *	Gallery settings
				**/

				// Modify scope models
				scope.images = (scope.images) ? scope.images : [];
				scope.methods = (scope.methods) ? scope.methods : {};
				scope.onOpen = (scope.onOpen) ? scope.onOpen : angular.noop;
				scope.onClose = (scope.onClose) ? scope.onClose : angular.noop;

				// Watches
				var imagesFirstWatch = true;
				var activeImageIndexFirstWatch = true;

				scope.$watch('images', function(){
					if(imagesFirstWatch){
						imagesFirstWatch = false;
					}
					else if(scope.images.length) scope.setActiveImg(
						scope.images[scope.activeImageIndex || 0]
					);
				});

				scope.$watch('activeImageIndex', function(newImgIndex){
					if(activeImageIndexFirstWatch){
						activeImageIndexFirstWatch = false;
					}
					else if(scope.images.length) scope.setActiveImg(
						scope.images[newImgIndex]
					);
				})
				
				/***************************************************/

				/*
				 *	Methods
				**/

				// Open gallery modal
				scope.methods.open = function(imgIndex){
					// Open modal from an index if one passed
					scope.activeImageIndex = (imgIndex) ? imgIndex : 0;

					scope.opened = true; 

					 // call open event after transition
					$timeout(function(){
						scope.onOpen();
					}, 300);
				}


				// Close gallery modal
				scope.methods.close = function(){
					scope.opened = false; // Model closed

					// call close event after transition
					$timeout(function(){
						scope.onClose();
						scope.activeImageIndex = 0; // Reset index
					}, 300);
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
				 *	User interactions
				**/
				$document.bind('keyup', function(event){
					if(event.which == keys.right || event.which == keys.enter){
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