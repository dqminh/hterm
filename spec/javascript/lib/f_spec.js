describe('hterm.f', function() {
  it('clamps a number', function() {
    expect(hterm.f.clamp(3, 2, 4)).toEqual(3);
    expect(hterm.f.clamp(3, 4, 5)).toEqual(4);
    expect(hterm.f.clamp(6, 4, 5)).toEqual(5);
  });
});
