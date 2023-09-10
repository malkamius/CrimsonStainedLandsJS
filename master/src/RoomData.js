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
        "Inside": "Inside",
        "City": "City",
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

    static Sectors = {
        Inside: { Sector: RoomData.SectorTypes.Inside, Name: "Indoors", MovementCost: 1, MovementWait: 1, Display: "\\winside\\x" },
        Field:  { Sector: RoomData.SectorTypes.Field, Name: "Plains", MovementCost: 2, MovementWait: 1, Display: "\\yplains\\x" },
        Desert:  { Sector: RoomData.SectorTypes.Desert, Name: "Desert", MovementCost: 2, MovementWait: 2, Display: "\\Ydesert\\x" },
        City:  { Sector: RoomData.SectorTypes.City, Name: "City", MovementCost: 1, MovementWait: 1, Display: "\\wcity\\x" },
        Road:  { Sector: RoomData.SectorTypes.Road, Name: "Road", MovementCost: 1, MovementWait: 1, Display: "\\Wroad\\x" },
        Trail:  { Sector: RoomData.SectorTypes.Trail, Name: "Trail", MovementCost: 2, MovementWait: 1, Display: "\\Gtrail\\x" },
        Forest:  { Sector: RoomData.SectorTypes.Forest, Name: "Forest", MovementCost: 5, MovementWait: 2, Display: "\\Gforest\\x" },
        Hills:  { Sector: RoomData.SectorTypes.Hills, Name: "Hills", MovementCost: 3, MovementWait: 4, Display: "\\Ghills\\x" },
        Cave:  { Sector: RoomData.SectorTypes.Cave, Name: "Cave", MovementCost: 3, MovementWait: 3, Display: "\\Wcave\\x" },
        Mountain:  { Sector: RoomData.SectorTypes.Mountain, Name: "Mountain", MovementWait: 3, MovementCost: 6, Display: "\\Wmountain\\x" },
        Swamp:  { Sector: RoomData.SectorTypes.Swamp, Name: "Swamp", MovementWait: 3, MovementCost: 3, Display: "\\Gswamp\\x" },
        Underground:  { Sector: RoomData.SectorTypes.Underground, Name: "Underground", MovementWait: 2, MovementCost: 2, Display: "\\Wunderground\\x"},
        Underwater:  { Sector: RoomData.SectorTypes.Underwater, Name: "Underwater", MovementWait: 3, MovementCost: 6, Display: "\\Bunderwater\\x"},
        WaterSwim:  { Sector: RoomData.SectorTypes.WaterSwim, Name: "WaterSwim", MovementWait: 2, MovementCost: 6, Display: "\\Bwater\\x"},
        WaterNoSwim: { Sector: RoomData.SectorTypes.WaterNoSwim, Name: "WaterNoSwim", MovementWait: 3, MovementCost: 6, Display: "\\Bwater\\x"},
        River: { Sector: RoomData.SectorTypes.River, Name: "River", MovementWait: 2, MovementCost: 6, Display: "\\Briver\\x"},
        Ocean: { Sector: RoomData.SectorTypes.Ocean, Name: "Ocean", MovementWait: 3, MovementCost: 10, Display: "\\Bocean\\x"},
        Air: { Sector: RoomData.SectorTypes.Ocean, Name: "Air", MovementWait: 1, MovementCost: 10, Display: "\\cair\\x"}
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
    Affects = Array();
	Flags = {};
	Sector = "Inside";
    ExtraDescriptions = [];
    NightName = "";
    NightDescription = "";

	constructor(area, roomxml) {
		const ExitData = require('./ExitData');
		this.Area = area;
		this.VNum = roomxml.GetElementValueInt("VNum");
		this.Name = roomxml.GetElementValue("Name");
		this.Description = roomxml.GetElementValue("Description");
        this.NightName = roomxml.GetElementValue("NightName");
        this.NightDescription = roomxml.GetElementValue("NightDescription");
        var sector = roomxml.GetElementValue("Sector");
		this.Sector = RoomData.SectorTypes.ISSET(sector);
        if(!this.Sector) console.log(Utility.Format("Sector {0} not found", sector));


        this.MaxLevel = roomxml.GetElementValueInt("MaxLevel", 60);
        this.MinLevel = roomxml.GetElementValueInt("MinLevel", 0);
		Utility.ParseFlags(this.Flags, roomxml.GetElementValue("Flags"));

		this.Exits = Array(null, null, null, null, null, null);
		
		for(const exits of roomxml.EXITS) {
			if(exits) {
				for(var exitxml of exits.EXIT) {
					var exitdata = new ExitData(this, exitxml);
				}
			}
		}

        if(roomxml.EXTRADESCRIPTIONS && roomxml.EXTRADESCRIPTIONS[0].EXTRADESCRIPTION) {
            for(var edxml of roomxml.EXTRADESCRIPTIONS[0].EXTRADESCRIPTION) {
                var extradescription = {Keyword: edxml.GetElementValue("Keyword"), Description: edxml.GetElementValue("Description")};
                this.ExtraDescriptions.push(extradescription);
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

                if(item.ExtraFlags.ISSET(ItemData.ExtraFlags.Glow) || item.ItemTypes.ISSET(ItemData.ItemTypes.Light))
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

