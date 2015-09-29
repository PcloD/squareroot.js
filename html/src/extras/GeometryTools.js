/**
 *  @namespace GeometryTools
 *  @memberof SQR
 *
 *  @description Tools to work with geometries/buffers.
 */
SQR.GeometryTools = (function() {

	var geoTools = {};
	var MAX_BUFFER_SIZE = 65535;

	/**
	 *	@method batch
	 *	@memberof SQR.GeometryTools
	 *
	 *	@description Combines all the geometries in a tree into one geometry. It assumes (but does not check) 
	 *	that all the children can be rendered using the same shader and that all their buffers have the same
	 *	layout. 
	 *
	 *	@param {SQR.Transform} container - the root of the tree to combine. 
	 *	This object and all it's children will be combined. 
	 *
	 *	@returns {SQR.Transform} the same object as passed in the argument. It will have no children 
	 *	and will have a buffer containing all the combine geometries. If the container shader was not set
	 *	it will inherit the shader from the first child that had one.
	 */
	geoTools.batch = function(container) {
		var batchObjects = [], size = 0;

		var updateTransform = function(t) {

			t.transformWorld();

			if (t.numChildren > 0) {
	            for (var i = 0; i < t.numChildren; i++) {
	                updateTransform(t.children[i]);
	            }
	        }

	        if(t.buffer) {
	        	if(t.buffer.isIndexed()) {
	        		console.warn("> SQR.GeometryTools.batch - indexed buffers can't be batched (yet)");
	        	} else {
	        		batchObjects.push(t);
	        		size += t.buffer.size;
	        	}
	        }

	        if(t.shader && !container.shader) {
	        	container.shader = t.shader;
	        }
		}

		updateTransform(container);

		var cb = SQR.Buffer().layout(batchObjects[0].buffer.layout, size);

		var offset = 0, base = 0, tmp = new SQR.V3(), tmpMat = new SQR.Matrix33(), c = 0;
		

		for(var i = 0; i < batchObjects.length; i++) {
				var bo = batchObjects[i];
				var b = batchObjects[i].buffer;
				var tb = new Float32Array(b.size * b.strideSize);
				tb.set(b.getDataArray());

				b.iterate('aPosition', function(i, d, c) {
					tmp.set(d[i+0], d[i+1], d[i+2], 1);
					bo.globalMatrix.transformVector(tmp);
					tb[i+0] = tmp.x;
					tb[i+1] = tmp.y;
					tb[i+2] = tmp.z;
				});

				b.iterate('aNormal', function(i, d, c) {
					tmp.set(d[i+0], d[i+1], d[i+2]);
					bo.globalMatrix.inverseMat3(tmpMat);
					tmpMat.transformVector(tmp);
					tb[i+0] = tmp.x;
					tb[i+1] = tmp.y;
					tb[i+2] = tmp.z;
				});

				cb.setRawData(tb, offset - base);

				offset += b.size * b.strideSize;

				c++;
		}

		// console.log('batched ' + container.numChildren + ' geometries, ' + size + ' vertices, ' + offset + ' elements in array');

		container.removeAll();
		container.buffer = cb.update();

		return container;
	}

	return geoTools;

})();