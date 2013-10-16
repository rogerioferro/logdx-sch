
goog.provide('logdx.sch.Handle');

goog.require('goog.math');


/**
 * Handle object
 * 
 * @param {logdx.sch.Figure} figure Figure object.
 *
 * @extends {goog.Disposable}
 * @constructor
 */
logdx.sch.Handle = function(figure) {
  goog.Disposable.call(this);
  this.figure_ = figure;
  this.canvas_ = this.figure_.canvas_;
  this.svg_ = this.canvas_.getSvg();
  this.svgElement_ = this.svg_.createGroup(this.canvas_.getHandleGroup());
  
  
  this.svgMv = this.svg_.drawRect(0, 0, 0, 0, this.svgElement_);
  this.svgMv.setAttributes({'class': goog.getCssName('log-cursor-move')});
  
  this.svgNW = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.svgN  = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.svgNE = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.svgW  = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.svgE  = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.svgSE = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.svgS  = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.svgSW = this.svg_.drawRect(0,0,0,0,this.svgElement_);
  this.resizeShapes = [this.svgN, this.svgNE, this.svgE, this.svgSE, 
                       this.svgS, this.svgSW, this.svgW, this.svgNW];
  this.cursor = [goog.getCssName('log-cursor-n-resize'),
                 goog.getCssName('log-cursor-ne-resize'),
                 goog.getCssName('log-cursor-e-resize'),
                 goog.getCssName('log-cursor-se-resize'),
                 goog.getCssName('log-cursor-s-resize'),
                 goog.getCssName('log-cursor-sw-resize'),
                 goog.getCssName('log-cursor-w-resize'),
                 goog.getCssName('log-cursor-nw-resize')];

  var attr = {'fill' : '#fff',
              'fill-opacity' : 0.8,
              'stroke': '#aaa',
              'stroke-dasharray' : 'none'
             };
             
  var i = this.resizeShapes.length;
  while (i--) this.resizeShapes[i].setAttributes(attr);

  this.updateSize_();
  this.updateTransformation_();

  /**
   * Event handler for this object.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);
  this.eh_.listen(this.svgMv.getElement(),
    goog.events.EventType.MOUSEDOWN, this.onMv, this);
    

  this.canvas_.listen(logdx.sch.Canvas.EventType.ZOOM,
    this.onZoom, false, this);

  this.onZoom();
};
goog.inherits(logdx.sch.Handle, goog.Disposable);

/**
 * disposeInternal
 * @override
 */
logdx.sch.Handle.prototype.disposeInternal = function() {
  this.eh_.unlisten(this.svgMv.getElement(),
    goog.events.EventType.MOUSEDOWN, this.onMv, this);

  this.canvas_.unlisten(logdx.sch.Canvas.EventType.ZOOM,
    this.onZoom, false, this);


  this.remove();
  this.canvas_  = null;
  this.svgElement_ = null;
  logdx.sch.Handle.superClass_.disposeInternal.call(this);
};

/**
 * onZoom
 *
 * Called on zoom change
 *
 */
logdx.sch.Handle.prototype.onZoom = function() {
  var zoom = this.canvas_.getZoom();
  var p = -1/zoom;
  var s = 2/zoom;
  var i = this.resizeShapes.length;
  while(i--){
    this.resizeShapes[i].setPosition(p,p);
    this.resizeShapes[i].setSize(s,s);
  }
  
};

logdx.sch.Handle.prototype.updateSize_ = function() {
  var box     = this.figure_.bounds;
  var width   = box.width;
  var height  = box.height;
  var left    = box.left;
  var right   = left + width;
  var top     = box.top;
  var bottom  = top + height;
  var middleX = left + width/2;
  var middleY = top + height/2;
  
  this.svgMv.setPosition(left, top);
  this.svgMv.setSize(width, height);
  
  this.svgNW.setTransformation(left, top, 0, 0, 0);
  this.svgN.setTransformation(middleX, top, 0, 0, 0);
  this.svgNE.setTransformation(right, top, 0, 0, 0);
  this.svgW.setTransformation(left, middleY, 0, 0, 0);
  this.svgE.setTransformation(right, middleY, 0, 0, 0);
  this.svgSW.setTransformation(left, bottom,0, 0, 0);
  this.svgS.setTransformation(middleX, bottom, 0, 0, 0);
  this.svgSE.setTransformation(right, bottom, 0, 0, 0);
};

logdx.sch.Handle.prototype.updateTransformation_ = function() {
  var f = this.figure_;
  this.svgElement_.setTransformation(f.x, f.y, f.rot, f.centerX, f.centerY);
  var index = goog.math.safeFloor((((f.rot + 360) % 360 + 22.5) / 45 ) % 8);
  for (var i = 0; i < 8; i++){
    this.resizeShapes[i].setAttributes({'class':this.cursor[index++ % 8]})
  }
};


logdx.sch.Handle.prototype.remove = function() {
  if(this.svgElement_) {
    this.canvas_.getSvg().removeElement(this.svgElement_);
  }
};


/**
 * Handles SVG element Mouse Down event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.Handle.prototype.onMv = function(event) {
  this.figure_.sendAction(logdx.sch.Action.MOVE);
};
