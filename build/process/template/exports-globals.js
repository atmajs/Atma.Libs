

function obj_extend(target, source) {
	
	for (var key in source) {
		if (source[key] == null) 
			continue;
		
		if (globals[key] != null
			&& typeof globals[key] === 'object'
			&& typeof source[key] === 'object') {
			
			obj_extend(globals[key], source[key]);
			continue;
		}
		
		globals[key] = source[key];
	}
}


obj_extend(globals, this);
