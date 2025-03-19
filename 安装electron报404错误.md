1. 跳过安装过程中要执行的脚本

```
pnpm add electron --ignore-scripts
```

2. 手动下载 electron[https://github.com/electron/electron/releases/tag/v33.2.0]，选择 electron-v33.2.0-win32-x64.zip

3. 在 vite.config.ts 设置 electron 所在的路径

```
process.env.ELECTRON_OVERRIDE_DIST_PATH = fileURLToPath(new URL('./.electron/electron-v33.2.0-win32-x64', import.meta.url))
```

4. electron-builder 打包过程中会下载electron，手动将electron-v33.2.0-win32-x64.zip放到 AppData/Local/electron/Cache可以跳过下载