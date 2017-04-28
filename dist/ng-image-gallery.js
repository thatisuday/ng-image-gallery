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
			thumbnails  	:   true,
			thumbSize		: 	80,
			inline      	:   false,
			bubbles     	:   true,
			bubbleSize		: 	20,
			imgBubbles  	:   false,
			bgClose     	:   false,
			piracy 			: 	false,
			imgAnim 		: 	'fadeup',
			errorPlaceHolder:   'Error when loading the image!'
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
	.filter('ngImageGalleryTrust', ['$sce', function($sce) {
      return function(value, type) {
        // Defaults to treating trusted value as `html`
        return $sce.trustAs(type || 'html', value);
      }
    }])
    .directive('ngRightClick', ['$parse', function($parse){
	    return {
	    	restrict: "A",
			scope : false,
			link : function(scope, element, attrs){
				element.bind('contextmenu', function(event){
					if(scope.piracy == false){
						event.preventDefault();
						return scope.piracy;
					}
				});
			}
	    };
	}])
	.directive("showImageAsync", [function(){
		return {
			restrict: "A",
			scope: false,
			link: function (scope, element, attributes){
				var image = new Image();
				image.src = attributes.showImageAsync;
				image.onload = function(){
					scope.$apply(function(){
						if(attributes.asyncKind == 'thumb'){
							element.css({ backgroundImage: 'url("' + attributes.showImageAsync + '")' });
							element.empty(); // remove loading animation element
						}
						else if(attributes.asyncKind == 'bubble'){
							element.css({ backgroundImage: 'url("' + attributes.showImageAsync + '")' });
						}
					});
				};
				image.onerror = function(){
					element.empty(); // remove loading animation element
				}
			}
		};
	}])
	.directive("bubbleAutoFit", ['$window', '$timeout', function($window, $timeout){
		return {
			restrict: "A",
			scope: false,
			link: {
				pre : function (scope, element, attributes){
					var autoFitBubbles = function(){
						var scrollerWidth = element[0].getBoundingClientRect().width;
						if(scrollerWidth == 0) return;

						var bubbleSize = scope.bubbleSize;
						var minMargin = 4 + 4; // left+right
						var bubbleSpace = (bubbleSize + minMargin);
						var rawQuotient = scrollerWidth / bubbleSpace;
						var bubblesInView = Math.floor(rawQuotient);
						var extraSpace = scrollerWidth - (bubblesInView * bubbleSpace);
						var extraMargin = extraSpace / bubblesInView;
						var bubbleMargin = minMargin + extraMargin;
						var finalBubbleSpace = bubbleMargin + bubbleSize;

						scope._bubblesInView = bubblesInView;
						scope._finalBubbleSpace = finalBubbleSpace;
						scope._bubbleMargin = '0 ' + (bubbleMargin/2) + 'px';

						scope._safeApply(angular.noop);
					};

					$timeout(autoFitBubbles);

					angular.element($window).bind('resize', function(){
						$timeout(autoFitBubbles);
					});
					scope.$watch('inline', function(){
						$timeout(autoFitBubbles);
					});
					scope.$watch('bubbleSize', function(){
						$timeout(autoFitBubbles);
					});
					scope.$watchCollection('images', function(){
						$timeout(autoFitBubbles);
					});
				}
			}
		};
	}])
	.directive("bubbleAutoScroll", ['$window', '$timeout', function($window, $timeout){
		return {
			restrict: "A",
			scope: false,
			link: function (scope, element, attributes){

				var indexCalc = function(){
					var relativeIndexToBubbleWrapper = scope._bubblesInView - (scope._bubblesInView - scope._activeImageIndex);

					$timeout(function(){
						if(relativeIndexToBubbleWrapper > scope._bubblesInView - 2){
							var outBubbles = ((scope._activeImageIndex+1) - scope._bubblesInView) + 1;

							if(scope._activeImageIndex != (scope.images.length - 1)){
								scope._bubblesContainerMarginLeft = '-' + (scope._finalBubbleSpace * outBubbles) + 'px';
							}
							else{
								scope._bubblesContainerMarginLeft = '-' + (scope._finalBubbleSpace * (outBubbles - 1)) + 'px';
							}
						}
						else{
							scope._bubblesContainerMarginLeft = '0px';
						}
					});
				}

				angular.element($window).bind('resize', function(){
					$timeout(indexCalc);
				});
				scope.$watch('_bubblesInView', function(){
					$timeout(indexCalc);
				});
				scope.$watch('_activeImageIndex', function(){
					$timeout(indexCalc);
				});
				scope.$watchCollection('images', function(){
					$timeout(indexCalc);
				});
			}
		};
	}])
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
				thumbSize		: 	'=?', 		// px
				inline 			: 	'=?',		// true|false
				bubbles 		: 	'=?',		// true|false
				bubbleSize 		: 	'=?',		// px
				imgBubbles 		: 	'=?',		// true|false
				bgClose 		: 	'=?',		// true|false
				piracy			: 	'=?',		// true|false
				imgAnim 		: 	'@?',		// {name}
				errorPlaceHolder: 	'@?',		// {name}

				onOpen 			: 	'&?',		// function
				onClose 		: 	'&?',		// function,
				onDelete		: 	'&?'
			},
			template : 	'<div class="ng-image-gallery img-move-dir-{{_imgMoveDirection}}" ng-class="{inline:inline}" ng-hide="images.length == 0">'+

							// Thumbnails container
							//  Hide for inline gallery
							'<div ng-if="thumbnails && !inline" class="ng-image-gallery-thumbnails">' +
 								'<div class="thumb" ng-repeat="image in images track by image.id" ng-click="methods.open($index);" show-image-async="{{image.thumbUrl || image.url}}" async-kind="thumb" ng-style="{\'width\' : thumbSize+\'px\', \'height\' : thumbSize+\'px\'}">'+
 									'<div class="loader"></div>'+
 								'</div>' +
 							'</div>' +

							// Modal container
							// (inline container for inline modal)
							'<div class="ng-image-gallery-modal" ng-if="opened" ng-cloak>' +

								// Gallery backdrop container
								// (hide for inline gallery)
								'<div class="ng-image-gallery-backdrop" ng-if="!inline"></div>'+

								// Gallery contents container
								// (hide when image is loading)
								'<div class="ng-image-gallery-content" ng-show="!imgLoading" ng-click="backgroundClose($event);">'+

									// actions icons container
									'<div class="actions-icons-container">'+
										// Delete image icon
										'<div class="delete-img" ng-repeat="image in images track by image.id" ng-if="_activeImg == image && image.deletable" title="Delete this image..." ng-click="_deleteImg(image)"></div>'+
									'</div>'+

									// control icons container
									'<div class="control-icons-container">'+
										// External link icon
										'<a class="ext-url" ng-repeat="image in images track by image.id" ng-if="_activeImg == image && image.extUrl" href="{{image.extUrl}}" target="_blank" title="Open image in new tab..."></a>'+

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
										'<div class="galleria-images img-anim-{{imgAnim}} img-move-dir-{{_imgMoveDirection}}">'+
											'<img class="galleria-image" ng-right-click ng-repeat="image in images track by image.id" ng-if="_activeImg == image" ng-src="{{image.url}}" ondragstart="return false;" ng-attr-alt="{{image.alt || undefined}}"/>'+
										'</div>'+

										// Image description container
										'<div class="galleria-title-description-wrapper">'+
											'<div ng-repeat="image in images track by image.id" ng-if="(image.title || image.desc) && (_activeImg == image)">'+
												'<div class="title" ng-if="image.title" ng-bind-html="image.title | ngImageGalleryTrust"></div>'+
												'<div class="desc" ng-if="image.desc" ng-bind-html="image.desc | ngImageGalleryTrust"></div>'+
											'</div>'+
										'</div>'+

										// Bubble navigation container
										'<div class="galleria-bubbles-wrapper" ng-if="bubbles && !imgBubbles" ng-hide="images.length == 1" ng-style="{\'height\' : bubbleSize+\'px\'}" bubble-auto-fit>'+
											'<div class="galleria-bubbles" bubble-auto-scroll ng-style="{\'margin-left\': _bubblesContainerMarginLeft}">'+
												'<span class="galleria-bubble" ng-click="_setActiveImg(image);" ng-repeat="image in images track by image.id" ng-class="{active : (_activeImg == image)}" ng-style="{\'width\' : bubbleSize+\'px\', \'height\' : bubbleSize+\'px\', margin: _bubbleMargin}"></span>'+
											'</div>'+
										'</div>'+

										// Image bubble navigation container
										'<div class="galleria-bubbles-wrapper" ng-if="bubbles && imgBubbles" ng-hide="images.length == 1" ng-style="{\'height\' : bubbleSize+\'px\'}" bubble-auto-fit>'+
											'<div class="galleria-bubbles" bubble-auto-scroll ng-style="{\'margin-left\': _bubblesContainerMarginLeft}">'+
												'<span class="galleria-bubble img-bubble" ng-click="_setActiveImg(image);" ng-repeat="image in images track by image.id" ng-class="{active : (_activeImg == image)}" show-image-async="{{image.bubbleUrl || image.thumbUrl || image.url}}" async-kind="bubble" ng-style="{\'width\' : bubbleSize+\'px\', \'height\' : bubbleSize+\'px\', \'border-width\' : bubbleSize/10+\'px\', margin: _bubbleMargin}"></span>'+
											'</div>'+
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

								// (show when image cannot be loaded)
								'<div class="ng-image-gallery-errorplaceholder" ng-show="imgError">'+
									'<div class="ng-image-gallery-error-placeholder" ng-bind-html="errorPlaceHolder | ngImageGalleryTrust"></div>'+
								'</div>'+
							'</div>'+
						'</div>',

			link : {
				pre : function(scope, elem, attr){

					/*
					 *	Operational functions
					**/

					// Show gallery loader
					scope._showLoader = function(){
						scope.imgLoading = true;
					}

					// Hide gallery loader
					scope._hideLoader = function(){
						scope.imgLoading = false;
					}

					// Image load complete promise
					scope._loadImg = function(imgObj){

						// Return rejected promise
						// if not image object received
						if(!imgObj) return $q.reject();

						var deferred =  $q.defer();

						// Show loder
						if(!imgObj.hasOwnProperty('cached')) scope._showLoader();

						// Process image
						var img = new Image();
						img.src = imgObj.url;
						img.onload = function(){
							// Hide loder
							if(!imgObj.hasOwnProperty('cached')) scope._hideLoader();

							// Cache image
							if(!imgObj.hasOwnProperty('cached')) imgObj.cached = true;

							deferred.resolve(imgObj);
						}
						img.onerror = function(){
							if(!imgObj.hasOwnProperty('cached')) scope._hideLoader();

							deferred.reject('Error when loading img');
						}

						return deferred.promise;
					}

					scope._setActiveImg = function(imgObj){
						// Get images move direction
						if(
							scope.images.indexOf(scope._activeImg) - scope.images.indexOf(imgObj) == (scope.images.length - 1) ||
							(
								scope.images.indexOf(scope._activeImg) - scope.images.indexOf(imgObj) <= 0 &&
								scope.images.indexOf(scope._activeImg) - scope.images.indexOf(imgObj) != -(scope.images.length - 1)
							)

						){
							scope._imgMoveDirection = 'forward';
						}
						else{
							scope._imgMoveDirection = 'backward';
						}

						// Load image
						scope._loadImg(imgObj).then(function(imgObj){
							scope._activeImg = imgObj;
							scope._activeImageIndex = scope.images.indexOf(imgObj);
							scope.imgError = false;
						}, function(){
							scope._activeImg = null;
							scope._activeImageIndex = scope.images.indexOf(imgObj);
							scope.imgError = true;
						})
						;
					}

					scope._safeApply = function(fn){
						var phase = this.$root.$$phase;
						if(phase == '$apply' || phase == '$digest'){
							if(fn && (typeof(fn) === 'function')){
								fn();
							}
						}else{
							this.$apply(fn);
						}
					};

					scope._deleteImg = function(img){
						var _deleteImgCallback = function(){
							var index = scope.images.indexOf(img);
							console.log(index);
							scope.images.splice(index, 1);
							scope._activeImageIndex = 0;

							/**/
						}

						scope.onDelete({img: img, cb: _deleteImgCallback});
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
						scope.thumbSize 	 = 	(conf.thumbSize 	!= undefined) ? conf.thumbSize 		: 	(scope.thumbSize 	!= undefined) 	?  scope.thumbSize		: 	ngImageGalleryOpts.thumbSize;
						scope.inline 	 	 = 	(conf.inline 		!= undefined) ? conf.inline 	 	: 	(scope.inline 		!= undefined) 	?  scope.inline			: 	ngImageGalleryOpts.inline;
						scope.bubbles 	 	 = 	(conf.bubbles 		!= undefined) ? conf.bubbles 	 	: 	(scope.bubbles 		!= undefined) 	?  scope.bubbles		: 	ngImageGalleryOpts.bubbles;
						scope.bubbleSize 	 = 	(conf.bubbleSize 	!= undefined) ? conf.bubbleSize 	 : 	(scope.bubbleSize 	!= undefined) 	?  scope.bubbleSize		: 	ngImageGalleryOpts.bubbleSize;
						scope.imgBubbles 	 = 	(conf.imgBubbles 	!= undefined) ? conf.imgBubbles 	: 	(scope.imgBubbles 	!= undefined) 	?  scope.imgBubbles		: 	ngImageGalleryOpts.imgBubbles;
						scope.bgClose 	 	 = 	(conf.bgClose 		!= undefined) ? conf.bgClose 	 	: 	(scope.bgClose 		!= undefined) 	?  scope.bgClose		: 	ngImageGalleryOpts.bgClose;
						scope.piracy 	 	 = 	(conf.piracy 		!= undefined) ? conf.piracy 	 	: 	(scope.piracy 		!= undefined) 	?  scope.piracy			: 	ngImageGalleryOpts.piracy;
						scope.imgAnim 	 	 = 	(conf.imgAnim 		!= undefined) ? conf.imgAnim 	 	: 	(scope.imgAnim 		!= undefined) 	?  scope.imgAnim		: 	ngImageGalleryOpts.imgAnim;
						scope.errorPlaceHolder = (conf.errorPlaceHolder != undefined) ? conf.errorPlaceHolder : (scope.errorPlaceHolder != undefined) ? scope.errorPlaceHolder : ngImageGalleryOpts.errorPlaceHolder;
					});

					scope.onOpen 	 = 	(scope.onOpen 	!= undefined) ? scope.onOpen 	 : 	angular.noop;
					scope.onClose 	 = 	(scope.onClose 	!= undefined) ? scope.onClose 	 : 	angular.noop;
					scope.onDelete 	 = 	(scope.onDelete != undefined) ? scope.onDelete 	 : 	angular.noop;

					// If images populate dynamically, reset gallery
					var imagesFirstWatch = true;
					scope.$watchCollection('images', function(){
						if(imagesFirstWatch){
							imagesFirstWatch = false;
						}
						else if(scope.images.length){
							scope._setActiveImg(scope.images[scope._activeImageIndex || 0]);
						}
					});

					// Watch index of visible/active image
					// If index changes, make sure to load/change image
					var activeImageIndexFirstWatch = true;
					scope.$watch('_activeImageIndex', function(newImgIndex){
						if(activeImageIndexFirstWatch){
							activeImageIndexFirstWatch = false;
						}
						else if(scope.images.length){
							scope._setActiveImg(
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
						scope._activeImageIndex = (imgIndex) ? imgIndex : 0;

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
							scope._activeImageIndex = 0; // Reset index
						}, 300);
					}

					// Change image to next
					scope.methods.next = function(){
						if(scope._activeImageIndex == (scope.images.length - 1)){
							scope._activeImageIndex = 0;
						}
						else{
							scope._activeImageIndex = scope._activeImageIndex + 1;
						}
					}

					// Change image to prev
					scope.methods.prev = function(){
						if(scope._activeImageIndex == 0){
							scope._activeImageIndex = scope.images.length - 1;
						}
						else{
							scope._activeImageIndex--;
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
					$rootScope.$on('$routeChangeSuccess', removeClassFromDocumentBody);

				}
			}
		}
	}]);
 })();