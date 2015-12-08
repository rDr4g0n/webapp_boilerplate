/*****************************************************************************
 * 
 * Copyright (C) Zenoss, Inc. 2015, all rights reserved.
 * 
 * This content is made available according to terms specified in
 * License.zenoss under the directory where your Zenoss product is installed.
 * 
 ****************************************************************************/

/* globals require: true, __dirname: true */
/* jshint multistr: true */

var gulp = require("gulp"),
    babel = require("gulp-babel"),
    concat = require("gulp-concat"),
    sourcemaps = require("gulp-sourcemaps"),
    sequence = require("run-sequence"),
    sass = require("gulp-sass"),
    livereload = require("gulp-livereload"),
    autoprefixer = require("gulp-autoprefixer");

var paths = {
    src: "src/",
    build: "build/",
    css: "scss/",
};

var mainLib = [
    paths.src +"app.js",
];

var babelConfig = {
    blacklist: ["react"],
    comments: false
};

gulp.task("default", function(){
    sequence("babel", "css", function(){});
});

gulp.task("babel", function(){
    return gulp.src(mainLib)
        .pipe(sourcemaps.init())
            .pipe(concat("app.js"))
            .pipe(babel(babelConfig))
        .pipe(sourcemaps.write("./", { sourceRoot: "src" }))
        .pipe(gulp.dest(paths.build))
        .pipe(livereload());
});

gulp.task("css", function(){
    return gulp.src(paths.css +"index.scss", {sourceMap: "sass", sourceComments: "map"})
        .pipe(sass.sync().on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.build +"assets/"))
        .pipe(livereload());
});

gulp.task("watch", function(){
    livereload.listen();

    // concat js
    gulp.watch(paths.src + "**/*.js", function(){
        sequence("babel", function(){});
    });

    // scss
    gulp.watch(paths.css + "**/*.scss", function(){
        sequence("css", function(){});
    });
});
