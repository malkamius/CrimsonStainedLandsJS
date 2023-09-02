const Utility = require('./Utility');
const XmlHelper = require("./XmlHelper");

class RoomData {
	static Rooms = {};
	static Directions = Array("north", "east", "south", "west", "up", "down");
	static ExitFlags =
    {
        "Door": "Door",
        "Closed": "Closed",
        "Locked": "Locked",
        "Window": "Window",
        "PickProof": "PickProof",
        "NoPass": "NoPass",
        "NoBash": "NoBash",
        "Hidden": "Hidden",
        "HiddenWhileClosed": "HiddenWhileClosed",
        "MustUseKeyword": "MustUseKeyword",
        "NoRandomize": "NoRandomize",
        "NonObvious": "Hidden",
    };

    static SectorTypes =
    {
        "Inside = 0": "Inside = 0",
        "City = 1": "City = 1",
        "Forest": "Forest",
        "Field": "Field",
        "Hills": "Hills",
        "Mountain": "Mountain",
        "Swamp": "Swamp",
        "Desert": "Desert",
        "Cave": "Cave",
        "Underground": "Underground",
        "WaterSwim": "WaterSwim",
        "WaterNoSwim": "WaterNoSwim",
        "River": "River",
        "Ocean": "Ocean",
        "Air": "Air",
        "Road": "Road",
        "Trail": "Trail",
        "Underwater": "Underwater",
        "NoSwim": "WaterNoSwim",
        "Swim": "WaterSwim"
    };

    static RoomFlags =
    {
        "Dark": "Dark",
        "NoMob": "NoMob",
        "Indoors": "Indoors",
        "Cabal": "Cabal",
        "Private": "Private",
        "Safe": "Safe",
        "Solitary": "Solitary",
        "PetShop": "PetShop",
        "NoRecall": "NoRecall",
        "ImplementorOnly": "ImplementorOnly",
        "HeroesOnly": "HeroesOnly",
        "NewbiesOnly": "NewbiesOnly",
        "Law": "Law",
        "Nowhere": "Nowhere",
        "NoGate": "NoGate",
        "Consecrated": "Consecrated",
        "NoSummon": "NoSummon",
        "NoConsecrate": "NoConsecrate",
        "NoMagic": "NoMagic",
        "GlobeDarkness": "GlobeDarkness",
        "RandomExits" : "RandomExits"
    };
	
	Area = null;
	VNum = 0;
	Name = "";
	Description = "";
	Exits = Array(null, null, null, null, null, null);
	Characters = Array();
	Items = Array();
	Flags = {};
	Sector = "Inside";

	constructor(area, roomxml) {
		const ExitData = require('./ExitData');
		this.Area = area;
		this.VNum = roomxml.GetElementValueInt("VNum");
		this.Name = roomxml.GetElementValue("Name");
		this.Description = roomxml.GetElementValue("Description");
		this.Sector = roomxml.GetElementValue("Sector");
		Utility.ParseFlags(this.Flags, roomxml.GetElementValue("Flags"));

		this.Exits = Array(null, null, null, null, null, null);
		
		for(const exits of roomxml.EXITS) {
			if(exits) {
				for(var exitxml of exits.EXIT) {
					var exitdata = new ExitData(this, exitxml);
				}
			}
		}
		RoomData.Rooms[this.VNum] = this;
	}

	GetExit(keyword, count = 0) {
		var number = 0;
		var [number, keyword] = keyword.numberArgument();
		for(var exit of this.Exits) {
			if(exit && (exit.Keywords.IsName(keyword) || exit.Direction.prefix(keyword)) && ++count > number) {
				return [exit, count];
			}
		}
		return [null, count];
	}

    get IsWilderness()
    {
        return this.Sector == RoomData.SectorTypes.Trail ||
            this.Sector == RoomData.SectorTypes.Field ||
            this.Sector == RoomData.SectorTypes.Forest ||
            this.Sector == RoomData.SectorTypes.Hills ||
            this.Sector == RoomData.SectorTypes.Mountain ||
            this.Sector == RoomData.SectorTypes.WaterSwim ||
            this.Sector == RoomData.SectorTypes.WaterNoSwim ||
            this.Sector == RoomData.SectorTypes.Cave ||
            this.Sector == RoomData.SectorTypes.Underground ||
            this.Sector == RoomData.SectorTypes.Underwater ||
            this.Sector == RoomData.SectorTypes.Ocean ||
            this.Sector == RoomData.SectorTypes.River ||
            this.Sector == RoomData.SectorTypes.Swamp ||
            this.Sector == RoomData.SectorTypes.Desert;
    }

    get IsWater() {
        return this.Sector == RoomData.SectorTypes.WaterSwim || 
            this.Sector == RoomData.SectorTypes.WaterNoSwim || 
            this.Sector == RoomData.SectorTypes.River ||
            this.Sector == RoomData.SectorTypes.Ocean ||
            this.Sector == RoomData.SectorTypes.Underwater;
    }

    get IsDark()
    {
        const ItemData = require("./ItemData");
        for(var ch of this.Characters) {
            for(var key in ch.Equipment) {
                var item = ch.Equipment[key];

                if(item.ExtraFlags.ISSET("Glow") || item.ExtraFlags.ISSET("Glowing") || item.ItemTypes.ISSET(ItemData.ItemTypesList.Light))
                    return false;
            }
            
        }

        if (this.Flags.ISSET("Dark"))
            return true;

        if (this.Sector == SectorTypes.Inside
            || this.Sector == SectorTypes.City)
            return false;
        
        const WeatherInfo = require("./WeatherInfo");

        if (WeatherInfo.Sunlight.equals("Set")
            || WeatherInfo.Sunlight.equals("Dark"))
            return true;

        return false;
    }
}


module.exports = RoomData;

