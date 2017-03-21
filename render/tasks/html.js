const path = require('path');
const rename = require('gulp-rename');
const renderContentful = require('../plugins/render-contentful');
const fs = require('fs');

module.exports = function ({dir}) {
    return this.src(process.env.INPUT_DIR  + '/views/**/*.html')
        .pipe(renderContentful())
        .pipe(rename(path => {
            path.dirname = '';
        }))
        .pipe(this.dest(process.env.OUTPUT_DIR));
}