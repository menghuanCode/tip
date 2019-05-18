'use strict';

import { TweenLite } from 'gsap/TweenLite';
import CSSPlugin from 'gsap/CSSPlugin'
const _activate = CSSPlugin;

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


        matrixAnimation(tipEl, {
            opacity: 1,
            transform: `translate(${direction.out})`,
        })

        tip.tween = TweenLite.to(tipEl, 0.5, {
            opacity: 1,
            transform: `translate(${direction.out})`,
            onComplete: function () {
                if (!tip.config.isImage) {
                    tip.timer = setTimeout(function () {
                        tip.tween.reverse()
                    }, tip.config.duration)
                }
            },
            onReverseComplete: function () {
                tip.config.onComplete.call(tip)
                tip.isWrapperRemove = true
                tip.destroy()
            }
        })
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


function matrixAnimation(el, toObj) {
    let a, b, c, d, e, f
    let x, y, s
    let curObj = Object.create(null)
    let width = getPropertyValue(el, "width")
    let height = getPropertyValue(el, "height")

    for(let key in toObj) {
       curObj[key] = getPropertyValue(el, key)
    }

    // 如果有这个属性的话
    if (curObj["transform"]) {

        let reg = /[^(?=)]+/g
        let matrix
        if (curObj["transform"] === "none") {
            matrix = [1, 0, 0, 1, 0, 0]
        } else {
            matrix = (curObj["transform"].match(reg)[1]).split(',')
            // [a, b, c, d, e, f] = matrix.map(item => item - 0)

            console.log(matrix)
            // console.log([a, b, c, d, e, f])
        }

        let toTransformArray = toObj["transform"].match(reg)
        let toTransformMap = Object.create(null)

        for(let i = 0; i < toTransformArray.length; i++) {
            let key = toTransformArray[i]
            if (i % 2 === 1) { continue }
            toTransformMap[key] = toTransformArray[i + 1]
        }

        console.log(toTransformMap)

        console.log([a, b, c, d, e, f])
        // 如果有位移
        if (toTransformMap["translate"]) {
            let value = toTransformMap["translate"].split(/,\s*/)
            if (value.length === 1) {
                value.push(value[0])
            }

            e += isRate(value[0]) ? rateToInt(width, value[0]) : parseFloat(value[0])
            f += isRate(value[1]) ? rateToInt(height, value[1]) : parseFloat(value[1])
        }

        console.log([a, b, c, d, e, f])

    }

    console.log(curObj)

    // return curMatrix
    
    function getPropertyValue(el, propertyName) {
        return getComputedStyle(el, null).getPropertyValue(propertyName)
    }

    // 是否是百分比
    function isRate(rate) {
        let reg = /^\.?(?:\d+)%$/
        return reg.test(rate)
    }

    function rateToInt(base, rate) {
        if (isNaN(parseFloat(base)) || isNaN(parseFloat(rate))) {
            throw new Error("请输入合适的数值或数值字符串")
        }

        console.log(base, rate, (parseFloat(base) * parseFloat(rate))/100)
        return (parseFloat(base) * parseFloat(rate))/100
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


window.requestAnimationFrame = (function (callback) {
    return requestAnimationFrame || setTimeout(callback, callback.interval || DEFAULT_INTERVAL)
})()

window.cancelAnimationFrame = (function (id) {
    return cancelAnimationFrame || clearTimeout(id)
})()



window.tip = createTip