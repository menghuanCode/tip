'use strict';

(function () {

    // 初始化状态
    const STATE_INITAL = 0
    // 开始状态
    const STATE_START = 1

    let queue = []

    let _config = {
        title: '',
        content: '',
        duration: 1000,
        direction: 'top',
        shade: true,
        multile: false,
        onComplete: function () {}
    }

    let instance


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
        this.list = []
        this.timer = undefined
        this.wrapper = undefined
        this.state = STATE_INITAL
        this.init(config)
        return this
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

        // 如果不是初始化，就还原
        if (this.state === STATE_START) {
            this.destroy(config) 
        }

        this.state = STATE_START

        this.config = Object.create(_config)
        isTypeof(config) === 'string' ? (this.config.content = config) : Object.assign(this.config, config)
        this.index++

        this.render()
        return this
    }

    Tip.prototype.render = function () {

        if (this.state !== STATE_START) {
            return this
        }

        let that = this

        this.wrapper = document.createElement('div')
        this.wrapper.className = 'ui-tip-wrapper'
        this.wrapper.id = 'ui-tip-wrapper-' + this.index
        document.body.append(this.wrapper)  
        queue.push(this)

        this.wrapper.innerHTML = this.view()
        this.animation()
        return this
    }

    Tip.prototype.view = function () {

        let config = this.config

        let html = `
            <div class="ui-tip ${config.className ? config.className : ''}" data-cid="${this.cid}">
                <div class="ui-tip-title">${config.title}</div>
                <div class="ui-tip-content">${config.content}</div>
            </div>
            ${config.shade ? '<div class="ui-tip-shade"></div>' : ''} 
        `
        return html
    }

    Tip.prototype.animation = function () {
        let that = this

        addCss(this.wrapper, {
            top: "50%",
            left: "50%",
            opacity: 0,
            transform: 'translate(-50%, 50%)',
        })

        this.tween = TweenMax.to(this.wrapper, 0.5, {
            opacity: 1,
            transform: 'translate(-50%, -50%)',
            onComplete: function () {
                that.timer = setTimeout(function () {
                    that.tween.reverse()
                }, that.config.duration)
            },
            onReverseComplete: function () {
                that.config.onComplete.call(that)
                that.destroy()
            }
        })

    }

    Tip.prototype.destroy = function () {
        if (this.state === STATE_INITAL) {
            return this
        }

        this.state = STATE_INITAL

        // 如果有动画操作
        if (this.tween) {
            this.tween.kill()
            this.tween = undefined
        }

        // 如果有 wrapper
        if (this.wrapper) {
            this.wrapper.remove()
            this.wrapper = undefined
        }

        // 如果有时间控制函数
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = undefined
        }


        // queue[this.index] = undefined
    }

    function addCss(el, propertys) {
        for (let key in propertys) {
            el.style[key] = propertys[key]
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




    window.tip = createTip

})()