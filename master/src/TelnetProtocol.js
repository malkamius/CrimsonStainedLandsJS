const { start } = require("repl");

class Command
{
    Type;
    Values = Array();
    constructor(CommandType, values) {
        this.Type = CommandType;
        this.Values = values;
    }
}
class TelnetProtocol
{
    static Options = {
        ECHO: 1,
        MUDServerStatusProtocolVariable: 1,
        MUDServerStatusProtocolValue: 2,
        TelnetType: 24,
        MUDServerStatusProtocol: 70,
        MUDSoundProtocol: 90,
        MUDeXtensionProtocol: 91,
        SubNegotiationEnd: 240,
        GoAhead: 249,
        SubNegotiation: 250,
        WILL: 251,
        WONT: 252,
        DO: 253,
        DONT: 254,
        InterpretAsCommand: 255,
    }

    static CommandTypes = {
            WillTelnetType: 1,
            ClientSendNegotiateType: 2,
            DoMUDServerStatusProtocol: 3,
            DontMUDServerStatusProtocol: 4,
            DoMUDExtensionProtocol: 5
        };

    static StartsWith(array, partial, startindex = 0)
    {
        if (!array || !partial || array.length - startindex < partial.length) return false;
        for(var i = 0; i < partial.length; i++)
            if(array[startindex + i] != partial[i]) return false;
        return true;
    }

    static GoAhead = [ TelnetProtocol.Options.InterpretAsCommand, TelnetProtocol.Options.GoAhead ];

    /// <summary>
    /// Server sends to inform that it can handle the telnet type
    /// </summary>
    /// <returns></returns>
    static ServerGetDoTelnetType = [ TelnetProtocol.Options.InterpretAsCommand, TelnetProtocol.Options.DO, TelnetProtocol.Options.TelnetType ];

    static ClientGetWillTelnetType = [ TelnetProtocol.Options.InterpretAsCommand, TelnetProtocol.Options.WILL, TelnetProtocol.Options.TelnetType ];
    /// <summary>
    /// Server sends when ready to receive telnet type
    /// </summary>
    /// <returns></returns>
    static ServerGetWillTelnetType = [   
         TelnetProtocol.Options.InterpretAsCommand,
         TelnetProtocol.Options.SubNegotiation,
         TelnetProtocol.Options.TelnetType,
        1,
         TelnetProtocol.Options.InterpretAsCommand,
         TelnetProtocol.Options.SubNegotiationEnd];

    static ClientNegotiateTelnetType = [ 
        TelnetProtocol.Options.InterpretAsCommand, 
        TelnetProtocol.Options.SubNegotiation, 
        TelnetProtocol.Options.TelnetType, 
         0 ]; 

    static ServerGetWillMudServerStatusProtocol = [ 
        TelnetProtocol.Options.InterpretAsCommand, 
        TelnetProtocol.Options.WILL, 
        TelnetProtocol.Options.MUDServerStatusProtocol ];

    static ClientGetWillMUDServerStatusProtocol = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.DO,
        TelnetProtocol.Options.MUDServerStatusProtocol ];

    static ClientGetDontMUDServerStatusProtocol = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.DONT,
        TelnetProtocol.Options.MUDServerStatusProtocol ];

    static ClientGetWontMUDServerStatusProtocol = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.WONT,
        TelnetProtocol.Options.MUDServerStatusProtocol ];

    static ServerGetNegotiateMUDServerStatusProtocol(Values)
    {
        var data = Array(TelnetProtocol.Options.InterpretAsCommand, TelnetProtocol.Options.SubNegotiation, TelnetProtocol.Options.MUDServerStatusProtocol);

        for(var key in Values)
        {
            var variable = Values[key];
            data.push(TelnetProtocol.Options.MUDServerStatusProtocolVariable);
            for (var i = 0; i < key.length; ++i) {
                data.push(key.charCodeAt(i));//from   w w w . j a va  2 s  . com
            }
            
            for(var value of variable)
            {
                var strvalue = value.toString();
                data.push(TelnetProtocol.Options.MUDServerStatusProtocolValue);
                for (var i = 0; i < strvalue.length; ++i) {
                    data.push(strvalue.charCodeAt(i));//from   w w w . j a va  2 s  . com
                }
            }

        }

        data.push(TelnetProtocol.Options.InterpretAsCommand);
        data.push(TelnetProtocol.Options.SubNegotiationEnd);
        return data;
    }

    static ServerGetWillMUDExtensionProtocol = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.WILL,
        TelnetProtocol.Options.MUDeXtensionProtocol ];

    static ClientGetDoMUDExtensionProtocol = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.DO,
        TelnetProtocol.Options.MUDeXtensionProtocol ];
    
    static ClientGetWillMUDExtensionProtocol = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.WILL,
        TelnetProtocol.Options.MUDeXtensionProtocol ];

    static ClientGetDontMUDExtensionProtocol = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.DONT,
        TelnetProtocol.Options.MUDeXtensionProtocol ];

    static ClientGetDontUnknown = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.DONT];

    static ClientGetWillUnknown = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.WILL];

    static ServerGetTelnetTypeNegotiate = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.SubNegotiation,
        TelnetProtocol.Options.TelnetType,
        1,
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.SubNegotiationEnd];

    static ClientGetDoEcho = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.DO,
        TelnetProtocol.Options.ECHO];

    static ServerGetWillEcho = [
        TelnetProtocol.Options.InterpretAsCommand,
        TelnetProtocol.Options.WILL,
        TelnetProtocol.Options.ECHO];
    
    static ProcessInterpretAsCommand(sender, data, position, callback)
    {
        /// IAC TType Negotiation
        /// https://tintin.mudhalla.net/protocols/mtts/
        /// https://tintin.mudhalla.net/rfc/rfc854/
        /// https://www.rfc-editor.org/rfc/rfc1091
        /// https://tintin.mudhalla.net/info/ansicolor/
        var carryover = null;
        var newposition = 0;
        if (data.length > position + 2)
        {
            /// DO TTYPE sent on connection acceptance, Client responds with WILL TTYPE
            if (TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetWillTelnetType, position))
            {
                /// READY TO RECEIVE TTYPE
                callback(sender, new Command(TelnetProtocol.CommandTypes.WillTelnetType));
                carryover = null;
                newposition = position + 3;
                return [newposition, carryover];
            }
            /// TTYPE Received from Client
            else if (TelnetProtocol.StartsWith(data, TelnetProtocol.ClientNegotiateTelnetType, position))
            {
                var hittheend = false;
                var TerminalTypeResponse = Array();
                for (var responseindex = position + TelnetProtocol.ClientNegotiateTelnetType.length; responseindex < data.length; responseindex++)
                {
                    if (data[responseindex] == TelnetProtocol.Options.InterpretAsCommand)
                    {
                        hittheend = true;
                        break;
                    }
                    TerminalTypeResponse.push(data[responseindex]);
                }
                if (hittheend)
                {
                    var ClientString = "";
                    for (var i = 0; i < TerminalTypeResponse.length; i++) {
                        ClientString += String.fromCharCode(TerminalTypeResponse[i]);
                    }
                    callback(sender, new Command(TelnetProtocol.CommandTypes.ClientSendNegotiateType, { "TelnetType": [ClientString]}));

                    newposition = position + TerminalTypeResponse.length + TelnetProtocol.ClientNegotiateTelnetType.length + 1;
                    carryover = null;
                    return [newposition, carryover];
                }
                else
                {
                    newposition = data.length;
                    carryover = new byte[data.length - position];
                    data.CopyTo(carryover, 0);
                    return [newposition, carryover];
                }
            }
            else if (TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetWillMUDServerStatusProtocol, position))
            {
                newposition = position + TelnetProtocol.ClientGetWillMUDServerStatusProtocol.length;
                carryover = null;
                callback(sender, new Command(TelnetProtocol.CommandTypes.DoMUDServerStatusProtocol));
                return [newposition, carryover];
            }
            else if (TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetDontMUDServerStatusProtocol, position))
            {
                callback(sender, new Command(TelnetProtocol.CommandTypes.DontMUDServerStatusProtocol));
                newposition = position + TelnetProtocol.ClientGetDontMUDServerStatusProtocol.length;
                carryover = null;
                return [newposition, carryover];
            }
            else if (TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetWillMUDExtensionProtocol, position) || 
                TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetDoMUDExtensionProtocol, position))
            {
                callback(sender, new Command(TelnetProtocol.CommandTypes.DoMUDExtensionProtocol));
                newposition = position + TelnetProtocol.ClientGetWillMUDExtensionProtocol.length;
                carryover = null;
                return [newposition, carryover];
            }
            else if(TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetDontMUDExtensionProtocol, position))
            {
                newposition = position + TelnetProtocol.ClientGetDontMUDExtensionProtocol.length;
                carryover = null;
                return [newposition, carryover];
            }

            else if (TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetDontUnknown, position))
            {
                newposition = position + TelnetProtocol.ClientGetDontUnknown.length + 1;
                carryover = null;
                return [newposition, carryover];
            }
            else if (TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetWillUnknown, position))
            {
                newposition = position + TelnetProtocol.ClientGetWillUnknown.length + 1;
                carryover = null;
                return [newposition, carryover];
            }
            else if(TelnetProtocol.StartsWith(data, TelnetProtocol.ClientGetWillMUDServerStatusProtocol, position)) {
                newposition = position + TelnetProtocol.ClientGetWillMUDServerStatusProtocol.length;
                carryover = null;
                return [newposition, carryover];
            }
        }

        newposition = position + 1;
        carryover = null;
        return [newposition, carryover];
    }
}
module.exports = TelnetProtocol;