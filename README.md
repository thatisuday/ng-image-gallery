# angular-image-gallery
Angular directive for image gallery in **modal** with **thumbnails**
###[Preview](http://bit.do/ng-image-gallery )

***

# Dependencies
1. AngularJS
2. ngAnimate

> Make sure you load all dependencies before loading **ng-image-gallery** files

***

# Install
## Download
### → using bower
```
bower install --save ng-image-gallery
```

> Include `angular.min.js` and `angular-animate.min.js` from bower components.
>
> Include `main.min.js` and `main.min.css` from `dist` folder of this repository.
>
> Include `icons` from `res` folder of this repository.

### → Manual 
1. Install AngularJS or include `<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js"></script>`
2. Install ngAnimate or include `<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-animate.js"></script>`
3. Include `main.min.js` and `main.min.css` from `dist` folder of this repository.
4. Include `icons` from `res` folder of this repository.

## Configure
Add `thatisuday.ng-image-gallery` module to your app's dependencies.

```
var myTestApp = angular.module('test', ['thatisuday.ng-image-gallery']);
```


***

# Create image gallery
```
<ng-image-gallery images="images" methods="methods" thumbnails="true | false | model" on-open="opened();" on-close="closed();"></ng-image-gallery>
```

> You can also use `<div ng-image-gallery ...></div>` approach.

## Options (attributes)
### 1. images
**images** is a JavaScript array that contains objects with image url(s) of the images to be loaded into the gallery. This object can be dynamic, means images can be pushed into this array at any time. This array looks like below...

```
// inside your app controller
$scope.images = [
	{
		thumbUrl : 'https://pixabay.com/static/uploads/photo/2016/06/13/07/32/cactus-1453793__340.jpg',
		url : 'https://pixabay.com/static/uploads/photo/2016/06/13/07/32/cactus-1453793_960_720.jpg'
	},
	{
		url : 'https://pixabay.com/static/uploads/photo/2016/06/10/22/25/ortler-1449018_960_720.jpg'
	},
	{
		thumbUrl : 'https://pixabay.com/static/uploads/photo/2016/04/11/18/53/aviator-1322701__340.jpg',
		url : 'https://pixabay.com/static/uploads/photo/2016/04/11/18/53/aviator-1322701_960_720.jpg'
	}
];
```
> `thumbUrl` is not absolutely necessary. If `thumbUrl` url is empty, thumbnail will use `url` instead to show preview.

--

### 2. methods (optional)
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

### 3. thumbnails (optional)
thumbnails attribute is used when you need to generate thumbnails on the page of the gallery images. When user clicks on any thumbnail, gallery modal is opened with that image as visible image.

> It's value can be `true` or `false` hardcoded in attribute itself or you can assigned it to some scope variable which has boolean value.

--
### 4. on-open (optional)
This is the callback function that must be executed after gallery modal is opened. Function in the controller will look like below

```
$scope.opened = function(){
	alert('Gallery opened'); // or do something else
}
```

--

### 5. on-close (optional)
Similar to `on-open` attribute but will be called when gallery modal closes.


***

# Traits
1. Provide support for thumbnail generation.
2. Dynamic population of images at any time.
3. Lazy-loading of images, meaning... loading animation will be showed in the gallery until image is downloaded.
4. jQuery independent with no dom manipulation at all.
5. Smooth animations.
6. Keypress support.
7. Responsive (using css flexbox).
8. 4kb gzipped (css+js)
9. Total control on gallery from outsite world.
10. Made by awesome guy ;) - just kidding (about `awesome`)

***

# Contributions and Bug reports
1. Please create an issue if you need some help or report a bug.
2. Take a pull request to add more features or fix the bugs. Please mention your changes in the PR.
