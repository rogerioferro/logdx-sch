/**
 * @fileoverview Schematic Canvas.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */
goog.provide('logdx.sch.Canvas');
goog.provide('logdx.sch.Canvas.EventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.math');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('logdx.sch.Figure');
goog.require('logdx.sch.tool');
goog.require('logdx.sch.tool.MouseEvent');
goog.require('logdx.svg.Canvas');

/**
 * Canvas component
 *
 * @param {goog.math.Size} ppi PPI size.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 *
 * @extends {goog.ui.Component}
 * @constructor
 */
logdx.sch.Canvas = function(ppi, opt_domHelper) {
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
  this.ppmm_ = new goog.math.Size(this.ppi_.width / 25.4,
                                  this.ppi_.height / 25.4);

  /**
   * Zoom factor.
   * @type {number}
   * @private
   */
  this.zoom_level_ = 1;


  /**
   * SVG object. This object is created once the
   * component's DOM element is known.
   *
   * @type {logdx.svg.Canvas?}
   */
  this.svg_ = null;
  
  /**
   * Group to figures elements
   *
   * @type {logdx.svg.GroupElement?}
   */
  this.figureGroup_  = null;

  /**
   * Group to handles elements
   *
   * @type {logdx.svg.GroupElement?}
   */
  this.handleGroup_ = null;

  /**
   * List of Tools.
   * @type {Array.<logdx.sch.tool>}
   */
  this.tools = [];

  /**
   * List of Figures.
   * @type {Array.<logdx.sch.Figure>}
   */
  this.figures = [];
  
  /**
   * List of Figures Selected.
   * @type {Array.<logdx.sch.Figure>}
   */
  this.selected = [];

  /**
   * Sheet Size in mm.
   * @type {goog.math.Size}
   * @private
   */
  this.sheet_size_in_mm_ = new goog.math.Size(0, 0);

  /**
   * Sheet Position.
   *
   * @type {goog.math.Coordinate}
   * @private
   */
  this.sheet_pos_ = new goog.math.Coordinate(0, 0);

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


  /**
   * Mouse Wheel handler for this object. This object is created once the
   * component's DOM element is known.
   *
   * @type {goog.events.MouseWheelHandler?}
   * @private
   */
  this.mwh_ = null;
};
goog.inherits(logdx.sch.Canvas, goog.ui.Component);


/**
 * Custom events.
 * @enum {string}
 */
logdx.sch.Canvas.EventType = {
  /** Dispatched before the apply zoom. */
  ZOOM: 'zoom'
};

/**
 * Get Svg object 
 * @return {logdx.svg.Canvas}
 */
logdx.sch.Canvas.prototype.getSvg = function() {
  return this.svg_;
};


/**
 * Get Group to draw figures
 * @return {logdx.svg.GroupElement}
 */
logdx.sch.Canvas.prototype.getFigureGroup = function() {
  return this.figureGroup_;
};

/**
 * Get Group to draw handles
 * @return {logdx.svg.GroupElement}
 */
logdx.sch.Canvas.prototype.getHandleGroup = function() {
  return this.handleGroup_;
};

/**
 * Set Tool
 * @param {logdx.sch.tool} tool Tool object.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button.
 */
logdx.sch.Canvas.prototype.setTool = function(tool, opt_button) {
  var button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT;
  if (this.tools[button]) {
    this.tools[button].dispose();
  }
  this.tools[button] = tool;
  this.tools[button].setCanvas(this);
};


/**
 * Get toolselect object
 * @return {logdx.sch.toolselect?}
 */
logdx.sch.Canvas.prototype.getToolSelect = function () {
  var tool = this.tools[goog.events.BrowserEvent.MouseButton.LEFT];
  return tool instanceof logdx.sch.toolselect ? tool : null;
};

/**
* Set sheet size in "mm".
* @param {goog.math.Size} size of container.
* */
logdx.sch.Canvas.prototype.setSheetSize = function(size) {
  this.sheet_size_in_mm_.width = size.width;
  this.sheet_size_in_mm_.height = size.height;

  if (this.sheet) {
    this.sheet.setSize(
      this.sheet_size_in_mm_.width, this.sheet_size_in_mm_.height);
  }
};
/**
* Set ppi.
* @param {goog.math.Size} ppi PPI size.
* */
logdx.sch.Canvas.prototype.setPpi = function(ppi) {
  this.ppi_.width = ppi.width;
  this.ppi_.height = ppi.height;

  this.ppmm_.width = this.ppi_.width / 25.4;
  this.ppmm_.height = this.ppi_.height / 25.4;

  this.resize(this.curSize);
};

/**
 * getZoom
 * @return {number}
 * */
logdx.sch.Canvas.prototype.getZoom = function() {
  return this.zoom_level_;
};
/**
 * setZoom
 * @param {number} zoom Zoom Level.
 * @param {goog.math.Coordinate=} opt_cursor Cursor position.
 **/
logdx.sch.Canvas.prototype.setZoom = function(zoom, opt_cursor) {
  zoom = Math.min(Math.max(0.01, zoom), 12);

  var g = this.zoom_level_ / zoom;

  this.zoom_level_ = zoom;
  this.dispatchEvent(logdx.sch.Canvas.EventType.ZOOM);
  
  this.resize(this.curSize);

  var diff = opt_cursor || new goog.math.Coordinate();

  this.sheet_pos_.x = (this.sheet_pos_.x + diff.x) * g - diff.x;
  this.sheet_pos_.y = (this.sheet_pos_.y + diff.y) * g - diff.y;

  this.pan(0, 0);
};
/**
 * Fit to Screen
 * */
logdx.sch.Canvas.prototype.fitToScreen = function() {
  var size = this.curSize;
  
  var w_mm = size.width / this.ppmm_.width;
  var h_mm = size.height / this.ppmm_.height;


  var z_w = w_mm / this.sheet_size_in_mm_.width;
  var z_h = h_mm / this.sheet_size_in_mm_.height;
  
  var z = Math.min(z_w, z_h);

  this.setZoom(z);

  this.sheet_pos_.x =
    (w_mm / this.zoom_level_ - this.sheet_size_in_mm_.width) / 2;
  this.sheet_pos_.y =
    (h_mm / this.zoom_level_ - this.sheet_size_in_mm_.height) / 2;

  this.pan(0, 0);
};
/**
 * Resize canvas
 * @param {goog.math.Size} size of container.
 * */
logdx.sch.Canvas.prototype.resize = function(size) {
  
  /** Store size*/
  this.curSize = size.clone();
  /** Set new size. */
  var w = size.width;
  var h = size.height;
  this.svg_.setSize(w, h);
  /** Scale graphics area. */
  var gwz = (this.ppmm_.width * this.zoom_level_);
  var ghz = (this.ppmm_.height * this.zoom_level_);
  
  w /= gwz;
  h /= ghz;
  
  this.svg_.setCoordSize(w,h);
  this.pan(0, 0);

  this.sheet.setAttributes({'stroke-width' : 1/gwz});

  var width = 0.2/this.zoom_level_;
  var dash = (5*width) + ',' + (2.5*width);
  this.handleGroup_.setAttributes({'stroke-width' : width,
                                   'stroke-dasharray' : dash
                                  });
};

/**
 * Pan canvas
 * @param {number} dx
 * @param {number} dy
 * */
logdx.sch.Canvas.prototype.pan = function(dx, dy) {
  this.sheet_pos_.x += dx;
  this.sheet_pos_.y += dy;
  var gwz = (this.ppmm_.width * this.zoom_level_);
  var ghz = (this.ppmm_.height * this.zoom_level_);
  var ddx = 0.5 / gwz;
  var ddy = 0.5 / ghz;
  
  var x = -this.sheet_pos_.x - ddx;
  var y = -this.sheet_pos_.y - ddy;

  this.svg_.setCoordOrigin(x,y);
};
/**
 * Creates an initial DOM representation for the component.
 * @override
*/
logdx.sch.Canvas.prototype.createDom = function() {

  /** Create background.*/
  var elem = goog.dom.createElement('div');
  goog.dom.classes.add(elem, goog.getCssName('log-canvas-background'));

  this.svg_ = new logdx.svg.Canvas(0, 0);
  this.svg_.createDom();
  this.svg_.render(elem);

  /** Create sheet.*/
  this.sheet = this.svg_.drawRect(0, 0,
    this.sheet_size_in_mm_.width, this.sheet_size_in_mm_.height);
  this.sheet.setAttributes({'fill':'#fff','stroke':'#d4d4d4'});

  /** Create Groups of each shape type*/
  this.figureGroup_ = this.svg_.createGroup();
  this.handleGroup_ = this.svg_.createGroup();
  this.handleGroup_.setAttributes({'fill' : '#800080',
                                   'fill-opacity': 0.1,
                                   'stroke' : '#800080'});
  
  /** decorate it.*/
  this.decorateInternal(elem);
};


/**
 * Decorates an existing HTML DIV element as a Canvas.
 *
 * @param {Element} element The DIV element to decorate.
 */
logdx.sch.Canvas.prototype.decorateInternal = function(element) {
  //logdx.sch.Canvas.superClass_.decorateInternal.call(this, element);
  this.setElementInternal(element);
  var elem = this.getElement();
  elem.tabIndex = 0;
};

/** @override */
logdx.sch.Canvas.prototype.disposeInternal = function() {
  this.eh_.dispose();
  if (this.kh_) {
    this.kh_.dispose();
  }
  if (this.mwh_) {
    this.mwh_.dispose();
  }
  goog.base(this, 'disposeInternal');
};


/**
 * Called when component's element is known to be in the document.
 */
logdx.sch.Canvas.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var parent = goog.dom.getParentElement(this.getElement());
  goog.style.setStyle(parent, 'overflow', 'hidden');
  

  this.mwh_ = new goog.events.MouseWheelHandler(this.getElement());
  this.eh_.listen(this.mwh_,
    goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
    this.handleMouseWheel);

  this.eh_.listen(this.getElement(),
    goog.events.EventType.CONTEXTMENU, this.onPopup_);
  this.eh_.listen(this.getElement(), 
    goog.events.EventType.CLICK, this.onClicked_);
  this.eh_.listen(this.getElement(),
    goog.events.EventType.MOUSEDOWN, this.onMouseDown_);
  this.eh_.listen(this.getElement(),
    goog.events.EventType.MOUSEMOVE, this.onMouseMove_);
  this.eh_.listen(this.getElement(),
    goog.events.EventType.MOUSEUP, this.onMouseUp_);

//  this.eh_.listen(goog.dom.getDocument(), goog.events.EventType.KEYDOWN,
//    this.onKey_);

//  this.eh_.listen(goog.dom.getDocument(), goog.events.EventType.KEYUP,
//    this.onKey_);

//  this.kh_ = new goog.events.KeyHandler(this.getElement());
//  this.kh_ = new goog.events.KeyHandler(goog.dom.getDocument());
//  this.eh_.listen(this.kh_, goog.events.KeyHandler.EventType.KEY,
//    this.onKey_);

};
/**
 * Called when component's element is known to have been removed from the
 * document.
 */
logdx.sch.Canvas.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');

  this.eh_.unlisten(this.mwh_,
    goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
    this.handleMouseWheel);

  this.eh_.unlisten(this.getElement(),
    goog.events.EventType.CONTEXTMENU, this.onPopup_);
  this.eh_.unlisten(this.getElement(),
    goog.events.EventType.CLICK, this.onClicked_);
  this.eh_.unlisten(this.getElement(),
    goog.events.EventType.MOUSEDOWN, this.onMouseDown_);
  this.eh_.unlisten(this.getElement(),
    goog.events.EventType.MOUSEMOVE, this.onMouseMove_);
  this.eh_.unlisten(this.getElement(),
    goog.events.EventType.MOUSEUP, this.onMouseUp_);

//  this.eh_.unlisten(this.kh_, goog.events.KeyHandler.EventType.KEY,
//    this.onKey_);
};


/**
 * Convert coordinate to canvas reference.
 * @param {Number} x position x.
 * @param {Number} y position y.
 * @return {goog.math.Coordinate}
 */
logdx.sch.Canvas.prototype.clientToCanvas = function(x, y) {
//  var bounds = this.getElement().getBoundingClientRect();
  var pos = goog.style.getClientPosition(this.getElement());
  var gwz = (this.ppmm_.width * this.zoom_level_);
  var ghz = (this.ppmm_.height * this.zoom_level_);
  pos.x = (x - pos.x) / gwz - this.sheet_pos_.x;
  pos.y = (y - pos.y) / ghz - this.sheet_pos_.y;
  return pos;
};

/**
 * Set the mouse position on tool.
 * @param {logdx.sch.tool} tool Tool object.
 * @param {goog.events.Event} event The mouse event.
 */
logdx.sch.Canvas.prototype.setPointer = function(tool, event) {
  
  var s_pos = goog.style.getClientPosition(this.getElement());
  
  var gwz = (this.ppmm_.width * this.zoom_level_);
  var ghz = (this.ppmm_.height * this.zoom_level_);
  var px_client_x = event.clientX;
  var px_client_y = event.clientY;
  var px_offset_x = event.clientX - s_pos.x - this.sheet_pos_.x * gwz;
  var px_offset_y = event.clientY - s_pos.y - this.sheet_pos_.y * ghz;
  var mm_client_x = px_client_x / gwz;
  var mm_client_y = px_client_y / gwz;
  var mm_offset_x = (event.clientX - s_pos.x) / gwz - this.sheet_pos_.x;
  var mm_offset_y = (event.clientY - s_pos.y) / ghz - this.sheet_pos_.y;


  if (event.type == goog.events.EventType.MOUSEDOWN) {
    tool.event.px_client_down.x = px_client_x;
    tool.event.px_client_down.y = px_client_y;
    tool.event.px_offset_down.x = px_offset_x;
    tool.event.px_offset_down.y = px_offset_y;

    tool.event.mm_client_down.x = mm_client_x;
    tool.event.mm_client_down.y = mm_client_y;
    tool.event.mm_offset_down.x = mm_offset_x;
    tool.event.mm_offset_down.y = mm_offset_y;
  }

  tool.event.px_client.x = px_client_x;
  tool.event.px_client.y = px_client_y;
  tool.event.px_offset.x = px_offset_x;
  tool.event.px_offset.y = px_offset_y;

  tool.event.mm_client.x = mm_client_x;
  tool.event.mm_client.y = mm_client_y;
  tool.event.mm_offset.x = mm_offset_x;
  tool.event.mm_offset.y = mm_offset_y;

  //console.log(tool.event.mm_offset.toString());
};
/**
 * Handles DIV element mouse wheel.
 * @param {goog.events.Event} event The click event.
 */

logdx.sch.Canvas.prototype.handleMouseWheel = function(event) {
  event.preventDefault();
  var tool = this.tools[goog.events.BrowserEvent.MouseButton.MIDDLE];
  if (tool) {
    this.setPointer(tool, event);
    tool.onMouseWheel(goog.math.sign(event.deltaY));
  }
};
/**
 * Handles Popup event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.Canvas.prototype.onPopup_ = function(event) {
  event.preventDefault();
};
/**
 * Handles DIV element clicks.
 * @param {goog.events.Event} event The click event.
 * @private
 */
logdx.sch.Canvas.prototype.onClicked_ = function(event) {
  event.preventDefault();
  /*
  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {
//    console.log('Clicked...');

    var s_pos = goog.style.getClientPosition(this.getElement());
    var fill = new goog.graphics.SolidFill('red', 0.5);
    var w = 20;
    var h = 10;
    var gwz = this.ppmm_.width * this.zoom_level_;
    var ghz = this.ppmm_.height * this.zoom_level_;
    var x = (event.clientX - s_pos.x) / gwz - w / 2 - this.sheet_pos_.x;
    var y = (event.clientY - s_pos.y) / ghz - h / 2 - this.sheet_pos_.y;

    this.drawRect(x, y, w, h, null, fill);
    this.drawEllipse(x,y, w, h, null, fill);
    //this.svg_.drawRect(0, 0, 3.3333, 3.3333, null, fill);
  }
  /**/
};
/**
 * Handles DIV element Mouse Down event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.Canvas.prototype.onMouseDown_ = function(event) {
  event.preventDefault();
  var tool = this.tools[event.button];
  if (tool) {
    tool.event.button = event.button;
    tool.event.mouse_down = true;
    this.setPointer(tool, event);
    tool.onMouseDown();
  }
};
/**
 * Handles DIV element Mouse Move event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.Canvas.prototype.onMouseMove_ = function(event) {
  event.preventDefault();
  goog.array.forEachRight(this.tools, function(tool, i, arr) {
    this.setPointer(tool, event);
    if (tool.event.mouse_down) {
      tool.onMouseDrag();
    }else {
      tool.onMouseMove();
    }
  },this);
};
/**
 * Handles DIV element Mouse Up event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.Canvas.prototype.onMouseUp_ = function(event) {
  event.preventDefault();
  var tool = this.tools[event.button];
  if (tool) {
    tool.event.mouse_down = false;
    this.setPointer(tool, event);
    tool.onMouseUp();
  }
};


/**
 * Fired when user presses a key while the DIV has focus.
 * @param {goog.events.Event} event The key event.
 * @private
 */
logdx.sch.Canvas.prototype.onKey_ = function(event) {
  var keyCodes = goog.events.KeyCodes;
  if (event.keyCode == keyCodes.SPACE || event.keyCode == keyCodes.ENTER) {
    goog.dom.classes.add(this.getElement(),
      goog.getCssName('log-canvas-move'));
  }
};
