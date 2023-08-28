class Utility {
	static Compare (str1, str2) {
		return str1 && str2 && str1.toLowerCase() == str2.toLowerCase();
	};

	static Prefix (str1, str2) {
		return str1 && str2 && str1.length >= str2.length && str1.toLowerCase().startsWith(str2.toLowerCase());
	};

	static Includes(str1, str2) {
		return str1 && str2 && str1.toLowerCase().includes(str2.toLowerCase());
	};

	static Capitalize(str) {
		return str && str.length > 1? (str[0].toUpperCase() + str.substr(1)) : (str? str.toUpperCase() : "");
	}

	static TrimStart(text, characters) {
		if(!text || text.length == 0)
			return "";

		if(!characters || characters.length == 0) 
			characters = ['\t', ' ', '\n', '\r'];

		while(characters.find((element) => element == text[0])) {
			if(text.length > 1)
				text = text.substring(1);
			else
				text = "";
		}
		return text;
	}

	static IsNullOrEmpty(str) {
		return !str || str.length == 0;
	}

	static IsName(namelist, thename, disallowPrefix = false)
	{
		var part = "";
		var originalString = "";
		var list = "";
		var name = "";
		
		if (Utility.IsNullOrEmpty(thename) || Utility.IsNullOrEmpty(namelist))
			return false;

		originalString = thename;

		do
		{
			var part;
			[part, thename] = thename.oneArgument();

			if (Utility.IsNullOrEmpty(part))
				return false;

			list = namelist;
			var found = false;
			do
			{
				[name, list] = list.oneArgument();

				if (Utility.IsNullOrEmpty(name))
					return false;

				if (disallowPrefix == false)
				{
					if (Utility.Prefix(name, part))
					{
						found = true;
						break;
					}
				}


				if (Utility.Compare(originalString, name))
				{
					return true;
				}
				if (Utility.Compare(part, name))
				{
					found = true;
					break;
				}
			} while (!Utility.IsNullOrEmpty(name) && !Utility.IsNullOrEmpty(list));

			if (!found) return false;
		} while (!Utility.IsNullOrEmpty(part) && !Utility.IsNullOrEmpty(thename));


		return true;
	}

	static OneArgument(text) {
		if(!text || text.length == 0)
		{
			return ["", ""];
		}
		
		var Delimiter = " ";
		var SingleArgument = "";
		text = Utility.TrimStart(text, ['\0', ' ', '\n', '\r', '\t']);
		if (text.length > 0)
		{
			if (text[0] == '\'' || text[0] == '"')
			{
				Delimiter = text[0];
				text = text.substring(1);
			}
			var delimiterIndex = text.indexOf(Delimiter);
			if (delimiterIndex >= 1)
			{
				SingleArgument = text.substring(0, delimiterIndex);
				if (delimiterIndex < text.length)
				{
					text = text.substring(delimiterIndex + 1);
					return [SingleArgument, text];
				}
				text = "";
				
				return [SingleArgument, text];
			}
			SingleArgument = text;
			text = "";
			
			return [SingleArgument, text];
		}
		text = "";
		SingleArgument = "";

		return [SingleArgument, text];
	}

	static NumberArgument(args)
	{
		var index = 0;
		var result = 0;
		if(!Utility.IsNullOrEmpty(args)) {
			index = args.indexOf('.');
			//if(index == -1) index = args.IndexOf(' ');
			if (index > 0)
			{
				var result = parseInt(args.substring(0, index));
				
				if (args.length > index + 1)
				{
					args = args.substring(index + 1);
				}
				else
					args = "";
			} 
		}
		return [result, args];
	}

	static ParseFlags(array, flags) {
		var flag;
		[flag, flags] = flags.oneArgument();
		while(!flag.IsNullOrEmpty()) {
			array[flag] = true;
			[flag, flags] = flags.oneArgument();
		}
	}

	static JoinFlags(array) {
		var result = "";
		for(var key in array) {
			result = result + (result.length > 0? " " : "") + key;
		}
		return result;
	}

	static CloneArray(arraytoclone) {
		var result = Array();
		//Object.assign(result, array);
		for(var i = 0; i < arraytoclone.length; i++)
			result.push(arraytoclone[i]);
		return result;
	}

	static JoinArray(arraytojoin, transform, separator = ", ") {
		var result = "";
		for(var key in arraytojoin) {
			var value = arraytojoin[key];
			if(transform) value = transform(value, key);
			result = result + (result.length > 0? separator : "") + value;
		}
		return result;
	}

	static Roll(dice) {
		var result = Math.floor(Math.random() * dice[0]) * Math.floor(Math.random() * dice[1]) + dice[2];
		return result;
	}

	static Random(num1, num2) {
		if(num2 < num1) {
			var temp = num1;
			num1 = num2;
			num2 = temp;
		}
		var result = Math.floor(Math.random() * (num2 - num1)) + num1;
		return result;
	}

	static NumberPercent() {
		return Random(0, 127);
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
	static Format(str, ...array) {
		var result = "";
		if(array && array.length == 1 && Array.isArray(array[0])) array = array[0];
		if(Utility.IsNullOrEmpty(str))
			return result;
		else if(!array || array.length == 0)
			return str;
		else {
			for(var i = 0; i < str.length; i++) {
				if(str[i] == "{") {
					
					var startindex = i + 1;
					while(i + 1 < str.length && str[++i] != "}")
						;
					
					if(i > startindex) {
						var variable = str.substring(startindex, i);
						var variables = variable.split(",");
						if(variables && variables[0]) {
							var index = parseInt(variables[0])
							if(index != NaN && index < array.length && index >= 0) {
								if(variable[1]) {
									var padding = parseInt(variables[1]);
									if(padding && padding < 0) {
										result = result + ("" + array[index]).padStart(-padding);
									} else if (padding > 0) {
										result = result + ("" + array[index]).padEnd(padding);
									} else {
										result = result + array[index];
									}
								}
								else {
									result = result + array[index];
								}
							}
							else if(index < 0)
								console.log("Parameter index less than 0");
							else
								console.log("Parameter index greater than array length");
						} else {
							var index = parseInt(variable);

							if(index != NaN && index < array.length) {
								result = result + array[index];
							} else if(index < 0)
								console.log("Parameter index less than 0");
							else
								console.log("Parameter index greater than array length");
						}
					}
					//i++;
				} else 
				if(i < str.length)
					result = result + str[i];
			}
			return result;
		}
	}

	static Interpolate(level, value_00, value_32)
	{
		return value_00 + level * (value_32 - value_00) / 32;
	}
}

const xml2js = require('xml2js');

// https://stackoverflow.com/a/59102181
Object.defineProperty( String.prototype, 'oneArgument', { value: function () { return Utility.OneArgument(this); }} );
Object.defineProperty( String.prototype, 'numberArgument', { value: function () { return Utility.NumberArgument(this); }} );
Object.defineProperty( String.prototype, 'equals', { value: function (str1) { return Utility.Compare(this, str1); }} );
Object.defineProperty( String.prototype, 'prefix', { value: function (str) { return Utility.Prefix(this, str); }} );
Object.defineProperty( String.prototype, 'IsName', { value: function (str) { return Utility.IsName(this, str); }} );
Object.defineProperty( String.prototype, 'contains', { value: function (str) { return Utility.Includes(this, str); }} );
Object.defineProperty( String.prototype, 'IsNullOrEmpty', { value: function () { return Utility.IsNullOrEmpty(this); }} );
Object.defineProperty( String.prototype, 'ParseXml', { value: function (callback) { 
	const parser = new xml2js.Parser({ strict: false, trim: false });
	
	var content;
	parser.parseString(this, (err, result) => {if(err) throw new Error(err); content = result;});
	return content;
}} );


Object.defineProperty( Array.prototype, 'joinWithTransform', { value: function () { return Utility.JoinArray(this, transform, separator); }} );

module.exports = Utility;
