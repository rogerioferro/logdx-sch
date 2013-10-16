/**
 * @fileoverview Schematic Figure.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

goog.provide('logdx.sch.Figure');
goog.provide('logdx.sch.Action');

goog.require('goog.math');
goog.require('goog.Disposable');
goog.require('logdx.sch.Handle');

/**
 * Enum for Actions
 * @enum {number}
 */
logdx.sch.Action = {
  SELECT    : 1,
  MOVE      : 2,
  ROTATE    : 3,
  NW_RESIZE : 4,
  N_RESIZE  : 5,
  NE_RESIZE : 6,
  E_RESIZE  : 7,
  SE_RESIZE : 8,
  S_RESIZE  : 9,
  SW_RESIZE : 10,
  W_RESIZE  : 11,
  REMOVE    : 12
};


/**
 * Figure object
 *
 * @extends {goog.Disposable}
 * @constructor
 */
logdx.sch.Figure = function() {
  goog.Disposable.call(this);

  /**
   * Canvas object.
   * @type {logdx.sch.Canvas?}
   */
  this.canvas_ = null;
  
  /**
   * Svg Element.
   * @type {logdx.svg.Element?}
   */
  this.svgElement_ = null;
  
  /**
   * Limits of Figure.
   * @type {goog.math.Rect?}
   */
  this.bounds = null;
  
  /**
   * The 'x' position.
   * @type {number}
   */
  this.x = 0;

  /**
   * The 'y' position.
   * @type {number}
   */
  this.y = 0;
  
  /**
   * The 'x' center position.
   * @type {number}
   */
  this.centerX = 0;

  /**
   * The 'y' center position.
   * @type {number}
   */
  this.centerY = 0;
  
  /**
   * The rotation angle.
   * @type {number}
   */
  this.rot = 0;
  
  /**
   * Event handler for this object.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);
};
goog.inherits(logdx.sch.Figure, goog.Disposable);

/**
 * Add Figure to Canvas
 * @param {logdx.sch.Canvas} canvas Canvas object.
 */
logdx.sch.Figure.prototype.addToCanvas = function(canvas) {
  if (this.canvas_ == canvas) return;
  if (this.canvas_ !== null) this.remove();
  this.canvas_ = canvas;
  
  goog.array.insert(this.canvas_.figures,this);
  
  this.svgElement_ = this.canvas_.getSvg()
      .createGroup(this.canvas_.getFigureGroup());
  
  this.shape =this.canvas_.getSvg().drawEllipse( 0, 0, 5, 10,
    this.svgElement_);
    
  this.svgElement_.setAttributes({'fill' : '#800',
                                  'fill-opacity' : 1,
                                  'stroke' : '#000',
                                  'stroke-width' : 0.2,
                                  'class' : goog.getCssName('log-cursor-move')
                                });

  var box = this.svgElement_.getElement().getBBox();
  this.bounds = new goog.math.Rect(box.x, box.y, box.width, box.height);
  this.setSize(box.width, box.height);
  
  var element = this.svgElement_.getElement();
  this.eh_.listen(element,
    goog.events.EventType.MOUSEDOWN, this.onMouseDown, this);
};
/**
 * Remove figure from Canvas
 */
logdx.sch.Figure.prototype.remove = function() {
  if (this.canvas_ && this.svgElement_) {
    this.unselect();
    goog.array.remove(this.canvas_.figures,this);
    this.canvas_.getSvg().removeElement(this.svgElement_);
    this.canvas_      = null;
    this.svgElement_  = null;
    this.bounds       = null;
  }
};

/**
 * disposeInternal
 * @override
 */
logdx.sch.Figure.prototype.disposeInternal = function() {
  var element = this.svgElement_.getElement();
  this.eh_.unlisten(element,
    goog.events.EventType.MOUSEDOWN, this.onMouseDown, this);

  this.remove();

  logdx.sch.Figure.superClass_.disposeInternal.call(this);
  
  //console.log('Figure destroyed...');
};

/**
 * Set figure opacity.
 */
logdx.sch.Figure.prototype.setOpacity = function(opacity) {
  this.svgElement_.setAttributes({'opacity':opacity});
};

/**
 * Translates this figure by the given offsets.
 * @param {goog.math.Coordinate} diff The coordinate
 * to translate this figure by.
 **/
logdx.sch.Figure.prototype.translate = function(diff) {
  this.x += diff.x;
  this.y += diff.y;
  this.updateTransformation_();
};

/**
 * Rotate this figure by the given angle.
 * @param {number} angle The angle to rotate.
 **/
logdx.sch.Figure.prototype.rotate = function(angle) {
  var phi = angle%360;
  if (phi > 180) phi -= 360; 
  //console.log(phi);
  this.rot = phi;
  this.updateTransformation_();
};

/**
 *  move to coordinate
 * @param {goog.math.Coordinate} coord Position to move.
 **/
logdx.sch.Figure.prototype.moveTo = function(coord) {
  this.x = coord.x;
  this.y = coord.y;
  this.updateTransformation_();
};

/**
 * Set size of figure.
 */
logdx.sch.Figure.prototype.setSize = function(width, height, opt_action) {
  this.bounds.width = width;
  this.bounds.height = height;
  this.centerX = this.bounds.left + this.bounds.width/2;
  this.centerY = this.bounds.top + this.bounds.height/2;
  this.updateTransformation_();  
};

/**
 * Update the transformation of figure.
 */
logdx.sch.Figure.prototype.updateTransformation_ = function() {
  if (this.svgElement_) {
    this.svgElement_.setTransformation(this.x, this.y,
      this.rot, this.centerX, this.centerY);
    if (this.handle) {
      this.handle.updateTransformation_();
    }
  }
};

/**
 * Verify if figure is inside the shape.
 * @param {logdx.svg.Element} shape Shape.
 * @return {boolean}
 **/
logdx.sch.Figure.prototype.isInside = function(shape) {
  var cr0 = shape.getElement().getBoundingClientRect();
  var cr1 = this.svgElement_.getElement().getBoundingClientRect();
  return (cr0.top <= cr1.top) && (cr0.left <= cr1.left) &&
    (cr0.bottom >= cr1.bottom) && (cr0.right >= cr1.right);
};

/**
 * Select Figure
 */
logdx.sch.Figure.prototype.select = function () {
  if (!this.handle) {
    this.canvas_.selected.push(this);
    this.handle = new logdx.sch.Handle(this);
  }
};
  
/**
 * Unselect Figure
 * @param {boolean?} opt_notRemove Don't remove from the list.
 */
logdx.sch.Figure.prototype.unselect = function (opt_notRemove) {
  if (this.handle) {
    this.handle.dispose();
    this.handle = null;
    if (!opt_notRemove) {
      goog.array.remove(this.canvas_.selected,this);
    }
  }
};

/**
 * Send action to Select Tool.
 * @param {logdx.sch.Action} action Action to send.
 */
logdx.sch.Figure.prototype.sendAction = function(action) {
  var tool = this.canvas_.getToolSelect();
  if (tool){
    tool.clicked(this, action);
  }
};

/**
 * Handles SVG element Mouse Down event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.Figure.prototype.onMouseDown = function(event) {
  this.sendAction(logdx.sch.Action.SELECT);
};
