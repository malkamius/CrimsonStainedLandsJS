const TimeInfo = require("./TimeInfo");
const Utility = require("./Utility");
    
class WeatherInfo
{
    static SkyStates =
    {
        Cloudless  : "Cloudless",
        Cloudy      : "Cloudy",
        Raining     : "Raining",
        Lightning   : "Lightning"
    };

    static SunlightStates =
    {
        "Dark": "Dark",
        "Rise": "Rise",
        "Light": "Light",
        "Set" : "Set"
    };

    static mmhg;
    static change;

    static Sky;

    static get Sunlight() {
        return TimeInfo.Hour < 5 || TimeInfo.Hour > 20 ? WeatherInfo.SunlightStates.Dark :
        (TimeInfo.Hour < 6 ? WeatherInfo.SunlightStates.Rise :
        (TimeInfo.Hour < 19 ? WeatherInfo.SunlightStates.Light :
        (TimeInfo.Hour < 20 ? WeatherInfo.SunlightStates.Set :
            WeatherInfo.SunlightStates.Dark)))
    };

    static init() {
        WeatherInfo.change = 0;
        WeatherInfo.mmhg = 960;
        if (TimeInfo.Month >= 7 && TimeInfo.Month <= 12)
            WeatherInfo.mmhg += Utility.Random(1, 50);
        else
            WeatherInfo.mmhg += Utility.Random(1, 80);

        if (WeatherInfo.mmhg <= 980) WeatherInfo.Sky = WeatherInfo.SkyStates.Lightning;
        else if (WeatherInfo.mmhg <= 1000) WeatherInfo.Sky = WeatherInfo.SkyStates.Raining;
        else if (WeatherInfo.mmhg <= 1020) WeatherInfo.Sky = WeatherInfo.SkyStates.Cloudy;
        else WeatherInfo.Sky = WeatherInfo.SkyStates.Cloudless;
    }
}
WeatherInfo.init();
module.exports = WeatherInfo;