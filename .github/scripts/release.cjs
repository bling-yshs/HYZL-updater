const fs = require('fs');
const fsp = require('fs').promises;
const crypto = require('crypto');
const https = require('https');
const path = require("node:path");

async function downloadFile(url, dest) {
  const dirname = path.dirname(dest);
  if (fs.existsSync(dirname)) {
    return true;
  }
  await fsp.mkdir(dirname, {recursive: true});
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fsp.unlink(dest);
      reject(err);
    });
  });
}

async function calculateMD5(filePath) {
  const buffer = await fsp.readFile(filePath);
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

async function main() {
  // 读取updater.json文件
  let buffer = await fsp.readFile('./updater.json');
  let obj = JSON.parse(buffer.toString());
  
  // 获取程序输入，两个参数，一个version，changelog，都是字符串
  let version = process.argv[2];
  const args = process.argv.slice(3);
  const changelog = args.join('\n');
  console.log(`version: ${version}, changelog: ${changelog}`);
  
  // 获取当前秒级时间戳
  let timestamp = Math.floor(new Date().getTime() / 1000);
  let fileUrl = `https://github.com/bling-yshs/HYZL/releases/download/${version}/HYZL.exe`
  
  while (true) {
    let response = await fetch(fileUrl)
    if (response.ok) {
      break
    } else {
      await sleep(10000)
    }
  }
  
  // 下载上面链接的文件，并计算它的md5
  const dest = `${version}/HYZL.exe`; // 文件下载到的路径
  await downloadFile(fileUrl, dest);
  let md5 = await calculateMD5(dest);
  // let url = 'https://cdn.jsdelivr.net/gh/bling-yshs/ys-image-host@main/img/202404242234348.png'
  let url = `https://cdn.jsdelivr.net/gh/bling-yshs/HYZL-updater@main/${dest}`;
  obj.unshift({
    version,
    url,
    md5,
    timestamp,
    changelog,
    "deprecated": false
  });
  // 写入updater.json文件
  await fsp.writeFile('./updater.json', JSON.stringify(obj, null, 2));
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(console.error);

