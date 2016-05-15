var path = require('path'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    less = require('gulp-less'),
    clean = require('gulp-clean'),
    ftp = require('vinyl-ftp'),
    creds = require('./credentials.json'),

    ftp_connection = ftp.create({
        host: creds.host,
        user: creds.user,
        pass: creds.pass,
        parallel: 7,
        log: gutil.log
    });

gulp.task('clean', function () {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

gulp.task('less', ['clean'], function () {
    return gulp.src(path.join('src', 'less', '*.less'))
        .pipe(less())
        .pipe(gulp.dest(path.join('dist', 'css')));
});

gulp.task('js', ['clean'], function () {
    return gulp.src(path.join('src', 'js', '*.js'))
        .pipe(gulp.dest(path.join('dist', 'js')));
});

gulp.task('img', ['clean'], function () {
    return gulp.src(path.join('src', 'img', '*'))
        .pipe(gulp.dest(path.join('dist', 'img')));
});

gulp.task('err', ['clean'], function () {
    return gulp.src(path.join('src', 'err', '*.html'))
        .pipe(gulp.dest(path.join('dist', 'err')));
});

gulp.task('config', ['clean'], function () {
    return gulp.src(path.join('src', '.htaccess'))
        .pipe(gulp.dest(path.join('dist')));
});

gulp.task('html', ['clean'], function () {
    return gulp.src(path.join('src', 'index.html'))
        .pipe(gulp.dest(path.join('dist')));
});

gulp.task('build', ['html', 'config', 'err', 'img', 'js', 'less']);

gulp.task('deploy', ['build'], function () {
    return gulp.src('dist/**/*', { buffer: false })
        .pipe(ftp_connection.dest(''));
});
