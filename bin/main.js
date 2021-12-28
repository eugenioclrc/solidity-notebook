#!/usr/bin/env node
'use strict'
/**
 * @author github.com/tintinweb
 * @license MIT
 * */
const Vorpal = require('vorpal');
const c = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { InteractiveSolidityShell, SolidityStatement } = require('../src/handler');
const { convert, multilineInput } = require('../src/utils');

const CONFIG_HOME = path.join(os.homedir(), '.solidity-shell');
const CONFIG_FILE = '.config';

const REX_PLACEHOLDER = /(^|\s)(\$_)(\s|$)/ig /* LAST_KNOWN_RESULT placeholder */

var LAST_KNOWN_RESULT = 'ss';
var SESSION = 'previous.session';


/** static funcs */
function loadFile(name){
    let cfgFile = path.join(CONFIG_HOME, name);

    if(fs.existsSync(cfgFile)){
        return JSON.parse(fs.readFileSync(cfgFile));
    }
    return {};
}

function saveFile(name, data){
    let cfgFile = path.join(CONFIG_HOME, name);
    
    if(!fs.existsSync(CONFIG_HOME)){
        fs.mkdirSync(CONFIG_HOME);
    }
    fs.writeFileSync(cfgFile, JSON.stringify(data));
}

/** MAIN */
const argv = require('minimist')(process.argv, {'--': true});
var config = loadFile(CONFIG_FILE);
const oldGanacheArgs = config.ganacheArgs;
if(argv['--'].length){ // temporarily override ganache args
    config.ganacheArgs = argv['--'];
}

const shell = new InteractiveSolidityShell(config);

process.on('exit', () => { 
    shell.blockchain.stopService(); 
    if(argv['--'].length){ //restore old ganache args
        shell.settings.ganacheArgs = oldGanacheArgs;
    }
    saveFile(CONFIG_FILE, shell.settings)
    saveFile(SESSION, shell.dumpSession())
});

const vorpal = new Vorpal()
    .delimiter('')
    .show()
    .parse(argv._);

vorpal.on('client_prompt_submit', (cmd) => {
    if(cmd.trim() === 'exit'){
        process.exit(0); // exit completely from repl. otherwise, would return to main vorpal loop
    }
});

vorpal
    .mode('repl', 'Enters Solidity Shell Mode')
    .delimiter(c.bold('» '))
    .init(function (args, cb) {
        this.log(`🚀 Entering interactive Solidity ${c.bold(shell.settings.installedSolidityVersion)} shell. '${c.bold('.help')}' and '${c.bold('.exit')}' are your friends.`);
        return cb();
    })
    .action(function (input, cb) {
        let command = multilineInput(input);

        /* substitute placeholder: $_ */
        command = command.replace(REX_PLACEHOLDER, ' ' + LAST_KNOWN_RESULT + ' ');

        if (command.startsWith('.')) {
            let commandParts = command.split(' ');
            let ret = undefined;
            switch (commandParts[0]) {
                case '.help':
                    cb(`
📚 Help:
   -----

 ${c.bold('$_')} is a placeholder holding the most recent evaluation result.
 ${c.bold('pragma solidity <version>')} to change the compiler version.


 ${c.bold('General:')}
    .help                                ... this help :)
    .exit                                ... exit the shell

 ${c.bold('Settings:')}
    .config                              ... show settings
            set <key> <value>            ... set setting
            unset <key>                  ... unset setting
 ${c.bold('Session:')}
    .session                             ... list sessions
            load <id>                    ... load session
            save <id>                    ... save session
    .undo                                ... undo last command
    .reset                               ... reset cmd history. start from scratch.

 ${c.bold('Debug:')}
    .proc                                ... show processes managed by solidity-shell (ganache)
    .dump                                ... show template contract
    .echo                                ... every shell needs an echo command


cheers 🙌 
    ${c.bold('@tintinweb')} 
    ConsenSys Diligence @ https://consensys.net/diligence/
    https://github.com/tintinweb/solidity-shell/ 
`);

                    break; //show usage
                case '.exit': process.exit(); break; //exit -> no more cb()
                case '.reset': shell.reset(); break; //reset complete state
                case '.undo': shell.revert(); break; //revert last action
                case '.config':
                    switch(commandParts[1]){
                        case 'set': shell.setSetting(commandParts[2], convert(commandParts.slice(3).join(' '))); break;
                        case 'unset': delete shell.settings[commandParts[2]]; break;
                        default: return cb(shell.settings); 
                    } break;
                case '.session': 
                    switch(commandParts[1]){
                        default:
                            let sessions = fs.readdirSync(CONFIG_HOME).filter(file => file.endsWith('.session'));
                            return cb('     - ' + sessions.map(s => c.bold(s.replace('.session',''))).join('\n     - '));
                        case 'load': 
                            shell.loadSession(loadFile(`${commandParts[2]}.session`))
                            break;
                        case 'save': 
                            SESSION = `${commandParts[2]}.session`;
                            saveFile(SESSION, shell.dumpSession())
                            break;
                    }; 
                    break;
                case '//DISABLED-.play': 
                    let path = `./${commandParts[1]}`
                    if(!fs.existsSync(path)){
                        this.log(`file not found: ${path}`);
                        return cb();
                    }
                    this.log(`⏯️  playing '${path}'`)
                    let lines = fs.readFileSync(path, 'utf-8')
                    lines.split('\n').map(l => l.trim()).filter(l => l && l.length).forEach(l => {
                        this.log(l)
                        this.parent.exec(l, function(err, data){
                            if(!err && data){
                                return cb(data)
                            } 
                            return 
                        })
                    })
                    break;
                case '.dump': return cb(c.yellow(shell.template()));
                case '.echo': return cb(c.bold(c.yellow(commandParts.slice(1).join(' '))))
                case '.proc': 
                    if(!shell.blockchain.proc){
                        return cb();
                    }
                    return cb(`${c.bold(c.yellow(shell.blockchain.proc.pid))} - ${shell.blockchain.proc.spawnargs.join(', ')}`)
                default:
                    console.error(`Unknown Command: '${command}'. Type '${c.bold('.help')}' for a list of commands.`);
            }
            // meta commands
            return cb(ret);
        }

        const statement = new SolidityStatement(command);

        /* REPL cmd */
        shell.run(statement).then(res => {
            if(!Array.isArray(res) && typeof res === 'object'){
                return cb();
            }
            LAST_KNOWN_RESULT = res;
            cb(c.bold(c.yellow(res)));
        }).catch(errors => {
            console.error(errors)
            cb()
        })
    });



/*** make autocomplete happy. this is hacky, i know 🙄 */

vorpal 
    .command(".help")
vorpal 
    .command(".exit")
    .alias("exit")
vorpal 
    .command(".config")
    .autocomplete(["set","unset"])
    
vorpal 
    .command(".session")
    .autocomplete(["load","save"])
vorpal 
    .command(".undo")
vorpal 
    .command(".redo")
vorpal 
    .command(".reset")
vorpal 
    .command(".proc")
vorpal 
    .command(".dump")
vorpal 
    .command(".echo <msg>")
vorpal 
    .command("$_")

/** start in repl mode */
vorpal.execSync("repl")

//vorpal.execSync("uint a = 2") /* debug */


const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
      cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});



app.get('/', function(req, res) {
   // res.sendfile('index.html');
   res.send(`
   <!DOCTYPE html>
<html>
   <head>
      <title>Hello world</title>
   </head>
   <script src = "/socket.io/socket.io.js"></script>
   
   <script>
      const socket = io();
      window.s = socket;
   </script>
   <body>Hello</body>
</html>`);
});

let lines = 0;

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
    console.log('A user connected');

    socket.on('exec', async function ({ id, value }) {
        try {
            lines++;
            let command = multilineInput(value);
            const statement = new SolidityStatement(command);
            const response = await shell.run(statement);
            socket.emit('response', { response, id, line: lines });
        } catch(err) {
            socket.emit('error', { error: err, id, line: lines });
        }
    });
   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});

http.listen(3005, function() {
   console.log('listening on *:3005');
});

/*

        let command = multilineInput(input);

        const statement = new SolidityStatement(command);

        /* REPL cmd * /
        shell.run(statement).then(res => {
            if(!Array.isArray(res) && typeof res === 'object'){
                return cb();
            }
            LAST_KNOWN_RESULT = res;
            cb(c.bold(c.yellow(res)));
        }).catch(errors => {
            console.error(errors)
            cb()
        })
*/