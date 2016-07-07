/**!
 * AngularJS modal directive
 * @author Uday Hiwarale <uhiwarale@gmail.com>
 * https://www.github.com/thatisuday/ngModal
 */
 
 
 (function(){
	'use strict';
	
	var keys = {
		enter : 13,
		esc   : 27,
		left  : 37,
		right : 39
	};
	
	//jQuery .closest like
	function closest(el, classname) {
		if(el.parentNode){
			if(el.parentNode.className){
				var classnames = el.parentNode.className.split(' ');
				if(classnames.includes(classname)){
					return true;
				}
				else{
					return closest(el.parentNode, classname);
				}
			}else{
				return closest(el.parentNode, classname);
			}
		}else{
			return false;
		}
	};
	
	angular.module('thatisuday.modal', []).provider('ngModalOps', function(){
		/*
		 *	Add default options here
		**/
		var defOps = {
			closable : true,
			compactClose : true,
			fullscreen : false,
			closeIcon : '_cross_icon',
			
			width : '700px',
			height : '400px',
			padding:'20px 30px',
			borderRadius:'3px',
			top:'50%',
			left:'50%',
			backdrop : 'rgba(0,0,0,0.75)',
			background : '#fff',
			zIndex:'9999',
			
			animation : true,
			animDropIn : 'fadeIn',
			animDropOut : 'fadeOut',
			animBodyIn : 'zoomIn',
			animBodyOut : 'fadeOut',
			animDuration : 300,
			
			prevIcon : '_prev_icon',
			nextIcon : '_next_icon',
			thumbs : true,
			thumbsLength : 5,
			animImage : 'fadeIn'
		};
		
		return {
			setOptions : function(newOps){
				angular.extend(defOps, newOps);
			},
			$get : function(){
				return defOps;
			}
		}
	})
	.directive('ngModal', ['$timeout', '$q', '$document', '$window', '$sce', 'ngModalOps', function($timeout, $q, $document, $window, $sce, ngModalOps){
		return {
			restrict : 'AE',
			transclude : true,
			template : '\
				<div class="ngModal animated" ng-class="{_active:states.isOpened, _hidden:states.isClosed}">\
					<div class="_close" ng-click="controls.close();"></div>\
				</div>\
			',
			replace : true,
			scope : {
				video : '@?',
				options : '=?',
				controls : '=?',
				callbacks : '=?',
				gallery : '=?',
				onOpen : "&?",
				onClose : "&?"
			},
			compile : function(tElem, tAttr){
				if(tAttr.gallery){
					tElem.append('\
						<div class="_body _gallery animated">\
							<img ng-if="imageLoaded" ng-src="{{currentImg}}" class="animated" ng-class="{\'{{initOps.animImage}}\':imageAnimted, _hidden:!imageAnimted}" />\
							<div ng-if="!imageLoaded" class="_spinner"></div>\
						</div>\
						<div ng-if="initOps.thumbs" class="_thumbnails_conatainer" style="width:{{initOps.thumbsLength*40}}px;">\
							<div class="_thumbnails" style="margin-left:{{thumbScroll}}px;">\
								<div ng-repeat="img in gallery" ng-class="{current:($index == currImgIndex)}" ng-click="showImage($index);" style="background-image:url({{img.thumbURL || img.imgURL}});"></div>\
							</div>\
						</div>\
						<div class="_prev {{initOps.prevIcon}}" ng-click="prevImage();"></div>\
						<div class="_next {{initOps.nextIcon}}" ng-click="nextImage();"></div>\
					');
				}
				else if(tAttr.video){
					tElem.append('<div class="_body _video animated"><iframe ng-src="{{videoURL}}"></iframe></div>');
				}
				else{
					tElem.append('<div class="_body animated" ng-transclude></div>');
				}
				
				return function(scope, iElem, iAttr){
					
					//Basic functions
					var 
						$modal = iElem,
						modal = $modal[0],
						mBody = $modal[0].querySelector('._body'),
						$mBody = angular.element(mBody),
						mClose = $modal[0].querySelector('._close'),
						$mClose = angular.element(mClose),
						getDim = function(){
							return {
								windowWidth : window.innerWidth,
								windowHeight : window.innerHeight,
								mBodyWidth : mBody.offsetWidth,
								mBodyHeight : mBody.offsetHeight
							}
						},
						mBodyResize = function(){ // Adjust modal body position
							var dim = getDim();
							if(dim.mBodyWidth < dim.windowWidth || dim.mBodyHeight < dim.windowHeight){
								$mBody.css({
									'left' : '50%',
									'margin-left' : '-' + (dim.mBodyWidth/2) + 'px',
									'top' : '50%',
									'margin-top' : '-' + (dim.mBodyHeight/2) + 'px'
								});
							}
							else{
								$mBody.css({
									'left' : '0',
									'margin-left' : '0',
									'top' : '0',
									'margin-top' : '0'
								});
							}
						},
						mCloseSetPos = function(){ // Adjust close icon position
							var dim = getDim();
							if(dim.mBodyWidth < dim.windowWidth || dim.mBodyHeight < dim.windowWidth){
								$mClose.css({
									'right' : ((dim.windowWidth - dim.mBodyWidth) / 2 - 25) + 'px',
									'top' : ((dim.windowHeight - dim.mBodyHeight) / 2 - 30) + 'px'
								});
							}
						}
					;
					
					
					//Gallery functions
					var defer;
					scope.loadImage = function(index){
						if(defer) defer.reject();
						defer = $q.defer();
						
						scope.states.imgLoading = true; //Add a modal state
						scope.imageAnimted = false; //For image load animation
						
						//Prevent loading of cached images
						if(scope.gallery[index].cached && scope.gallery[index].cached === true){
							defer.resolve(index);
							return defer.promise;
						}
						
						var image = new Image();
						image.src = scope.gallery[index].imgURL;
						image.onload = function(){
							scope.gallery[index].cached = true;
							defer.resolve(index); //Resolve loadImage promise
						};
						
						scope.imageLoaded = false;
						return defer.promise;
					};
					
					scope.showImage = function(index){ //Show gallery image
						var defer = $q.defer();
						
						scope.currImgIndex = index || 0;
						scope.loadImage(scope.currImgIndex).then(function(index){
							scope.currentImg = scope.gallery[index].imgURL;
							$timeout(function(){
								defer.resolve(); //Resolve showImage promise
								
								scope.states.imgLoading = false; //Add a modal state
								scope.imageLoaded = true;
								$timeout(function(){ scope.imageAnimted = true; }, 10);
								
								//Scroll thumbnails
								scope.thumbScroll = scope.thumbScroll || 0;
								if(scope.gallery.length > scope.initOps.thumbsLength){
									if((scope.currImgIndex + 2) > scope.initOps.thumbsLength){
										if((scope.currImgIndex + 1) == scope.gallery.length){
											scope.thumbScroll = -40 * ((scope.currImgIndex + 1) - scope.initOps.thumbsLength);
										}
										else{
											scope.thumbScroll = -40 * ((scope.currImgIndex + 2) - scope.initOps.thumbsLength);
										}
									}
									else if(scope.currImgIndex < scope.initOps.thumbsLength){
										scope.thumbScroll = 0;
									}
								}
							});
							
							if(!scope.$$phase && !scope.$root.$$phase) scope.$apply();
						});
						
						return defer.promise;
					};
					
					scope.prevImage = function(){
						scope.currImgIndex = (scope.currImgIndex == 0) ? scope.gallery.length -1 : scope.currImgIndex - 1;
						
						scope.showImage(scope.currImgIndex).then(function(){
							//Callback for previous image load complete
							$timeout(function(){if(scope.callbacks.onPrevDone) scope.callbacks.onPrevDone();});
						});
						
						//Callback for previous image load initiated
						$timeout(function(){if(scope.callbacks.onPrev) scope.callbacks.onPrev();});
					};
					
					scope.nextImage = function(){
						scope.currImgIndex = (scope.currImgIndex == scope.gallery.length - 1) ? 0 : scope.currImgIndex + 1;
						
						scope.showImage(scope.currImgIndex).then(function(){
							//Callback for next image load complete
							$timeout(function(){if(scope.callbacks.onNextDone) scope.callbacks.onNextDone();});
						});
						
						//Callback for previous image load initiated
						$timeout(function(){if(scope.callbacks.onNext) scope.callbacks.onNext();});
					};
					
					
					
					
					
					/////////////////////////////////////////////////////////////////////////////////////////////
					// 				Modal states
					/////////////////////////////////////////////////////////////////////////////////////////////
					scope.states = {
						isTouched : false,
						isOpened : false,
						isClosed : true,
						imgLoading : false
					};
					scope.$watchCollection('states', function(newStates){
						scope.states.isClosed = !newStates.isOpened; //Maintain isOpened/isClosed states
					});
					
					
					
					
					
					/////////////////////////////////////////////////////////////////////////////////////////////
					// 			Set options
					/////////////////////////////////////////////////////////////////////////////////////////////
					scope.initOps = angular.extend({}, ngModalOps, scope.options);
					if(iAttr.gallery && scope.gallery){
						scope.initOps.closable = false;
						scope.initOps.compactClose = false;
					}
					else if(scope.initOps.fullscreen){
						scope.initOps.compactClose = false;
					}
					
					
					
					
					
					/////////////////////////////////////////////////////////////////////////////////////////////
					// 			Perform options actions
					/////////////////////////////////////////////////////////////////////////////////////////////
					/* Modal closable on click outside of modal body */
					if(scope.initOps.closable){
						$modal.css({'cursor':'pointer'});
						$modal.bind('click', function(event){
							if(event.target != mBody && !mBody.contains(event.target)){
								scope.controls.close();
							}
						});
					}
					
					/* Set close icon */
					if(scope.initOps.closeIcon) $mClose.addClass(scope.initOps.closeIcon);
					
					/* Set animation duration */
					if(scope.initOps.animation && scope.initOps.animDuration){
						var animDurationSec = scope.initOps.animDuration/1000 + 's';
						$modal.css({'-webkit-animation-duration':animDurationSec, 'animation-duration':animDurationSec});
						$mBody.css({'-webkit-animation-duration':animDurationSec, 'animation-duration':animDurationSec});
					} else{scope.initOps.animDuration = 0;}
					
					/* Set basic css style */
					$modal.css({
						'background-color' : scope.initOps.backdrop,
						'z-index' : scope.initOps.zIndex
					});
					$mBody.css({
						'background-color' : scope.initOps.background,
						'width' : scope.initOps.width,
						'height' : scope.initOps.height,
						'padding' : scope.initOps.padding,
						'border-radius' : scope.initOps.borderRadius,
						'top' : scope.initOps.top,
						'left' : scope.initOps.left
					});
					
					/* Full screen modal */
					if(scope.initOps.fullscreen){
						$mBody.css({
							'width' : '100%',
							'min-height' : '100%',
							'height' : 'auto',
							'top' : '0',
							'left' : '0',
							'border-radius' : '0px'
						});
						$mClose.css({
							'color' : '#333'
						});
					}
					
					/* Flat modal */
					if(scope.initOps.flat){
						$modal.addClass('_flat _' + scope.initOps.flat);
					}
					
					/* Modal gallery */
					if(iAttr.gallery && scope.gallery){
						var dim = getDim();
						$mBody.css({
							'background-color' : 'transparent',
							'width' : 'calc(100% - 100px)',
							'height' : 'calc(100% - 100px)'
						});
						scope.showImage(); //Show gallery image
					}
					
					/* Modal video */
					if(iAttr.video && scope.video){
						var dim = getDim();
						scope.videoURL = $sce.trustAsResourceUrl(scope.video);
						
						$mBody.css({
							'height' : (dim.mBodyWidth / 100) * 56.25 + 'px',
							'border-radius' : '0px',
							'padding' : '0px'
						});
					}
					
					
					
					
					
					/////////////////////////////////////////////////////////////////////////////////////////////
					// 				Modal control actions
					/////////////////////////////////////////////////////////////////////////////////////////////
					scope.controls = scope.controls || {};
					scope.callbacks = scope.callbacks || {};
					
					/* Open modal */
					scope.controls.open = function(){
						if(scope.states.isOpened) return;
						scope.states.isOpened = true;
						scope.states.isTouched = true;
						
						$document.find('body').addClass('ngModalVisible'); //Disable document scroll
						
						if(scope.initOps.animation){ //Animations
							$modal.removeClass(scope.initOps.animDropOut).addClass(scope.initOps.animDropIn);
							$mBody.removeClass(scope.initOps.animBodyOut).addClass(scope.initOps.animBodyIn);
						}
						
						$timeout(function(){ //Set modal body position
							if(!scope.initOps.fullscreen) mBodyResize();
							if(scope.initOps.compactClose) mCloseSetPos(); /* Compact close button */
						});
						
						$timeout(function(){ //Event callbacks
							if(scope.onOpen) scope.onOpen();
							if(scope.callbacks.onOpen) scope.callbacks.onOpen();
						}, scope.initOps.animDuration); //After animation complete
						
						if(!scope.$$phase && !scope.$root.$$phase) scope.$apply();
					};
					
					/* Close modal */
					scope.controls.close = function(){
						if(!scope.states.isOpened) return;
						
						if(scope.initOps.animation){ //Animations
							$modal.removeClass(scope.initOps.animDropIn).addClass(scope.initOps.animDropOut);
							$mBody.removeClass(scope.initOps.animBodyIn).addClass(scope.initOps.animBodyOut);
						}
						
						$timeout(function(){
							scope.states.isOpened = false;
							
							//Event callbacks
							if(scope.onClose) scope.onClose();
							if(scope.callbacks.onClose) scope.callbacks.onClose();
							
							$timeout(function(){
								if(document.getElementsByClassName('ngModal _active').length === 0){
									$document.find('body').removeClass('ngModalVisible'); //Enable document scroll
								}
							});
						}, scope.initOps.animDuration); //After animation complete
						
						if(!scope.$$phase && !scope.$root.$$phase) scope.$apply();
					};
					
					/* Get modal states */
					scope.controls.getStates = function(){
						return scope.states;
					};
					
					/* Gallery next image */
					scope.controls.nextImage = function(){
						scope.nextImage();
					};
					
					/* Gallery previous image */
					scope.controls.prevImage = function(){
						scope.prevImage();
					};
					
					/* Gallery show image */
					scope.controls.showImage = function(index){
						if(index < scope.gallery.length) scope.showImage(index);
						if(!scope.$$phase && !scope.$root.$$phase) scope.$apply();
					};
					
					
					
					
					
					/////////////////////////////////////////////////////////////////////////////////////////////
					// 				Browser actions
					/////////////////////////////////////////////////////////////////////////////////////////////
					
					/* Window key press */
					$document.bind('keyup', function(event){
						if(scope.states.isOpened){
							if(event.which === keys.esc){
								scope.controls.close();
							} else if(event.which === keys.left){
								scope.prevImage();
							} else if(event.which === keys.right){
								scope.nextImage();
							}
						}
					});
					
					/* Window resize */
					angular.element($window).bind('resize', function(){
						if(scope.states.isOpened){
							if(!scope.initOps.fullscreen) mBodyResize();
							if(scope.initOps.compactClose) mCloseSetPos(); /* Compact close button */
						}
					});
					
					
					
					
					
					/////////////////////////////////////////////////////////////////////////////////////////////
					// 				Misc 
					/////////////////////////////////////////////////////////////////////////////////////////////
					
					/* Check for nested modal */
					$timeout(function(){
						if(closest($modal[0], 'ngModal')) $modal.css({'position':'absolute'});
					});
				}
			}
		}
	}]);
 })();