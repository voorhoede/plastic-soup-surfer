const fs = require('fs');
const path = require('path');

require('dotenv').config();

fs.readdirSync(__dirname + "/tasks").forEach(file => {
    const fullPath = path.join(__dirname + "/tasks", file);

    if(fs.statSync(fullPath).isFile()) {
        require(__dirname + "/tasks/" + file);
    }
});