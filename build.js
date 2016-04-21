#!/usr/bin/env node

var fs = require('fs');
var UglifyJS = require("uglify-js");
var moment = require("moment");

var version = require("./version.json");

var baseUrl = "html/src/";
var outputUrl = "build/";

var addToChangeLog = function(m) {

	var log  = '\n';
		log += '##### v' + version.version + ' b ' + version.build + '\n';
		log += '*' + version.date + '*\n\n';
		log += m + '\n\n';
	fs.appendFileSync("./CHANGELOG.md", log);
}

var updateVersionFile = function() {

	var jsHeader = "/**\n";
	jsHeader += " *	@property Version - autogenerated with build script, holds current verison info\n";
	jsHeader += " */\n"
	jsHeader += "// DO NOT EDIT. Updated from version.json\nSQR.Version = ";

	fs.writeFileSync("./version.json", JSON.stringify(version));
	fs.writeFileSync(baseUrl  + "Version.js", jsHeader + JSON.stringify(version) +";");
}

var walk = function(dir, filelist) {

	var files = fs.readdirSync(dir);
	var filelist = filelist || [];

	files.forEach(function(file) {
		if (fs.statSync(dir + file).isDirectory()) {
			filelist = walk(dir + file + '/', filelist);
		} else {
			if(file.indexOf('.') != 0) filelist.push(dir + file);
		}
	});

	return filelist;
};

var minify = function(set) {

	var includes = [];

	for(var i = 0; i < set.length; i++) {
		includes.push(set[i]);
	}

	var result = "";

	try {
		result = UglifyJS.minify(includes);
	} catch(e) {
		console.log(e);
	}

	 

	return result.code;
}

var concat = function(set) {

	var concatFile = "";

	for(var i = 0; i < set.length; i++) {
		var f =  set[i];
		var name = f.substring(baseUrl.length);
		concatFile += "/* --- --- [" + name + "] --- --- */\n\n";
		concatFile += fs.readFileSync(f);
		concatFile += "\n\n";
	}

	return concatFile;
}

var createBucket = function(folder, files) {

	files = files || [];
	
	if(folder instanceof Array) {
		folder.forEach(function(f) {
			files = files.concat(walk(baseUrl + f + '/'));
		});
	} else {
		files = files.concat(walk(baseUrl + folder + '/'));
	}

	var result = {};
	
	result.concat = concat(files);
	result.mini = minify(files);

	return result;
}

var saveBucket = function(bucket, fileBase) {

	var cf = outputUrl + fileBase + '.js';
	var mf = outputUrl + fileBase + '.min.js';

	fs.writeFileSync(cf, bucket.concat);
	fs.writeFileSync(mf, bucket.mini);

	var cs = fs.statSync(cf).size;
	var ms = fs.statSync(mf).size;

	var cks = (cs / 1024) | 0;
	var mks = (ms / 1024) | 0;

	console.log('[ ' + cf + '\t' + cs + ' bytes\t' + cks + ' kb ]');
	console.log('[ ' + mf + '\t' + ms + ' bytes\t' + mks + ' kb ]');
}

var logMessage = process.argv[2];

if(!logMessage) {
	console.warn('WARNING - Please provide a log message for this build or - for dev/test builds');
	return;
}

version.build++;
version.date = moment().format('MMM Do YYYY');

if(logMessage != '-') {
	console.log('[ Squareroot.js v' + version.version + ' build ' + version.build + ' ]');	
	addToChangeLog(logMessage);
	
} else {
	console.log('[ Squareroot.js v' + version.version + ' DEV BUILD (' + version.build + ') ]');
}

updateVersionFile();

var core = createBucket(['common', 'math', 'two', 'primitives'], [baseUrl + 'SQR.js', baseUrl + 'Version.js', baseUrl + 'GLSL.js']);
saveBucket(core, 'sqr');

var two = createBucket(['math', 'two'], [baseUrl + 'SQR.js', baseUrl + 'Version.js']);
saveBucket(two, 'sqr-two');

saveBucket(createBucket('vr'), 'sqr-vr');

// #### Custom build for Kuula ###
var k = function() {
	var ffs = [];
	Array.prototype.slice.call(arguments).forEach(function(f) { 
		var p = baseUrl + f + '.js';
		ffs.push(p); 
	});
	return ffs;
}

var kuula = createBucket([], k(
	'SQR', 
	'Version',
	'GLSL',
	'common/Buffer',
	'common/Context',
	'common/Loader',
	'common/Pointer3d',
	'common/Ray',
	'common/Renderer',
	'common/Shader',
	'common/Texture',
	'common/Transform',
	'math/Color',
	'math/Math',
	'math/Matrix33',
	'math/Matrix44',
	'math/ProjectionMatrix',
	'math/Quaternion',
	'math/Vector2',
	'math/Vector3',
	'primitives/Mesh',
	'primitives/Poly',
	'primitives/PostEffect',
	'primitives/Sphere',
	'primitives/Vertex',
	'vr/Gyro'
));

saveBucket(kuula, 'sqr-kuula')








