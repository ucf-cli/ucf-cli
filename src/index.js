function $molilog(msg){
  if(chalk){
    console.log(chalk.hex('#FF7E00')('[moli] >>>>>>>>>> ' + msg));
  }else{
    console.log('[moli] >>>>>>>>>> ' + msg);
  }
}
debugger;
var os = require('os');
var fs = require('fs');
var chalk = require('chalk');
$molilog('moli-cli starting......');
var argv = require('minimist')(process.argv.slice(2));
var commands = argv._;
var resolve = require('resolve');
var path = require('path');

var currentNodeVersion = process.versions.node;
if (currentNodeVersion.split('.')[0] < 6) {
  console.error(chalk.red('You are running Node ' + currentNodeVersion + '.\n' + 'Create moli App requires Node 6 or higher. \n' + 'Please update your version of Node.'));
  process.exit(1);
}

var installDir = os.homedir() + "/.moli-cli";
var ubaVersionPath = installDir + "/moli-plugin.json";
var ubaVersion = {
  version: {}
}

function updateConfig() {
  var configObj = {};
  var pluginLists = ["init", "install", "dev","build"];

  fs.readFile(ubaVersionPath, "utf8", (err, data) => {
    configObj = JSON.parse(data);
    pluginLists.forEach(function(_plugin){
      var version = require(`../node_modules/moli-${_plugin}/package.json`).version;
      configObj["version"][_plugin] = version;
    });
    fs.writeFile(ubaVersionPath, JSON.stringify(configObj), (err) => {
      if (err)
        throw err;
      getHelp();
    });
  });
}

function checkConfig() {
  fs.access(installDir, function(err) { //判断moli配置文件夹是否存在
    if (err) {
      fs.mkdir(installDir, function() { //创建配置文件夹
        fs.access(ubaVersionPath, function(err) {
          if (err) { //不存在配置文件
            fs.writeFile(ubaVersionPath, JSON.stringify(ubaVersion), (err) => { //创建配置文件
              if (err)
                throw err;
              updateConfig();
            });
          }
        });
      });
    } else {
      updateConfig();
    }
  });
}

function getHelp() {
  fs.readFile(ubaVersionPath, "utf8", (err, data) => {
    if (err)
      throw err;

    var configObj = JSON.parse(data);
    console.log();
    console.log(chalk.green("  Usage: moli <command> [options]"));
    console.log();
    console.log();
    console.log(chalk.green(`  Command:`));
    console.log();
    for (var item in configObj.version) {
      console.log(chalk.green(`    ${item}\t\tv${configObj.version[item]}`));
    }
    console.log();
    console.log(chalk.green("  Options:"));
    console.log();
    console.log(chalk.green("    -h, --help     output usage information"));
    console.log(chalk.green("    -v, --version  output the version number"));
    console.log();
  });
}

function findPluginPath(command) {
  if (command && /^\w+$/.test(command)) {
    try {
      var pluginName = 'moli-' + command;
      var fullpath = path.join(__dirname, '..', 'node_modules');
      $molilog('the plugin['+pluginName+'] path is ' + fullpath);

      return resolve.sync(pluginName, {
        paths: [path.join(__dirname, '..', 'node_modules')]
      });
    } catch (e) {
      console.log('');
      console.log('  ' + chalk.green(command) + ' command is not installed.');
      console.log('  You can try to install it by ' + chalk.blue.bold('moli-cli install ' + command) + '.');
      console.log('');
    }
  }
}

//检查命令
if (commands.length === 0) {
  if (argv.version || argv.v) {
    console.log(chalk.green(require("../package.json").version));
    $molilog("commands.length === 0 over, process exit!");
    process.exit(0);
  }
  checkConfig();
  $molilog("commands.length === 0 over, process exit!");
} else {
  var opts = {
    cmd: commands,
    argv: argv,
    name: require("../package.json").name
  };
  
  $molilog('os.homedir() is ' + os.homedir());
  $molilog('__dirname is ' + __dirname);
  $molilog('commands is ' + JSON.stringify(commands));
  $molilog('argv is ' + + JSON.stringify(argv));
  $molilog('moli.config.js is at ' + path.resolve(".", "moli.config.js"));


  var pluginPath = findPluginPath(commands[0]);
  
  $molilog('path of plugin[' + commands[0] + '] required  is ' + pluginPath);
  if (pluginPath) {
    
    var _pName = `moli-${commands[0]}`;
    $molilog(`the plugin is ` + _pName + 'is executing');
    if (require(_pName).plugin) {
      require(_pName).plugin(opts);
    } else {
      console.log(chalk.red("  Error : Plugin internal error."));
    }
  }
}