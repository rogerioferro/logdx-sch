

/**
 * @fileoverview Schematic Canvas.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */
goog.provide('logdx.sch.canvas');
goog.provide('logdx.sch.canvas.EventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.EventTarget');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.graphics');
goog.require('goog.graphics.Font');
goog.require('goog.math');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Canvas component
 *
 * @param {goog.math.Size} ppi PPI size.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 *
 * @extends {goog.ui.Component}
 * @constructor
 */
logdx.sch.canvas = function(ppi, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);


  /**
   * PPI size (pixels per inch).
   * @type {goog.math.Size}
   * @private
   */
  this.ppi_ = new goog.math.Size(ppi.width, ppi.height);
  
  /**
   * PPmm size (pixels per millimeter).
   * @type {goog.math.Size}
   * @private
   */
  this.ppmm_ = new goog.math.Size(this.ppi_.width/25.4, this.ppi_.height/25.4);
  

  /**
   * Zoom factor.
   * @type {number}
   * @private
   */
  this.zoom_ = 1;

  /**
   * Enable pan.
   * @type {boolean}
   * @private
   */
  this.panEnabled_ = false;

  /**
   * In pan mode.
   * @type {boolean}
   * @private
   */
  this.panMode_ = false;

  /**
   * Sheet Size in mm.
   * @type {goog.math.Size}
   * @private
   */
  this.sheetSize_mm_ = new goog.math.Size(0, 0);

  /**
   * Sheet Size in px.
   * @type {goog.math.Size}
   * @private
   */
  this.sheetSize_ = new goog.math.Size(0, 0);

  /**
   * Graphics object. This object is created once the
   * component's DOM element is known.
   *
   * @type {goog.graphics.AbstractGraphics?}
   */
  this.graphics = null;

  /**
   * Sheet Element. This object is created once the
   * component's DOM element is known.
   *
   * @type {Element?}
   * @private
   */
  this.sheet_ = null;

  /**
   * Event handler for this object.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * Keyboard handler for this object. This object is created once the
   * component's DOM element is known.
   *
   * @type {goog.events.KeyHandler?}
   * @private
   */
  this.kh_ = null;

};
goog.inherits(logdx.sch.canvas, goog.ui.Component);


/**
 * Custom events.
 * @enum {string}
 */
logdx.sch.canvas.EventType = {
  /** Dispatched before the apply zoom. */
  ZOOM: 'zoom'
};

/**
* Set sheet size in "mm".
* @param {goog.math.Size} size of container.
* */
logdx.sch.canvas.prototype.setSheetSize = function(size) {
  this.sheetSize_mm_.width = size.width;
  this.sheetSize_mm_.height = size.height;
  this.updateSheet();
};

/**
* Update sheet size.
* */
logdx.sch.canvas.prototype.updateSheet = function() {
  this.sheetSize_.width = this.sheetSize_mm_.width * this.ppmm_.width;
  this.sheetSize_.height = this.sheetSize_mm_.height * this.ppmm_.height;

  if (this.isInDocument()) {
    var parent = goog.dom.getParentElement(this.getElement());
    this.resize(goog.style.getSize(parent));
  }
};


/**
* Set ppi.
* @param {goog.math.Size} ppi PPI size.
* */
logdx.sch.canvas.prototype.setPpi = function(ppi) {
  this.ppi_.width = ppi.width;
  this.ppi_.height = ppi.height;
  
  this.ppmm_.width = this.ppi_.width/25.4;
  this.ppmm_.height = this.ppi_.height/25.4;
  
  this.updateSheet();
};


/**
 * getZoom
 * @return {number}
 * */
logdx.sch.canvas.prototype.getZoom = function() {
  return this.zoom_;
};
/**
 * setZoom
 * @param {number} zoom Zoom Level.
 * */
logdx.sch.canvas.prototype.setZoom = function(zoom) {
  if(this.zoom_ == zoom) return;
  this.zoom_ = zoom;
  var parent = goog.dom.getParentElement(this.getElement());
  this.resize(goog.style.getSize(parent));
};
/**
 * Fit to Screen
 * */
logdx.sch.canvas.prototype.fitToScreen = function() {
  this.setZoom(1);
  var parent = goog.dom.getParentElement(this.getElement());
  var v_size = goog.style.getSize(parent);
  var s_size = goog.style.getSize(this.sheet_);
  var z_w = v_size.width/s_size.width*this.zoom_;
  var z_h = v_size.height/s_size.height*this.zoom_;
  var z = Math.min(z_w,z_h);
  this.setZoom(z);
  var size = goog.style.getSize(this.getElement());
  parent.scrollLeft = (size.width - v_size.width)/2;
  parent.scrollTop = (size.height - v_size.height)/2;
  this.dispatchEvent(logdx.sch.canvas.EventType.ZOOM);
};

/**
 * Resize canvas
 * @param {goog.math.Size} size of container.
 * @param {goog.math.Coordinate=} opt_diff space to pan.
 * */
logdx.sch.canvas.prototype.resize = function(size, opt_diff) {
  /** Scale sheet */
  var s_w = this.sheetSize_.width * this.zoom_;
  var s_h = this.sheetSize_.height * this.zoom_;
  goog.style.setSize(this.sheet_, s_w, s_h);

  /** Get sheet area in pixel. */
  //var s_size = goog.style.getSize(this.sheet_);
  var w = 2 * size.width + s_w;
  var h = 2 * size.height + s_h;

  goog.style.setSize(this.getElement(), w, h);
  this.graphics.setSize(w, h);
  var s_x = goog.math.safeCeil((w - s_w) / 2);
  var s_y = goog.math.safeCeil((h - s_h) / 2);

  var s_pos = goog.style.getPosition(this.sheet_);
  goog.style.setPosition(this.sheet_, s_x, s_y);

  /** Scale graphics area. */
  var gwz = (this.ppmm_.width*this.zoom_);
  var ghz = (this.ppmm_.height*this.zoom_);
  this.graphics.setCoordSize(w / gwz, h / ghz);
  this.graphics.setCoordOrigin(-s_x / gwz, -s_y / ghz);

  var diff = opt_diff || new goog.math.Coordinate(0, 0);
  diff.x += s_x - s_pos.x;
  diff.y += s_y - s_pos.y;
  this.pan(diff.x, diff.y);  
};
/**
 * Pan canvas
 * @param {number} dx
 * @param {number} dy
 * */
logdx.sch.canvas.prototype.pan = function(dx, dy) {
  var parent = goog.dom.getParentElement(this.getElement());
  parent.scrollLeft += dx;
  parent.scrollTop += dy;  
};
/**
 * Move Sheet to Origin
 * */
logdx.sch.canvas.prototype.gotoOrigin = function() {
  var s_pos = goog.style.getPosition(this.sheet_);
  var parent = goog.dom.getParentElement(this.getElement());
  parent.scrollLeft = s_pos.x;
  parent.scrollTop = s_pos.y;
};
/**
 * Enable pan mode
 * @param {boolean} enable
* */
logdx.sch.canvas.prototype.setPanMode = function(enable) {
  this.panMode_ = enable;

  if (this.panMode_) {
     goog.dom.classes.add(this.getElement(),
      goog.getCssName('log-canvas-move'));
  }else {
     goog.dom.classes.remove(this.getElement(),
      goog.getCssName('log-canvas-move'));
  }
};

/**
 * Creates an initial DOM representation for the component.
 */
logdx.sch.canvas.prototype.createDom = function() {
  /** Create background.*/
  var elem = goog.dom.createElement('div');
  goog.dom.classes.add(elem, goog.getCssName('log-canvas-background'));
  /** Create Sheet.*/
  this.sheet_ = goog.dom.createDom('div');
  goog.style.setStyle(this.sheet_, 'position', 'absolute');
  goog.dom.classes.add(this.sheet_, goog.getCssName('log-canvas-sheet'));

  /** Create graphic area.*/
  this.graphics = goog.graphics.createSimpleGraphics(0, 0);
  //this.graphics = new goog.graphics.CanvasGraphics(0, 0);
  //this.graphics.createDom();
 
  goog.style.setStyle(this.graphics.getElement(), 'position', 'absolute');
  goog.dom.appendChild(elem, this.sheet_);
  this.graphics.render(elem);

  /** decorate it.*/
  this.decorateInternal(elem);
};


/**
 * Decorates an existing HTML DIV element as a Canvas.
 *
 * @param {Element} element The DIV element to decorate.
 */
logdx.sch.canvas.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  var elem = this.getElement();
  elem.tabIndex = 0;

  this.kh_ = new goog.events.KeyHandler(elem);
//this.eh_.listen(this.kh_, goog.events.KeyHandler.EventType.KEY, this.onKey_);
};


/** @override */
logdx.sch.canvas.prototype.disposeInternal = function() {
  this.eh_.dispose();
  if (this.kh_) {
    this.kh_.dispose();
  }
  goog.base(this, 'disposeInternal');
};


/**
 * Called when component's element is known to be in the document.
 */
logdx.sch.canvas.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var parent = goog.dom.getParentElement(this.getElement());
  goog.style.setStyle(parent, 'overflow', 'hidden');

  /** @type {goog.events.MouseWheelHandler}*/
  this.mwh = new goog.events.MouseWheelHandler(this.getElement());
  this.eh_.listen(this.mwh, goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
    this.handleMouseWheel);
  this.eh_.listen(this.getElement(), goog.events.EventType.CONTEXTMENU,
    this.onPopup_);
  this.eh_.listen(this.getElement(), goog.events.EventType.CLICK,
    this.onClicked_);
  this.eh_.listen(this.getElement(), goog.events.EventType.MOUSEDOWN,
    this.onMouseDown_);
  this.eh_.listen(this.getElement(), goog.events.EventType.MOUSEMOVE,
    this.onMouseMove_);
  this.eh_.listen(this.getElement(), goog.events.EventType.MOUSEUP,
    this.onMouseUp_);
};


/**
 * Called when component's element is known to have been removed from the
 * document.
 */
logdx.sch.canvas.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');

  this.eh_.unlisten(this.mwh,
    goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel);
  this.eh_.unlisten(this.getElement(), goog.events.EventType.CONTEXTMENU,
    this.onPopup_);
  this.eh_.unlisten(this.getElement(), goog.events.EventType.CLICK,
    this.onClicked_);
  this.eh_.unlisten(this.getElement(), goog.events.EventType.MOUSEDOWN,
    this.onMouseDown_);
  this.eh_.unlisten(this.getElement(), goog.events.EventType.MOUSEMOVE,
    this.onMouseMove_);
  this.eh_.unlisten(this.getElement(), goog.events.EventType.MOUSEUP,
    this.onMouseUp_);

};

/**
 * Handles DIV element mouse wheel.
 * @param {goog.events.Event} event The click event.
 */
logdx.sch.canvas.prototype.handleMouseWheel = function(event) {
  event.preventDefault();

  var z_last = this.zoom_;
  var step = (event.deltaY ? event.deltaY < 0 ? -0.1 : 0.1 : 0);
  var z = Math.min(Math.max(0.01, this.zoom_ * (1 + step)),12);
  if (z >= 0.95 && z <= 1.05) z = 1;  
  this.zoom_ = z;
  
  this.dispatchEvent(logdx.sch.canvas.EventType.ZOOM);
  
  /** Calculate displacement after zoom */
  var s_pos = goog.style.getClientPosition(this.sheet_);
  var x = Math.round((event.clientX - s_pos.x) * (this.zoom_ / z_last - 1));
  var y = Math.round((event.clientY - s_pos.y) * (this.zoom_ / z_last - 1));

  var parent = goog.dom.getParentElement(this.getElement());
  this.resize(goog.style.getSize(parent), new goog.math.Coordinate(x, y));
};

/**
 * Handles Popup event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.canvas.prototype.onPopup_ = function(event) {
  event.preventDefault();
};
/**
 * Handles DIV element clicks.
 * @param {goog.events.Event} event The click event.
 * @private
 */
logdx.sch.canvas.prototype.onClicked_ = function(event) {
  event.preventDefault();
  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT &&
    !this.panMode_) {
//    console.log('Clicked...');
    var s_pos = goog.style.getClientPosition(this.sheet_);
    var fill = new goog.graphics.SolidFill('red', 0.5);
    var w = 20;
    var h = 10;
    var gwz = this.ppmm_.width * this.zoom_;
    var ghz = this.ppmm_.height * this.zoom_;
    var x = (event.clientX - s_pos.x) / gwz - w / 2;
    var y = (event.clientY - s_pos.y) / ghz - h / 2;

    this.graphics.drawRect(x, y, w, h, null, fill);
    //this.graphics.drawRect(0, 0, 3.3333, 3.3333, null, fill);
  }
};
/**
 * Handles DIV element Mouse Down event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.canvas.prototype.onMouseDown_ = function(event) {
  event.preventDefault();
  if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE ||
    (event.button == goog.events.BrowserEvent.MouseButton.LEFT &&
    this.panMode_)) {
    goog.dom.classes.add(this.getElement(),
      goog.getCssName('log-canvas-move'));

    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
    this.mouseDragDiffX = 0;
    this.mouseDragDiffY = 0;
    this.panEnabled_ = true;
  }
};
/**
 * Handles DIV element Mouse Move event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.canvas.prototype.onMouseMove_ = function(event) {
  event.preventDefault();
  if (this.panEnabled_) {
    var dXAbs = event.clientX - this.mouseDownX;
    var dYAbs = event.clientY - this.mouseDownY;

    var dX = this.mouseDragDiffX - dXAbs;
    var dY = this.mouseDragDiffY - dYAbs;

    this.pan(dX, dY);

    this.mouseDragDiffX = dXAbs;
    this.mouseDragDiffY = dYAbs;
  }
};
/**
 * Handles DIV element Mouse Up event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.canvas.prototype.onMouseUp_ = function(event) {
  event.preventDefault();
  this.panEnabled_ = false;
  if (!this.panMode_) {
    goog.dom.classes.remove(this.getElement(),
      goog.getCssName('log-canvas-move'));
  }
};


// /**
// * Fired when user presses a key while the DIV has focus.
// * @param {goog.events.Event} event The key event.
// * @private
// */
//logdx.sch.canvas.prototype.onKey_ = function(event) {
//  var keyCodes = goog.events.KeyCodes;
//  if (event.keyCode == keyCodes.SPACE || event.keyCode == keyCodes.ENTER) {
//    console.log('key pressed...');
//  }
//};
