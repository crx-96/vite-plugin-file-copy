import * as fs from 'fs';
import * as path from 'path';

export interface VitePluginFileCopyOption {
  src: string;
  dest: string;
}

export interface Plugin {
  name: string;
  configResolved: (resolvedConfig: any) => void;
  closeBundle: () => void;
}

// 判断路径是否是绝对路径
const isAbsolute = (url: string): boolean => {
  return path.isAbsolute(url);
};

// 判断是否是目录、是否存在，不存在则创建
const isDirectory = (url: string): boolean => {
  if (fs.existsSync(url)) {
    if (fs.statSync(url).isDirectory()) {
      return true;
    }
  } else {
    if (isDirectory(path.resolve(url, '..'))) {
      fs.mkdirSync(url);
      return true;
    }
  }
  return false;
};

// 克隆的方法
const copy = (options: VitePluginFileCopyOption): void => {
  if (fs.existsSync(options.src) && isDirectory(options.dest)) {
    // 读取目录下的文件
    const files = fs.readdirSync(options.src);
    files.forEach((item) => {
      const src_url = path.resolve(options.src, item);
      const dest_url = path.resolve(options.dest, item);
      const file = fs.statSync(src_url);
      if (file.isFile()) {
        // 文件直接克隆
        fs.writeFileSync(dest_url, fs.readFileSync(src_url));
      } else {
        // 目录继续递归
        copy({ src: src_url, dest: dest_url });
      }
    });
  }
};

export default (optionsList: VitePluginFileCopyOption[] = [{ src: 'static', dest: 'dist/static' }]): Plugin => {
  let list: VitePluginFileCopyOption[] = [];

  return {
    name: 'vite-plugin-file-copy',
    configResolved: (resolvedConfig: any) => {
      // 项目的根目录
      const root = resolvedConfig.root;
      // 复制的列表参数
      list = optionsList.map((item) => {
        return {
          ...item,
          src: isAbsolute(item.src) ? item.src : path.resolve(root, item.src),
          dest: isAbsolute(item.dest) ? item.dest : path.resolve(root, item.dest),
        };
      });
    },
    closeBundle: () => {
      list.forEach((item) => {
        copy(item);
      });
    },
  };
};
