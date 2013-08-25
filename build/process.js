include

.js('process/Sources.js')
.load('libs.json')

.done(function(resp){
	
	var libs = resp.load.libs,
		Sources = resp.Sources,
		Uglify = resp.Uglify;
	
	
	if (typeof libs === 'string') 
		libs = JSON.parse(libs);
		
	
	include
		.routes(libs.routes)
		.load(libs.libraries)
		.done(function(resp){
			
			var pckg = Sources.prepair(libs.pckg, resp.load);
			
			new Sources(pckg)
				.process()
				.save();
			
		})
	
	

});