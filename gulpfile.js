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
    }),

    watch_targets = {
        'html': "src/index.html",
        'js': "src/**/*.js",
        'less': "src/**/*.less"
    },

    clean_targets = {
        'all': '',
        'html': 'index.html',
        'css': 'css',
        'js': 'js',
        'img': 'img',
        'err': 'err'
    };

for(prop in clean_targets) {
    gulp.task('clean-' + prop, function (prop) {
        return function () {
            return gulp.src(
                    path.join('dist', clean_targets[prop]),
                    { read: false }
                ).pipe(clean());
            }
    }(prop));
}

gulp.task('less', ['clean-css'], function () {
    return gulp.src(path.join('src', 'less', '*.less'))
        .pipe(less())
        .pipe(gulp.dest(path.join('dist', 'css')));
});

gulp.task('js', ['clean-js'], function () {
    return gulp.src(path.join('src', 'js', '*.js'))
        .pipe(gulp.dest(path.join('dist', 'js')));
});

gulp.task('html', ['clean-html'], function () {
    return gulp.src(path.join('src', 'index.html'))
        .pipe(gulp.dest(path.join('dist')));
});

// For build supertask
gulp.task('_less', ['clean-all'], function () {
    return gulp.src(path.join('src', 'less', '*.less'))
        .pipe(less())
        .pipe(gulp.dest(path.join('dist', 'css')));
});

// For build supertask
gulp.task('_js', ['clean-all'], function () {
    return gulp.src(path.join('src', 'js', '*.js'))
        .pipe(gulp.dest(path.join('dist', 'js')));
});

// For build supertask
gulp.task('_html', ['clean-all'], function () {
    return gulp.src(path.join('src', 'index.html'))
        .pipe(gulp.dest(path.join('dist')));
});

gulp.task('img', ['clean-all'], function () {
    return gulp.src(path.join('src', 'img', '*'))
        .pipe(gulp.dest(path.join('dist', 'img')));
});

gulp.task('err', ['clean-all'], function () {
    return gulp.src(path.join('src', 'err', '*.html'))
        .pipe(gulp.dest(path.join('dist', 'err')));
});

gulp.task('config', ['clean-all'], function () {
    return gulp.src(path.join('src', '.htaccess'))
        .pipe(gulp.dest(path.join('dist')));
});

gulp.task('build', ['_html', '_js', '_less', 'config', 'err', 'img']);

gulp.task('deploy', ['build'], function () {
    return gulp.src('dist/**/*', { buffer: false })
        .pipe(ftp_connection.dest(''));
});

gulp.task('watch', function () {
    gutil.log("Watching html, js, less...");
    gulp.watch(watch_targets.html, ['html']);
    gulp.watch(watch_targets.js, ['js']);
    gulp.watch(watch_targets.less, ['less']);
});
