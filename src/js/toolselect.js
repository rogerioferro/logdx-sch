/**
 * @fileoverview Schematic Select Tool.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

 goog.provide('logdx.sch.toolselect');
 
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
 * onMouseDown
 * 
 * @override
 */
logdx.sch.toolselect.prototype.onMouseDown = function() {
  
  this.onMouseUp();
  this.zoom = this.canvas.getZoom();
  var stroke = new goog.graphics.Stroke(0.2/this.zoom, 'rgba(128,0,128,0.8)');
  var fill = new goog.graphics.SolidFill('#800080', 0.2);
  this.shape = this.canvas.graphics.drawRect(
    this.event.mm_offset.x, this.event.mm_offset.y, 0, 0, stroke, fill);
};
/**
 * onMouseDrag
 * 
 * @override
 */
logdx.sch.toolselect.prototype.onMouseDrag = function(){
  var w = this.event.mm_offset.x - this.event.mm_offset_down.x;
  var h = this.event.mm_offset.y - this.event.mm_offset_down.y;
  this.shape.setSize(Math.max(0.1,Math.abs(w)),Math.max(0.1,Math.abs(h)));
  this.shape.setPosition(this.event.mm_offset_down.x + Math.min(0,w), 
    this.event.mm_offset_down.y + Math.min(0,h));
  var zoom = this.canvas.getZoom();
  if(this.zoom != zoom){
    this.zoom = zoom;
    var stroke = new goog.graphics.Stroke(0.2/this.zoom, 'rgba(128,0,128,0.8)');  
    this.shape.setStroke(stroke);
  }
};
/**
 * on MouseUp
 * 
 * @override
 */
logdx.sch.toolselect.prototype.onMouseUp = function(){
  if(this.shape){
    this.canvas.graphics.removeElement(this.shape);
    this.shape.dispose();
    this.shape = null;
  }
};
