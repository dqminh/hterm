describe('hterm.RowCol', function() {
  var rowCol;
  beforeEach(function() {
    rowCol = new hterm.RowCol(10, 20);
  });

  it('has row, column and overflow', function() {
    expect(rowCol.row).toEqual(10);
    expect(rowCol.column).toEqual(20);
    expect(rowCol.overflow).toBeFalsy();
  });

  it('moves row and column', function() {
    rowCol.move(20, 30, true)
    expect(rowCol.row).toEqual(20);
    expect(rowCol.column).toEqual(30);
    expect(rowCol.overflow).toBeTruthy();
  });

  it('is clonable', function() {
    var clone = rowCol.clone()
    expect(clone.row).toEqual(rowCol.row);
    expect(clone.column).toEqual(rowCol.column);
    expect(clone.overflow).toEqual(rowCol.overflow);
  });

  it('can be set to another RowCol instance', function() {
    var rowCol1 = new hterm.RowCol(20, 30, true);
    rowCol.setTo(rowCol1);
    expect(rowCol.row).toEqual(20);
    expect(rowCol.column).toEqual(30);
    expect(rowCol.overflow).toBeTruthy();
  });

  it('can be tested for equality', function() {
    var rowCol1 = new hterm.RowCol(10, 20);
    expect(rowCol.equals(rowCol1)).toBeTruthy();
  });
});
