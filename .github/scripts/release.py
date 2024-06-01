import os
import hashlib
import requests
import time
import json
from pathlib import Path


def download_file(url, dest):
    dirname = os.path.dirname(dest)
    if not os.path.exists(dirname):
        os.makedirs(dirname)
    with requests.get(url, stream=True) as response:
        response.raise_for_status()
        with open(dest, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)


def calculate_md5(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


def main():
    # 读取updater.json文件
    with open('./updater.json', 'r', encoding='utf-8') as f:
        obj = json.load(f)

    # 获取程序输入，两个参数，一个version，changelog，都是字符串
    import sys
    if len(sys.argv) < 3:
        print("Usage: python script.py <version> <changelog>")
        return

    version = sys.argv[1]
    changelog = ' '.join(sys.argv[2:])
    print(f"version: {version}, changelog: {changelog}")

    # 获取当前秒级时间戳
    timestamp = int(time.time())
    file_url = f"https://github.com/bling-yshs/HYZL/releases/download/{version}/HYZL.exe"

    while True:
        response = requests.head(file_url)
        if response.status_code == 302:
            break
        else:
            print("没找到文件，等待10秒后重试")
            time.sleep(10)

    # 下载上面链接的文件，并计算它的md5
    dest = f"{version}/HYZL.exe"  # 文件下载到的路径
    download_file(file_url, dest)
    md5 = calculate_md5(dest)
    url = f"https://cdn.jsdelivr.net/gh/bling-yshs/HYZL-updater@main/{dest}"
    obj.insert(0, {
        "version": version,
        "url": url,
        "md5": md5,
        "timestamp": timestamp,
        "changelog": changelog,
        "deprecated": False
    })

    # 写入updater.json文件
    with open('./updater.json', 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
