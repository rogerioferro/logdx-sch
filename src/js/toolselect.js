/**
 * @fileoverview Schematic Select Tool.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

 goog.provide('logdx.sch.toolselect');

 goog.require('goog.math');
 goog.require('logdx.sch.tool');
 goog.require('logdx.sch.Action');

/**
 * Select class
 *
 * @extends {logdx.sch.tool}
 * @constructor
 */
logdx.sch.toolselect = function() {
  logdx.sch.tool.call(this);
  
  /**
   * Figure clicked.
   * @type {logdx.sch.Figure?}
   */
  this.figureClicked = null;
  
  /**
   * Action to execute
   * @type {logdx.sch.Action?}
   */
  this.action = null;
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
    this.shape.setAttributes({'stroke-width' : 0.2 / zoom});
  }
};

/**
 * onMouseDown
 *
 * @override
 */
logdx.sch.toolselect.prototype.onMouseDown = function() {
  this.clearShape();
  if (this.action != null) {
    if (this.action == logdx.sch.Action.SELECT) {
      this.clearSelection();
      this.figureClicked.select();
      this.action = logdx.sch.Action.MOVE;
    }
    this.p0 = this.event.mm_offset.clone();
    if (this.action == logdx.sch.Action.MOVE) {
      goog.array.forEach(this.canvas.selected, function(figure, i, arr){
        figure.setOpacity(0.5);
      },this);        
    }
    else{
      if (this.action == logdx.sch.Action.SE_RESIZE) {
      }
      this.figureClicked.setOpacity(0.5);
    }
  }
  else {    
    this.clearSelection();
    this.shape = this.canvas.getSvg().drawRect(
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
  if (this.action != null) {
    switch (this.action) {
      default:
      case logdx.sch.Action.MOVE:
        var diff = goog.math.Coordinate.difference(
                          this.event.mm_offset, this.p0);
        goog.array.forEach(this.canvas.selected, function(figure, i, arr){
          figure.translate(diff);
        },this);        
        break;
    }
    this.p0 = this.event.mm_offset.clone();
  }
  else {
    var w = this.event.mm_offset.x - this.event.mm_offset_down.x;
    var h = this.event.mm_offset.y - this.event.mm_offset_down.y;
    var left = this.event.mm_offset_down.x + Math.min(0, w);
    var top = this.event.mm_offset_down.y + Math.min(0, h);
    var width = Math.max(0.1, Math.abs(w));
    var height = Math.max(0.1, Math.abs(h));
    this.shape.setSize(width, height);
    this.shape.setPosition(left, top);
  }
};
/**
 * on MouseUp
 *
 * @override
 */
logdx.sch.toolselect.prototype.onMouseUp = function() {
  goog.array.forEach(this.canvas.selected, function(figure, i, arr){
    figure.setOpacity(1);
  },this);        
  if (this.action == null) {
    this.clearSelection();
    goog.array.forEach(this.canvas.figures, function(figure, i, arr){
      if (figure.isInside(this.shape)) {
        figure.select();
      }
    },this);
  }
  else {
    this.action = null;
  }
  this.clearShape();
};

/**
 * Clear selection shape
 */
logdx.sch.toolselect.prototype.clearShape = function() {
  if (this.shape) {
    this.canvas.getSvg().removeElement(this.shape);
    this.shape = null;
  }
};

/**
 * Clear selection list
 */
logdx.sch.toolselect.prototype.clearSelection = function() {
  while (this.canvas.selected.length > 0) {
    this.canvas.selected.pop().unselect(true);
  }
};

/**
 * Some figure was clicked
 * @param {logdx.sch.Figure} figure Figure clicked.
 * @param {logdx.sch.Action} action Action to execute.
 */
logdx.sch.toolselect.prototype.clicked = function(figure, action) {
  this.action = action;
  this.figureClicked = figure;
};
