
/*
 * SmilePlease v1.0 - a lightweight library for taking screenshots of the current state of DOM
 * Author: Venkat Subramanian <venkat.crescentian@gmail.com>
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
				sp.target = tg;

				// cloning the target to avoid polluting the original reference
				sp.targetClone = tg.cloneNode(true); 

				sp.createCanvas(); 
				sp.render();
				// sp.applyStyles();
			})(this);
		};

		sp.prototype = {

			createCanvas: function () {
				// var canvas = document.createElement('canvas');
				var canvas = document.getElementById('canvas');
				canvas.setAttribute('width', this.target.offsetWidth + 'px');
				canvas.setAttribute('height', this.target.offsetHeight + 'px');
				this.canvas = canvas;
				this.ctx = canvas.getContext('2d');

				
			},

			getStyles: function (elem, isRoot, prop) {
				var cs = window.getComputedStyle(elem,null);
			  	if (prop) {
				  // console.log(prop+" : "+cs.getPropertyValue(prop));
				  return prop + ":" + cs.getPropertyValue(prop) + ";";
				}
				var len = cs.length || 0;
				var inlStyles = "";
				while (--len) {
				 
				  var style = cs[len];

				  // skipping to add 'margins' to the canvas for Root elem
				  if (isRoot && (style.indexOf('margin') > -1 || style.indexOf('margin-') > -1)) {
				  	  continue;
				  }

				  inlStyles += (style + ":" + cs.getPropertyValue(style) + ";");
				  // console.log(style+" : "+cs.getPropertyValue(style));
				}
				return inlStyles;
			},

			applyStyles: function (target) {
				
				var nodeList = target ? target.getElementsByTagName('*') : this.target.getElementsByTagName('*'),
					nodeListLen = nodeList.length || 0;
				var nodeCloneList = this.targetClone.getElementsByTagName('*');

				while (--nodeListLen) {
					nodeCloneList[nodeListLen].style = this.getStyles(nodeList[nodeListLen]);
				}

				(function rootNodeStyleFix (sp) { // target tag style apply		
					sp.targetClone.style = sp.getStyles(sp.target, true); 
				})(this);
				
				
				return nodeCloneList;
			},

			cookBlob: function (target) {
				var target = target || this.targetClone;
				
				this.applyStyles();

				var xmlSer = new XMLSerializer();
				var serialisedDom = xmlSer.serializeToString(target);

				var svgScaffold = '<svg xmlns="http://www.w3.org/2000/svg" id="sp_svg">' +
							           '<foreignObject width="100%" height="100%">' +
								           '<div xmlns="http://www.w3.org/1999/xhtml" id="sp_root">' +
								           		serialisedDom +
								           '</div>' +
							           '</foreignObject>' +
						          '</svg>';
			    // console.log(serialisedDom);
				// var xmlParser = new DOMParser();
				// var xmlDoc = xmlParser.parseFromString(svgScaffold, "text/xml");
				
				// xmlDoc.getElementById('sp_root').appendChild(domExtract);
				return svgScaffold;
			},

			render: function () {
				var self = this;
				var img = new Image();
				var cookedBlob = this.cookBlob();
				// console.log(cookedBlob);
				var svg = new Blob([cookedBlob], {type: 'image/svg+xml'});
				var url = DOMURL.createObjectURL(svg);

				// this.createCanvas();

				img.src = url;
				img.setAttribute('width', this.canvas.width + 'px');
				img.setAttribute('height', this.canvas.height + 'px');

				img.onload = function () {
					var imgWidth = img.width;
					var imgHeight = img.height;

					self.canvas.width = imgWidth;
					self.canvas.height = imgHeight;

				  	// self.ctx.drawImage(img, 0, 0, 500, 300, 0, 0, 500, 300);
				  	self.ctx.drawImage(img, 0, 0);
				  	// document.body.appendChild(img);
				  	DOMURL.revokeObjectURL(url);
				}

				

				// document.body.appendChild(img);
				document.body.appendChild(this.canvas);

			}

		};

		return new sp();

	}(function(target) {
		return typeof target === 'string' ? document.querySelector(target) : target;
	}(target), callback));
}

__ = smilePlease; // short-hand alias.

// e.g. 
__('#test');

