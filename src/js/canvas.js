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


  //this.toolselect = new logdx.sch.toolselect(this);
  
  /**
   * Mouse event parameters.
   * @type {Array.<logdx.sch.tool>}
   */
  this.tools = new Array();
   
   /*test*/
   /*
  this.tools[goog.events.BrowserEvent.MouseButton.LEFT] =
      new logdx.sch.toolselect();
  this.tools[goog.events.BrowserEvent.MouseButton.LEFT].setCanvas(this);

  this.tools[goog.events.BrowserEvent.MouseButton.MIDDLE] =
      new logdx.sch.toolpan();
  this.tools[goog.events.BrowserEvent.MouseButton.MIDDLE].setCanvas(this);
*/

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
   * Sheet Size in mm.
   * @type {goog.math.Size}
   * @private
   */
  this.sheet_size_in_mm_ = new goog.math.Size(0, 0);

  /**
   * Sheet Size in px.
   * @type {goog.math.Size}
   * @private
   */
  this.sheet_size_in_px_ = new goog.math.Size(0, 0);

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
  this.sheet_element_ = null;
  
  /**
   * Sheet Position.
   *
   * @type {goog.math.Coordinate}
   * @private
   */
  this.sheet_pos_ = new goog.math.Coordinate();

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
 * Set Tool
 * @param {logdx.sch.tool} tool Tool object.
 * @param {goog.events.BrowserEvent.MouseButton=} opt_button Mouse button.
 */
logdx.sch.canvas.prototype.setTool = function(tool, opt_button) {
  button = opt_button || goog.events.BrowserEvent.MouseButton.LEFT;
  tool.setCanvas(this);
  this.tools[button] = tool;
};


/**
* Set sheet size in "mm".
* @param {goog.math.Size} size of container.
* */
logdx.sch.canvas.prototype.setSheetSize = function(size) {
  this.sheet_size_in_mm_.width = size.width;
  this.sheet_size_in_mm_.height = size.height;
  this.updateSheet();
};

/**
* Update sheet size.
* */
logdx.sch.canvas.prototype.updateSheet = function() {
  this.sheet_size_in_px_.width = this.sheet_size_in_mm_.width * this.ppmm_.width;
  this.sheet_size_in_px_.height = this.sheet_size_in_mm_.height * this.ppmm_.height;

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
  
  this.updateGraphScale();
  this.updateSheet();
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
  if(this.zoom_level_ == zoom) return;

  if(opt_cursor){
    /** Calculate displacement after zoom */
    var s_pos = goog.style.getClientPosition(this.sheet_element_);
    var g = zoom/this.zoom_level_  - 1;
    opt_cursor.x = Math.round((opt_cursor.x - s_pos.x) * g);
    opt_cursor.y = Math.round((opt_cursor.y - s_pos.y) * g);
  }

  this.zoom_level_ = zoom;
  this.dispatchEvent(logdx.sch.canvas.EventType.ZOOM);

  var parent = goog.dom.getParentElement(this.getElement());
  this.resize(goog.style.getSize(parent), opt_cursor);
};
/**
 * Fit to Screen
 * */
logdx.sch.canvas.prototype.fitToScreen = function() {
  var parent = goog.dom.getParentElement(this.getElement());
  var v_size = goog.style.getSize(parent);
  var z_w = v_size.width/this.sheet_size_in_px_.width;
  var z_h = v_size.height/this.sheet_size_in_px_.height;
  var z = Math.min(z_w,z_h);
  this.setZoom(z);
  var size = goog.style.getSize(this.getElement());
  parent.scrollLeft = (size.width - v_size.width)/2;
  parent.scrollTop = (size.height - v_size.height)/2;
};
/**
 * Resize canvas
 * @param {goog.math.Size} size of container.
 * @param {goog.math.Coordinate=} opt_diff space to pan.
 * */
logdx.sch.canvas.prototype.resize = function(size, opt_diff) {
  /** Save screen position*/
  var parent = goog.dom.getParentElement(this.getElement());
  var left = parent.scrollLeft;
  var top = parent.scrollTop;
  
  /** Scale sheet */
  var new_sheet_w = this.sheet_size_in_px_.width * this.zoom_level_;
  var new_sheet_h = this.sheet_size_in_px_.height * this.zoom_level_;
  goog.style.setSize(this.sheet_element_, new_sheet_w, new_sheet_h);

  /** Calculate new size and position. */
  var w = 2 * size.width + new_sheet_w;
  var h = 2 * size.height + new_sheet_h;

  var new_sheet_x = goog.math.safeCeil((w - new_sheet_w) / 2);
  var new_sheet_y = goog.math.safeCeil((h - new_sheet_h) / 2);

  goog.style.setPosition(this.sheet_element_, new_sheet_x, new_sheet_y);
  goog.style.setSize(this.getElement(), w, h);
  this.graphics.setSize(w, h);


  /** Scale graphics area. */
  var gwz = (this.ppmm_.width*this.zoom_level_);
  var ghz = (this.ppmm_.height*this.zoom_level_);
  this.graphics.setCoordSize(w / gwz, h / ghz);
  this.graphics.setCoordOrigin(
    -(new_sheet_x-0.5) / gwz, -(new_sheet_y-0.5) / ghz);

  var diff = opt_diff || new goog.math.Coordinate();
  diff.x += new_sheet_x - this.sheet_pos_.x;
  diff.y += new_sheet_y - this.sheet_pos_.y;
  
  /** Restore screen position */
  parent.scrollLeft = left + diff.x;
  parent.scrollTop = top + diff.y;

  this.sheet_pos_.x = new_sheet_x;
  this.sheet_pos_.y = new_sheet_y;
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
  var parent = goog.dom.getParentElement(this.getElement());
  parent.scrollLeft = this.sheet_pos_.x;
  parent.scrollTop = this.sheet_pos_.y;
};
/**
 * Creates an initial DOM representation for the component.
 */
logdx.sch.canvas.prototype.createDom = function() {
  /** Create background.*/
  var elem = goog.dom.createElement('div');
  goog.dom.classes.add(elem, goog.getCssName('log-canvas-background'));
  /** Create Sheet.*/
  this.sheet_element_ = goog.dom.createDom('div');
  goog.style.setStyle(this.sheet_element_, 'position', 'absolute');
  goog.dom.classes.add(this.sheet_element_, goog.getCssName('log-canvas-sheet'));

  /** Create graphic area.*/
  this.graphics = goog.graphics.createSimpleGraphics(0, 0);
  //this.graphics = new goog.graphics.CanvasGraphics(0, 0);
  //this.graphics.createDom();
 
  goog.style.setStyle(this.graphics.getElement(), 'position', 'absolute');
  goog.dom.appendChild(elem, this.sheet_element_);
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
 * Set the mouse position on tool.
 * @param {logdx.sch.tool} tool Tool object.
 * @param {goog.events.Event} event The mouse event.
 */
logdx.sch.canvas.prototype.setPointer = function(tool, event) {
  var s_pos = goog.style.getClientPosition(this.sheet_element_);
  var gwz = (this.ppmm_.width*this.zoom_level_);
  var ghz = (this.ppmm_.height*this.zoom_level_);
  var px_client_x = event.clientX;
  var px_client_y = event.clientY;
  var px_offset_x = event.clientX - s_pos.x;
  var px_offset_y = event.clientY - s_pos.y;
  var mm_client_x = px_client_x/gwz;
  var mm_client_y = px_client_y/gwz;
  var mm_offset_x = px_offset_x/gwz;
  var mm_offset_y = px_offset_y/ghz;

  if(event.type == goog.events.EventType.MOUSEDOWN){
    tool.event.px_offset_down.x = px_offset_x;
    tool.event.px_offset_down.y = px_offset_y;
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
}
/**
 * Handles DIV element mouse wheel.
 * @param {goog.events.Event} event The click event.
 */
logdx.sch.canvas.prototype.handleMouseWheel = function(event) {
  event.preventDefault();

  var step = (event.deltaY ? event.deltaY < 0 ? -0.1 : 0.1 : 0);
  var z = this.zoom_level_ * (1 + step);
  if (z >= 0.95 && z <= 1.05) z = 1;  
  var x = event.clientX;
  var y = event.clientY;
  this.setZoom(z, new goog.math.Coordinate(x, y));
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
  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT &&
    !this.panMode_) {
//    console.log('Clicked...');
    
    var s_pos = goog.style.getClientPosition(this.sheet_element_);
    var fill = new goog.graphics.SolidFill('red', 0.5);
    var w = 20;
    var h = 10;
    var gwz = this.ppmm_.width * this.zoom_level_;
    var ghz = this.ppmm_.height * this.zoom_level_;
    var x = (event.clientX - s_pos.x) / gwz - w / 2;
    var y = (event.clientY - s_pos.y) / ghz - h / 2;

    this.graphics.drawRect(x, y, w, h, null, fill);
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
