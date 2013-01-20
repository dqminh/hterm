describe('hterm.Size', function() {
  var size;
  beforeEach(function() {
    size = new hterm.Size(10, 20);
  });

  it('has width and height', function() {
    expect(size.width).toEqual(10);
    expect(size.height).toEqual(20);
  });

  it('resizes', function() {
    size.resize(20, 30)
    expect(size.width).toEqual(20);
    expect(size.height).toEqual(30);
  });

  it('is clonable', function() {
    var clone = size.clone()
    expect(clone.width).toEqual(size.width);
    expect(clone.height).toEqual(size.height);
  });

  it('can be set to another RowCol instance', function() {
    var size1 = new hterm.Size(20, 30);
    size.setTo(size1);
    expect(size.width).toEqual(20);
    expect(size.height).toEqual(30);
  });

  it('can be tested for equality', function() {
    var size1 = new hterm.Size(10, 20);
    expect(size.equals(size1)).toBeTruthy();
  });
});
