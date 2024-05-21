const fs = require('fs');

// 读取updater.json文件
let buffer = fs.readFileSync('./updater.json');
let obj = JSON.parse(buffer.toString());

// 获取程序输入，两个参数，一个version，changelog，都是字符串
let version = process.argv[2]
const args = process.argv.slice(3);
const changelog = args.join('\n');
console.log(`version: ${version}, changelog: ${changelog}`);
// 获取当前秒级时间戳
let timestamp = Math.floor(new Date().getTime() / 1000);

obj.unshift({
  version,
  "url": `https://mirror.ghproxy.com/https://github.com/bling-yshs/YzLauncher-windows/releases/download/${version}/YzLauncher-windows.exe`,
  timestamp,
  changelog,
  "deprecated": false
})

// 写入updater.json文件
fs.writeFileSync('./updater.json', JSON.stringify(obj, null, 2));
