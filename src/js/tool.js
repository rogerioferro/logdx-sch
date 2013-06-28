/**
 * @fileoverview Schematic Tool base class.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */
goog.provide('logdx.sch.tool');
goog.provide('logdx.sch.tool.MouseEvent');

goog.require('goog.math');


/**
 * Tool constructor
 * 
 *
 * @constructor
 */
logdx.sch.tool = function() {
  
  /**
   * Canvas object.
   * @type {logdx.sch.canvas?}
   */
  this.canvas = null;
  
  /**
   * Mouse Event values.
   * @type {logdx.sch.tool.MouseEvent}
   */
  this.event = new logdx.sch.tool.MouseEvent();
  
};

/**
 * dispose
 */
logdx.sch.tool.prototype.dispose = function() {
};

/**
 * setCanvas
 * 
 * @param {logdx.sch.canvas} canvas Canvas object.
 */
logdx.sch.tool.prototype.setCanvas = function(canvas) {
  this.canvas = canvas;
};

/**
 * onMouseWheel
 * @param {number} step Mouse Wheel Step
 */
logdx.sch.tool.prototype.onMouseWheel = function(step){
};
/**
 * onMouseMove
 */
logdx.sch.tool.prototype.onMouseMove = function(){
};
/**
 * onMouseDown
 */
logdx.sch.tool.prototype.onMouseDown = function() {
};
/**
 * onMouseDrag
 */
logdx.sch.tool.prototype.onMouseDrag = function(){
};
/**
 * on MouseUp
 */
logdx.sch.tool.prototype.onMouseUp = function(){
};



/**
 * Mouse Event class.
 * 
 * @constructor
 */
logdx.sch.tool.MouseEvent = function () {
  
  /** @type {boolean}*/
  this.mouse_down = false;
  
  /** @type {goog.events.BrowserEvent.MouseButton}*/
  this.button = goog.events.BrowserEvent.MouseButton.LEFT;

  /** Pixel values*/
  /** @type {goog.math.Coordinate}*/
  this.px_client_down = new goog.math.Coordinate();
  /** @type {goog.math.Coordinate}*/
  this.px_client = new goog.math.Coordinate();
  /** @type {goog.math.Coordinate}*/
  this.px_offset_down = new goog.math.Coordinate();
  /** @type {goog.math.Coordinate}*/
  this.px_offset = new goog.math.Coordinate();

  /** Millimeter values*/
  /** @type {goog.math.Coordinate}*/
  this.mm_client_down = new goog.math.Coordinate();
  /** @type {goog.math.Coordinate}*/
  this.mm_client = new goog.math.Coordinate();
  /** @type {goog.math.Coordinate}*/
  this.mm_offset_down = new goog.math.Coordinate();
  /** @type {goog.math.Coordinate}*/
  this.mm_offset = new goog.math.Coordinate();

};
