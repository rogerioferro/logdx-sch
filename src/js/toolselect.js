/**
 * @fileoverview Schematic Select Tool.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

 goog.provide('logdx.sch.toolselect');

 goog.require('goog.math');
 goog.require('logdx.sch.tool');



/**
 * Select class
 *
 * @extends {logdx.sch.tool}
 * @constructor
 */
logdx.sch.toolselect = function() {
  logdx.sch.tool.call(this);
};
goog.inherits(logdx.sch.toolselect, logdx.sch.tool);

/**
 * setCanvas
 *
 * @param {logdx.sch.Canvas} canvas Canvas object.
 *
 * @override
 */
logdx.sch.toolselect.prototype.setCanvas = function(canvas) {
  logdx.sch.toolselect.superClass_.setCanvas.call(this, canvas);
  this.canvas.listen(logdx.sch.Canvas.EventType.ZOOM,
    this.onZoom, false, this);
  goog.dom.classes.add(this.canvas.getElement(),
    goog.getCssName('log-cursor-pointer'));
};

/**
 * dispose
 * @override
 */
logdx.sch.toolselect.prototype.dispose = function() {
  this.canvas.unlisten(logdx.sch.Canvas.EventType.ZOOM,
    this.onZoom);
  goog.dom.classes.remove(this.canvas.getElement(),
    goog.getCssName('log-cursor-pointer'));
};


/**
 * onZoom
 *
 * Called on zoom change
 *
 */
logdx.sch.toolselect.prototype.onZoom = function() {
  if (this.shape) {
    var zoom = this.canvas.getZoom();
    //var stroke = new goog.graphics.Stroke(0.2 / zoom, 'rgba(128,0,128,0.8)');
    //this.shape.setStroke(stroke);
    this.shape.setAttributes({'stroke-width' : 0.2 / zoom});
  }
};
/**
 * onMouseDown
 *
 * @override
 */
logdx.sch.toolselect.prototype.onMouseDown = function() {
  this.onMouseUp();
  this.figure = null;
  goog.array.forEach(this.canvas.figures, function(figure, i, arr) {
    if (figure.contains(this.event.mm_offset)) {
      this.figure = figure;
      return false;
    }
  },this);
  if (this.figure) {
    this.p0 = this.event.mm_offset.clone();
    this.figure.shape.setAttributes({'opacity' : 0.5});
    this.canvas.setHandle(this.figure.bounds, 0);
  }
  else {
    //var fill = new goog.graphics.SolidFill('#800080', 0.2);
    this.canvas.clearHandle();
    this.shape = this.canvas.svg_.drawRect(
      this.event.mm_offset.x, this.event.mm_offset.y, 0, 0);
    this.shape.setAttributes({'fill' : '#800080',
                              'fill-opacity' : 0.2,
                              'stroke' : '#800080',
                              'stroke-opacity' : 0.8
                             });
    this.onZoom();
  }
};
/**
 * onMouseDrag
 *
 * @override
 */
logdx.sch.toolselect.prototype.onMouseDrag = function() {
  if (this.figure) {
    var diff = goog.math.Coordinate.difference(this.event.mm_offset, this.p0);
    this.figure.translate( diff );
    this.canvas.transformHandle(this.figure.bounds.left, this.figure.bounds.top, 0);
    this.p0 = this.event.mm_offset.clone();
  }
  else {
    var w = this.event.mm_offset.x - this.event.mm_offset_down.x;
    var h = this.event.mm_offset.y - this.event.mm_offset_down.y;
    this.shape.setSize(Math.max(0.1, Math.abs(w)), Math.max(0.1, Math.abs(h)));
    this.shape.setPosition(this.event.mm_offset_down.x + Math.min(0, w),
    this.event.mm_offset_down.y + Math.min(0, h));
  }
};
/**
 * on MouseUp
 *
 * @override
 */
logdx.sch.toolselect.prototype.onMouseUp = function() {
  if (this.shape) {
    this.canvas.svg_.removeElement(this.shape);
    this.shape.dispose();
    this.shape = null;
  }
  if (this.figure) {
    this.figure.shape.setAttributes({'opacity' : 1});    
  }
};
