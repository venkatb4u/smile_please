
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

	* Simply double-click on the page to toggle the 'EDIT' mode GUI and single click to select the DOM
 */

var SP = (function () {
	"use strict";

	function _(tg, cb) {

	 	tg = typeof tg === 'string' ? document.querySelector(tg) : tg;

	 	var DOMURL = window.URL || window.webkitURL || window;

		function sp () {
			(function init(sp) {
				// target assignment, if not, doc.body is default
				sp.target = tg || document.body;
				sp.cb = cb;

				// cloning the target to avoid polluting the original doc reference
				sp.targetClone = sp.target.cloneNode(true); 

				sp.createCanvas(); 

				sp.render();

			})(this);

			return {
				start : this.guiStart,
				stop : this.guiStop,
				__proto__ : this.__proto__
			}
		};

		sp.prototype = {

			createCanvas: function () {
				var canvas = document.createElement('canvas');
				canvas.id = 'sp_canvas';
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
				var len = cs.length || 0,
					inlStyles = "";

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
				var self = this;
				return new Promise(function(resolve, reject) { 
					var	nodeList = target ? target.getElementsByTagName('*') : self.target.getElementsByTagName('*'),
						nodeListLen = nodeList.length || 0;
					var nodeCloneList = self.targetClone.getElementsByTagName('*');
					var promises = [];
					while (nodeListLen--) {
						promises.push((function(nodeListLen) { // to sustain in the loop with callback ops
							return new Promise(function(res, rej) {
								var cloneElem = nodeCloneList[nodeListLen];
								if (cloneElem.nodeName === 'IMG') {
									imgToDataUrl(cloneElem.src).then(function(dataUrl) {
										cloneElem.src = dataUrl;
										cloneElem.style = self.getStyles(nodeList[nodeListLen]);
										res();
									});
								}
								else {
									cloneElem.style = self.getStyles(nodeList[nodeListLen]);	
									res();
								}
							});
						})(nodeListLen));
					}

					(function rootNodeStyleFix (sp) { // target tag style apply		
						sp.targetClone.style = sp.getStyles(sp.target, true); 
					})(self);
					
					Promise.all(promises).then(function(results) { // assuring if all of the inner-promises are resolved.
						resolve(nodeCloneList);
					});
					
				});
			},

			cookBlob: function (target) {
				var target = target || this.targetClone;
				
				this.applyStyles().then(function(response) {
					console.log(response);
				});

				var xmlSer = new XMLSerializer(),
					serialisedDom = xmlSer.serializeToString(target),
					svgScaffold = '';

				return svgScaffold = '<svg xmlns="http://www.w3.org/2000/svg" id="sp_svg">' +
								           '<foreignObject width="100%" height="100%">' +
									           '<div xmlns="http://www.w3.org/1999/xhtml" id="sp_root">' +
									           		serialisedDom +
									           '</div>' +
								           '</foreignObject>' +
							          '</svg>';
			},

			render: function () {
				var self = this,
					cookedBlob = this.cookBlob(),
					svg = new Blob([cookedBlob], {type: 'image/svg+xml'}),
					url = DOMURL.createObjectURL(svg),
					img = new Image();

				function requestImage(imageUrl) {
					return new Promise(function(resolve, reject) { 
						var URL = window.URL || window.webkitURL,
							req = new XMLHttpRequest();
					    req.onload = function() {
					      var img = new Image();
					      img.setAttribute('crossOrigin', 'anonymous'); // this is to support CORS

					      img.onload = function() {
					        URL.revokeObjectURL(this.src);
					        resolve(img);
					      };
					      img.onerror = function() {
					      	reject(Error('img load err'));
					      }
					      
					      img.src = URL.createObjectURL(req.response);
					    };
					    req.open("get", imageUrl, true);
					    req.responseType = 'blob';
					    req.send();
					});
				}

				requestImage(url).then(function(img) {
					// console.log(url);
				 //  	console.log(img);
				    self.canvas.width = img.width;
				    self.canvas.height = img.height;
				    // self.ctx = self.canvas.getContext('2d');
				    self.ctx.drawImage(img, 0, 0);
				 	
				 	try { // handling exception if canvas is tainted
				  		var dataURL = self.canvas.toDataURL("image/png", 1.0);
    					dataURL.replace(/^data:image\/(png|jpg);base64,/, ""); 	
				  	}
				  	catch (e) {
				  		console.log(e);
				  	}
				  	
				  	dataURL && localStorage.setItem("savedImageData", dataURL);
				  	// callback trigger
				  	self.cb && self.cb(self.canvas); 

				});

				// img.onload = function () {
				// 	var imgWidth = img.width,
				// 		imgHeight = img.height;

				// 	self.canvas.width = imgWidth;
				// 	self.canvas.height = imgHeight;

				//   	// self.ctx.drawImage(img, 0, 0, 500, 300, 0, 0, 500, 300);
				//   	self.ctx.drawImage(img, 0, 0);

				//   	try { // handling exception if canvas is tainted
				//   		var dataURL = self.canvas.toDataURL("image/png", 1.0);
    // 					dataURL.replace(/^data:image\/(png|jpg);base64,/, ""); 	
				//   	}
				//   	catch (e) {
				//   		console.log(e);
				//   	}
				  	

				//   	dataURL && localStorage.setItem("savedImageData", dataURL);

				//   	// document.body.appendChild(img);
				//   	DOMURL.revokeObjectURL(url);

				//   	// callback trigger
				//   	self.cb && self.cb(self.canvas); 
				// }

				// img.setAttribute('crossOrigin', 'anonymous'); // this is to support CORS
				// img.setAttribute('width', this.canvas.width + 'px');
				// img.setAttribute('height', this.canvas.height + 'px');
				// img.src = url;

				// // make sure the load event fires for cached images too
				// if ( img.complete || img.complete === undefined ) {
				//     img.src = "http://www.gravatar.com/avatar/0e39d18b89822d1d9871e0d1bc839d06?s=128&d=identicon&r=PG";
				//     img.src = url;
				// }

				var modal = document.getElementById('sp_modal');
				while (modal.firstChild)  // flushing off
				    modal.removeChild(modal.firstChild);

				var header = document.createElement('header');
				header.textContent = "Here's the screenshot...! \n Do 'Right click' --> 'Save As' to export it out.";
				modal.appendChild(header);
				modal.appendChild(this.canvas);
				!modal.hasAttribute('open') && modal.showModal();

			}

		};

		return new sp();

	}

	// Event handlers
	function selectHandler (e) {
		e.preventDefault(); // cutting-off default behaviours 
		e.stopPropagation(); // to prevent propagating to dblclick

		this.selected = e.target;
		console.log("Selected - ", this.selected);

		var modal = document.getElementById('sp_modal');
		if (modal.hasAttribute('open') && modal.contains(document.getElementsByTagName('canvas')[0])) {
			modal.removeChild(modal.lastChild);
			modal.close();
		}
		else {
			_(this.selected, function() {
				document.body.classList.remove('sp_edit');
				document.body.removeEventListener('click', selectHandler, true); // ONE-TIME event trigger
			});
		}
		
		
	}
	
	function editModeHandler (e) {
		e.preventDefault();
		e.stopPropagation();

		document.body.classList.toggle('sp_edit') ? document.body.addEventListener('click', selectHandler, true) : document.body.removeEventListener('click', selectHandler, true);
	}
	document.body.addEventListener('dblclick', editModeHandler, false);

	// Styles
	(function attachSpStyles () {

		var style = ".sp_edit *:hover {"
						+ "cursor: move;"
						+ "box-shadow: -1px 3px 21px 0px rgba(0, 0, 0, 0.75);"
					+ "}"
					+ "#sp_modal {"
						+ "text-align: center;"
						+ "width: 90%;"
						+ "margin: 0 auto;"
						+ "padding: 0 0 20px 0;"
					+ "}"
					+ "#sp_modal > header {"
						+ "padding: 15px;"
						+ "margin-bottom: 20px;"
						+ "background: #f7f9fb;"
						+ "box-shadow: 0px 1px 10px #333;"
					+ "}";
		var styleTag = document.createElement('style');
		styleTag.textContent = style;
		document.head.appendChild(styleTag);
	})();
	// Modal
	(function modalScreen () {
		var modal = document.createElement('dialog');
		modal.id = 'sp_modal';
		document.body.appendChild(modal);
	})();

	console.log('EditMode events triggered...!');
	console.log('Use __(dom, [optional-callback]) for taking screengrabs');


	// Image CORS exception handler
	function imgToDataUrl (url) {
		return new Promise(function(resolve, reject) { 
		 	  var img = new Image();
			  img.crossOrigin = 'Anonymous';
			  img.onload = function() {
			    var canvas = document.createElement('canvas');
			    var ctx = canvas.getContext('2d');
			    var dataURL;
			    canvas.height = this.height;
			    canvas.width = this.width;
			    ctx.drawImage(this, 0, 0);
			    dataURL = canvas.toDataURL('image/png');
			    canvas = null;

			    resolve(dataURL);

			  };

			  img.onerror = function() {
			     reject(Error("img load error"));
			  };

			  img.src = url;
		});
	}

	return _;

})();

__ = smilePlease = SP; // short-hand alias.

// DEBUG mode
// __('#test', function(canvas) {
// 	document.body.appendChild(canvas);
// 	// console.log(canvas.toDataURL('image/jpeg', 1.0));
// });

