define(function(require, exports, module){
    'use strict';
	
    const NodeDomain          = brackets.getModule('utils/NodeDomain'),
		  ExtensionUtils      = brackets.getModule('utils/ExtensionUtils'),
		  Document            = brackets.getModule('document/Document'),
		  DocumentManager     = brackets.getModule('document/DocumentManager'),
		  PreferencesManager  = brackets.getModule('preferences/PreferencesManager'),
		  Dialogs             = brackets.getModule('widgets/Dialogs');
	
	const Main = function(){
		
		const prefs = PreferencesManager.getExtensionPrefs('sasscompiler');
		var DOC = null;
		var HOME_PATH = null;
		const CONFIG = {
			style: 'nested',
			includePaths: [],
			precision: 5,
			sourceComments: false
		};
		
		prefs.definePreference('files', 'object', {});
		
		function loadConfig(config, cfg){
			
			for(var k in cfg){
				if(config[k])
					config[k] = cfg[k];
			}
			
			return config;
		}
		
		function configGenerator(){
			
			var config = Object.assign({}, CONFIG);
			var prefsfiles = prefs.get('files');
			
			if(prefsfiles['*']){
				config = loadConfig(config, prefsfiles['*']);
				if(prefsfiles['*']['savepath']){
					config.savepath = HOME_PATH+prefsfiles['*']['savepath'];
					config.savepath += DOC.file._name.replace('.scss', '.css').replace('.sass', '.css');
				}
			}
			
			var prefssavepath = prefsfiles[DOC.file._path.replace(HOME_PATH, '')];
			if(prefssavepath){
				if(typeof prefssavepath == 'string'){
					config.savepath = HOME_PATH+prefssavepath;
				}else if(typeof prefssavepath == 'object'){
					config = loadConfig(config, prefssavepath);
					if(prefssavepath['savepath']){
						config.savepath = HOME_PATH+prefssavepath['savepath'];
					}
				}
			}
			
			for(var l=0;l<=4;l++){
				
				var line = DOC.getLine(l);
				line = line.match(/^\/\/([a-zA-Z]{0,})\:\s?(.*?)$/);
				
				if(line && line[1] && line[2]){
					
					var key = line[1].toLowerCase();
					var value = line[2].toLowerCase();
					
					switch(key){
							
						case 'savepath':
							config.savepath = value.replace(/\\/g, '\\');
							config.savepath = DOC.file._parentPath+config.savepath;
							break;
							
						case 'style':
							config.style = value;
							break;
						
						case 'includepaths':
							try {
								config.includePaths = JSON.parse(value);
							}catch(e){
								console.log('Wrong includePaths value!');
							}
							break;
							
						case 'sourceComments':
							config.sourceComments = (value == 'true')?true:false;
							break;
							
						case 'precision':
							config.precision = parseInt(value);
							if(!config.precision){
								config.precision = 5;
								console.log('Wrong precision value!');
							}
							break;
							
					}

				}

			}
			
			
			return config;
		}
		
		DocumentManager.on('documentSaved.sasscompiler', function(event, document){

			if(
				document.language._fileExtensions.length > 0
				&& ['sass', 'scss'].indexOf(document.language._fileExtensions[0].toLowerCase()) > -1
			){
				
				DOC = document;
				HOME_PATH = document.file._watchedRoot.entry._path;
				
				var config = configGenerator();
				
				if(config.savepath){
					if(['nested', 'expanded', 'compact', 'compressed'].indexOf(config.style) > -1){
						
						sassDomain.exec('compile', document.file._path, config)
							.done(function(compileData){
							
								if(!compileData.css){
									Dialogs.showModalDialog('sasscompiler_error', 'Error when compiling SASS to CSS!', compileData.message+((compileData.line)?' on line '+compileData.line+':'+compileData.column:''));
								}

							}).fail(function(error){

								console.log('[szymonlisowiec.sasscompiler] '+error);

							});

					}else{
						Dialogs.showModalDialog('sasscompiler_error', 'Error when compiling SASS to CSS!', 'Wrong compile style.');
					}
				}else{
					Dialogs.showModalDialog('sasscompiler_error', 'Error when compiling SASS to CSS!', 'You have to give save path for CSS file.');
				}

			}

			return true;
		});
		
	};
	
	const sassDomain = new NodeDomain('sassDomain', ExtensionUtils.getModulePath(module, 'node/sassDomain'));
	
	sassDomain.exec('isready')
		.done(function(status){
			
			Main();
			
		}).fail(function(error){
			
			try {
				
				if(error.indexOf('Node Sass could not find a binding for your current environment') > -1){
					var errorA = error.match(/Missing binding (.*?)binding\.node/g);
					if(errorA[0]){

						var error = errorA[0].replace('Missing binding ', '').trim().replace(/\\/g, '\\\\');
						var seperator = (error.indexOf('/') > -1)?'/':'\\';
						error = error.split(seperator);

						var env = error[error.length-3];
						var binding = error[error.length-1];

						delete error[error.length-3];
						delete error[error.length-1];

						error = error.join(seperator).replace(/\\(.)/mg, '$1');
						var path = error.substr(0, error.length-1);

						Dialogs.showModalDialog('sasscompiler_error', 'Error when running node-sass!', '<h3>To fix:</h3><dl><li>1. Go to <a href="https://github.com/sass/node-sass-binaries">https://github.com/sass/node-sass-binaries</a> and download <strong>'+env+'_'+binding+'</strong></li><li>Rename downloaded file as '+binding+'</li><li>Put file in: '+path+env+' (You have to create "'+env+' directory")</li></dl>');

					}else throw error;
				}else throw error;
				
			}catch(error){
				Dialogs.showModalDialog('sasscompiler_error', 'Error when running node-sass!', 'For more informations, go to Debug -> Show Developer tools (F12) -> Console.');
			}
			
		});
	
});