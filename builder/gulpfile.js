const fs = require('fs');
const gulp = require('gulp');
const path = require('path');

const dir = __dirname;

fs.readdirSync(dir + "/tasks").forEach(function (file) {
    let task = require(dir + "/tasks/" + file);
    let deps;

    const taskName = path.basename(file, path.extname(file));

    if(typeof task === "function") {
        deps = task.deps;
        task = task.bind(gulp, {dir});
    }

    if(Array.isArray(deps)) {
        gulp.task(taskName, deps, task);
    }
    else {
        gulp.task(taskName, task);
    }
});