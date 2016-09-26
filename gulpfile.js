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
    through2 = require('through2'),
    creds = require('./credentials.json'),

    /*
     * Impromptu plugin-like fn for wrapping
     * piped contents in a template. Uses plugin-name
     * 'custom-wrapWith' for errors.
     */
    wrapWith = function (template, marker, newExt) {
        return through2.obj(function (file, enc, callback) {
            fs.readFile(template, function (err, template_data) {
                // throw an error if we failed to read the template
                if (err) {
                    cb(new gutil.PluginError(
                        'custom-wrapWith',
                        err,
                        { fileName: file.path }
                    ));
                    return;
                }
                // grab leading characters for formatting
                var leads = leadingChars(template_data.toString(), marker),
                // transform input by formatting it
                    prepped = file.contents
                        .toString()
                        .trim()
                        .replace(/\n/g, '\n' + leads),
                // "compile" template
                    compiled = template_data
                        .toString()
                        .replace(
                            marker,
                            prepped
                        );
                file.contents = new Buffer(compiled);
                if (newExt) {
                    file.path = gutil.replaceExtension(file.path, newExt);
                }
                callback(null, file);
            });
        });
    },

    // Returns characters leading some marker
    leadingChars = function (str, marker) {
        var lines = str.split('\n'),
            index, leading;
        lines.forEach(function (line) {
            index = line.indexOf(marker);
            if (index > -1) {
                leading = line.substring(0, index);
            }
        });
        return leading;
    },

    // Reads the first line of an md file to derive a title
    readFirstLine = function (name, filter, cb) {
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
    },

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
        'posts': 'posts',
        'err': 'err'
    },

    build_targets = {
        'less': {
            'src': path.join('src', 'less', '*.less'),
            'dest': path.join('dist', 'css')
        },
        'js': {
            'src': path.join('src', 'less', '*.less'),
            'dest': path.join('dist', 'js')
        },
        'html': {
            'src': path.join('src', 'index.html'),
            'dest': path.join('dist')
        },
        'posts': {
            'fn': function () {
                var path_writing = path.join('src', 'posts');
                return gulp.src(path.join(path_writing, '**/*.md'),{
                        base: path.join(path_writing, 'md')
                    })
                    .pipe(markdown())
                    .pipe(
                        wrapWith(
                            path.join(path_writing, 'templates', 'post.html'),
                            "{{markdown}}"
                        )
                    ).pipe(gulp.dest(path.join('dist', 'posts'), {
                        base: '..'
                    }));
            }
        },
        'index-posts': {
            'fn': function () {
                var path_md = path.join('src', 'posts', 'md'),
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

                return gulp.src(path.join('src', 'posts', 'index.html'))
                    .pipe(mustache({ posts: glob }))
                    .pipe(gulp.dest(path.join('dist', 'posts')));
            }
        }
    };

// Generates clean tasks
for(prop in clean_targets) {
    gulp.task('clean-' + prop, (function (prop) {
        return function () {
            return gulp.src(
                    path.join('dist', clean_targets[prop]),
                    { read: false }
                ).pipe(clean());
            }
    }(prop)));
}

// Generates public (cli invoked) and private (build task) tasks.\
//   Private tasks have different dependencies:
//     clean-all vs clean-`type`(clean-js, clean-css, etc.)
for(prop in build_targets) {
    var taskGenerator = function (prop) {
        return function () {
            return gulp.src(build_targets[prop]['src'])
                .pipe(gulp.dest(build_targets[prop]['dest']));
        }
    }

    var task = build_targets[prop]['fn'] || taskGenerator(prop);

    gulp.task(
        prop,
        ['clean-'+prop],
        task
    );
    gulp.task(
        '_' + prop,
        ['clean-all'],
        task
    );
}

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
    '_index-posts',
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
