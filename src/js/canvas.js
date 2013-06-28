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
//goog.require('goog.graphics');
//goog.require('goog.graphics.Font');
goog.require('goog.graphics.SvgGraphics');
goog.require('goog.math');
goog.require('goog.style');
goog.require('goog.ui.Component');

goog.require('logdx.sch.tool');
goog.require('logdx.sch.tool.MouseEvent');


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
   * Mouse event parameters.
   * @type {Array.<logdx.sch.tool>}
   */
  this.tools = new Array();

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
  this.zoom_level_ = 1;

  /**
   * Graphics object. This object is created once the
   * component's DOM element is known.
   *
   * @type {goog.graphics.AbstractGraphics?}
   */
  this.graphics = null;

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
  this.sheet_pos_ = new goog.math.Coordinate(0,0);

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
 * Set Tool
 * @param {logdx.sch.tool} tool Tool object.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button.
 */
logdx.sch.canvas.prototype.setTool = function(tool, opt_button) {
  var button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT;
  tool.setCanvas(this);
  if(this.tools[button]){
    this.tools[button].dispose();
  }
  this.tools[button] = tool;
};


/**
* Set sheet size in "mm".
* @param {goog.math.Size} size of container.
* */
logdx.sch.canvas.prototype.setSheetSize = function(size) {
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
logdx.sch.canvas.prototype.setPpi = function(ppi) {
  this.ppi_.width = ppi.width;
  this.ppi_.height = ppi.height;

  this.ppmm_.width = this.ppi_.width/25.4;
  this.ppmm_.height = this.ppi_.height/25.4;

  this.resize(goog.style.getSize(this.graphics.getElement()));
};

/**
 * getZoom
 * @return {number}
 * */
logdx.sch.canvas.prototype.getZoom = function() {
  return this.zoom_level_;
};
/**
 * setZoom
 * @param {number} zoom Zoom Level.
 * @param {goog.math.Coordinate=} opt_cursor Cursor position.
 * */
logdx.sch.canvas.prototype.setZoom = function(zoom, opt_cursor) {
  zoom = Math.min(Math.max(0.01, zoom), 12);

  var g =  this.zoom_level_ / zoom;  

  this.zoom_level_ = zoom;
  this.dispatchEvent(logdx.sch.canvas.EventType.ZOOM);

  this.resize(goog.style.getSize(this.graphics.getElement()));

  var diff = opt_cursor || new goog.math.Coordinate();

  this.sheet_pos_.x = (this.sheet_pos_.x + diff.x) * g - diff.x;
  this.sheet_pos_.y = (this.sheet_pos_.y + diff.y) * g - diff.y;

  this.pan(0, 0);
};
/**
 * Fit to Screen
 * */
logdx.sch.canvas.prototype.fitToScreen = function() {
  var size = goog.style.getSize(this.graphics.getElement());
  var w_mm = size.width / this.ppmm_.width;
  var h_mm = size.height / this.ppmm_.height;
  
  var z_w = w_mm/this.sheet_size_in_mm_.width;
  var z_h = h_mm/this.sheet_size_in_mm_.height;
  var z = Math.min(z_w,z_h);  

  this.setZoom(z);
  
  this.sheet_pos_.x = 
    (w_mm/this.zoom_level_ - this.sheet_size_in_mm_.width)/2;
  this.sheet_pos_.y = 
    (h_mm/this.zoom_level_ - this.sheet_size_in_mm_.height)/2;
  
  this.pan(0,0);
};
/**
 * Resize canvas
 * @param {goog.math.Size} size of container.
 * */
logdx.sch.canvas.prototype.resize = function(size) {
  /** Set new size. */
  var w = size.width;
  var h = size.height;
  this.graphics.setSize(w, h);
  /** Scale graphics area. */
  var gwz = (this.ppmm_.width*this.zoom_level_);
  var ghz = (this.ppmm_.height*this.zoom_level_);
  this.graphics.setCoordSize(w / gwz, h / ghz);
  this.pan(0,0);
  
  var stroke = new goog.graphics.Stroke('1px','#d4d4d4');
  this.sheet.setStroke(stroke);
};

/**
 * Pan canvas
 * @param {number} dx
 * @param {number} dy
 * */
logdx.sch.canvas.prototype.pan = function(dx, dy) {
  this.sheet_pos_.x += dx;
  this.sheet_pos_.y += dy;
  var gwz = (this.ppmm_.width*this.zoom_level_);
  var ghz = (this.ppmm_.height*this.zoom_level_);
  var ddx = 0.5/gwz;
  var ddy = 0.5/ghz;

  this.graphics.setCoordOrigin(-this.sheet_pos_.x - ddx, -this.sheet_pos_.y - ddy);
};
/**
 * Creates an initial DOM representation for the component.
 */
logdx.sch.canvas.prototype.createDom = function() {
  
  /** Create background.*/
  var elem = goog.dom.createElement('div');
  goog.dom.classes.add(elem, goog.getCssName('log-canvas-background'));
  
  this.graphics = new goog.graphics.SvgGraphics(0, 0);
  this.graphics.createDom();
  this.graphics.render(elem);

  
  /** Create sheet.*/
  var fill = new goog.graphics.SolidFill('white');
  this.sheet = this.graphics.drawRect(0, 0, 
    this.sheet_size_in_mm_.width, this.sheet_size_in_mm_.height, null, fill);
  
  /** decorate it.*/
  this.decorateInternal(elem);
};


/**
 * Decorates an existing HTML DIV element as a Canvas.
 *
 * @param {Element} element The DIV element to decorate.
 */
logdx.sch.canvas.prototype.decorateInternal = function(element) {
  //logdx.sch.canvas.superClass_.decorateInternal.call(this, element);
  this.setElementInternal(element);
  var elem = this.getElement();
  elem.tabIndex = 0;  
};

/** @override */
logdx.sch.canvas.prototype.disposeInternal = function() {
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
logdx.sch.canvas.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var parent = goog.dom.getParentElement(this.getElement());
  goog.style.setStyle(parent, 'overflow', 'hidden');

  this.mwh_ = new goog.events.MouseWheelHandler(this.getElement());
  this.eh_.listen(this.mwh_,
    goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
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
logdx.sch.canvas.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');

  this.eh_.unlisten(this.mwh_,
    goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, 
    this.handleMouseWheel);
    
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

//  this.eh_.unlisten(this.kh_, goog.events.KeyHandler.EventType.KEY,
//    this.onKey_);
};


/**
 * Set the mouse position on tool.
 * @param {logdx.sch.tool} tool Tool object.
 * @param {goog.events.Event} event The mouse event.
 */
logdx.sch.canvas.prototype.setPointer = function(tool, event) {
  var s_pos = goog.style.getClientPosition(this.graphics.getElement());
  var gwz = (this.ppmm_.width*this.zoom_level_);
  var ghz = (this.ppmm_.height*this.zoom_level_);
  var px_client_x = event.clientX;
  var px_client_y = event.clientY;
  var px_offset_x = event.clientX - s_pos.x - this.sheet_pos_.x * gwz;
  var px_offset_y = event.clientY - s_pos.y - this.sheet_pos_.y * ghz;
  var mm_client_x = px_client_x/gwz;
  var mm_client_y = px_client_y/gwz;
  var mm_offset_x = (event.clientX - s_pos.x)/gwz - this.sheet_pos_.x;
  var mm_offset_y = (event.clientY - s_pos.y)/ghz - this.sheet_pos_.y;
    

  if(event.type == goog.events.EventType.MOUSEDOWN){
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
}
/**
 * Handles DIV element mouse wheel.
 * @param {goog.events.Event} event The click event.
 */
 
logdx.sch.canvas.prototype.handleMouseWheel = function(event) {
  event.preventDefault();
  var tool = this.tools[goog.events.BrowserEvent.MouseButton.MIDDLE];
  if(tool){
    this.setPointer(tool, event);
    tool.onMouseWheel(goog.math.sign(event.deltaY));
  }
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
    //this.graphics.drawRect(0, 0, 3.3333, 3.3333, null, fill);
  }
  /**/
};
/**
 * Handles DIV element Mouse Down event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.canvas.prototype.onMouseDown_ = function(event) {
  event.preventDefault();
  var tool = this.tools[event.button];
  if(tool){
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
logdx.sch.canvas.prototype.onMouseMove_ = function(event) {
  event.preventDefault();
  goog.array.forEachRight(this.tools,function(tool, i, arr){
    this.setPointer(tool, event);
    if(tool.event.mouse_down){
      tool.onMouseDrag();
    }else{
      tool.onMouseMove();
    }
  },this);
};
/**
 * Handles DIV element Mouse Up event.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.canvas.prototype.onMouseUp_ = function(event) {
  event.preventDefault();
  var tool = this.tools[event.button];
  if(tool){
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
logdx.sch.canvas.prototype.onKey_ = function(event) {
  console.log('key...');
  var keyCodes = goog.events.KeyCodes;
  if (event.keyCode == keyCodes.SPACE || event.keyCode == keyCodes.ENTER) {
    console.log('key pressed...');
    goog.dom.classes.add(this.getElement(),
      goog.getCssName('log-canvas-move'));
  }
};
