/**
 *  @method createSphere
 *  @memberof SQR.Primitives
 *
 *  @description Creates a simple cube geometry, 1 quad per side, with UVs, non-indexed
 *
 *  @param {Number} radius - radius of the sphere
 *  @param {Number=} [sw=8] - width (longitude) segments. Minimum 3.
 *  @param {Number=} [sh=6] - width (latitude) segments. Minimum 3.
 *  @param {Object=} options - additional settings
 *
 *  @returns {SQR.Buffer}
 */
SQR.Primitives.createSphere = function(radius, segmentsX, segmentsY, options) {

	var m = new SQR.Mesh();

	radius = radius || 50;
	segmentsX = Math.max(3, Math.floor(segmentsX) || 8);
	segmentsY = Math.max(3, Math.floor(segmentsY) || 6);
	options = options || {};

	var phi = Math.PI * 2;
	var tht = Math.PI;

	var x, y;

	// for (y = 1; y <= segmentsY - 1; y++) {
	for (y = 0; y <= segmentsY; y++) {

		for (x = 0; x < segmentsX; x++) {

			var u = x / (segmentsX - 1);
			var v = y / segmentsY;

			var xp = -radius * Math.cos(u * phi) * Math.sin(v * tht);
			var yp =  radius * Math.cos(v * tht);
			var zp =  radius * Math.sin(u * phi) * Math.sin(v * tht);

			var i = m.V(xp, yp, zp);
			m.T(u, 1 - v);

		}
	}

	// var northPole = m.V(0, radius, 0);
	// var southPole = m.V(0, -radius, 0);	
	// m.T(1, 1);
	// m.T(0, 0);

	for (y = 0; y < segmentsY; y++) {

		var isn = y == 0;
		var iss = y == segmentsY - 1;

		for (x = 0; x < segmentsX; x++) {

			var y0 = y;
			var y1 = y + 1;

			var x0 = x;
			var x1 = (x + 1) % (segmentsX);

			var ta = y0 * segmentsX + x0;// - segmentsX;
			// if(isn) ta = northPole;

			var tb = y0 * segmentsX + x1;// - segmentsX;
			// if(isn) tb = northPole;

			var tc = y1 * segmentsX + x0;// - segmentsX;
			// if(iss) tc = southPole;

			var td = y1 * segmentsX + x1;// - segmentsX;
			// if(iss) td = southPole;

			if(isn) {
				m.F(ta, td, tc).T(ta, td, tc);
			} else if(iss) {
				m.F(ta, tb, td).T(ta, tb, td);
			} else {
				m.F(ta, tb, tc, td).T(ta, tb, tc, td);
			}

		}
	}

	m.calculateNormals(options.smooth);
	if(options.flip) m.flip();

	return m.update();
}