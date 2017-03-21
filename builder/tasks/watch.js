
module.exports = function ({dir}) {
    this.watch(dir + "/templates/**/*.html", ['html']);
}

module.exports.deps = ['html'];