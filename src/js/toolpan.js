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
 * onMouseWheel
 * @param {number} step Mouse Wheel Step
 * 
 * @override
 */
logdx.sch.toolpan.prototype.onMouseWheel = function(step){
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
