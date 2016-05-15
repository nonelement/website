var path = require('path'),
    gulp = require('gulp'),
    less = require('gulp-less');

gulp.task('less', function () {
    return gulp.src(path.join('src', 'less', '*.less'))
        .pipe(less())
        .pipe(gulp.dest(path.join('dist', 'css')));
});
