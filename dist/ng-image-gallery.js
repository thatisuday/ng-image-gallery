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
	.provider('ngImageGalleryOpts', function(){
		var defOpts = {
			thumbnails  :   true,   
			inline      :   false,
			bubbles     :   true,
			imgBubbles  :   false,   
			bgClose     :   false,
			imgAnim 	: 	'fadeup',
		};

		return{
			setOpts : function(newOpts){
				angular.extend(defOpts, newOpts); 
			},
			$get : function(){
				return defOpts;
			}
		}
	})
	.directive('ngImageGallery', ['$rootScope', '$timeout', '$q', 'ngImageGalleryOpts',
	function($rootScope, $timeout, $q, ngImageGalleryOpts){
		return {
			replace : true,
			transclude : false,
			restrict : 'AE',
			scope : {
				images 			: 	'=',		// []
				methods 		: 	'=?',		// {}
				conf 			: 	'=?',		// {}

				thumbnails 		: 	'=?',		// true|false
				inline 			: 	'=?',		// true|flase
				bubbles 		: 	'=?',		// true|flase
				imgBubbles 		: 	'=?',		// true|flase
				bgClose 		: 	'=?',		// true|flase
				imgAnim 		: 	'@?',		// {name}

				onOpen 			: 	'&?',		// function
				onClose 		: 	'&?'		// function
			},
			template : 	'<div class="ng-image-gallery img-move-dir-{{imgMoveDirection}}" ng-class="{inline:inline}">'+
							
							// Thumbnails container
							//  Hide for inline gallery
							'<div ng-if="thumbnails && !inline" class="ng-image-gallery-thumbnails">'+
								'<div class="thumb" ng-repeat="image in images" ng-click="methods.open($index);" ng-style="{ \'background-image\': \'url(\' + (image.thumbUrl || image.url) + \')\' }"  ng-attr-title="{{image.title || undefined}}"></div>'+
							'</div>'+

							// Modal container
							// (inline container for inline modal)
							'<div class="ng-image-gallery-modal" ng-show="opened" ng-cloak>' +
								
								// Gallery backdrop container
								// (hide for inline gallery)
								'<div class="ng-image-gallery-backdrop" ng-if="!inline"></div>'+
								
								// Gallery contents container
								// (hide when image is loading)
								'<div class="ng-image-gallery-content" ng-show="!imgLoading" ng-click="backgroundClose($event);">'+
									
									// destroy icons container
									'<div class="destroy-icons-container">'+
										// External link icon
										'<a class="ext-url" ng-repeat="image in images" ng-if="activeImg == image && image.extUrl" href="{{image.extUrl}}"></a>'+

										// Close Icon (hidden in inline gallery)
										'<div class="close" ng-click="methods.close();" ng-if="!inline"></div>'+
									'</div>'+

									// Prev-Next Icons
									// Add `bubbles-on` class when bubbles are enabled (for offset)
									'<div class="prev" ng-click="methods.prev();" ng-class="{\'bubbles-on\':bubbles}" ng-hide="images.length == 1"></div>'+
									'<div class="next" ng-click="methods.next();" ng-class="{\'bubbles-on\':bubbles}" ng-hide="images.length == 1"></div>'+

									// Galleria container
									'<div class="galleria">'+
										
										// Images container
										'<div class="galleria-images img-anim-{{imgAnim}} img-move-dir-{{imgMoveDirection}}">'+
											'<img class="galleria-image" ng-repeat="image in images" ng-if="activeImg == image" ng-src="{{image.url}}" ondragstart="return false;" oncontextmenu="return false;" ng-attr-title="{{image.title || undefined}}" ng-attr-alt="{{image.alt || undefined}}"/>'+
										'</div>'+

										// Bubble navigation container
										'<div class="galleria-bubbles" ng-if="bubbles && !imgBubbles"  ng-hide="images.length == 1">'+
											'<span class="galleria-bubble" ng-click="setActiveImg(image);" ng-repeat="image in images" ng-class="{active : (activeImg == image)}"></span>'+
										'</div>'+

										// Image bubble navigation container
										'<div class="galleria-bubbles" ng-if="bubbles && imgBubbles" ng-hide="images.length == 1">'+
											'<span class="galleria-bubble img-bubble" ng-click="setActiveImg(image);" ng-repeat="image in images" ng-class="{active : (activeImg == image)}" ng-style="{ \'background-image\': \'url(\' + (image.bubbleUrl || image.thumbUrl || image.url) +\')\' }"></span>'+
										'</div>'+

									'</div>'+

								'</div>'+
								
								// Loading animation overlay container
								// (show when image is loading)
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
					
					// Return rejected promise
					// if not image object received
					if(!imgObj) return $q.reject();

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
					// Get images move direction
					if(
						scope.images.indexOf(scope.activeImg) - scope.images.indexOf(imgObj) == (scope.images.length - 1) ||
						(
							scope.images.indexOf(scope.activeImg) - scope.images.indexOf(imgObj) <= 0 && 
							scope.images.indexOf(scope.activeImg) - scope.images.indexOf(imgObj) != -(scope.images.length - 1)
						)
						
					){
						scope.imgMoveDirection = 'forward';
					}
					else{
						scope.imgMoveDirection = 'backward';
					}

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
				scope.images 	 	 = 	(scope.images 		!= undefined) ? scope.images 	 : 	[];
				scope.methods 	 	 = 	(scope.methods 		!= undefined) ? scope.methods 	 : 	{};
				scope.conf 	 		 = 	(scope.conf 		!= undefined) ? scope.conf 		 : 	{};

				// setting options
				scope.$watchCollection('conf', function(conf){
					scope.thumbnails 	 = 	(conf.thumbnails 	!= undefined) ? conf.thumbnails 	: 	(scope.thumbnails 	!= undefined) 	?  scope.thumbnails		: 	ngImageGalleryOpts.thumbnails;
					scope.inline 	 	 = 	(conf.inline 		!= undefined) ? conf.inline 	 	: 	(scope.inline 		!= undefined) 	?  scope.inline			: 	ngImageGalleryOpts.inline;
					scope.bubbles 	 	 = 	(conf.bubbles 		!= undefined) ? conf.bubbles 	 	: 	(scope.bubbles 		!= undefined) 	?  scope.bubbles		: 	ngImageGalleryOpts.bubbles;
					scope.imgBubbles 	 = 	(conf.imgBubbles 	!= undefined) ? conf.imgBubbles 	: 	(scope.imgBubbles 	!= undefined) 	?  scope.imgBubbles		: 	ngImageGalleryOpts.imgBubbles;
					scope.bgClose 	 	 = 	(conf.bgClose 		!= undefined) ? conf.bgClose 	 	: 	(scope.bgClose 		!= undefined) 	?  scope.bgClose		: 	ngImageGalleryOpts.bgClose;
					scope.imgAnim 	 	 = 	(conf.imgAnim 		!= undefined) ? conf.imgAnim 	 	: 	(scope.imgAnim 		!= undefined) 	?  scope.imgAnim		: 	ngImageGalleryOpts.imgAnim;
				});

				scope.onOpen 	 	 = 	(scope.onOpen 		!= undefined) ? scope.onOpen 	 : 	angular.noop;
				scope.onClose 	 	 = 	(scope.onClose 		!= undefined) ? scope.onClose 	 : 	angular.noop;
				
				// If images populate dynamically, reset gallery
				var imagesFirstWatch = true;
				scope.$watch('images', function(){
					if(imagesFirstWatch){
						imagesFirstWatch = false;
					}
					else if(scope.images.length) scope.setActiveImg(
						scope.images[scope.activeImageIndex || 0]
					);
				});

				// Watch index of visible/active image
				// If index changes, make sure to load/change image
				var activeImageIndexFirstWatch = true;
				scope.$watch('activeImageIndex', function(newImgIndex){
					if(activeImageIndexFirstWatch){
						activeImageIndexFirstWatch = false;
					}
					else if(scope.images.length){
						scope.setActiveImg(
							scope.images[newImgIndex]
						);
					}
				});

				// Open modal automatically if inline
				scope.$watch('inline', function(){
					$timeout(function(){
						if(scope.inline) scope.methods.open();
					});
				});
				

				/***************************************************/


				/*
				 *	Methods
				**/

				// Open gallery modal
				scope.methods.open = function(imgIndex){
					// Open modal from an index if one passed
					scope.activeImageIndex = (imgIndex) ? imgIndex : 0;

					scope.opened = true;

					// set overflow hidden to body
					if(!scope.inline) angular.element(document.body).addClass('body-overflow-hidden');

					// call open event after transition
					$timeout(function(){
						scope.onOpen();
					}, 300);
				}

				// Close gallery modal
				scope.methods.close = function(){
					scope.opened = false; // Model closed

					// set overflow hidden to body
					angular.element(document.body).removeClass('body-overflow-hidden');

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

				// Close gallery on background click
				scope.backgroundClose = function(e){
					if(!scope.bgClose || scope.inline) return;

					var noCloseClasses = [
						'galleria-image',
						'destroy-icons-container',
						'ext-url',
						'close',
						'next',
						'prev',
						'galleria-bubble'
					];

					// check if clicked element has a class that
					// belongs to `noCloseClasses`
					for(var i = 0; i < e.target.classList.length; i++){
						if(noCloseClasses.indexOf(e.target.classList[i]) != -1){
							break;
						}
						else{
							scope.methods.close();
						}
					}
				}


				/***************************************************/


				/*
				 *	User interactions
				**/

				// Key events
				angular.element(document).bind('keyup', function(event){
					// If inline modal, do not interact
					if(scope.inline) return;

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

				// Swipe events
				if(window.Hammer){
					var hammerElem = new Hammer(elem[0]);
					hammerElem.on('swiperight', function(ev){
						$timeout(function(){
							scope.methods.prev();
						});
					});
					hammerElem.on('swipeleft', function(ev){
						$timeout(function(){
							scope.methods.next();
						});
					});
					hammerElem.on('doubletap', function(ev){
						if(scope.inline) return;

						$timeout(function(){
							scope.methods.close();
						});
					});
				};


				/***********************************************************/


				/*
				 *	Actions on angular events
				**/
				
				var removeClassFromDocumentBody = function(){
					angular.element(document.body).removeClass('body-overflow-hidden');
				};
				
				$rootScope.$on('$stateChangeSuccess', removeClassFromDocumentBody);
				$rootScope.$on('$routeChangeSuccess ', removeClassFromDocumentBody);

			}
		}
	}]);
 })();