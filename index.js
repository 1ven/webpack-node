#!/usr/bin/env node

const path = require('path');
const cp = require('child_process');
const webpack = require('webpack');
const MemoryFS = require("memory-fs");

const fs = new MemoryFS();
const configPath = path.resolve(process.cwd(), 'webpack.config.js');
const compiler = webpack(require(configPath));
let processes = [];

compiler.outputFileSystem = fs;
compiler.watch(void 0, (err, stats) => {
  console.log('Building...')

  if (err) {
    throw err;
  }

  const errors = stats.compilation.errors;

  if (errors.length) {
    for (let error of stats.compilation.errors) {
      console.log(error.message)
    }
    return;
  }

  console.log(`Built in ${stats.endTime - stats.startTime}ms`);

  for (let [i, file] of Object.keys(stats.compilation.assets).entries()) {
    process[i] && process[i].kill();

    const output = fs.readFileSync(path.resolve(compiler.outputPath, file), 'utf-8');
    const pr = cp.spawn('node', ['-e', output]);

    pr.stdout.on('data', (data) => {
      console.log(`NodeJS output: ${toString(data)}`);
    });

    pr.stderr.on('data', (data) => {
      console.log(`NodeJS error: ${toString(data)}`);
    });

    process[i] = pr;
  }
});

const toString = (data) => new Buffer(data).toString('utf8');