var fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    clean = require('gulp-clean'),
    less = require('gulp-less'),
    markdown = require('gulp-markdown'),
    mustache = require('gulp-mustache'),
    replace = require('gulp-replace'),
    gutil = require('gulp-util'),
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
        'writing': 'writing',
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

function readFirstLine(name, filter, cb) {
    var data, lines, line;

    if (!cb) {
        cb = filter;
        filter = null;
    }

    data = fs.readFileSync(name);
    lines = data.toString().split('\n');

    if (filter) {
        line = filter(lines[0]);
    }

    cb(null, line);
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


gulp.task('index-posts', ['clean-writing'], function () {
    var path_md = path.join('src', 'writing', 'md'),
        re_md = /\.(md)$/,
        default_content = `<span> Nothing here! </span>`,
        glob = [],
        dir,
        stream;
    try {
        dir = fs.readdirSync(path_md);
        dir.forEach(function (file) {
            readFirstLine(
                path.join(path_md, file),
                function (title) {
                    return title.replace(/#/g, "").trim();
                },
                function (err, title) {
                    if (err) {
                        gutil.log(err);
                    } else {
                        var filename = file.replace(re_md, ".html");
                        glob.push({ "name":filename, "title": title });
                    }
                }
            );
        });
    } catch (e) {
        gutil.log("There was a problem reading md: ", e);
    }

    return gulp.src(path.join('src', 'writing', 'index.html'))
        .pipe(mustache({ posts: glob }))
        .pipe(gulp.dest(path.join('dist', 'writing')));
});

gulp.task('posts', ['clean-writing', 'index-posts'], function () {
    return gulp.src(path.join('src', 'writing', '**/*.md'),{
            base: path.join('src', 'writing', 'md')
        })
        .pipe(markdown())
        .pipe(gulp.dest(path.join('dist', 'writing'), {
            base: '..'
        }));
});

// For build supertask
gulp.task('_index-posts', ['clean-all'], function () {
    var path_md = path.join('src', 'writing', 'md'),
        re_md = /\.(md)$/,
        default_content = `<span> Nothing here! </span>`,
        glob = [],
        dir,
        stream;
    try {
        dir = fs.readdirSync(path_md);
        dir.forEach(function (file) {
            readFirstLine(
                path.join(path_md, file),
                function (title) {
                    return title.replace(/#/g, "").trim();
                },
                function (err, title) {
                    if (err) {
                        gutil.log(err);
                    } else {
                        var filename = file.replace(re_md, ".html");
                        glob.push({ "name":filename, "title": title });
                    }
                }
            );
        });
    } catch (e) {
        gutil.log("There was a problem reading md: ", e);
    }

    return gulp.src(path.join('src', 'writing', 'index.html'))
        .pipe(mustache({ posts: glob }))
        .pipe(gulp.dest(path.join('dist', 'writing')));
});

// For build supertask
gulp.task('_posts', ['clean-all', '_index-posts'], function () {
    return gulp.src(path.join('src', 'writing', '**/*.md'),{
            base: path.join('src', 'writing', 'md')
        })
        .pipe(markdown())
        .pipe(gulp.dest(path.join('dist', 'writing'), {
            base: '..'
        }));
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

gulp.task('build', [
    '_html',
    '_js',
    '_less',
    '_posts',
    'config',
    'err',
    'img'
]);

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
