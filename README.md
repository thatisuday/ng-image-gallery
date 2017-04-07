![gif](https://media.giphy.com/media/l0HlHWjTy61tdPxYs/giphy.gif)

# ng-image-gallery ![bower](https://img.shields.io/bower/v/ng-image-gallery.svg?style=flat-square) [![npm downloads](https://img.shields.io/npm/dt/ng-image-gallery.svg?style=flat-square)](https://www.npmjs.com/package/ng-image-gallery) [![preview](https://img.shields.io/badge/preview-click_here-green.svg?style=flat-square)](https://rawgit.com/thatisuday/ng-image-gallery/master/demo/main.html)

Angular directive for image gallery in **modal** with **thumbnails** or **inline** like carousel

***

# Dependencies
1. AngularJS
2. ngAnimate

> Make sure you load all dependencies before loading **ng-image-gallery** files

***

# Install
## Download
### → using __**bower**__ or __**npm**__
```
bower install --save ng-image-gallery
npm install --save ng-image-gallery
```

> Include `angular.min.js` and `angular-animate.min.js` from bower components.
>
> Include `ng-image-gallery.min.js` and `ng-image-gallery.min.css` from `dist` folder of this repository.
>
> Include `icons` from `res` folder of this repository.
>
> Include `hammer.js` for touch support (optional).

### → Manual
1. Install AngularJS or include `<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js"></script>`
2. Install ngAnimate or include `<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-animate.js"></script>`
3. Include `ng-image-gallery.min.js` and `ng-image-gallery.min.css` from `dist` folder of this repository.
4. Include `icons` from `res` folder of this repository.
5. Include `hammer.js` from http://hammerjs.github.io (optional).

## Configure
Add `thatisuday.ng-image-gallery` module to your app's dependencies.

```
var myTestApp = angular.module('test', ['thatisuday.ng-image-gallery']);
```


***

# Create image gallery
```
<ng-image-gallery
	images="images"
	methods="methods"
	thumbnails="true | false | boolean-model"
	thumb-size="integer | model"
	inline="true | false | boolean-model"
	bubbles="true | false | boolean-model"
	bubble-size="integer | model"
	img-bubbles="true | false | boolean-model"
	bg-close="true | false | boolean-model"
	piracy="true | false | boolean-model"
	img-anim="fadeup"
	conf="conf"
	on-open="opened();"
	on-close="closed();"
	on-delete="delete(img, cb)"
></ng-image-gallery>
```

> You can also use `<div ng-image-gallery ...></div>` approach.


## Set options in `config` phase
You can set up `ng-image-gallery` options once and for all using `ngImageGalleryOptsProvider`.

```
myApp.config(['ngImageGalleryOptsProvider', function(ngImageGalleryOptsProvider){
	ngImageGalleryOptsProvider.setOpts({
		thumbnails  	:   true,
		thumbSize		: 	80,
		inline      	:   false,
		bubbles     	:   true,
		bubbleSize		: 	20,
		imgBubbles  	:   false,
		bgClose     	:   false,
		piracy 			: 	false,
		imgAnim 		: 	'fadeup',
	});
}])
```

> See runtime options for explanation

***

## Set options in runtime (attributes)
### images
**images** is a JavaScript array that contains objects with image url(s) of the images to be loaded into the gallery. This object can be dynamic, means images can be pushed into this array at any time. This array looks like below...

```
// inside your app controller
$scope.images = [
	{
		id : 1,
		title : 'This is <b>amazing photo</b> of <i>nature</i>',
		alt : 'amazing nature photo',
		thumbUrl : 'https://pixabay.com/static/uploads/photo/2016/06/13/07/32/cactus-1453793__340.jpg',
		url : 'https://pixabay.com/static/uploads/photo/2016/06/13/07/32/cactus-1453793_960_720.jpg',
		extUrl : 'http://mywebsitecpm/photo/1453793'
	},
	{
		id : 2,
		url : 'https://pixabay.com/static/uploads/photo/2016/06/10/22/25/ortler-1449018_960_720.jpg',
		deletable : true,
	},
	{
		id : 3,
		thumbUrl : 'https://pixabay.com/static/uploads/photo/2016/04/11/18/53/aviator-1322701__340.jpg',
		url : 'https://pixabay.com/static/uploads/photo/2016/04/11/18/53/aviator-1322701_960_720.jpg'
	}
];
```
> `id` is unique field which is mandatory after v2.1.0. This help angular keep track of images.

> `deletable` is boolean field which provide delete icon on gallery to delete the image. Read `on-delete` attribute.

> `thumbUrl` is not absolutely necessary. If `thumbUrl` url is empty, thumbnail will use `url` instead to show preview.

> `extUrl` is also **optional**, it is external link of current image. An `external link' icon with anchor link will be added beside close button.

> `title` and `alt` tags are also **optional**.

--

### methods (optional)
**methods** is a communication gateway between your app and image gallery methods. It's a JavaScript object which can be used to `open` or `close` the modal as well as change images inside gallery using `prev` and `next` key. This can be done as follows...

```
// inside your app controller
$scope.images = [...];

// gallery methods
$scope.methods = {};

// so you will bind openGallery method to a button on page
// to open this gallery like ng-click="openGallery();"
$scope.openGallery = function(){
	$scope.methods.open();

	// You can also open gallery model with visible image index
	// Image at that index will be shown when gallery modal opens
	//scope.methods.open(index);
};

// Similar to above function
$scope.closeGallery = function(){
	$scope.methods.close();
};

$scope.nextImg = function(){
	$scope.methods.next();
};

$scope.prevImg = function(){
	$scope.methods.prev();
};
```

--

### thumbnails (optional) _[default : true]_
thumbnails attribute is used when you need to generate thumbnails on the page of the gallery images. When user clicks on any thumbnail, gallery modal is opened with that image as visible image.

--

### thumb-size (optional) _[default : 80]_
Sets the size of thumbnails in pixels. You just need to add integer values.

--

### inline (optional) _[default : false]_
inline attribute is used when you need to inline image gallery instead in modal. When gallery is inline, no thumbnails will be generated and gallery will be launched automatically.

--

### bubbles (optional) _[default : true]_
Turn on/off bubbles.

--

### bubble-size (optional) _[default : 20]_
Sets the size of navigational bubbles in pixels. You just need to add integer values.

--

### img-bubbles (optional) _[default : false]_
To create image bubbles instead of simple circles. by default, bubble image url will be `thumbUrl` or `url`. But you can also add `bubbleUrl` (of small sizes images) to minimize request payload.

> Not recommend if bubbles url defaults to `url` as it will download heavy images all at once.

--

### bg-close (optional) _[default : false]_
close gallery on background click. This can be very sensitivity in mobile devices. This will not work in inline gallery.


--

### piracy  (optional) _[default : false]_
Allow user to save image by right click on it.

--

### img-anim (optional) _[default : 'fadeup']_
Set animation for image transition. Possible animation classes : `fade`, `fadeup`, `zoom`, `slide`, `pop`, `revolve`.

--

### conf
`conf` attribute contains JavaScript object (bound to scope) which override global options.

Not a big fan of inline options, use `conf`
```
$scope.conf = {
	thumbnails  	:   true,
	thumbSize		: 	80,
	inline      	:   false,
	bubbles     	:   true,
	bubbleSize		: 	20,
	imgBubbles  	:   false,
	bgClose     	:   false,
	piracy 			: 	false,
	imgAnim 		: 	'fadeup',
};
```

--

### on-open (optional) _[default : noop]_
This is the callback function that must be executed after gallery modal is opened. Function in the controller will look like below

```
$scope.opened = function(){
	alert('Gallery opened'); // or do something else
}
```

--

### on-close (optional) _[default : noop]_
Similar to `on-open` attribute but will be called when gallery modal closes.

--

### on-delete (optional) _[default : noop]_
Callback function when user deletes the image. This function receives two arguments. The image that is requested to delete and a callback function.
Once you dealt with image, make sire to call callback function, which will remove that image from gallery and refresh the UI.


***

# Touch support
- swipe right for prev
- swipe left for next
- doubletap to close gallery

> Touch will be enabled only if `hammer.js` file is added.

***

# Precautions
### When gallery is inline
1. Do not open gallery manually, it will be automatically launched inline in the page.
2. Default dimensions of inline gallery is 100% by 300px. Make sure to customize it as per your needs on `.ng-image-gallery-modal` class inside `.ng-image-gallery.inline` class.
3. Do not use callbacks on inline gallery as it is useless to do so at least on `open` and `close` events.
4. By default, close button is hidden in inline gallery as it makes no sense.

***

# Traits
1. Provide support for thumbnail generation.
2. Dynamic population of images at any time.
3. Lazy-loading of images, meaning... loading animation will be showed in the gallery until image is downloaded.
4. jQuery independent.
5. Smooth animations.
6. Keypress support.
7. Responsive (using css flexbox) with touch support.
8. Image theft protection (simple way)
9. Total control on gallery from outside world.
10. Inline + Modal gallery, awesome combo.

***

# Build on your own
You can build this directive with your own customization using gulp.

1. Go to repository's parent directory and install all node dev dependencies using `npm install --dev`.
2. Make sure you have gulp install globally. Else use `npm install -g gulp` to install gulp globally.
3. All css for this repository has been generated using sass (.scss), so you need to spend 5 mins to learn basics of sass.
4. To build or watch the changes, use command `gulp build` or `gulp watch`
5. run `node demo-server.js` to lauch demo of the plugin.

***

# Contributions and Bug reports
1. Please create an issue if you need some help or report a bug.
2. Take a pull request to add more features or fix the bugs. Please mention your changes in the PR.
3. Please make sure you recommend good practices if you came/come across any or if something could have been better in this module.
