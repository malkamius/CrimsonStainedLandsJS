/***************************************************************************
 * Detailed, 3x3 display ASCII automapper for ROM MUDs.                    *
 *  ---------------------------------------------------------------------  *
 * Some of the code within is indirectly derived from mlk's asciimap.c.    *
 * Thanks go out to him for sharing his code, as things I learned working  *
 * with it in my earlier coding days stayed with me and went into this     *
 * snippet.  A portion of mlk's header has been included below out of      *
 * respect.                                                                *
 *  ---------------------------------------------------------------------  *
 * This code may be used freely, all I ask is that you send any feedback   *
 * or bug reports you come up with my way.                                 *
 *                                         -- Midboss (sfritzjr@gmail.com) *
 ***************************************************************************/

/************************************************************************/
/* mlkesl@stthomas.edu  =====>  Ascii Automapper utility                */
/* Let me know if you use this. Give a newbie some _credit_,            */
/* at least I'm not asking how to add classes...                        */
/* Also, if you fix something could ya send me mail about, thanks       */
/* PLEASE mail me if you use this or like it, that way I will keep it up*/
/************************************************************************/
const Utility = require("./Utility");
const Character = require("./Character");
class MapRoom
{
    map = { };
    rooms = {};
    POIs = {};
    room = null;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    queue = Array();

    constructor(map, rooms, POI, room, x, y, width, height, queue)
    {
        this.map = map;
        this.rooms = rooms;
        this.POIs = POI;
        this.room = room;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.queue = queue;
    }
}
class Mapper
{
    static DoMap(ch, args)
    {
        if (ch.Room != null)
            Mapper.DisplayMap(ch, ch.Room);
        else
            ch.send("You aren't in a room.\n\r");
    }

    
    
    static DisplayMap(ch, room)
    {
        var buffer = "";
        const TimeSpan = require("./TimeSpan")
        if(ch.MapLastDisplayed && new TimeSpan(new Date() - ch.MapLastDisplayed).totalSeconds < 5)
        {
            ch.send("Please wait a few seconds before displaying the map again.\n\r");
            return;
        }    
        ch.MapLastDisplayed = new Date();

        var Width = 26;
        var Height = 12;

        var map = {};
        var POIs = {};

        var X = Width / 2, Y = Height / 2;
        var ToMap = Array();
        
        ToMap.push(new MapRoom(map, {}, POIs, room, X, Y, Width, Height, ToMap));

        while (ToMap.length > 0)
            Mapper.MapOneRoom(ToMap.pop());
        
            

        for (var y = 0; y < Height * 3; y++)
        {
            for (var x = 0; x < Width * 3; x++)
            {
                var str;
                if ((str = map[x + "," +y]))
                    buffer += str;
                else
                    buffer += "\\x ";
            }
            buffer += "\n";
        }
        buffer += "\n";
        for(var POIKey in POIs)
        {
            buffer += Utility.Format("{0,5} :: {1}\n", POIKey, POIs[POIKey]);
        }
        ch.send(buffer);
    }

    static MapOneRoom(maproom)
    {
        if (maproom.rooms[maproom.room.VNum])
            return;
        var reversedirectionoffsets = [[ 0, -1 ], [ 1, 0 ], [ 0, 1 ], [ -1, 0 ]];
        maproom.map[(maproom.x * 3) + "," + (maproom.y * 3)] = " ";
        maproom.rooms[maproom.room.VNum] = maproom.room.VNum;
        for (var exit = 0; exit < 4; exit++)
        {
            if (maproom.room.Exits[exit] && maproom.room.Exits[exit].Destination)
            {
                var subx = maproom.x + reversedirectionoffsets[exit][0];
                var suby = maproom.y + reversedirectionoffsets[exit][1];
                if (subx >= 0 && subx < maproom.width && suby >= 0 && suby < maproom.height && 
                    !maproom.rooms[maproom.room.Exits[exit].Destination.VNum] && (!maproom.map[(subx * 3) + "," + (suby * 3)] || maproom.map[(subx * 3) + "," + (suby * 3)] == " "))
                maproom.queue.push(new MapRoom(maproom.map, maproom.rooms, maproom.POIs, maproom.room.Exits[exit].Destination, subx, suby, maproom.width, maproom.height, maproom.queue));
                    //MapRoom(map, rooms, POI, room.Exits[exit].Destination, subx, suby, width, height);

            }

            
        }

        for (var yoffset = 0; yoffset < 3; yoffset++)
        {
            for (var xoffset = 0; xoffset < 3; xoffset++)
            {
                var existing;
                if (!(existing = maproom.map[(maproom.x * 3 + xoffset) +","+ (maproom.y * 3 + yoffset)]) || existing == " ")
                    Mapper.AddMapChar(maproom.map, maproom.room, maproom.x, maproom.y, xoffset, yoffset, maproom.width, maproom.height);


            }
        }

        for (var ch of maproom.room.Characters)
        {
            if (ch.Flags.IsSetAny("Practice", "Train", "Shopkeeper", "Healer", "Trainer", "Gain", Character.ActFlags.GuildMaster))
            {
                var POIChar;
                var keys = Object.keys(maproom.POIs);
                if (keys.length > 8 && keys.length < 'Z'.charCodeAt(0) - 'A'.charCodeAt(0) + 9)
                {
                    POIChar = String.fromCharCode('A'.charCodeAt(0) + (keys.length - 9));
                }
                else if (keys.length < 9)
                {
                    POIChar = String.fromCharCode('1'.charCodeAt(0) + (keys.length));
                }
                else
                    POIChar = '\0';

                if (POIChar != '\0')
                {
                    if(maproom.map[(maproom.x * 3 + 1) + "," + (maproom.y * 3 + 1)] != "\\Y*\\x") {
                        maproom.map[(maproom.x * 3 + 1) + "," + (maproom.y * 3 + 1)] = POIChar;
                        maproom.POIs[POIChar] = ch.GetShortDescription(null);
                    }
                }
            }
        }
    }

    static AddMapChar(map, room, x, y, xoffset, yoffset, width, height)
    {
        var UpExit = room.Exits[4];
        var DownExit = room.Exits[5];

        var roomWall = Mapper.GetRoomAsciiCharacter(room, true);
        var roomFloor = Mapper.GetRoomAsciiCharacter(room, false);
        var pExit;
        var yRoom;
        var xRoom;

        var AsciiString = " ";
        // Top left
        if (yoffset == 0 && xoffset == 0)
        {
            if (UpExit != null && UpExit.Destination &&
            (!UpExit.Flags.ISSET("Hidden") &&
            (!UpExit.Flags.ISSET("HiddenWhileClosed") || !UpExit.Flags.ISSET("Closed"))))
            {
                if (!UpExit.Flags.ISSET("Closed"))
                    AsciiString = "\\B^\\x";
                else if (UpExit.Flags.ISSET("Locked"))
                    AsciiString = "\\Y^\\x";
                else
                    AsciiString = "\\D^\\x";
            }
            else if (!(pExit = room.Exits[3])
                || !(xRoom = pExit.Destination)
                || pExit.Flags.ISSET("Hidden")
                || !(pExit = room.Exits[0])
                || !(yRoom = pExit.Destination)
                || pExit.Flags.ISSET("Hidden"))
                AsciiString = roomWall;

            //Pretty up fields and large halls by removing unsightly corners.
            else if (((pExit = room.Exits[0]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = room.Exits[3]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[1]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[0]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[2]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[3])  && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden")))
                AsciiString = roomWall;

            else
                AsciiString = roomWall;
        }
        // Bottom right
        else if (yoffset == 2 && xoffset == 2)
        {

            if (DownExit != null && DownExit.Destination &&
            (!DownExit.Flags.ISSET("Hidden") &&
            (!DownExit.Flags.ISSET("HiddenWhileClosed") || !DownExit.Flags.ISSET("Closed"))))
            {
                if (!DownExit.Flags.ISSET("Closed"))
                    AsciiString = "\\Bv";
                else if (DownExit.Flags.ISSET("Locked"))
                    AsciiString = "\\Yv";
                else
                    AsciiString = "\\Dv";
            }
            else if ((pExit = room.Exits[1]) == null
                || (xRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit = room.Exits[2]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden"))
                AsciiString = roomWall;

            //Pretty up fields and large halls by removing unsightly corners.
            else if (((pExit = room.Exits[2]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = room.Exits[1]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[3]) && pExit.Destination 
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[2]) && pExit.Destination 
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[0]) && pExit.Destination 
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[1]) && pExit.Destination 
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden")))
                AsciiString = roomWall;

            else
                AsciiString = roomWall;
        }
        else if (yoffset == 0 && xoffset == 2) // top right
        {
            if ((pExit = room.Exits[1]) == null
                || (xRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit = room.Exits[0]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden"))
                AsciiString = roomWall;

            //Pretty up fields and large halls by removing unsightly corners.
            else if (((pExit = room.Exits[0]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = room.Exits[1]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[3]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[0]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[2]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[1]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden")))
                AsciiString = roomWall;

            else
                AsciiString = roomWall;
        }
        // Bottom left
        else if (yoffset == 2 && xoffset == 0)
        {

            if ((pExit = room.Exits[3]) == null
                || (xRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit = room.Exits[2]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden"))
                AsciiString = roomWall;

            //Pretty up fields and large halls by removing unsightly corners.
            else if (((pExit = room.Exits[2]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = room.Exits[3]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[1]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[2]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[0]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[3]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden")))
                AsciiString = roomWall;

            else
                AsciiString = roomWall;
        }
        else if (xoffset == 1 && yoffset == 0) //Upper Mid
        {

            //Make sure map rooms aren't null.
            if ((pExit = room.Exits[0]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit.Flags.ISSET("HiddenWhileClosed") && pExit.Flags.ISSET("Closed")))
                AsciiString = roomWall;

            else if ((pExit = room.Exits[0]) && pExit.Destination
                    && (pExit = yRoom.Exits[2]))
            {
                pExit = room.Exits[0];

                //Display doors.  Grey are locked, off white are just closed.
                if (!pExit.Flags.ISSET("Closed"))
                    AsciiString = "|\\x";
                else if (pExit.Flags.ISSET("Locked"))
                    AsciiString = "\\Y-\\x";
                else
                    AsciiString = "\\D-\\x";
            }
            else
                AsciiString = roomWall;
        }
        else if (xoffset == 1 && yoffset == 2) //Bottom Mid
        {

            //Make sure map rooms aren't null.
            if ((pExit = room.Exits[2]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit.Flags.ISSET("HiddenWhileClosed") && pExit.Flags.ISSET("Closed")))
                AsciiString = roomWall;

            else if ((pExit = room.Exits[2]) && pExit.Destination
                    && (pExit = yRoom.Exits[0]))
            {
                pExit = room.Exits[2];

                //Display doors.  Grey are locked, off white are just closed.
                if (!pExit.Flags.ISSET("Closed"))
                    AsciiString = "|";
                else if (pExit.Flags.ISSET("Locked"))
                    AsciiString = "\\Y-\\x";
                else
                    AsciiString = "\\D-\\x";
            }
            else
                AsciiString = roomWall;
        }
        else if (xoffset == 0 && yoffset == 1) //Left Mid
        {

            //Make sure map rooms aren't null.
            if ((pExit = room.Exits[3]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit.Flags.ISSET("HiddenWhileClosed") && pExit.Flags.ISSET("Closed")))
                AsciiString = roomWall;

            else if ((pExit = room.Exits[3]) && pExit.Destination
                    && (pExit = yRoom.Exits[1]))
            {
                pExit = room.Exits[3];

                //Display doors.  Grey are locked, off white are just closed.
                if (!pExit.Flags.ISSET("Closed"))
                    AsciiString = "-\\x";
                else if (pExit.Flags.ISSET("Locked"))
                    AsciiString = "\\Y|\\x";
                else
                    AsciiString = "\\D|\\x";
            }
            else
                AsciiString = roomWall;
        }
        else if (xoffset == 2 && yoffset == 1) //Right Mid
        {

            //Make sure map rooms aren't null.
            if ((pExit = room.Exits[1]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit.Flags.ISSET("HiddenWhileClosed") && pExit.Flags.ISSET("Closed")))
                AsciiString = roomWall;

            else if ((pExit = room.Exits[1]) && pExit.Destination
                    && (pExit = yRoom.Exits[3]))
            {
                pExit = room.Exits[1];

                //Display doors.  Grey are locked, off white are just closed.
                if (!pExit.Flags.ISSET("Closed"))
                    AsciiString = "-";
                else if (pExit.Flags.ISSET("Locked"))
                    AsciiString = "\\Y|\\x";
                else
                    AsciiString = "\\D|\\x";
            }
            else
                AsciiString = roomWall;
        }
        else if (xoffset == 2 && yoffset == 0) //Upper Right
        {

            //Make sure map rooms aren't null.
            if ((pExit = room.Exits[1]) == null
                || (xRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit = room.Exits[0]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden"))
                AsciiString = roomWall;

            //Pretty up fields and large halls by removing unsightly corners.
            else if (((pExit = room.Exits[0]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = room.Exits[1]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[3])
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[0]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[2])
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[1]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden")))
                AsciiString = roomFloor;

            else
                AsciiString = roomWall;
        }
        else if (xoffset == 0 && yoffset == 2) //Bottom Left
        {

            //Make sure map rooms aren't null.
            if ((pExit = room.Exits[3]) == null
                || (xRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden")
                || (pExit = room.Exits[2]) == null
                || (yRoom = pExit.Destination) == null
                || pExit.Flags.ISSET("Hidden"))
                AsciiString = roomWall;

            //Pretty up fields and large halls by removing unsightly corners.
            else if (((pExit = room.Exits[2]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = room.Exits[3]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[1])
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = xRoom.Exits[2]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[0])
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden"))
                    || ((pExit = yRoom.Exits[3]) && pExit.Destination
                        && !pExit.Flags.ISSET("Door")
                        && !pExit.Flags.ISSET("Hidden")))
                AsciiString = roomFloor;

            else
                AsciiString = roomWall;
        }
        else if (xoffset == 1 && yoffset == 1 && x == width / 2 && y == height / 2)
            AsciiString = "\\Y*\\x";
        else
            AsciiString = roomFloor;

        map[(x * 3 + xoffset) + "," + ( y * 3 + yoffset)] = AsciiString;
    }

    static GetRoomAsciiCharacter(room, isWall)
    {
        if (!room)
            return " ";
        else if (!isWall)
        {
            switch (room.Sector)
            {
                case "Hills": return "\\Gn\\x";
                case "Desert": return "\\Y+\\x";
                case "City": return "\\W+\\x";
                case "Underground": return "\\D+\\x";
                case "Mountain": return "\\y^\\x";
                case "Trail":
                case "Road":
                case "Inside": return "\\W+\\x";
                case "Field": return "\\g\"\\x";
                case "Forest": return "\\G+\\x";
                case "River":
                case "Swim":
                    if (Utility.Random(1, 3) < 2)
                        return "\\C~\\x";
                    else
                        return "\\c~\\x";
                case "NoSwim":
                    if (Utility.Random(1, 3) < 2)
                        return "\\B~\\x";
                    else
                        return "\\b~\\x";
                default: return " ";
            }
        }
        else
        {
            switch (room.Sector)
            {
                case "Desert":
                case "Road":
                case "Trail":
                case "City":
                case "Mountain":
                case "Underground":
                case "Inside": return "\\W#\\x";
                case "Hills":
                case "Field": return "\\G\"\\x";
                case "Forest": return "\\g@\\x";
                case "River":
                case "Swim":
                    if (Utility.Random(1, 3) < 2)
                        return "\\C~\\x";
                    else
                        return "\\c~\\x";
                case "Ocean":
                case "Underwater":
                case "NoSwim":
                    if (Utility.Random(1, 3) < 2)
                        return "\\B~\\x";
                    else
                        return "\\b~\\x";
                default: return " ";
            }
        }
    }
}

Character.DoCommands.DoMap = Mapper.DoMap;
module.exports = Mapper;