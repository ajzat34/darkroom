function normalcdf(x) {
  return 0.5 * (1 + erf(x));
}

function erf(x) {
    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;

    // Save the sign of x
    var sign = 1;
    if (x < 0) {
        sign = -1;
    }
    x = Math.abs(x);

    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);

		return sign*y
}

function gaussian(x, stdev) {
  return normalcdf(x/stdev)
}

function gaussianRange(a, b, stdev) {
	var av = gaussian(a, stdev)
	var bv = gaussian(b, stdev)
  if (bv > av){
		return bv - av
  }
	return av - bv
}

function gaussianPixel (n, spread) {
	return gaussianRange(n - 0.5, n + 0.5, spread)
}

// create a gaussian distribution given the number of included pixels
function gaussianNDist(n, spread) {
	var result = []
	var total = 0
	for (var i = 0; i<(n-1); i++) {
		var g = gaussianPixel(i, spread)
		// keep track of total
		// non-center values must be counted twice
		if (i == 0){ total += g
		} else { total += 2*g }
		result.push(g)
	}
	result.push( (1.0-total)/2 )
  return result
}

function gaussianDist2D(spread) {
	var s = gaussianNDist(2, spread)

	return [
		s[0]*s[0], s[1]*s[0], s[0]*s[0],
		s[0]*s[1], s[1]*s[1], s[0]*s[1],
		s[0]*s[0], s[1]*s[0], s[0]*s[0],
	]
}
