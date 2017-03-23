const fs = require('fs');

require('dotenv').config();

fs.readdirSync(__dirname + "/tasks").forEach(file => {
    require(__dirname + "/tasks/" + file);
});