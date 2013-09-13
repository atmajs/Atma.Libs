include

	.js(
		'process/Sources.js',
		'publish.js'
	)
	.load('node.json', 'browser.json')

	.done(function(resp){
		
		var libsNode = resp.load.node,
			libsBrowser = resp.load.browser,
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
		
		
		process(libsNode, function(){
			
			process(libsBrowser, function(){
				
				if (app.config.cli.params.publish){
					publish(function(error){
						if (error) 
							logger.error(error);
							
						logger.log('Done'.green.bold);
					});
				}
			});
		});
		
		

	});