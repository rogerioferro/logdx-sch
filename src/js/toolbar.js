goog.provide('logdx.sch.toolbar');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Separator');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarMenuButton');
goog.require('goog.ui.ToolbarRenderer');
goog.require('goog.ui.ToolbarSelect');
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.ToolbarToggleButton');
goog.require('logdx.sch.toolpan');
goog.require('logdx.sch.toolselect');
goog.require('logdx.sch.tooltip');

/**
* ToolBar Constructor.
* @constructor
* @param {Element} parent element.
* @param {logdx.sch.app} app object.
*/
logdx.sch.toolbar = function(parent, app) {

  /**
   * Parent Element.
   * @type {Element}
   */
  this.parent = parent;

  /**
   * App Object.
   * @type {logdx.sch.app}
   */
  this.app = app;

  /**
   * Toolbar
   * @type {goog.ui.Toolbar}
   */
  var toolbar = new goog.ui.Toolbar();

  this.addMenuBar(toolbar);
  toolbar.addChild(new goog.ui.ToolbarSeparator(), true);
  this.addEditBar(toolbar);

  /**
   * Selection Model used for Tools Buttons.
   * @type {goog.ui.SelectionModel}
   */
  var sel_model = new goog.ui.SelectionModel();
  sel_model.setSelectionHandler(function(button, select) {
    if (button) {
      button.setChecked(select);
    }
  });

  this.addToolsBar(toolbar, sel_model);
  this.addZoomBar(toolbar, sel_model);

  toolbar.render(this.parent);
};


/**
 * Update Zoom level at Toolbar.
 * @param {number} zoom Zoom level.
 */
logdx.sch.toolbar.prototype.updateZoom = function(zoom) {
  var z = zoom * 100;
  var caption = ((z < 1000) ? z.toPrecision(3) : z.toFixed(0)) + '%';
  this.zoom_select_.setValue(caption);
  this.zoom_select_.setDefaultCaption(caption);
};

/**
 * Add Menu Buttons on Toolbar.
 * @param {goog.ui.Toolbar} toolbar Toolbar object.
 */
logdx.sch.toolbar.prototype.addMenuBar = function(toolbar) {
  /**
   * File Menu
   * @type {goog.ui.Menu}
   */
  var file_menu = new goog.ui.Menu();
  var new_item = this.addMenuItem(file_menu, 'New...',
    goog.getCssName('goog-icon-file'), 'Ctrl+N');
  var open_item = this.addMenuItem(file_menu, 'Open...',
    goog.getCssName('goog-icon-folder-open'));
  var rename_item = this.addMenuItem(file_menu, 'Rename...',
    goog.getCssName('goog-icon-edit'));
  var make_copy_item = this.addMenuItem(file_menu, 'Make a copy...',
    goog.getCssName('goog-icon-copy'));
  var download_item = this.addMenuItem(file_menu, 'Download as PDF',
    goog.getCssName('goog-icon-cloud-download'));
  file_menu.addChild(new goog.ui.MenuSeparator(), true);
  var setup_item = this.addMenuItem(file_menu, 'Setup...',
    goog.getCssName('goog-icon-setup'));

  setup_item.listen(goog.ui.Component.EventType.ACTION, function(e) {
    this.app.setupDialog();
  },false, this);

  /**
   * Edit Menu
   * @type {goog.ui.Menu}
   */
  var edit_menu = new goog.ui.Menu();
  this.addMenuItem(edit_menu, 'Undo',
    goog.getCssName('goog-icon-undo'), 'Ctrl+Z');
  this.addMenuItem(edit_menu, 'Redo',
    goog.getCssName('goog-icon-redo'), 'Ctrl+Y');
  edit_menu.addChild(new goog.ui.MenuSeparator(), true);
  this.addMenuItem(edit_menu, 'Copy',
    goog.getCssName('goog-icon-copy'), 'Ctrl+C');
  this.addMenuItem(edit_menu, 'Cut',
    goog.getCssName('goog-icon-cut'), 'Ctrl+X');
  this.addMenuItem(edit_menu, 'Paste',
    goog.getCssName('goog-icon-paste'), 'Ctrl+V');
  this.addMenuItem(edit_menu, 'Delete',
    goog.getCssName('goog-icon-trash'), 'Del');

  /**
   * File Button
   * @type {goog.ui.ToolbarMenuButton}
   */
  var file_button = new goog.ui.ToolbarMenuButton('File', file_menu);
  file_button.setCollapsed(goog.ui.ButtonSide.END);
  toolbar.addChild(file_button, true);

  /**
   * Edit Button
   * @type {goog.ui.ToolbarMenuButton}
   */
  var edit_button = new goog.ui.ToolbarMenuButton('Edit', edit_menu);
  edit_button.setCollapsed(goog.ui.ButtonSide.START);
  toolbar.addChild(edit_button, true);
};

/**
 * Add Edit Buttons on Toolbar.
 * @param {goog.ui.Toolbar} toolbar Toolbar object.
 */
logdx.sch.toolbar.prototype.addEditBar = function(toolbar) {
  /**
   * Undo Button
   * @type {goog.ui.ToolbarButton}
   */
  var undo_button = new goog.ui.ToolbarButton(
    this.newIcon(goog.getCssName('goog-icon-undo')));
  undo_button.setCollapsed(goog.ui.ButtonSide.END);
  toolbar.addChild(undo_button, true);
  new logdx.sch.tooltip(undo_button, 'Undo (Ctrl+Z)');

  /**
   * Redo Button
   * @type {goog.ui.ToolbarButton}
   */
  var redo_button = new goog.ui.ToolbarButton(
    this.newIcon(goog.getCssName('goog-icon-redo')));
  redo_button.setCollapsed(goog.ui.ButtonSide.START);
  toolbar.addChild(redo_button, true);
  new logdx.sch.tooltip(redo_button, 'Redo (Ctrl+Y)');
};

/**
 * Add Tools Buttons on Toolbar.
 * @param {goog.ui.Toolbar} toolbar Toolbar object.
 * @param {goog.ui.SelectionModel} sel_model Selection Model.
 */
logdx.sch.toolbar.prototype.addToolsBar = function(toolbar, sel_model) {
  /**
   * Pointer Button
   * @type {goog.ui.ToolbarToggleButton}
   */
  var pointer_button = new goog.ui.ToolbarToggleButton(
    this.newIcon(goog.getCssName('goog-icon-cursor')));
  pointer_button.setAutoStates(goog.ui.Component.State.CHECKED, false);
  sel_model.addItem(pointer_button);
  sel_model.setSelectedItem(pointer_button);
  pointer_button.listen(goog.ui.Component.EventType.ACTION, function(e) {
    var btn = e.target;
    if (!btn.isChecked()) {
      sel_model.setSelectedItem(e.target);
      this.app.canvas.setTool(new logdx.sch.toolselect());
    }
  },false, this);
  pointer_button.setCollapsed(goog.ui.ButtonSide.END);
  toolbar.addChild(pointer_button, true);
  new logdx.sch.tooltip(pointer_button, 'Pointer (Esc)');

  /**
   * Move Button
   * @type {goog.ui.ToolbarToggleButton}
   */
  var move_button = new goog.ui.ToolbarToggleButton(
    this.newIcon(goog.getCssName('goog-icon-grab')));
  move_button.setAutoStates(goog.ui.Component.State.CHECKED, false);
  sel_model.addItem(move_button);
  move_button.listen(goog.ui.Component.EventType.ACTION, function(e) {
    var btn = e.target;
    if (!btn.isChecked()) {
      sel_model.setSelectedItem(btn);
      this.app.canvas.setTool(new logdx.sch.toolpan(true));
    }
  },false, this);
  move_button.setCollapsed(goog.ui.ButtonSide.START);
  toolbar.addChild(move_button, true);
  new logdx.sch.tooltip(move_button, 'Pan (Space + Drag)');

};

/**
 * Add Zoom Buttons on Toolbar.
 * @param {goog.ui.Toolbar} toolbar Toolbar object.
 * @param {goog.ui.SelectionModel} sel_model Selection Model.
 */
logdx.sch.toolbar.prototype.addZoomBar = function(toolbar, sel_model) {
  /**
   * Zoom Menu Select
   * @type {goog.ui.Menu}
   */
  var zoom_menu = new goog.ui.Menu();
  var z = ['400%', '300%', '200%', '150%', '100%', '75%', '50%', '25%'];
  for (var i = 0; i < z.length; i++) {
    zoom_menu.addChild(new goog.ui.MenuItem(z[i]), true);
  }
  zoom_menu.addChild(new goog.ui.MenuSeparator(), true);
  zoom_menu.addChild(new goog.ui.MenuItem('Fit To Screen'), true);

  /**
   * Zoom Select
   * @type {goog.ui.ToolbarSelect}
   */
  var zoom_select = new goog.ui.ToolbarSelect('zoom', zoom_menu);
  zoom_select.setCollapsed(goog.ui.ButtonSide.END);
  toolbar.addChild(zoom_select, true);

  zoom_select.listen(goog.ui.Component.EventType.CHANGE, function(e) {
    if (!this.app.canvas) return;
    var last = e.target.getItemCount() - 1;
    if (e.target.getSelectedIndex() == last) {
      //console.log('Fit...');
      this.app.canvas.fitToScreen();
    }else {
      var item = e.target.getSelectedItem();
      if (item) {
        var zoom = parseInt(item.getCaption(), 10);
        if (goog.math.isFiniteNumber(zoom)) {
          this.app.canvas.setZoom(zoom / 100);
        }
      }
    }
  },false, this);

  /**
   * Zoom In Button
   * @type {goog.ui.ToolbarToggleButton}
   */
  var zoom_in_button = new goog.ui.ToolbarToggleButton(
    this.newIcon(goog.getCssName('goog-icon-zoom-in')));
  zoom_in_button.setAutoStates(goog.ui.Component.State.CHECKED, false);
  sel_model.addItem(zoom_in_button);
  zoom_in_button.listen(goog.ui.Component.EventType.ACTION, function(e) {
    var btn = e.target;
    if (!btn.isChecked()) {
      sel_model.setSelectedItem(btn);
    }
  },false, this);
  zoom_in_button.setCollapsed(
    goog.ui.ButtonSide.END | goog.ui.ButtonSide.START);
  toolbar.addChild(zoom_in_button, true);
  new logdx.sch.tooltip(zoom_in_button, 'Zoom In (Ctrl++)');

  /**
   * Zoom Out Button
   * @type {goog.ui.ToolbarToggleButton}
   */
  var zoom_out_button = new goog.ui.ToolbarToggleButton(
    this.newIcon(goog.getCssName('goog-icon-zoom-out')));
  zoom_out_button.setAutoStates(goog.ui.Component.State.CHECKED, false);
  sel_model.addItem(zoom_out_button);
  zoom_out_button.listen(goog.ui.Component.EventType.ACTION, function(e) {
    var btn = e.target;
    if (!btn.isChecked()) {
      sel_model.setSelectedItem(btn);
    }
  },false, this);
  zoom_out_button.setCollapsed(goog.ui.ButtonSide.START);
  toolbar.addChild(zoom_out_button, true);
  new logdx.sch.tooltip(zoom_out_button, 'Zoom Out (Ctrl+-)');

  /**
   * Zoom Select
   * @type {goog.ui.ToolbarSelect}
   */
  this.zoom_select_ = zoom_select;

  this.updateZoom(1);
};


/**
 * Create a icon to button.
 * @param {string} icon Icon Class.
 * @return {Element}
 * */
logdx.sch.toolbar.prototype.newIcon = function(icon) {
  return goog.dom.createDom('div', goog.getCssName('icon') + ' ' + icon);
};

/**
 * Add MenuItem to a Menu.
 * @param {goog.ui.Menu} menu Menu to add Item.
 * @param {string} caption Item Caption.
 * @param {string=} opt_icon Icon Class.
 * @param {string=} opt_accel Accel keys.
 * @return {goog.ui.MenuItem}
 */
logdx.sch.toolbar.prototype.addMenuItem =
function(menu, caption, opt_icon, opt_accel) {
  var doms = new Array();
  var i = 0;
  if (opt_accel !== undefined) {
    doms[i++] = goog.dom.createDom('div',
      goog.getCssName('goog-menuitem-accel'), opt_accel);
  }
  if (opt_icon !== undefined) {
    doms[i++] = goog.dom.createDom('div',
      goog.getCssName('goog-menuitem-icon') + ' ' + opt_icon);
  }
  doms[i++] = goog.dom.createTextNode(caption);
  var menu_item = new goog.ui.MenuItem(doms);
  menu.addChild(menu_item, true);
  return menu_item;
};
