// functions for gaussian distributions and 2d arrays

// calculate the area <x under the normal curve
function normalcdf(x) {
  return 0.5 * (1 + erf(x));
}

// constants for erf
var a1 =  0.254829592;
var a2 = -0.284496736;
var a3 =  1.421413741;
var a4 = -1.453152027;
var a5 =  1.061405429;
var p  =  0.3275911;

function erf(x) {
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

// get the area between two values on the normal curve
function gaussianRange(a, b, stdev) {
	var av = gaussian(a, stdev)
	var bv = gaussian(b, stdev)
  if (bv > av){
		return bv - av
  }
	return av - bv
}

// gets the area under the normal curve inside a pixel
function gaussianPixel (n, spread) {
	return gaussianRange(n - 0.5, n + 0.5, spread)
}

// create a gaussian distribution given the number of included pixels
function gaussianNDist(n, spread) {
	var result = new Array()
	var total = 0
	for (var i = 0; i<(n-1); i++) {
		var g = gaussianPixel(i, spread)
    result[i] = g
		// keep track of total
		// non-center values must be counted twice
		if (i == 0){ total += g
		} else { total += 2*g }
	}
	result.push( (1.0-total)/2 )
  return result
}

// gets the number of samples after the center sample
function nFromKsize(n) {
  return ((n-1)/2)+1
}

// makes the sum of the array 1
function normalizeArray(arr) {
  var sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue)
  for (var i = 0; i < arr.length; i++) {
    arr[i] /= sum
  }
  return arr
}

// create a gaussian 2d distribution
function gaussianNDist2D(ksize, spread) {
  var n = nFromKsize(ksize)
  var gdist = gaussianNDist(n, spread)
  // create the other half of the distribution
  var dup = []
  for (var i = gdist.length-1; i > 0; i--) {
    dup.push(gdist[i])
  }
  gdist = normalizeArray(dup.concat(gdist))

  var result = []

  for (var y = 0; y < ksize; y++) {
    var yw = gdist[y]
    for (var x = 0; x < ksize; x++) {
      result[(y*ksize)+x] = gdist[x]*yw
    }
  }
  return normalizeArray(result)
}
