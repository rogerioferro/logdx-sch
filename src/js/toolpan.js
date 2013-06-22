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
 * @param {logdx.sch.canvas} canvas Canvas object.
 *
 * @extends {logdx.sch.tool}
 * @constructor
 */
logdx.sch.toolpan = function(canvas) {
  logdx.sch.tool.call(this, canvas);
};
goog.inherits(logdx.sch.toolpan, logdx.sch.tool);

/**
 * onMouseDown
 * 
 * @override
 */
logdx.sch.toolpan.prototype.onMouseDown = function() {
  this.x = this.event.px_client.x;
  this.y = this.event.px_client.y;
};
/**
 * onMouseDrag
 * 
 * @override
 */
logdx.sch.toolpan.prototype.onMouseDrag = function(){
  var dx = this.x - this.event.px_client.x;
  var dy = this.y - this.event.px_client.y;
  
  this.x = this.event.px_client.x;
  this.y = this.event.px_client.y;  
  
  this.canvas.pan(dx, dy);
};
