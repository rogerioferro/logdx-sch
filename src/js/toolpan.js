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
 * @extends {logdx.sch.tool}
 * @constructor
 */
logdx.sch.toolpan = function() {
  logdx.sch.tool.call(this);
};
goog.inherits(logdx.sch.toolpan, logdx.sch.tool);

/**
 * onMouseDown
 * 
 * @override
 */
logdx.sch.toolpan.prototype.onMouseDown = function() {
  this.x = this.event.mm_client.x;
  this.y = this.event.mm_client.y;
};
/**
 * onMouseDrag
 * 
 * @override
 */
logdx.sch.toolpan.prototype.onMouseDrag = function(){
  var dx = this.event.mm_client.x - this.x;
  var dy = this.event.mm_client.y - this.y;
  
  this.x = this.event.mm_client.x;
  this.y = this.event.mm_client.y;  

  
  this.canvas.pan(dx, dy);
};
