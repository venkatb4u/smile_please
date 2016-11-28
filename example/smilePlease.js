
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
	// function targetResolve (target) {
	// 	if (typeof target === 'string') {

	// 	}
	// }
	(function (tg, cb) {
	 	"use strict";

	 	var DOMURL = window.URL || window.webkitURL || window;

		function sp () {
			(function init(sp) {
				sp.target = tg;
				sp.createCanvas(); 
				sp.render();
				sp.applyStyles();
			})(this);
		};

		sp.prototype = {

			createCanvas: function () {
				var canvas = document.createElement('canvas');
				canvas.setAttribute('width', this.target.offsetWidth + 'px');
				canvas.setAttribute('height', this.target.offsetHeight + 'px');
				this.canvas = canvas;
				this.ctx = canvas.getContext('2d');

				document.body.appendChild(this.canvas);
			},

			getStyles: function (elem, prop) {
				var cs = window.getComputedStyle(elem,null);
			  	if (prop) {
				  // console.log(prop+" : "+cs.getPropertyValue(prop));
				  return prop + ":" + cs.getPropertyValue(prop) + ";";
				}
				var len = cs.length;
				var inlStyles = "";
				for (var i=0;i<len;i++) {
				 
				  var style = cs[i];
				  inlStyles += (style + ":" + cs.getPropertyValue(style) + ";");
				  // console.log(style+" : "+cs.getPropertyValue(style));
				}
				return inlStyles;
			},

			applyStyles: function () {
				var nodeList = this.target.getElementsByTagName('*'),
					nodeListLen = nodeList.length;
				for (var i=0; i<nodeListLen; i++) {
					var tag = nodeList[i];
					tag.style = this.getStyles(tag);
				}
				return nodeList;
			},

			cookBlob: function (domExtract) {
				var xmlSer = new XMLSerializer();
				var serialisedDom = xmlSer.serializeToString(domExtract);

				var svgScaffold = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" id="sp_svg">' +
							           '<foreignObject width="100%" height="100%">' +
								           '<div xmlns="http://www.w3.org/1999/xhtml" id="sp_root">' +
								           		serialisedDom +
								           '</div>' +
							           '</foreignObject>' +
						          '</svg>';

				// var xmlParser = new DOMParser();
				// var xmlDoc = xmlParser.parseFromString(svgScaffold, "text/xml");
				
				// xmlDoc.getElementById('sp_root').appendChild(domExtract);

				// var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
				// 	           '<foreignObject width="100%" height="100%">' +
				// 		           '<div xmlns="http://www.w3.org/1999/xhtml" id="sp_root">' +
				// 		            	serialisedDom +
				// 		           '</div>' +
				// 	           '</foreignObject>' +
				//            '</svg>';
			
				// var xmlSer = new XMLSerializer();
				// var serialisedDom = xmlSer.serializeToString(xmlDoc);
				
				// console.log({xmlDoc});
				// console.log({data1});
				// return xmlSer.serializeToString(xmlDoc.getElementById('sp_svg'));
				return svgScaffold;
			},

			render: function () {
				var self = this;
				var img = new Image();
				var cookedBlob = this.cookBlob(this.target);
				// console.log(cookedBlob);
				var svg = new Blob([cookedBlob], {type: 'image/svg+xml'});
				var url = DOMURL.createObjectURL(svg);

				img.onload = function () {
				  self.ctx.drawImage(img, 0, 0);
				  DOMURL.revokeObjectURL(url);
				}

				img.src = url;

			}

		};

		return new sp();

	}(function(target) {
		return typeof target === 'string' ? document.querySelector(target) : target;
	}(target), callback));
}

__ = smilePlease; // short-hand alias.

__('#test');

