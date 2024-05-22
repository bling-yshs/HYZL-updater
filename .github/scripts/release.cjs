const fs = require('fs').promises;
const crypto = require('crypto');
const https = require('https');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(dest);
      reject(err);
    });
  });
}

async function calculateMD5(filePath) {
  const buffer = await fs.readFile(filePath);
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

async function main() {
  // 读取updater.json文件
  let buffer = await fs.readFile('./updater.json');
  let obj = JSON.parse(buffer.toString());
  
  // 获取程序输入，两个参数，一个version，changelog，都是字符串
  let version = process.argv[2];
  const args = process.argv.slice(3);
  const changelog = args.join('\n');
  console.log(`version: ${version}, changelog: ${changelog}`);
  
  // 获取当前秒级时间戳
  let timestamp = Math.floor(new Date().getTime() / 1000);
  let url = 'https://example.com/path/to/file'; // 替换为实际的下载链接
  
  // 下载上面链接的文件，并计算它的md5
  const dest = 'HYZL.exe'; // 文件下载到的路径
  await downloadFile(url, dest);
  let md5 = await calculateMD5(dest);
  // 删除掉刚刚下载的文件
  await fs.unlink(dest);
  obj.unshift({
    version,
    url,
    md5,
    timestamp,
    changelog,
    "deprecated": false
  });
  
  // 写入updater.json文件
  await fs.writeFile('./updater.json', JSON.stringify(obj, null, 2));
}

main().catch(console.error);
