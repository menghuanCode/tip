'use strict';

import { TweenLite } from 'gsap/TweenLite';
import CSSPlugin from 'gsap/CSSPlugin'
const _activate = CSSPlugin;

import Timeline from './Timeline'

// 初始化状态
const STATE_INITAL = 0
// 开始状态
const STATE_START = 1

let _config = {
    title: '',
    content: '',
    duration: 1000,
    direction: 'center',
    shade: true,
    multile: false,
    isImage: false,
    onComplete: function () {}
}


let queue = [] 
let instance
let preTip = null

/**
 * 创建 Tip
 * @param  {[type]} config [description]
 * @return {[type]}        返回实例对象
 */
function createTip(config) {

    if (instance instanceof Tip) {
        return instance.init(config)
    }     

    instance = new Tip(config)
    return instance
}

function Tip(config) {    
    this.cid = 0
    this.index = 0
    this.timer = undefined
    this.wrapper = undefined
    this.state = STATE_INITAL
    return this.init(config)
}

Tip.prototype.init = function (config) {

    // 如果是数字就转换成字符串
    if (isTypeof(config) === 'number') {
        config = config.toString()
    }

    // 如果不等于对象或字符串
    if (isTypeof(config) !== 'object' && isTypeof(config) !== 'string') {
        throw new Error('请输入字符串或者对象')
    }

    // 如果不是初始化，只有一种情况：上一次tip没有执行完又重新显示tip。
    // 在判断是否是多行。
    // console.log(this.state !== STATE_INITAL, !config.multile)
    if (this.state !== STATE_INITAL && !config.multile) {

        // 如果上一次不是多行，那就终止
        if (preTip && !preTip.multile) {
            preTip.wrapper.remove()
            preTip.tween.kill()
            clearTimeout(preTip.timer)
            preTip = null
        }

    }
    this.state = STATE_START

    this.config = Object.create(_config)
    isTypeof(config) === 'string' ? (this.config.content = config) : Object.assign(this.config, config)
    this.config.isImage = isImgType(this.config.content)
    this.cid = `tip_` + +new Date()
    this.index++

    
    return this.render()
}

Tip.prototype.render = function () {

    if (this.state !== STATE_START) {
        return this
    }

    let that = this

    this.wrapper = document.createElement('div')
    this.wrapper.className = 'ui-tip-wrapper'
    this.wrapper.dataset.cid = this.cid
    document.body.append(this.wrapper)  
    this.wrapper.innerHTML = this.view()

    let tip = Object.assign({}, this)
    preTip = tip
    animation(tip)
    queue.push(tip)
    
    function animation(tip) {

        let directionObj = {
            top: {
                in: "-50%, -50%",
                out: "-50%, 50%"
            },
            right: {
                in: "50%, -50%",
                out: "-50%, -50%"
            },
            bottom: {
                in: "-50%, 50%",
                out: "-50%, -50%"
            },
            left: {
                in: "-100%, -50%",
                out: "-50%, -50%"
            },
            center: {
                in: "-50%, -50%",
                out: "-50%, -50%"
            }
        }

        if (!(Object.keys(directionObj)).some(item => item === tip.config.direction)) {
            throw new Error("方向值 direction 只能设 top、 right、 bottom、 left、 center")
        }

        let direction = directionObj[tip.config.direction]

        let tipEl = tip.wrapper.children[0]
        let shadeEl = tip.wrapper.children[1]

        addCss(tipEl, {
            top: "50%",
            left: "50%",
            opacity: 0,
            transform: `translate(${direction.in})`
        })

        shadeEl.style.display = tip.config.shade ? "block" : "none"


        // 位置后的方法做的 amatrix 动画，还没完成
        matrixAnimation(tipEl, {
            opacity: 1,
            transform: `translate(${direction.out})`,
        })
        
        // 
        // {opacity: "0", transform: "matrix(1, 0, 0, 1, -57.5, -20.5)"}
        // {opacity: 1, transform: "matrix(1,0,0,1,-57.5,-20.5)"}
        // 
        // matrix(1, 0, 0, 1, -57.5, 20.5)
        // matrix(1, 0, 0, 1, -57.5, -20.5)

        // tip.tween = TweenLite.to(tipEl, 0.5, {
        //     opacity: 1,
        //     transform: `translate(${direction.out})`,
        //     onComplete: function () {


        //         console.log(getComputedStyle(tipEl).transform)

        //         if (!tip.config.isImage) {
        //             tip.timer = setTimeout(function () {
        //                 tip.tween.reverse()
        //             }, tip.config.duration)
        //         }
        //     },
        //     onReverseComplete: function () {
        //         console.log(getComputedStyle(tipEl).transform)
        //         tip.config.onComplete.call(tip)
        //         tip.isWrapperRemove = true
        //         tip.destroy()
        //     }
        // })
    }

    tip.close = function () {
        this.tween.reverse()
    } 

    tip.destroy = function () {
        this.wrapper.remove()
        for (let i = 0; i < queue.length; i++) {
            let tip = queue[i]
            if (tip.cid === this.cid) { 
                queue.splice(i, 1)
                preTip = null
                break 
            }
        }
    } 

    return tip

}

Tip.prototype.view = function () {

    let config = this.config

    let html = `
        <div class="ui-tip ${config.isImage ? 'ui-tip-type-img' : ''} ${config.className ? config.className : ''}">
            <div class="ui-tip-title">${config.title}</div>
            <div class="ui-tip-content">${config.content}</div>
        </div>
        <div class="ui-tip-shade"></div>
    `
    return html
}

function isImgType(string) {
    var reg = /^<img.*>$/
    return reg.test(string)
}

/** 方向 */
function lerpDistance(aim, cur, ratio) {
    var delta = cur - aim;
    return aim + delta * ratio;
}

/**
 * 添加 css
 * @param {[type]} el        [description]
 * @param {[type]} propertys [description]
 */
function addCss(el, propertys) {
    for (let key in propertys) {
        el.style[key] = propertys[key]
    }
}

/**
 * 为之后做的 matrix 动画
 * @param  {[type]} el    原数
 * @param  {[type]} toStyle 准备达到的样式
 * @return {[type]}       [description]
 */
function matrixAnimation(el, toStyle) {
    let a, b, c, d, e, f

    // let x, y, s
    
    let fromStyle = Object.create(null)
    let elWidth = getPropertyValue(el, "width")
    let elHeight = getPropertyValue(el, "height")

    // 真正能执行动画的属性
    let canAnimateMap = Object.create(null)
    let matrix = [1, 0, 0, 1, 0, 0]

    for(let key in toStyle) {
        if (isPropertyEqual(el, key, toStyle[key])) {
            fromStyle[key] = el.style[key]
            continue
        }

        fromStyle[key] = getPropertyValue(el, key)
        canAnimateMap[key] =  true
    }

    // console.log(canAnimateMap)

    // 特殊的元素属性，如果有这个属性的话
    if (canAnimateMap["transform"]) {

        let reg = /[^(?=)]+/g

        if (fromStyle["transform"] === "none") {
            fromStyle.transform = `matrix(${String(matrix)})`
        } else {
            matrix = (fromStyle["transform"].match(reg)[1]).split(',');
            matrix = matrix.map(Number)
        }


        let match = toStyle["transform"].match(reg)
        let transformStyle = Object.create(null)

        for(let i = 0; i < match.length; i++) {
            let key = match[i]
            if (i % 2 === 1) { continue }
            transformStyle[key] = match[i + 1]
        }

        // console.log([a, b, c, d, e, f])
        // 如果有位移
        if (transformStyle["translate"]) {
            let value = transformStyle["translate"].split(/,\s*/)
            if (value.length === 1) {
                value.push(value[0])
            }

            console.log(value)
            matrix[4] = e = isRate(value[0]) ? rateToInt(elWidth, value[0]) : parseFloat(value[0])
            matrix[5] = f = isRate(value[1]) ? rateToInt(elHeight, value[1]) : parseFloat(value[1])
        }

        toStyle["transform"] = `matrix(${String(matrix)})`
        // console.log(fromStyle["transform"], matrix, toStyle["transform"])
    }


    // animation()

    function animation() {

        let timeline = new Timeline()
        let nextStyle = Object.create(null)

        // 第一次初始化循环
        for (let key in canAnimateMap) {
            nextStyle[key] = parseFloat(fromStyle[key])
        }

        timeline.onEnterFrame = function () {

            for(let key in canAnimateMap) {
                nextStyle[key] += lerpDistance(toStyle[key], nextStyle[key], 0.9)
                // let value = getPropertyValue(el, key)
            }

            console.log(nextStyle)

            console.log(1)
        }

        timeline.start(1000)

        // 啊，要是一步执行完成就好了
        addCss(el, toStyle)


    }

    console.log(matrix)
    console.log(fromStyle)
    console.log(toStyle)

    
    function getPropertyValue(el, propertyName) {
        return getComputedStyle(el, null).getPropertyValue(propertyName)
    }

    function isPropertyEqual(el, propertyName, property) {
        return  getPropertyValue(el, propertyName) === property || (el.style[propertyName] === property)
    }


    // 是否是百分比
    function isRate(rate) {
        let reg = /%$/
        return reg.test(rate)
    }


    function rateToInt(base, rate) {
        if (isNaN(parseFloat(base)) || isNaN(parseFloat(rate))) {
            throw new Error("请输入合适的数值或数值字符串")
        }

        return (parseFloat(base) * parseFloat(rate))/100
    }

    function lerpDistance(aim, cur, ratio) {
        var delta = cur - aim
        return aim + delta * ratio
    }
}

/**
 *  类型检测
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isTypeof(obj) {
    return (Object.prototype.toString.call(obj)).slice(8, -1).toLowerCase()
}


// window.requestAnimationFrame = (function (callback) {
//     return requestAnimationFrame || setTimeout(callback, callback.interval || DEFAULT_INTERVAL)
// })()

// window.cancelAnimationFrame = (function (id) {
//     return cancelAnimationFrame || clearTimeout(id)
// })()



window.tip = createTip