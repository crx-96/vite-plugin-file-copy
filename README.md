# vite-plugin-file-copy

vite 复制静态资源插件

# 使用

```js
import copyStatic from 'vite-plugin-file-copy';

export default defineConfig({
  plugins: [
    copyStatic([{src:'static','dist/static'}])
  ],
});
```
