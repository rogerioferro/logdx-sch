/**
 * @fileoverview Schematic Pan Tool.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

goog.provide('logdx.sch.toolpan');

goog.require('logdx.sch.tool');


/**
 * Pan class
 *
 * @param {boolean=} opt_use_cursor Change canvas cursor.
 *
 * @extends {logdx.sch.tool}
 * @constructor
 */
logdx.sch.toolpan = function(opt_use_cursor) {
  logdx.sch.tool.call(this);
  this.use_cursor = !!opt_use_cursor;
};
goog.inherits(logdx.sch.toolpan, logdx.sch.tool);

/**
 * setCanvas
 *
 * @param {logdx.sch.Canvas} canvas Canvas object.
 *
 * @override
 */
logdx.sch.toolpan.prototype.setCanvas = function(canvas) {
  logdx.sch.toolpan.superClass_.setCanvas.call(this, canvas);
  if (this.use_cursor) {
    goog.dom.classes.add(this.canvas.getElement(),
      goog.getCssName('log-cursor-grab'));
  }
};

/**
 * dispose
 * @override
 */
logdx.sch.toolpan.prototype.dispose = function() {
  goog.dom.classes.remove(this.canvas.getElement(),
    goog.getCssName('log-cursor-grab'));
  goog.dom.classes.remove(this.canvas.getElement(),
    goog.getCssName('log-cursor-grabbing'));
};

/**
 * onMouseWheel
 * @param {number} step Mouse Wheel Step.
 *
 * @override
 */
logdx.sch.toolpan.prototype.onMouseWheel = function(step) {
  var z = this.canvas.getZoom() * (1 + step * 0.1);
  if (z >= 0.95 && z <= 1.05) z = 1;

  this.canvas.setZoom(z, this.event.mm_offset);

};
/**
 * onMouseDown
 *
 * @override
 */
logdx.sch.toolpan.prototype.onMouseDown = function() {
  this.x = this.event.mm_client.x;
  this.y = this.event.mm_client.y;
    goog.dom.classes.add(this.canvas.getElement(),
      goog.getCssName('log-cursor-grabbing'));
};
/**
 * onMouseDrag
 *
 * @override
 */
logdx.sch.toolpan.prototype.onMouseDrag = function() {
  var dx = this.event.mm_client.x - this.x;
  var dy = this.event.mm_client.y - this.y;

  this.x = this.event.mm_client.x;
  this.y = this.event.mm_client.y;

  this.canvas.pan(dx, dy);
};
/**
 * onMouseUp
 *
 * @override
 */
logdx.sch.toolpan.prototype.onMouseUp = function() {
    goog.dom.classes.remove(this.canvas.getElement(),
      goog.getCssName('log-cursor-grabbing'));
};
