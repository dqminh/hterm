(function(ScrollPort) {
  'use strict'
  /**
   * Proxy for the native selection object which understands how to walk up the
   * DOM to find the containing row node and sort out which comes first.
   *
   * @param {hterm.ScrollPort} scrollPort The parent hterm.ScrollPort instance.
   */
  var Selection = function(scrollPort) {
    this.scrollPort_ = scrollPort;

    /**
     * The row containing the start of the selection.
     *
     * This may be partially or fully selected.  It may be the selection anchor
     * or the focus, but its rowIndex is guaranteed to be less-than-or-equal-to
     * that of the endRow.
     *
     * If only one row is selected then startRow == endRow.  If there is no
     * selection or the selection is collapsed then startRow == null.
     */
    this.startRow = null;

    /**
     * The row containing the end of the selection.
     *
     * This may be partially or fully selected.  It may be the selection anchor
     * or the focus, but its rowIndex is guaranteed to be greater-than-or-equal-to
     * that of the startRow.
     *
     * If only one row is selected then startRow == endRow.  If there is no
     * selection or the selection is collapsed then startRow == null.
     */
    this.endRow = null;

    /**
     * True if startRow != endRow.
     */
    this.isMultiline = null;

    /**
     * True if the selection is just a point rather than a range.
     */
    this.isCollapsed = null;
  };

  /**
   * Given a list of DOM nodes and a container, return the DOM node that
   * is first according to a depth-first search.
   *
   * Returns null if none of the children are found.
   */
  Selection.prototype.findFirstChild = function(parent, childAry) {
    var node = parent.firstChild;

    while (node) {
      if (childAry.indexOf(node) != -1)
        return node;

      if (node.childNodes.length) {
        var rv = this.findFirstChild(node, childAry);
        if (rv)
          return rv;
      }

      node = node.nextSibling;
    }

    return null;
  };

  /**
   * Synchronize this object with the current DOM selection.
   *
   * This is a one-way synchronization, the DOM selection is copied to this
   * object, not the other way around.
   */
  Selection.prototype.sync = function() {
    var self = this;

    // The dom selection object has no way to tell which nodes come first in
    // the document, so we have to figure that out.
    //
    // This function is used when we detect that the "anchor" node is first.
    function anchorFirst() {
      self.startRow = anchorRow;
      self.startNode = selection.anchorNode;
      self.startOffset = selection.anchorOffset;
      self.endRow = focusRow;
      self.endNode = selection.focusNode;
      self.endOffset = selection.focusOffset;
    }

    // This function is used when we detect that the "focus" node is first.
    function focusFirst() {
      self.startRow = focusRow;
      self.startNode = selection.focusNode;
      self.startOffset = selection.focusOffset;
      self.endRow = anchorRow;
      self.endNode = selection.anchorNode;
      self.endOffset = selection.anchorOffset;
    }

    var selection = this.scrollPort_.getDocument().getSelection();

    this.startRow = null;
    this.endRow = null;
    this.isMultiline = null;
    this.isCollapsed = !selection || selection.isCollapsed;

    if (this.isCollapsed)
      return;

    var anchorRow = selection.anchorNode;
    while (anchorRow && !('rowIndex' in anchorRow)) {
      anchorRow = anchorRow.parentNode;
    }

    if (!anchorRow) {
      console.error('Selection anchor is not rooted in a row node: ' +
          selection.anchorNode.nodeName);
      return;
    }

    var focusRow = selection.focusNode;
    while (focusRow && !('rowIndex' in focusRow)) {
      focusRow = focusRow.parentNode;
    }

    if (!focusRow) {
      console.error('Selection focus is not rooted in a row node: ' +
          selection.focusNode.nodeName);
      return;
    }

    if (anchorRow.rowIndex < focusRow.rowIndex) {
      anchorFirst();

    } else if (anchorRow.rowIndex > focusRow.rowIndex) {
      focusFirst();

    } else if (selection.focusNode == selection.anchorNode) {
      if (selection.anchorOffset < selection.focusOffset) {
        anchorFirst();
      } else {
        focusFirst();
      }

    } else {
      // The selection starts and ends in the same row, but isn't contained all
      // in a single node.
      var firstNode = this.findFirstChild(
          anchorRow, [selection.anchorNode, selection.focusNode]);

      if (!firstNode)
        throw new Error('Unexpected error syncing selection.');

      if (firstNode == selection.anchorNode) {
        anchorFirst();
      } else {
        focusFirst();
      }
    }

    this.isMultiline = anchorRow.rowIndex != focusRow.rowIndex;
  };

  ScrollPort.Selection = Selection;
})(hterm.ScrollPort);
