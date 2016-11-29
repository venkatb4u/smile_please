
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
    *  __(); (OR) smilePlease();   // if no DOM specified, 'document.body' is made to be default

	*  __(dom, [optional-callback]); (OR) smilePlease(dom, [optional -allback]);
	  e.g. __('#test'), __('.test', function(canvas) { document.body.appendChild(canvas) })
 */

var SP = (function () {
	"use strict";
	function selectHandler (e) {
		e.preventDefault(); // cutting-off default behaviours 
		e.stopPropagation(); // to prevent propagating to dblclick

		this.selected = e.target;
		console.log(this.selected);
	}
	
	function editModeHandler (e) {
		e.preventDefault();
		e.stopPropagation();

		if(document.body.classList.toggle('sp_edit')) { // if added
			document.body.addEventListener('click', selectHandler, true);
		}
		else {
			document.body.removeEventListener('click', selectHandler, true);
		}
	}

	function modalScreen () {
		var modal = document.createElement('dialog');
		modal.id = 'sp_modal';
		document.body.appendChild(modal);
	}

	document.body.addEventListener('dblclick', editModeHandler, false);
	modalScreen();

	console.log('EditMode events triggered...!');
	console.log('Use __(dom, [optional-callback]) for taking screengrabs');

	return function (tg, cb) {

	 	tg = typeof tg === 'string' ? document.querySelector(tg) : tg;

	 	var DOMURL = window.URL || window.webkitURL || window;

		function sp () {
			(function init(sp, editModeTrigger) {
				// target assignment, if not, doc.body is default
				sp.target = tg || document.body;
				sp.cb = cb;

				// cloning the target to avoid polluting the original doc reference
				sp.targetClone = sp.target.cloneNode(true); 

				sp.createCanvas(); 

				sp.render(function() {
					document.body.addEventListener('dblclick', editModeTrigger);
				});


			})(this, function() {
				
			});

			return {
				start : this.guiStart,
				stop : this.guiStop,
				__proto__ : this.__proto__
			}
		};

		sp.prototype = {

			createCanvas: function () {
				var canvas = document.createElement('canvas');
				canvas.setAttribute('width', this.target.offsetWidth + 'px');
				canvas.setAttribute('height', this.target.offsetHeight + 'px');
				this.canvas = canvas;
				this.ctx = canvas.getContext('2d');
			},

			getStyles: function (elem, isRoot, prop) {
				var cs = window.getComputedStyle(elem,null);
			  	if (prop) {
				  return prop + ":" + cs.getPropertyValue(prop) + ";";
				}
				var len = cs.length || 0;
				var inlStyles = "";

				while (len--) {
				 
				  var style = cs[len];

				  // skipping to add 'margins' to the canvas for Root elem
				  if (isRoot && (style.indexOf('margin') > -1 || style.indexOf('margin-') > -1))
				  	  continue;

				  inlStyles += (style + ":" + cs.getPropertyValue(style) + ";");
				}
				return inlStyles;
			},

			applyStyles: function (target) {
				
				var nodeList = target ? target.getElementsByTagName('*') : this.target.getElementsByTagName('*'),
					nodeListLen = nodeList.length || 0;
				var nodeCloneList = this.targetClone.getElementsByTagName('*');

				while (nodeListLen--) 
					nodeCloneList[nodeListLen].style = this.getStyles(nodeList[nodeListLen]);

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
				return svgScaffold;
			},

			render: function () {
				var self = this;
				var cookedBlob = this.cookBlob();

				var svg = new Blob([cookedBlob], {type: 'image/svg+xml'});
				var url = DOMURL.createObjectURL(svg);

				var img = new Image();

				img.onload = function () {
					var imgWidth = img.width;
					var imgHeight = img.height;

					self.canvas.width = imgWidth;
					self.canvas.height = imgHeight;

				  	// self.ctx.drawImage(img, 0, 0, 500, 300, 0, 0, 500, 300);
				  	self.ctx.drawImage(img, 0, 0);

				  	try { // handling exception if canvas is tainted
				  		var dataURL = self.canvas.toDataURL("image/png", 1.0);
    					dataURL.replace(/^data:image\/(png|jpg);base64,/, ""); 	
				  	}
				  	catch (e) {
				  		console.log(e);
				  	}
				  	

				  	dataURL && localStorage.setItem("savedImageData", dataURL);

				  	// document.body.appendChild(img);
				  	DOMURL.revokeObjectURL(url);

				  	// callback trigger
				  	self.cb && self.cb(self.canvas); 
				}

				img.setAttribute('crossOrigin', 'anonymous'); // this is to support CORS
				img.setAttribute('width', this.canvas.width + 'px');
				img.setAttribute('height', this.canvas.height + 'px');
				img.src = url;
				// img.src = "http://www.gravatar.com/avatar/0e39d18b89822d1d9871e0d1bc839d06?s=128&d=identicon&r=PG";

				// make sure the load event fires for cached images too
				if ( img.complete || img.complete === undefined ) {
				    img.src = "blob:http://localhost:3000/14d9bc95-e312-4872-8ab3-282e97c1dd0b";
				    img.src = url;
				}

				// document.body.appendChild(img);
				var modal = document.getElementById('sp_modal');
				modal.appendChild(this.canvas);
				modal.showModal();

			}

		};

		return new sp();

	};

})();

__ = smilePlease = SP; // short-hand alias.

// DEBUG mode
// __('#test', function(canvas) {
// 	document.body.appendChild(canvas);
// 	// console.log(canvas.toDataURL('image/jpeg', 1.0));
// });

