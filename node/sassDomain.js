const sass = require('node-sass');
const fs = require('fs');

function compile(filePath, config){
	
	var result = {};
	
	try {
		
		result = sass.renderSync({
			file: filePath,
			outputStyle: config.style,
			includePaths: config.includePaths,
			precision: config.precision,
			sourceComments: config.sourceComments,
		});
		
		fs.writeFileSync(config.savepath, result.css, {
			flag: 'w+'
		});
		
	}catch(error){
		result = {
			message: error.message,
			line: error.line,
			column: error.column,
			status: error.status,
			file: error.file
		};
	}
	
	return result;
	
}

function init(domainManager){
	
    if(!domainManager.hasDomain('sassDomain')){
        domainManager.registerDomain('sassDomain', {major: 0, minor: 1});
    }
	
    domainManager.registerCommand(
        'sassDomain',       // domain name
        'compile',    // command name
        compile,   // command handler function
        false,          // this command is synchronous in Node
        'Compile SASS/SCSS on CSS.',
        [	// parameters
			{
				name: 'filePath', 
            	type: 'string',
				description: 'Path to SASS/SCSS file.'
			},
			{
				name: 'config', 
            	type: 'object',
				description: 'node-sass options.'
			}
		],
        [	// return values
			{
				name: 'compileData',
				type: 'object',
				description: 'Data of compiling.'
			}
		]
    );
	
	domainManager.registerCommand(
        'sassDomain',       // domain name
        'isready',    // command name
        function(){
			return true;
		},   // command handler function
        false,          // this command is synchronous in Node
        'is ready?',
        [],
        [	// return values
			{
				name: 'isready',
				type: 'boolean',
				description: 'is ready?'
			}
		]
    );
	
	
}

exports.init = init;