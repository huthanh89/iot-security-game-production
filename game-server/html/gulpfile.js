//-----------------------------------------------------------------------------//
// Import
//-----------------------------------------------------------------------------//

const gulp       = require('gulp');
const livereload = require('gulp-livereload');

//-----------------------------------------------------------------------------//
// Tasks
//-----------------------------------------------------------------------------//

// Start livereload.

gulp.task('reload', (cb) =>{
  livereload.reload();
  cb();
});

// Start livereload.

gulp.task('default',(cb) =>{
  livereload({ 
    start: true 
  });
  cb();
});

//-----------------------------------------------------------------------------//
// Watch
//-----------------------------------------------------------------------------//

gulp.watch('instructor.css',            gulp.series('reload'));
gulp.watch('instructor-dashboard.html', gulp.series('reload'));
gulp.watch('instructor/**/*.js',        gulp.series('reload'));
gulp.watch('instructor/**/*.html',      gulp.series('reload'));
gulp.watch('instructor.js',             gulp.series('reload'));
gulp.watch('student.css',               gulp.series('reload'));
gulp.watch('student-dashboard.html',    gulp.series('reload'));
gulp.watch('student.js',                gulp.series('reload'));
gulp.watch('student/**/*.js',           gulp.series('reload'));
gulp.watch('student/**/*.html',         gulp.series('reload'));

//-----------------------------------------------------------------------------//