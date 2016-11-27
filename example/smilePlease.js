
/*
 * SmilePlease v1.0 - a lightweight library for taking screenshots of the current state of DOM
 * Author: Venkat Subramanian (https://github.com/Venkatb4U)
 * 
 * Copyright (c) 2016 Venkat Subramanian (https://github.com/Venkatb4U)
 * Licence: MIT
 */

 /*
  USAGE:
  -----
	smilePlease(dom, [optional callback]);
 */

var smilePlease = function (target, callback) {
	(function (tg, cb) {
	 	"use strict";

	 	var DOMURL = window.URL || window.webkitURL || window;

		function sp () {
			(function init(sp) {
				sp.createCanvas(); 
				sp.render(tg);
			})(this);
		};

		sp.prototype = {

			createCanvas: function () {
				var canvas = document.getElementById('canvas');
				canvas.setAttribute('width', '600px');
				canvas.setAttribute('height', '600px');
				this.ctx = canvas.getContext('2d');

				//document.body.appendChild(canvas);
			},
			cookBlob: function (domExtract) {
				var xmlSer = new XMLSerializer();
				var serialisedDom = xmlSer.serializeToString(domExtract);
				var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
					           '<foreignObject width="100%" height="100%">' +
						           '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
						            	serialisedDom +
						           '</div>' +
					           '</foreignObject>' +
				           '</svg>';
				var data1 ='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
					           '<foreignObject width="100%" height="100%">' +
						           '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
						             '<p style="color:red;"> hi venkat</p>' +
						             '<div href="https://facebook.com" style="border:2px dotted yellow;"> div tag</div>' +
						             '<img src="http://www.w3schools.com/tags/smiley.gif" width="50px" height="30px" />' +
						           '</div>' +
					           '</foreignObject>' +
				           '</svg>';
				console.log({data});
				console.log({data1});
				return data;
			},
			render: function (domExtract) {
				var self = this;
				var img = new Image();
				var svg = new Blob([this.cookBlob(domExtract)], {type: 'image/svg+xml'});
				var url = DOMURL.createObjectURL(svg);

				img.onload = function () {
				  self.ctx.drawImage(img, 0, 0);
				  DOMURL.revokeObjectURL(url);
				}

				img.src = url;

				console.log('url', url);
			}

		};

		return new sp();

	}(target, callback));
}

__ = smilePlease; // short-hand alias.

__(document.getElementById('test'));




//

// var canvas = document.getElementById('canvas');
// var ctx = canvas.getContext('2d');

// var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
//            '<foreignObject width="100%" height="100%">' +
//            '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
//              '<p> hi venkat asd</p>' +
//            '</div>' +
//            '</foreignObject>' +
//            '</svg>';

// var DOMURL = window.URL || window.webkitURL || window;

// var img = new Image();
// var svg = new Blob([data], {type: 'image/svg+xml'});
// var url = DOMURL.createObjectURL(svg);

// img.onload = function () {
//   ctx.drawImage(img, 0, 0);
//   DOMURL.revokeObjectURL(url);
// }

// img.src = url;