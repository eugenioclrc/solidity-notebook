<img src="demo.png" alt="Preview" width="800">

A fork from https://consensys.github.io/diligence/

## Solidity Shell Notebook

An interactive Solidity shell with lightweight session recording and remote compiler support.

<sub><b>note:</b> use `npx hardhat node` to start a local node before runinng
</sub>


1) start hardhat node
2) run shell `node bin/main.js`
3) run the notebook ` cd notebook && npm run dev`



```javascript

```javascript
⇒  solidity-shell
 
🚀 Entering interactive Solidity shell. '.help' and '.exit' are your friends.
 »  ℹ️  ganache-mgr: starting temp. ganache instance ...
 »
 »  uint a = 100
 »  uint b = 200
 »  a + b + 2 + uint8(50)
352
 »  $_
352
```

Oh, did you know that we automatically fetch a matching remote compiler when you change the solidity pragma? It is as easy as typing `pgrama solidity 0.5.0` and solidity-shell will do the rest 🙌.



### Hints

* `pragma solidity <version>` attempts to dynamically load the selected compiler version (remote compiler, may take a couple of seconds).
* Sessions can be saved and restored using the `.session` command. Your previous session is always stored and can be loaded via `.session load previous` (not safe when running concurrent shells).
* `.reset` completely removes all statements. `.undo` removes the last statement.
* See what's been generated under the hood? call `.dump`.
* Settings are saved on exit (not safe when running concurrent shells). call `config set <key> <value>` to change settings like ganache port, ganache autostart, etc.
* `$_` is a placeholder for the last known result. Feel free to use that placeholder in your scripts :)
* Special commands are dot-prefixed. Everything else is evaluated as Solidity code.


### Usage

#### Cmdline Passthru

Any arguments provided after an empty `--` are directly passed to `ganacheCmd` (default: `ganache-cli`). This way, for example, you can start a solidity shell on a ganache fork of mainnet via infura. Check `ganache-cli --help` for a list of available options.

```shell
⇒  solidity-shell -- --fork https://mainnet.infura.io/v3/yourApiToken
 
🚀 Entering interactive Solidity shell. Type '.help' for help, '.exit' to exit.
 »  ℹ️  ganache-mgr: starting temp. ganache instance ...
 »
 »  interface ERC20 {
multi> function name() external view returns (string memory);
multi> }
 
 »  ERC20(0xB8c77482e45F1F44dE1745F52C74426C631bDD52).name()
BNB

```

#### Repl

```shell
 🚀 Entering interactive Solidity shell. '.help' and '.exit' are your friends.
 »  ℹ️  ganache-mgr: starting temp. ganache instance ...
 »
 »   .help

📚 Help:
   -----

 $_ is a placeholder holding the most recent evaluation result.


 General:
    .help                                ... this help :)
    .exit                                ... exit the shell

 Settings:
    .config                              ... show settings
            set <key> <value>            ... set setting
            unset <key>                  ... unset setting
 Session:
    .session                             ... list sessions
            load <id>                    ... load session
            save <id>                    ... save session
            
    .undo                                ... undo last command
    .reset                               ... reset cmd history. start from scratch.

 Debug::
    .proc                                ... show processes managed by solidity-shell (ganache)
    .dump                                ... show template contract
    .echo                                ... every shell needs an echo command


cheers 🙌 
    @tintinweb 
    ConsenSys Diligence @ https://consensys.net/diligence/
    https://github.com/tintinweb/solidity-shell/ 
```

## Examples 


![solidity-shell](https://user-images.githubusercontent.com/2865694/131328119-e363f20a-f627-43fc-8801-8d6613ad740f.gif)


### Transaction vars: `msg.sender` etc.

```javascript
 »  msg.sender
0x70e9B09abd6A13D2F5083CD5814076b77427199F
 »  address(uint160(address(msg.sender)))
0x70e9B09abd6A13D2F5083CD5814076b77427199F
```

### Contracts, Structs, Functions

```javascript
⇒  solidity-shell
 
🚀 Entering interactive Solidity shell. Type '.help' for help, '.exit' to exit.
 »  ℹ️  ganache-mgr: starting temp. ganache instance ...
 »
 »  contract TestContract {}
 »  new TestContract()
0xFBC1B2e79D816E36a1E1e923dd6c6fad463F4368
 »  msg.sender
0x363830C6aee2F0c43922bcB785C570a7cca613b5
 »  block.timestamp
1630339581
 »  struct yolo {uint8 x; uint8 y;}
 »  function mytest(uint x) public pure returns(uint) {
multi> return x -5;
multi> }
 »  mytest(100)
95
```

![solidity-shell2](https://user-images.githubusercontent.com/2865694/131328490-e211e89b-ac59-4729-972b-3e3b19b75cfc.gif)

### Advanced usage

```javascript
 »  struct yolo {uint8 x; uint8 y;}
 »  .dump
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.7;

contract TestContract {}

struct yolo {uint8 x; uint8 y;}

contract MainContract {

    

    function main() public  {
        uint a = 100;
        uint b = 200;
        a + b + 2 + uint8(50);
        new TestContract();
        msg.sender;
        block.timestamp;
        return ;
    }
}
```
____


## Acknowledgements

* Inspired by the great but unfortunately unmaintained [solidity-repl](https://github.com/raineorshine/solidity-repl).
