const fs = require('fs');
const { join } = require('path');

require('dotenv').config();

const tasksDir = join(__dirname, 'tasks');

fs.readdirSync(tasksDir).forEach(file => {
    require(join(tasksDir, file));
});
