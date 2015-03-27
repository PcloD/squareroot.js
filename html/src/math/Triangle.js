/**
 *  @class Triangle
 *  @memberof SQR
 *
 *  @description Represents a triangle composed on 3 vectors. 
 *	Vectors can be of any size, though some of it methods only work with 2-dimensional vectors.
 *
 *	@param v1 Vector {@link SQR.V2} or {@link SQR.V3}
 *
 *	@property {SQR.V2} centroid - the centroid, undef until `calculateCentroid` is called.
 *	@property {Number} circumRadius - the  radius of the 
 *		circum-circle, undef until `calculateCircumCircle` is called.
 *	@property {SQR.V2} circumCenter - the center of the cirsum-circle, 
 *		undef until `calculateCircumCircle` is called.
 *	
 */
SQR.Triangle = function(v0, v1, v2) {

	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;

	/**
	 *	Calculates the centroid for this triangle. Only works with 2d coordinates for now.
	 *	The resulting centroid is stored in the `centroid` property.
	 *
	 *	@memberof SQR.Triangle.prototype
	 *	@method calculateCentroid
	 */
	this.calculateCentroid = function() {
		this.centroid = new SQR.V2();
		this.centroid.x = (this.v0.x + this.v1.x + this.v2.x) / 3;
		this.centroid.y = (this.v0.y + this.v1.y + this.v2.y) / 3;
	}

	/**
	 *	Calculates circumcircle, only works with 2d coordinates.
	 *	<br><br>
	 *	Based on 
	 *	{@link http://jwilson.coe.uga.edu/emat6680/dunbar/assignment4/assignment4_kd.htm this}
	 *	and
	 *	{@link http://www.exaflop.org/docs/cgafaq/cga1.html this}.
	 *
	 *	@memberof SQR.Triangle.prototype
	 *	@method calculateCircumCircle
	 */
	this.calculateCircumCircle = function() {
		var A = this.v1.x - this.v0.x;
		var B = this.v1.y - this.v0.y;
		var C = this.v2.x - this.v0.x;
		var D = this.v2.y - this.v0.y;

		var E = A * (this.v0.x + this.v1.x) + B * (this.v0.y + this.v1.y);
		var F = C * (this.v0.x + this.v2.x) + D * (this.v0.y + this.v2.y);

		var G = 2.0 * (A * (this.v2.y - this.v1.y) - B * (this.v2.x - this.v1.x));

		var dx, dy;

		if (Math.abs(G) < SQR.EPSILON) {
			// Collinear - find extremes and use the midpoint
			var minx = Math.min(this.v0.x, this.v1.x, this.v2.x);
			var miny = Math.min(this.v0.y, this.v1.y, this.v2.y);
			var maxx = Math.max(this.v0.x, this.v1.x, this.v2.x);
			var maxy = Math.max(this.v0.y, this.v1.y, this.v2.y);

			this.circumCenter = new SQR.V2((minx + maxx) / 2, (miny + maxy) / 2);

			dx = this.circumCenter.x - minx;
			dy = this.circumCenter.y - miny;
		} else {
			var cx = (D * E - B * F) / G;
			var cy = (A * F - C * E) / G;

			this.circumCenter = new SQR.V2(cx, cy);

			dx = this.circumCenter.x - this.v0.x;
			dy = this.circumCenter.y - this.v0.y;
		}

		this.circumRadiusSq = dx * dx + dy * dy;
		this.circumRadius = Math.sqrt(this.circumRadiusSq);
	}

	/**
	 *	Test whether the point v is inside the triangles circumcircle. 
	 *	If circum-circle was not calculated, calculateCircumCircle will be called first
	 *	@memberof SQR.Triangle.prototype
	 *	@method vertexInCircumcircle
	 *	@param {SQR.V2} v - vertex to be checked
	 *	@returns {boolean} true is vertex is in circumcircle
	 */
	this.vertexInCircumcircle = function(v) {

		if(!this.circumCenter) this.calculateCircumCircle();

		var dx = this.circumCenter.x - v.x;
		var dy = this.circumCenter.y - v.y;
		var sq = dx * dx + dy * dy;
		return (sq <= this.circumRadiusSq);

	}

};