!(function() {
	$.slipOnePageScroll = {};
	$.slipOnePageScroll.version = "0.0.1";
	$.fn.slipOnePageScroll = function(options) {

		var START_EVENT = 'touchstart',
			MOVE_EVENT = 'touchmove',
			END_EVENT = 'touchend',
			empty = function() {},
			slip = null,
			scTop,
			scHeight,
			startX, 
			startY,
			winHeight = window['innerHeight'] <= (document.body.clientHeight || document.documentElement.clientHeight) ?  window['innerHeight'] : (document.body.clientHeight || document.documentElement.clientHeight),
			opts = {
				ele: options.ele || $(this),
				scEle: $(options.scEle) || '',
				startFn: options.startFn || empty,
				moveFn: options.moveFn || empty,
				endFn: options.endFn || empty,
			};
		opts.page = opts.scEle.index();	
		opts.startPage = opts.page - 1;
		opts.endPage = opts.page + 1;
		function GetSlideAngle(dx, dy) {
	        return Math.atan2(dy, dx) * 180 / Math.PI;
	    }
		function GetSlideDirection(startX, startY, endX, endY) {
		      var dy = startY - endY;
		      var dx = endX - startX;
		      var result = 0;
		      //如果滑动距离太短
		      if(Math.abs(dx) < 2 && Math.abs(dy) < 2) {
		          return result;
		      }
		      var angle = GetSlideAngle(dx, dy);
		      if(angle >= -45 && angle < 45) {
		          result = 4;
		      }else if (angle >= 45 && angle < 135) {
		          result = 1;
		      }else if (angle >= -135 && angle < -45) {
		          result = 2;
		      }
		      else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
		          result = 3;
		      }
		      return result;
		}
		function reBind() {
			opts.ele.get(0).addEventListener(START_EVENT, slip._onTouchStart, false);
	    	opts.ele.get(0).addEventListener(MOVE_EVENT, slip._onTouchMove, false);
	    	opts.ele.get(0).addEventListener(END_EVENT, slip._onTouchEnd, false);
		}

		function reStart(callback) {
		    document.addEventListener(START_EVENT, this._onTouchStart, false);
		    document.addEventListener(END_EVENT, this._onTouchEnd, false);
		}
		function delstart(callback) {
		    document.removeEventListener(START_EVENT, this._onTouchStart, false);
		    document.removeEventListener(END_EVENT, this._onTouchEnd, false);
		}
		reStart.prototype._onTouchStart = delstart.prototype._onTouchStart = function(e) {
			startX = e.touches[0].pageX;
	        startY = e.touches[0].pageY;
		}	
		reStart.prototype._onTouchEnd = delstart.prototype._onTouchEnd = function(e) {	
			scTop = opts.scEle.scrollTop();

			var endX = e.changedTouches[0].pageX;
	        var endY = e.changedTouches[0].pageY;

	        var direction = GetSlideDirection(startX, startY, endX, endY);

	        // console.log('方向：' +　direction);
	        // console.log('scTop：' + scTop);
	        // console.log('scHeight - scTop：' + (scHeight - scTop));

			if(scHeight - scTop == winHeight && direction == 1) {
				new delstart();
				reBind();
		    	slip.jump(opts.endPage);
			}

			if(scTop == 0 && direction == 2) {
				new delstart();
				if(opts.startPage == 0) {
					init();
				} else {
					reBind();
			    	slip.jump(opts.startPage);
				}
			}
		}

		function init() {
			slip = Slip(opts.ele.get(0), 'y').webapp(null,true).start(function(e) {
				console.log('start');
				opts.startFn.call(this);
			}).move(function(e) {
				console.log('move');
				opts.moveFn.call(this);
			}).end(function(e) {
				console.log('end');
				opts.endFn.call(this);
				if(this.page == opts.page) {
					scTop = opts.scEle.scrollTop(),
					scHeight = opts.scEle.get(0).scrollHeight;
					console.log(scHeight - scTop);
					console.log(scTop);
					if((scHeight - scTop == winHeight || scTop == 0) && scHeight > winHeight) {
						slip.destroy();
						new reStart();
					}
				}
			});
		}
		init()
	}
})();