
include
	.load(
		'template/exports-common.js',
		'template/exports-namespace.js',
		'template/exports-globals.js',
		'template/wrapper.js'
	)
	
	
	.done(function(resp){
		
		var Uglify = io.File.middleware.uglify;
		
		include.exports = Class({
			Extends: Class.Deferred,
			
			Construct: function(pckg, name){
				this.pckg = pckg;
				this.name = name;
			},
			
			process: function(){
				
				var libs = '';
				
				for (var i = 0, x, imax = this.pckg.length; i < imax; i++){
					x = this.pckg[i];
					
					libs += x.source;
				}
				
				
				function join(type, mix) {
					return resp
						.load
						.wrapper
						.replace('%EXPORTS%', resp.load['exports-' + type])
						.replace('%NAMESPACE%', mix || '')
						.replace('%LIBS%', function() { return libs });
				}
				
				this.sources = {
					common: join('common'),
					globals: join('globals'),
					namespace: join('namespace', 'atma')
				};
				
				return this;
			},
			
			filename: function(type, mode){
				
				mode = mode
					? '-' + mode
					: '';
				
				if (!this.name) {
					
					switch (type) {
						case 'namespace':
							return 'index' + mode + '.js';
						case 'common':
							return 'exports' + mode + '.js';
						case 'globals':
							return 'globals' + mode + '.js'
					}
					
				}
				
				switch (type) {
					case 'namespace':
						return name + '/index' + mode + '.js';
					case 'common':
						return name + '/exports' + mode + '.js';
					case 'globals':
						return name + '/globals' + mode + '.js'
				}
				
				console.error('ERROR - undefined type -', type);
			},
			
			save: function(){
				
				
				function write(type) {
					var src = this.sources[type];
					
					new io
						.File(this.filename(type, 'dev'))
						.write(src);
					
					var file = new io.File(this.filename(type));
						
					file.content = src;
					Uglify(file, { minify: true });
					file.write();
					
				}
				
				write.call(this, 'common');
				write.call(this, 'namespace');
				write.call(this, 'globals');
				
				console.log('Saved:'.green.bold + (this.name || 'index'));
			},
			
			Static: {
				prepair: function(pckg, loadedPckg){
					var array = [],
						search,
						name;
					
					outer: for (var i = 0, x, imax = pckg.length; i < imax; i++){
						name = search = pckg[i];
						
						
						if (Array.isArray(pckg[i])) {
							search = pckg[i][0];
							name = pckg[i][1];
						}
						
						for (var key in loadedPckg) {
							if (key.indexOf(search) !== -1) {
								array.push({
									source: loadedPckg[key],
									name: name
								});
								continue outer;
							}
						}
						
						console.error('Pckg Not Found', search, name);
					}
					
					return array;
				}
			}
		});
		
});