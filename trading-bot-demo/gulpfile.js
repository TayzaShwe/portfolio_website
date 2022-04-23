var gulp = require( 'gulp' );
var uglify = require( 'gulp-uglify' )
var browserify = require( 'browserify' );
var babelify = require( 'babelify' );
var autoprefixer = require( 'gulp-autoprefixer' );
var sourcemaps = require( 'gulp-sourcemaps' );
var rename = require( 'gulp-rename' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' )

// main files
var jsSRC = 'trading-bot-demo.js';
var jsFolder = 'src/';
var jsDIST = 'dist/';
var jsFILES = [jsSRC];


function bb() {
    var result = jsFILES.map(function( entry ) {
        return browserify( {
            entries: [jsFolder + entry]
        })
        .transform( babelify, {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime']
        })
        .bundle()
        .pipe( source( entry )) // making sure that entry source is still piped.
        .pipe( rename( { extname: '.min.js' }) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true}) )
        .pipe( uglify() )
        .pipe( sourcemaps.write( './' ) )
        .pipe( gulp.dest( jsDIST ));
    });
}

// Takes js file and uses browserify, babelify, minify, and sourcemap.
// Will show "Did you forget to signal async completion". Don't worry it still works
gulp.task('js', function () { 
    jsFILES.map(function( entry ) {
        return browserify( {
            entries: [jsFolder + entry]
        })
        .transform( babelify, {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime']
        })
        .bundle()
        .pipe( source( entry )) // making sure that entry source is still piped.
        .pipe( rename( { extname: '.min.js' }) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true}) )
        .pipe( uglify() )
        .pipe( sourcemaps.write( './' ) )
        .pipe( gulp.dest( jsDIST ));
    });
});




