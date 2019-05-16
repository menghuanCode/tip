'use strict';

(function () {

    let queue = []
    let tips = []

    let cid = 0

    let _config = {
        title: '',
        content: '',
        duration: 10000,
        direction: 'top',
        shade: true,
        multile: false,
        onComplete: function () {}
    }

    let instance = undefined


    /**
     * 创建 Tip
     * @param  {[type]} config [description]
     * @return {[type]}        返回实例对象
     */
    function createTip(config) {

        // 判断是否有实例化的对象
        if (instance !== undefined) {
            return instance.init(config)
        }

        instance = new Tip(config)     
        return instance
    }

    function Tip(config) {    
        this.init(config)
    }

    Tip.prototype.init = function (config) {

        if (this.wrapper && !config.multile) {
            this.destroy()
        }

        this.config = Object.create(_config)

        if (isTypeof(config) === 'number') {
            config = config.toString()
        }

        // 如果不等于对象或字符串
        if (isTypeof(config) !== 'object' && isTypeof(config) !== 'string') {
            throw new Error('请输入字符串或者对象')
        }

        isTypeof(config) === 'string' ? (this.config.content = config) : Object.assign(this.config, config)
        this.cid = config.multile ? cid++ : cid

        this.render()
    }

    Tip.prototype.render = function () {

        this.wrapper = document.createElement('div')
        this.wrapper.className = 'ui-tip-wrapper'
        this.wrapper.id = 'ui-tip-wrapper-' + this.cid
        document.body.append(this.wrapper)  

        this.wrapper.innerHTML = this.view()
        this.animation()
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
            transform: 'translate(-50%, -50%)',
        })

        this.t =  TweenMax.to(this.wrapper, 0.1, {
            opacity: 1,
            transform: 'translate(-50%, -50%)',
            onComplete: function () {
                setTimeout(function () {
                    animationOut()
                    that.config.onComplete.call(that)
                    that.destroy()
                }, that.config.duration)
            }
        })

        function animationOut() {
            
        }
    }

    Tip.prototype.destroy = function () {
        this.wrapper.remove()
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




    // tip.view = function (year, month) {
    //     monthData = datepicker.getMonthData(year, month)
    //     let _ = queue[activeIndex] || {}
    //     let html = `
    //     <div class="ui-datepicker-header">
    //         <div data-direction="prev" class="ui-datepicker-btn ui-datepicker-prev-btn">&lt;</div>
    //         <div data-direction="next" class="ui-datepicker-btn ui-datepicker-next-btn">&gt;</div>
    //         ${monthData.year}-${monthData.month}
    //     </div>
    //     <div class="ui-datepicker-body">
    //         <table>
    //             <thead>
    //                 <tr>
    //                     <th>一</th>
    //                     <th>二</th>
    //                     <th>三</th>
    //                     <th>四</th>
    //                     <th>五</th>
    //                     <th>六</th>
    //                     <th>日</th>
    //                 </tr>
    //             </thead>
    //             <tbody>
    //                 <tr>
    //                     ${monthData.days.map((item, i) => `${i % 7 === 0 ? '<tr>' : ''}<td date="${item.time}" class="${item.month !== monthData.month ? 'other-month' : ''} ${item.time === _.activeTime ? 'active' : ''}">${item.showDate}</td>${i % 7 === 6 ? '</tr>' : ''}`).join('')}
    //                 </tr>
    //             </tbody>
    //         </table>
    //     </div>
    //     `
    //     return html
    // }

    // tip.render = function (direction) {
    //     if (monthData) {
    //         year = monthData.year
    //         month = monthData.month
    //     } else {
    //         let today = new Date()
    //         year = today.getFullYear()
    //         month = today.getMonth() + 1
    //     }

    //     if (direction === 'prev') month--
    //     if (direction === 'next') month++

    //     let _ = queue[activeIndex]

    //     let $wrapper = _ ? _.wrapper :  document.querySelector('.ui-datepicker-wrapper' + activeIndex)

    //     if (!$wrapper) {
    //         $wrapper = document.createElement('div')
    //         $wrapper.className = 'ui-datepicker-wrapper ui-datepicker-wrapper' + activeIndex
    //         document.body.append($wrapper)
    //     }

    //     $wrapper.innerHTML = datepicker.view(year, month)

    //     return $wrapper
    // }

    // tip.init = function (input) {

    //     queue.push({
    //         input: document.querySelector(input),
    //         wrapper: datepicker.render(),
    //         isOpen: false,
    //         index: index,
    //         activeTime: "",
    //         value: '',
    //     })

    //     let _ = queue[activeIndex]
    //     activeIndex = ++index

    //     // 当输入框点击的时候
    //     _.input.addEventListener('click', function (e) {

    //         activeIndex = _.index

    //         // 清除之前的
    //         for(let item of queue) {
    //             if (item.isOpen) {
    //                 item.isOpen = false
    //                 item.wrapper.classList.remove('ui-datepicker-wrapper-show')
    //             }
    //         }

    //         _.isOpen = !_.isOpen

    //         if (_.isOpen) {
    //             _.wrapper.classList.add('ui-datepicker-wrapper-show')

    //             let top = this.offsetTop
    //             let left = this.offsetLeft
    //             let height = this.offsetHeight

    //             _.wrapper.style.top = top + height + 2 + 'px'
    //             _.wrapper.style.left = left + 'px'

    //             let inputMonth = _.value.split('-')[1]

    //             if (inputMonth > month) {
    //                 datepicker.render('next')
    //             }

    //             if (inputMonth < month) {
    //                 datepicker.render('prev')
    //             }

    //         } else {
    //             _.wrapper.classList.remove('ui-datepicker-wrapper-show')
    //         }


    //     }, false)

    //     _.wrapper.addEventListener('click', function (e) {

    //         activeIndex = _.index

    //         let $target = e.target

    //         if ($target.tagName.toLowerCase() === 'td') {
    //             _.value = _.activeTime = $target.getAttribute('date')
    //             _.input.value = format(_.value)
    //             _.isOpen = false
    //             _.wrapper.classList.remove('ui-datepicker-wrapper-show')
    //             datepicker.render()
    //         }

    //         // 点击月份切换按钮
    //         if ($target.classList.contains('ui-datepicker-btn')) {
    //             let direction = $target.dataset.direction
    //             datepicker.render(direction)
    //         }

    //         function format(value) {
    //             let date = value.split('-')
    //             for(let i = 0; i < date.length; i++) {
    //                 let item = date[i]
    //                 if (item < 9) {  date[i] = "0" + item }
    //             }

    //             return date.join('-')
    //         }
    //     }, false)
    // }


    window.tip = createTip

})()