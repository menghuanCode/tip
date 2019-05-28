const STATE_INITIAL = 0
const STATE_START = 1
const STATE_STOP = 2

const DEFAULT_INTERVAL = 1000 / 60

window.requestAnimationFrame = (function (callback) {
    return requestAnimationFrame || setTimeout(callback, callback.interval || DEFAULT_INTERVAL)
})()

window.cancelAnimationFrame = (function (id) {
    return cancelAnimationFrame || clearTimeout(id)
})()



/**
 * 时间轴函数
 * @constructor
 */
function Timeline() {
    this.state = STATE_INITIAL
    this.animationFrameId = 0
}

/**
 * 每一帧调用函数
 */
Timeline.prototype.onEnterFrame = function (time) {

}

/**
 * 时间线暂停
 */
Timeline.prototype.stop = function () {
    if (this.state !== STATE_START) {
        return
    }

    this.state = STATE_STOP

    if (this.startTime) {
        this.dur = +new Date() - this.startTime
    }

    cancelAnimationFrame(this.animationFrameId)
    return this
}

/**
 * 时间线重新开始
 */
Timeline.prototype.restart = function () {
    if (this.state === STATE_STOP) {
        this.state = STATE_START
        startTimeline(this, +new Date() - this.dur)
    }

    return this
}

/**
 * 时间线开始
 * @param interval
 */
Timeline.prototype.start = function (interval) {
    if (this.state === STATE_START) {
        return
    }

    this.state = STATE_START
    this.interval = interval
    startTimeline(this, this.startTime = +new Date())
    return this
}

function startTimeline(timeline, startTime) {
    // 最后一次调用
    let lastTick = +new Date()
    let nextTick = function () {
        let now = +new Date()

        timeline.animationFrameId =  requestAnimationFrame(nextTick)

        if (now - lastTick >= timeline.interval) {
            lastTick = now
            timeline.onEnterFrame(now - startTime)
        }
    }

    nextTick.interval = timeline.interval
    nextTick()
}


export default Timeline