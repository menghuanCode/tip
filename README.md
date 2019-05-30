# tip 信息提示

简单直接、小巧的的信息提示 https://menghuancode.github.io/

## 简介

当我想要一个提示一个消息的时候，简单的系统提示太简陋，有名的如 [layer](http://layer.layui.com/) 有显的太臃肿，于是自己写一个。

## 安装下载

- 下载地址 https://github.com/menghuanCode/tip/releases
- `npm i zh-tip`
- CDN http://unpkg.com/zh-tip/example/js/layout.js

## 快速使用

```js
// 消息提示
tip('我是消息提示') 

// loading
var loading = tip('<img src="./svg-loaders/puff.svg" width="60" alt="">')
// 模拟任务执行完毕，
setTimeout(function () {
    loading.close()
}, 3000)
```
- [使用文档](./doc/use/README.md)
- [二次开发文档](./doc/dev/README.md)

## 交流 & 提问

- 提问：https://github.com/menghuanCode/tip/issues
- QQ 群：496407683

