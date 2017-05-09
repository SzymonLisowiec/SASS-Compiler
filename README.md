# SASS Compiler
Light extension to Brackets to compiling SASS/SCSS files on CSS.

# Two ways to configuration

## 1. Configuration in first lines of SASS/SCSS file.
```scss
//savepath: ../css/style.css
//style: compressed
.block {
    
    .block__element {
        
    }
    
}
```

## 1. Configuration in .brackers.json file.
```scss
{
	"sasscompiler.files": {
		"*": {
			"savepath": "css/",
			"style": "compressed",
			"includePaths": [],
			"precision": 5,
			"sourceComments": false
		},
		"scss/style.scss": "css/style.css",
		"scss/night.scss": {
		    "savepath": "css/night.css",
			"style": "nested"
		}
	}
}
```

# Source
Extension uses [node-sass](https://github.com/sass/node-sass)

# Liscense
MIT