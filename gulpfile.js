/* jshint node: true */

"use strict";

var gulp = require("gulp"),
    concat = require("gulp-concat"),
    livereload = require("gulp-livereload"),
    sourcemaps = require("gulp-sourcemaps"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    sequence = require("gulp-sequence"),
    serv = require("./serv"),
    exec = require("child_process").exec,
    globule = require("globule"),
    rollup = require("rollup-stream"),
    rollupIncludePaths = require("rollup-plugin-includepaths"),
    fs = require("fs"),
    through = require("through2");

var paths = {
    src: "src/",
    build: "build/",
    www: "www/",
};

var appName = "app",
    entrypoint = paths.src + appName + ".js";

gulp.task("default", ["deploy"]);

// build app and copy it to www dir
gulp.task("deploy", ["build", "copy"]);

// build js and css
gulp.task("build", function(callback){
    sequence("buildJS", "buildCSS")(callback);
});

// bundle all js from src dir
gulp.task("buildJS", function(){
    return rollup({
        entry: entrypoint,
        sourceMap: true,
        moduleName: appName,
        format: "iife",
        plugins: [
            // hacky workaround for make sure rollup
            // knows where to look for deps
            rollupIncludePaths({
                paths: [
                    paths.src
                    // TODO - recursively grab js from paths.src
                ]
            })
        ]
    })
    .pipe(source(appName + ".js", paths.src))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.build));
});

// bundle all css from src dir
gulp.task("buildCSS", function(cb){
    return gulp.src(paths.src + "**/*.css")
        .pipe(concat(appName + ".css"))
        .pipe(gulp.dest(paths.build));
});

// copy all necessary resources into www
gulp.task("copy", function(callback){
    sequence("copyHTML", "copyBuild")(callback);
});

// copy all html files from src into www
gulp.task("copyHTML", function(){
    return gulp.src([paths.src + "*.html"])
        .pipe(gulp.dest(paths.www));
});

// copy all built files into www
gulp.task("copyBuild", function(){
    return gulp.src(paths.build + "*")
        .pipe(gulp.dest(paths.www));
});

// livereload the demo page
gulp.task("reload", function(){
    livereload.reload();
});

// bring up a server pointing to www dir
// with livereload
gulp.task("watch", ["deploy"], function(){
    var port = 3006,
        hostname = "localhost";

    livereload.listen();

    // rebuild the js and css and copy the new files
    gulp.watch(paths.src + "**/*.js", ["deploy"]);
    gulp.watch(paths.src + "**/*.css", ["deploy"]);

    // copy "static" stuff
    gulp.watch(paths.webapp + "**/*.html", ["copy"]);
    // TODO - images

    // start webserver
    serv(paths.www, port);

    // open in browser
    // TODO - reuse existing tab
    exec("xdg-open http://"+ hostname +":"+ port, function(err, stdout, stderr){
        if(err){
            console.error("Huh...", stdout, stderr);
        }
    });
});
