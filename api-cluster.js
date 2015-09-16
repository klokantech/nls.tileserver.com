/**
 * TileServer.com Maps API: National Library of Scotland 
 * -----------------------------------------------------
 * Exported JavaScript functions to access to the public tilesets:
 *
 * - NLSTileUrlOS(x,y,z) - Tiles for Ordnance Survey map from 1920-1947
 *
 * The functions returns URL for a tile image at given x,y,z position.
 * Without parameters Bing SDK compatible string is returned.
 *
 * Please always get the tile url via this JavaScript API!
 * Direct access to the tile location is not recommended.
 * The server address is going to change as we update the dataset.
 *
 * Copyright (C) 2010 - Klokan Technologies GmbH
 * http://www.klokantech.com/
 */

// Global variables for the tileserver
var tileserver = "";
// var tileserver_default = "uk.tileserver.com/_os1/r0/";
var tileserver_default = "cz.tileserver.com/nls/";
var _gaq = _gaq || [];

// THE PUBLIC FUNCTIONS:
// =====================

/* Tiles for Ordnance Survey map from 1920-1947
 *
 * with x, y, z parameters it returns an URL for particular tile
 * with bounds paramter it returns expected results for OpenLayers
 * with tile, zoom parameters it behaves like Google getTileUrl function
 * without parameter it gives you the "Bing SDK" compatible universal string to access the tiles
 *
 * The function returns tiles from the tileserver_default, and after the dynamic test is finished from the fastest tileserver available
 */
function NLSTileUrlOS( x, y, z ) {

	// the "MAXZOOM" constant
	if (x == "MAXZOOM") return 14;

	// without given "x" we are returning Bing SDK string
	if (x == undefined) {
		return "http://t%2."+tileserver_default+'%4.jpg'; // ALWAYS DEFAULT SERVER NOW
		// if (tileserver == "") return "http://t%2."+tileserver_default+"%4.jpg";
		// else return "http://t%2."+tileserver+'%4.jpg';
	}
	
	// with "${x}" we return OpenLayers Array - this will mostly return only the tileserver_default location
	if (x == "${x}") {
		var urls = new Array();
		if (tileserver == "")
			for (no=0;no<5;no++)
				urls.push("http://t"+no+"."+tileserver_default+z+'/'+x+'/'+y+'.jpg');
		else
			for (no=0;no<5;no++)
				urls.push("http://t"+no+"."+tileserver+z+'/'+x+'/'+y+'.jpg');
		return urls;
	}
	
	// behave like OpenLayers .getURL(bounds):
	if (x['left'] != undefined) {
		var bounds = x;
		var res = this['map']['getResolution']();
		x = Math.round((bounds['left'] - this['maxExtent']['left']) / (res * this['tileSize']['w']));
		y = Math.round((this['maxExtent']['top'] - bounds['top']) / (res * this['tileSize']['h']));
		z = this['map']['getZoom']();
	}
	
	// behave like Google .getTileUrl(tile, zoom):
	if (x['x'] != undefined && Number( y ) != NaN && z == undefined) {
		z = y;
		y = x['y'];
		x = x['x'];
	}
  
  // HACK - ALWAYS USE THE NEW CDN ADDRESS
  var no = (x+y) % 4;
  return "http://nls-"+no+".tileserver.com/nls/"+z+'/'+x+'/'+y+'.jpg';
	
	// with numbers let's return directly the url to the tile on the server
	var no = (x+y) % 5;
	if (tileserver == "") return "http://t"+no+"."+tileserver_default+z+'/'+x+'/'+y+'.jpg';
	else return "http://t"+no+"."+tileserver+z+'/'+x+'/'+y+'.jpg';
}

/* CHOOSE A TILESERVER ON THE CLIENT SIDE
 * ======================================
 * Testing done via embedded iFrame: http://nls.tileserver.com/test.html
 * which calls tileserver_result() function
 *
 * Ignores servers which are down (unavailable) or extremelly overloaded (slow) !!!
 * Chooses the servers which are closest to the visitor (fastest response), theoretically.
 * TODO: implement trivial load-balancing (random selection) between available servers with a similar response time
 * TODO: give priority to certain servers (threshold based on the response time of other servers)
 */

function tileserver_test() {
	// add the iframe
	var tempIFrame=document.createElement('iframe');
	tempIFrame.style.border='0px';
	tempIFrame.style.width='0px';
	tempIFrame.style.height='0px';
	tempIFrame.src= 'http://nls.tileserver.com/test.html'; // RUN THE SPEED TEST!!!
	iFrameObj = document.body.appendChild(tempIFrame);
}

function tileserver_result( url ) { // THIS FUNCTION IS CALLED FROM THE EXTERNAL IFRAME

	tileserver=url;
	
	// SAVE THE RESULT TO A COOKIE WHICH EXPIRES WITH CLOSING THE BROWSER
	if (tileserver != "") document.cookie = 'nlstileserver='+encodeURIComponent(tileserver);

	tileserver_stats();
}

function tileserver_stats() {
	
	// DEBUG: SHOW TILESERVER ADDRESS IN THE TOP RIGHT CORNER

	if (window.location.href.search("DEBUG") != -1) {
		var newdiv = document.createElement('div');
		if (tileserver == "") newdiv.innerHTML = "DEFAULT: t0."+tileserver_default;
		else newdiv.innerHTML = "t0."+tileserver;
		newdiv.style.position="absolute";
		newdiv.style.top="0px";
		newdiv.style.right="0px";
		newdiv.style.color="#fff";
		newdiv.style.zIndex=1000;
		newdiv.style.backgroundColor="#000";
		if (document.body) document.body.appendChild(newdiv);
	}
	
	// STATISTICS - TRACKING VISITORS WITH GOOGLE ANALYTICS ASYNC

	_gaq.push(['_setAccount', 'UA-8073932-5']);
	_gaq.push(['_setDomainName', 'none']);
	_gaq.push(['_setAllowLinker', true]);
	_gaq.push(['_setAllowHash', false]);
	if (window.location.href.search("nls.tileserver.com") != -1)
		_gaq.push(['_setVar', ( window!=window.top ? "iframe" : "nls.tileserver.com" )]);
	else 
		_gaq.push(['_setVar', 'api']);
	_gaq.push(['_setCustomVar', 1, 'tileserver', tileserver, 2]);
	_gaq.push(['_trackPageview']);

	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
}


// ************
// domready.js CODE FROM: http://tanny.ica.com/ica/tko/test.nsf/js/domready.js
// http://tanny.ica.com/ICA/TKO/tkoblog.nsf/dx/domcontentloaded-for-browsers-part-v

// domReady.js
//
// DOMContentLoaded event handler. Works for browsers that don't support the DOMContentLoaded event.
//
// Modification Log:
// Date 	Initial Description
// 26 May 2008	TKO	Created by Tanny O'Haley

/*global addEvent, escape, unescape */

var domReadyEvent = {
	name: "domReadyEvent",
	// Array of DOMContentLoaded event handlers.
	events: {},
	domReadyID: 1,
	bDone: false,
	DOMContentLoadedCustom: null,

	// Function that adds DOMContentLoaded listeners to the array.
	add: function(handler) {
		// Assign each event handler a unique ID. If the handler has an ID, it
		// has already been added to the events object or been run.
		if (!handler.$$domReadyID) {
			handler.$$domReadyID = this.domReadyID++;

			// If the DOMContentLoaded event has happened, run the function.
			if(this.bDone){
				handler();
			}

			// store the event handler in the hash table
			this.events[handler.$$domReadyID] = handler;
		}
	},

	remove: function(handler) {
		// Delete the event handler from the hash table
		if (handler.$$domReadyID) {
			delete this.events[handler.$$domReadyID];
		}
	},

	// Function to process the DOMContentLoaded events array.
	run: function() {
		// quit if this function has already been called
		if (this.bDone) {
			return;
		}

		// Flag this function so we don't do the same thing twice
		this.bDone = true;

		// iterates through array of registered functions 
		for (var i in this.events) {
			this.events[i]();
		}
	},

	schedule: function() {
		// Quit if the init function has already been called
		if (this.bDone) {
			return;
		}
	
		// First, check for Safari or KHTML.
		if(/KHTML|WebKit/i.test(navigator.userAgent)) {
			if(/loaded|complete/.test(document.readyState)) {
				this.run();
			} else {
				// Not ready yet, wait a little more.
				setTimeout(this.name + ".schedule()", 100);
			}
		} else if(document.getElementById("__ie_onload")) {
			// Second, check for IE.
			return true;
		}

		// Check for custom developer provided function.
		if(typeof this.DOMContentLoadedCustom === "function") {
			//if DOM methods are supported, and the body element exists
			//(using a double-check including document.body, for the benefit of older moz builds [eg ns7.1] 
			//in which getElementsByTagName('body')[0] is undefined, unless this script is in the body section)
			if(typeof document.getElementsByTagName !== 'undefined' && (document.getElementsByTagName('body')[0] !== null || document.body !== null)) {
				// Call custom function.
				if(this.DOMContentLoadedCustom()) {
					this.run();
				} else {
					// Not ready yet, wait a little more.
					setTimeout(this.name + ".schedule()", 250);
				}
			}
		}

		return true;
	},

	init: function() {
		// If addEventListener supports the DOMContentLoaded event.
		if(document.addEventListener) {
			document.addEventListener("DOMContentLoaded", function() { domReadyEvent.run(); }, false);
		}

		// Schedule to run the init function.
		setTimeout("domReadyEvent.schedule()", 100);

		function run() {
			domReadyEvent.run();
		}
		
		// Just in case window.onload happens first, add it to onload using an available method.
		if(typeof addEvent !== "undefined") {
			addEvent(window, "load", run);
		} else if(document.addEventListener) {
			document.addEventListener("load", run, false);
		} else if(typeof window.onload === "function") {
			var oldonload = window.onload;
			window.onload = function() {
				domReadyEvent.run();
				oldonload();
			};
		} else {
			window.onload = run;
		}

		/* for Internet Explorer */
		/*@cc_on
			@if (@_win32 || @_win64)
			document.write("<script id=__ie_onload defer src=\"//:\"><\/script>");
			var script = document.getElementById("__ie_onload");
			script.onreadystatechange = function() {
				if (this.readyState == "complete") {
					domReadyEvent.run(); // call the onload handler
				}
			};
			@end
		@*/
	}
};

var domReady = function(handler) { domReadyEvent.add(handler); };
domReadyEvent.init();

(function(){
	var name = "nlstileserver";
	// read the cookie if available
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = cookies[i].replace(/^\s+|\s+$/g, '');
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				tileserver = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
})();

if (tileserver != "") {
	domReady(tileserver_stats);
} else {
	domReady(tileserver_test);
}
