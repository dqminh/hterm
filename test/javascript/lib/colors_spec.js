describe('hterm.colors', function() {
  it('converts rgb to x11 color', function() {
    expect(hterm.colors.rgbToX11('rgb(0,0,0)')).toEqual("rgb:0000/0000/0000");
    expect(hterm.colors.rgbToX11('rgb(20,20,20)')).toEqual("rgb:1414/1414/1414");
  });

  it('converts x11 to css color', function() {
    expect(hterm.colors.x11ToCSS('rgb:1414/1414/1414')).toEqual("rgba(20,20,20,1)");
    expect(hterm.colors.x11ToCSS('rgb:0000/0000/0000')).toEqual("rgba(0,0,0,1)");
  });

  it('converts rgb to hex', function() {
    expect(hterm.colors.rgbToHex('rgb(20,20,20)')).toEqual("#141414");
  });

  it('converts hex to rgb', function() {
    expect(hterm.colors.hexToRGB('#141414')).toEqual("rgb(20,20,20)");
  })
});
