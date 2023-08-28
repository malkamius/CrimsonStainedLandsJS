// https://stackoverflow.com/a/48106861
const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;   //     60,000
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;     //  3,600,000
const MILLIS_PER_DAY = MILLIS_PER_HOUR * 24;        // 86,400,000

class TimeSpan {
    _millis = 0;

    static interval(value, scale) {
        if (Number.isNaN(value)) {
            throw new Error("value can't be NaN");
        }

        const tmp = value * scale;
        const millis = TimeSpan.round(tmp + (value >= 0 ? 0.5 : -0.5));
        if ((millis > TimeSpan.maxValue.totalMilliseconds) || (millis < TimeSpan.minValue.totalMilliseconds)) {
            throw new TimeSpanOverflowError("TimeSpanTooLong");
        }

        return new TimeSpan(millis);
    }

    static round(n) {
        if (n < 0) {
            return Math.ceil(n);
        } else if (n > 0) {
            return Math.floor(n);
        }

        return 0;
    }

    static timeToMilliseconds(hour, minute, second) {
        const totalSeconds = (hour * 3600) + (minute * 60) + second;
        if (totalSeconds > TimeSpan.maxValue.totalSeconds || totalSeconds < TimeSpan.minValue.totalSeconds) {
            throw new TimeSpanOverflowError("TimeSpanTooLong");
        }

        return totalSeconds * MILLIS_PER_SECOND;
    }

    static get zero() {
        return new TimeSpan(0);
    }

    static get maxValue() {
        return new TimeSpan(Number.MAX_SAFE_INTEGER);
    }

    static get minValue() {
        return new TimeSpan(Number.MIN_SAFE_INTEGER);
    }

    static fromDays(value) {
        return TimeSpan.interval(value, MILLIS_PER_DAY);
    }

    static fromHours(value) {
        return TimeSpan.interval(value, MILLIS_PER_HOUR);
    }

    static fromMilliseconds(value) {
        return TimeSpan.interval(value, 1);
    }

    static fromMinutes(value) {
        return TimeSpan.interval(value, MILLIS_PER_MINUTE);
    }

    static fromSeconds(value) {
        return TimeSpan.interval(value, MILLIS_PER_SECOND);
    }

    // static fromTime(hours, minutes, seconds);
    // static fromTime(days, hours, minutes, seconds, milliseconds);
    static fromTime(daysOrHours, hoursOrMinutes, minutesOrSeconds, seconds = 0, milliseconds = 0) {
        if (milliseconds != undefined) {
            return this.fromTimeStartingFromDays(daysOrHours, hoursOrMinutes, minutesOrSeconds, seconds, milliseconds);
        } else {
            return this.fromTimeStartingFromHours(daysOrHours, hoursOrMinutes, minutesOrSeconds);
        }
    }

    static fromTimeStartingFromHours(hours, minutes, seconds) {
        const millis = TimeSpan.timeToMilliseconds(hours, minutes, seconds);
        return new TimeSpan(millis);
    }

    static fromTimeStartingFromDays(days, hours, minutes, seconds, milliseconds) {
        const totalMilliSeconds = (days * MILLIS_PER_DAY) +
            (hours * MILLIS_PER_HOUR) +
            (minutes * MILLIS_PER_MINUTE) +
            (seconds * MILLIS_PER_SECOND) +
            milliseconds;

        if (totalMilliSeconds > TimeSpan.maxValue.totalMilliseconds || totalMilliSeconds < TimeSpan.minValue.totalMilliseconds) {
            throw new TimeSpanOverflowError("TimeSpanTooLong");
        }
        return new TimeSpan(totalMilliSeconds);
    }

    constructor(millis) {
        this._millis = millis;
    }

    get days() {
        return TimeSpan.round(this._millis / MILLIS_PER_DAY);
    }

    get hours() {
        return TimeSpan.round((this._millis / MILLIS_PER_HOUR) % 24);
    }

    get minutes() {
        return TimeSpan.round((this._millis / MILLIS_PER_MINUTE) % 60);
    }

    get seconds() {
        return TimeSpan.round((this._millis / MILLIS_PER_SECOND) % 60);
    }

    get milliseconds() {
        return TimeSpan.round(this._millis % 1000);
    }

    get totalDays() {
        return this._millis / MILLIS_PER_DAY;
    }

    get totalHours() {
        return this._millis / MILLIS_PER_HOUR;
    }

    get totalMinutes() {
        return this._millis / MILLIS_PER_MINUTE;
    }

    get totalSeconds() {
        return this._millis / MILLIS_PER_SECOND;
    }

    get totalMilliseconds() {
        return this._millis;
    }

    add(ts) {
        const result = this._millis + ts.totalMilliseconds;
        return new TimeSpan(result);
    }

    subtract(ts) {
        const result = this._millis - ts.totalMilliseconds;
        return new TimeSpan(result);
    }

    toString() {
        var result = "";

        if(this.days) {
            result += this.days + " ";
        }

        if(this.hours) {
            this.hours.padStart(2, "0") + ":";
        }
        else
            result += "00:"
        
        if(this.minutes) {
            this.minutes.padStart(2, "0") + ":";
        }
        else
            result += "00:"

        if(this.seconds) {
            this.seconds.padStart(2, "0") + ".";
        }
        else
            result += "00."
    
        if(this.milliseconds) {
            this.milliseconds.padStart(3, "0");
        }
        else
            result += "000"
        return result;
    }
}

module.exports = TimeSpan;