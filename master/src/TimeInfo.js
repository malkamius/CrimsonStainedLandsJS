
const Game = require("./Game");
const TimeSpan = require("./TimeSpan");
class TimeInfo
{
    static get Minute() {
        return Math.floor(new TimeSpan(new Date() - new Date(2023, 1, 1)).totalSeconds / (Game.PULSE_PER_TICK / Game.PULSE_PER_SECOND) * 60) % 60; 
    }

    static get Hours() { return Math.floor((new TimeSpan(new Date() - new Date((2023, 1, 1)))).totalSeconds / (Game.PULSE_PER_TICK / Game.PULSE_PER_SECOND)); }

    static get Hour() { return TimeInfo.Hours % 24; }

    static get Days() { return (TimeInfo.Hours + 1) / 24; }

    static get Day() { return TimeInfo.Days % 35; }

    static get Months() { return TimeInfo.Days / 35; }

    static get Month() { return TimeInfo.Months % 17; }

    static get Year() { return TimeInfo.Months / 17; }

    static get IsNight() { return TimeInfo.Hour <= 6 || TimeInfo.Hour() >= 20; };

    static _day_name = 
    [
        "the Moon", "the Bull", "Deception", "Thunder", "Freedom",
        "the Great Gods", "the Sun"
    ];

    static _month_name = [
        "Winter", "the Winter Wolf", "the Frost Giant", "the Old Forces",
        "the Grand Struggle", "the Spring", "Nature", "Futility", "the Dragon",
        "the Sun", "the Heat", "the Battle", "the Dark Shades", "the Shadows",
        "the Long Shadows", "the Ancient Darkness", "the Great Evil"
    ];

    static get DayName() { 
        return TimeInfo._day_name[Math.floor((TimeInfo.Day + 1) % 7)]; 
    }

    static get MonthName() { 
        return TimeInfo._month_name[Math.floor((TimeInfo.Month + 1) % 12)]; 
    }
}
module.exports = TimeInfo;