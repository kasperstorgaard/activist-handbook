const express = require('express');
const path = require('path');
const chalk = require('chalk');

const port = 3000;

const app = express();

// Static folders
app.use('/libs', express.static(__dirname + '/libs'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/src', express.static(__dirname + '/src'));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const greet = `
${chalk.cyan`Activist handbook`}
${chalk.red`-----------------`}
${chalk.magenta(`App is running on localhost:${port}`)}
`;

app.listen(port, () => console.log(greet));