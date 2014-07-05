include

	.js(
		'process/Sources.js',
		'publish.js'
	)
	.load(
		'node.json',
		'browser.json',
		'libraries.json'
	)

	.done(function(resp){
		
		var libsNode = resp.load.node,
			libsBrowser = resp.load.browser,
			libraries = resp.load.libraries,
			Sources = resp.Sources,
			Uglify = resp.Uglify,
			publish = resp.publish;
		
		
		
		function process(libs, callback) {
			
			include
				.instance()
				.routes(libs.routes)
				.load(libs.libraries)
				.done(function(resp){
					
					var pckg = Sources.prepair(libs.pckg, resp.load);
					
					new Sources(pckg, libs.settings)
						.process()
						.save();
					
	
					callback();
				})
		}
		
		function processCopy(libs){
			libs.main.forEach(function(name){
				var dir = new io.Directory('../' + name + '/lib/');
				if (dir.exists() === false) {
					logger.error('Library not exists', name);
					return;
				}
				
				dir.copyTo('libraries/' + name + '/');
			});
		}
		
		
		process(libsNode, function(){
			
			process(libsBrowser, function(){
				
				//-processCopy(libraries);
				
				if (app.config.$cli.params.publish){
					publish(function(error){
						if (error) 
							logger.error(error);
							
						logger.log('Done'.green.bold);
					});
				}
			});
		});
		
		

	});