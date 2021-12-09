#!/usr/bin/env node
'use strict'
/**
 * @author github.com/tintinweb
 * @license MIT
 * */
const { getSolcJsCompilerList } = require('../src/remoteCompiler');


getSolcJsCompilerList({nightly:false}).then(compilers => {
    console.log(`'use strict'
/**
 * @author github.com/tintinweb
 * @license MIT
 * */
    
//autogenerated with # npm run updateCompilerList
module.exports.solcVersions = ${JSON.stringify(compilers, null, 4)}`);
})

