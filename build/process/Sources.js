
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
			
			Construct: function(pckg, setts){
				this.pckg = pckg;
				this.setts = Object.extend({
					output: '',
				}, setts);
			},
			
			process: function(){
				
				var libs = '';
				
				for (var i = 0, x, imax = this.pckg.length; i < imax; i++){
					x = this.pckg[i];
					
					if (typeof x.source !== 'string') {
						logger.error('Source is not a string');
						continue;
					}
					
					libs += '\n' + x.source;
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
				
				var output = this.setts.output;
				
				switch (type) {
					case 'namespace':
						return output + 'index' + mode + '.js';
					case 'common':
						return output + 'exports' + mode + '.js';
					case 'globals':
						return output + 'globals' + mode + '.js'
				}
				
				throw Error('ERROR - undefined type -', type);
			},
			
			save: function(){
				
				
				function write(type) {
					var source = this.sources[type];
					
					new io
						.File(this.filename(type, 'dev'))
						.write(source)
						;
					
					var file = new io.File(this.filename(type));
						
					file.content = source;
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
						
						console.error('Pckg Not Found', search, name, Object.keys(loadedPckg));
					}
					
					return array;
				}
			}
		});
		
});