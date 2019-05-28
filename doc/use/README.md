# 使用文档

## 使用

### 消息提示
```js 
tip('我是消息提示')   // 就是这么简单
```

### loading
```js
var loading = tip('<img src="./svg-loaders/puff.svg" width="60" alt="">')
// 模拟任务执行完毕，
setTimeout(function () {
    loading.close()
}, 3000)
```

### 自定义配置
```js
tip({
    content: '你好啊',         // 内容
    duration: 3s              // 持续时间
    direction： 'center'      // 动画进来时的方向
    shade:  true              // 是否显示遮罩
})

下面会介绍有哪些默认配置
```

## 配置

### 默认配置
```js
{
    title: '',                  // 标题
    content: '',                // 内容       
    duration: 1000,             // 持续时间，默认 1000 ms
    direction: 'center',        // 动画进来时的方向 ['top', 'bottom', 'left', 'right'] 默认右边
    shade: true,								// 是否显示遮罩，默认 true
    multile: false,					    // 是否显示多个，默认 false（第二个显示出来的时候，第一个会消失）
    isImage: false,						  // 是否是 图片， 默认 false，当然假如你传的是图片，它会自动改成 ture，当 loading 显示
    onComplete: function () {}	// 任务完成时想做的事
}
```
