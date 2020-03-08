const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require('gulp-concat');

gulp.task("default", function () {
  return gulp.src("src/index.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task('concat', function() {
 return gulp.src(['src/scripts/secrets.js', 'src/scripts/*.js', 'src/scripts/intents/*.js'])
    .pipe(concat('index.js'))
    .pipe(gulp.dest('dist/scripts'))
});