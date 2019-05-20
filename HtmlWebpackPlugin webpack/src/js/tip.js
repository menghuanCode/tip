'use strict';

/**
 * gsap 私有 hack，一定不能删，不然运行不了,你必须确保你在足够了解的情况下或者不需要才能删除 
 */
import { TweenLite } from 'gsap/TweenLite';
import CSSPlugin from 'gsap/CSSPlugin'
const _activate = CSSPlugin;
/*************************************************************************************/

// 初始化状态
const STATE_INITAL = 0
// 开始状态
const STATE_START = 1

let _config = {
    title: '',
    content: '',
    duration: 1000,
    direction: 'center',
    shade: false,
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
                in: "-50%, -100%",
                out: "-50%, -50%"
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
        tip.tween = matrixAnimation(tipEl, 0.5, {
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
 * @param  {[type]} el    元素
 * @param  {[type]} duration 持续时间
 * @param  {[type]} toStyle 准备达到的样式
 * @return {[type]}       [description]
 */
function matrixAnimation(el, duration, config) {

    console.log(getPropertyValue(el, "transform"))

    let _ = {
        el,
        duration: (duration * 1000) || 1000,
        interval: 16,
        fromStyle: Object.create(null),
        fromMatrix: [1, 0, 0, 1, 0, 0],
        toStyle: Object.assign({}, config),
        toMatrix: [1, 0, 0, 1, 0, 0],
        animation,
        timer: null,
        hasTransform: false,
        canAnimateMap: Object.create(null),
        reverse: function () {
            console.log("reverse");

            [this.fromStyle, this.toStyle] = [this.toStyle, this.fromStyle];
            [this.fromMatrix, this.toMatrix] = [this.toMatrix, this.fromMatrix];


            console.log(this.fromStyle, this.toStyle)
            console.log(this.fromMatrix, this.toStyle)

            this.onComplete = this.onReverseComplete
            this.animation()
        }
    }


    let event = ["reverse"]
    let on = ["onComplete", "onReverseComplete"]

    // 添加 暴露事件接口函数
    for (let key of on) {
        _[key] = function () {}
        _[key] = isFunction(config[key]) && config[key]

        // 删除不是 style 的属性
        delete _.toStyle[key]
    }

    for(let key in _.toStyle) {
        if (isPropertyEqual(el, key, _.toStyle[key])) {
            _.fromStyle[key] = _.toStyle[key]
            continue
        }

        _.fromStyle[key] = getPropertyValue(el, key)
        _.canAnimateMap[key] =  true
    }


    // console.log(canAnimateMap)

    // 特殊的元素属性，如果有这个属性的话
    if (_.canAnimateMap["transform"]) {
        // 不可遍历对象
        _.hasTransform = true
        Object.defineProperty(_.canAnimateMap, "transform", { enumerable: false })
        _.fromMatrix = getMartix(el, _.fromStyle["transform"])
        _.toMatrix = getMartix(el, _.toStyle["transform"])
        _.toStyle["transform"] = `matrix(${String(_.toMatrix)})`
    }


    _.animation()

    return _

    function animation() {

        let nextStyle = Object.assign({}, this.fromStyle)
        let nextMatrix = this.fromMatrix.slice()
        let count = parseInt(this.duration/this.interval)

        let index = 0

        this.timer = setInterval(() => {
            // 如果执行完毕
            if (index === count) {
                clearInterval(this.timer)
                this.onComplete.call(this)
                return
            }

            index++

            for (let key in this.canAnimateMap) {
                let speed = (this.toStyle[key] - this.fromStyle[key]) / count
                nextStyle[key] = parseFloat(nextStyle[key]) + speed
            }

            // 如有 transform
            if (this.hasTransform) {
                for(let i = 0; i < nextMatrix.length; i++) {
                    if (nextMatrix[i] !== this.toMatrix[i]) {
                        let speed = (this.toMatrix[i] - this.fromMatrix[i]) / count
                        nextMatrix[i] = parseFloat(nextMatrix[i]) + speed
                    }
                }
            }

            nextStyle["transform"] = `matrix(${String(nextMatrix)})`
            addCss(el, nextStyle)

        }, this.interval)
    }

    /**
     * 获取 Martix
     * @param  {[type]} transform matrix 字符串
     * @return {[type]}           返回一个 matrix 矩阵
     */
    function getMartix(el, transform) {
        let reg = /[^(?=)]+/g
        let isMatrix = /matrix/.test(transform)
        let matrix = [1, 0, 0, 1, 0, 0]

        // 如果是 "none"，就设为默认值
        if (transform === "none") {
            return matrix
        } 

        // 如果不是 matrix 字符串, 直接转换
        if (!isMatrix) {
            return transformToMartix(el, transform)
        }

        matrix = (transform.match(reg)[1]).split(',');
        matrix = matrix.map(Number)

        return matrix
    }

    function transformToMartix(el, transform) {
        let reg = /[^(?=)]+/g
        let match = transform.match(reg)
        let matrix = [1, 0, 0, 1, 0, 0] 
        let css = Object.create(null)
        let baseWidth = getPropertyValue(el, "width")
        let baseHeight = getPropertyValue(el, "height")

        for(let i = 0; i < match.length; i++) {
            if (i % 2 === 1) { continue }
            let key = match[i]
            css[key] = match[i + 1]
        }

        // 如果有 translate 属性
        if (css["translate"]) {
            let value = css["translate"].split(/,\s*/)
            if (value.length === 1) {
                value.push(value[0])
            }


            matrix[4] = isRate(value[0]) ? rateToInt(baseWidth, value[0]) : parseFloat(value[0])
            matrix[5] = isRate(value[1]) ? rateToInt(baseHeight, value[1]) : parseFloat(value[1])
        }

        return matrix
    }

    
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

    // 判断是否是函数
    function isFunction(func) {
        return typeof func === "function"
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