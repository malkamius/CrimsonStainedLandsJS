class Utility {
	static Compare (str1, str2) {
		return str1 && str2 && str1.isString() && str2.isString() && str1.toLowerCase() == str2.toLowerCase();
	};

	static Prefix (str1, str2) {
		return str1 && str2 && str1.isString() && str2.isString() && str1.length >= str2.length && str1.toLowerCase().startsWith(str2.toLowerCase());
	};

	static Includes(str1, str2) {
		return str1 && str2 && str1.isString() && str2.isString() && str1.toLowerCase().includes(str2.toLowerCase());
	};

	static Capitalize(str) {
		return str && str.isString() && str.length > 1? (str[0].toUpperCase() + str.substr(1)) : (str? str.toUpperCase() : "");
	}
	
	static URANGE(a, b, c) { return ((b) < (a) ? (a) : ((b) > (c) ? (c) : (b))); }

	static TrimStart(text, characters) {
		if(!text ||  text.length == 0)
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
			array[flag] = flag;
			[flag, flags] = flags.oneArgument();
		}
	}

	static JoinFlags(array, delimiter = " ") {
		var result = "";
		for(var key in array) {
			result = result + (result.length > 0? delimiter : "") + key;
		}
		return result;
	}

	static CloneArray(arraytoclone) {
		if(arraytoclone instanceof Array) {
			var result = Array();
			//Object.assign(result, array);
			for(var i = 0; i < arraytoclone.length; i++)
				result.push(arraytoclone[i]);
			return result;
		} else {
			var result = {};
			Object.assign(result, arraytoclone); 
			return result;
		}
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
		var result = 0;
		// if(dice[0] <= 1) return dice[1] + dice[2];
		// for(var i = 0; i < dice[1]; i++) {
		// 	result += Math.max(1, Math.ceil(Math.random() * Math.max(1, dice[0])));
		// }
		// result += dice[2];

		// Roll a random number between 1 * DiceSides and DiceSides + 1 * DiceCount, add DiceBonus
		result = Utility.Random(dice[1], dice[0] * dice[1]) + (dice[2]? dice[2] : 0);
		return result;
	}

	static Random(num1, num2) {
		if(num2 < num1) {
			var temp = num1;
			num1 = num2;
			num2 = temp;
		}
		var result = Math.round(Math.random() * (num2 - num1)) + num1;
		return result;
	}

	static NumberPercent() {
		return Utility.Random(0, 100);
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

	static Select(arr, predicate) {
		if(!arr) return [];
		var results = Array();
		for(var key in arr) {
			var item = arr[key];
			if(!predicate || predicate(item, key))
				results.push(item);
		}
		return results;
	}

	static SelectRandom(arr, predicate) {
		if(!arr) return null;
		var results = Array();
		if(predicate) {
			for(var key in arr) {
				var item = arr[key];
				if(predicate(item, key))
					results.push(item);
			}
		} else {
			for(var key in arr) {
				var item = arr[key];
				results.push(item);
			}
		}
		if(results.length == 0) return null;
		return results[Utility.Random(0, results.length - 1)];
	}

	static FirstOrDefault(arr, predicate) {
		if(!arr) return null;

		for(var key in arr) {
			var item = arr[key];
			if(!predicate || predicate(item, key))
				return item;
		}
		return null;
	}

	static IsSet(obj, flag) {
		var found = false;
		if(Array.isArray(obj)) {
			for(var setflag of obj) {
				if(setflag.equals(flag)) {
					return setflag;
				}
			}
		} else {
			found = obj[flag];
			if(!found) {
				for(var setflag in obj) { // case insensitive search
					if(setflag.equals(flag)) {
						return obj[setflag];
					}
				}
			}
		}
		return found;
	}

	static IsSetAny(obj, ...flags) {
		if(flags && flags.length == 1 && Array.isArray(flags[0])) flags = flags[0];
		if(flags && Array.isArray(flags) && flags.length == 1) flags = flags[0];
		if(Array.isArray(obj)) {
			for(var setflag of obj) {
				if(Array.isArray(flags)) {
					for(var flag of flags) {
						if(setflag.equals(flag)) {
							return flag;
						}
					}
				}
				else {
					for(var flag in flags) {
						if(setflag.equals(flag)) {
							return flag;
						}
					}
				}
			}
		} else {
			for(var setflag in obj) { // case insensitive search
				if(Array.isArray(flags)) {
					for(var flag of flags) {
						if(setflag.equals(flag)) {
							return obj[setflag];
						}
					}
				} else {
					for(var flag in flags) {
						if(setflag.equals(flag)) {
							return obj[setflag];
						}
					}
				}
			}
		}
		return false;
	}

	static RemoveFlag(obj, flag) {
		if(Array.isArray(obj)) {
			obj.find(function(setflag, index) {
				if(setflag.equals(flag)) {
					obj.splice(index, 1);
					return true;
				}
				return false;
			})
		} else {
			for(var setflag in obj) { // case insensitive search
				if(setflag.equals(flag)) {
					delete obj[setflag];
				}
			}
		}
	}

	static SETBIT(flags, flag) {
		flags[flag] = flag;
	}

	static Average(DiceSides = 0, DiceCount = 0, DiceBonus = 0) {
		if(Array.isArray(DiceSides)) {
			DiceCount = DiceSides[0];
			DiceBonus = DiceSides[2];
			DiceSides = DiceSides[1];
		}
		if(!DiceCount) DiceCount = 0;
		if(!DiceSides) DiceSides = 0;
		if(!DiceBonus) DiceBonus = 0;
		return ( (DiceCount + DiceBonus) + (DiceCount * DiceSides + DiceBonus)) / 2;
	} 

	static FormatDice(DiceSides = 0, DiceCount = 0, DiceBonus = 0) {
		if(Array.isArray(DiceSides)) {
			DiceCount = DiceSides[0];
			DiceBonus = DiceSides[2];
			DiceSides = DiceSides[1];
		}
		if(!DiceCount) DiceCount = 0;
		if(!DiceSides) DiceSides = 0;
		if(!DiceBonus) DiceBonus = 0;
		return DiceSides + "d" + DiceCount + "+" + DiceBonus;
	} 

	static FromLevelTable(leveltable, level) {
		var result = 0;
		for(var entry of leveltable) {
			if(level >= entry[0] && entry[1] > result)
				result = entry[1];
		}
		return result;
	}

	static GetEnumValueStrPrefix(arr, str, defaultvalue = "") {

		if(Array.isArray(arr)) {
			for(var value of arr) {
				if(value.prefix(str)) return value;
			}
		} else {
			for(var key in arr) {
				if(key.prefix(str)) return key;
			}
		}
		return defaultvalue;
	}

	static GetEnumValue(arr, str, defstr = "") {
		if(Array.isArray(arr)) {
			for(var value of arr) {
				if(value.equals(str)) return value;
			}
		} else {
			for(var key in arr) {
				if(key.equals(str)) return arr[key];
			}
		}
		return defstr;
	}

	static DiminishingReturns(value, max, steepness) {
		return max * (1 - Math.exp(-steepness * Math.abs(value))) * Math.sign(value);
	}

	static Max(arr, selector) {
		var max = NaN;
		for(var key in arr) {
			var value = selector? selector(arr[key]) : arr[key];
			if(isNaN(max) || value > max)
				max = value;
		}
		return max;
	}

	static Count(arr, selector) {
		var count = 0;
		for(var key in arr) {
			if(!selector || selector(arr[key], key)) {
				count++;
			}
		}
		return count;
	}

	static GetEnumValues(sourceflags, str, destination, exactmatch = true) {
		var setflags = {};
		var setflag;
		var potentialflags = str.split(" ");
		var valid = true;
		for(var flag of potentialflags) {
			if(!(setflag = sourceflags.ISSET(flag))) {
				valid = false;
				break;
			} else {
				setflags[setflag] = setflag;
			}
		}
		if(valid) {
			for(var key in setflags) {
				destination[key] = key;
			}
		}
		return valid;
	}
	
}



// https://stackoverflow.com/a/59102181
Object.defineProperty( String.prototype, 'oneArgument', { value: function () { return Utility.OneArgument(this); }} );
Object.defineProperty( String.prototype, 'numberArgument', { value: function () { return Utility.NumberArgument(this); }} );
Object.defineProperty( String.prototype, 'OneArgument', { value: function () { return Utility.OneArgument(this); }} );
Object.defineProperty( String.prototype, 'NumberArgument', { value: function () { return Utility.NumberArgument(this); }} );
Object.defineProperty( String.prototype, 'equals', { value: function (str1) { return Utility.Compare(this, str1); }} );
Object.defineProperty( String.prototype, 'prefix', { value: function (str) { return Utility.Prefix(this, str); }} );
Object.defineProperty( String.prototype, 'StrPrefix', { value: function (str) { return Utility.Prefix(this, str); }} );
Object.defineProperty( String.prototype, 'IsName', { value: function (str) { return Utility.IsName(this, str); }} );
Object.defineProperty( String.prototype, 'contains', { value: function (str) { return Utility.Includes(this, str); }} );
Object.defineProperty( String.prototype, 'IsNullOrEmpty', { value: function () { return Utility.IsNullOrEmpty(this); }} );
Object.defineProperty( String.prototype, 'ISEMPTY', { value: function () { return Utility.IsNullOrEmpty(this); }} );
Object.defineProperty( String.prototype, 'ParseXml', { value: function (callback) { 
	const xml2js = require('xml2js');
	const parser = new xml2js.Parser({ strict: false, trim: false });
	
	var content;
	parser.parseString(this, (err, result) => {if(err) throw new Error(err); content = result;});
	return content;
}} );
Object.defineProperty( String.prototype, 'isString', { value: function () { return this instanceof String || typeof this == "string" || Object.prototype.toString.call(this) === "[object String]"; }} );


Object.defineProperty( Array.prototype, 'joinWithTransform', { value: function (transform, separator) { return Utility.JoinArray(this, transform, separator); }} );
Object.defineProperty( Array.prototype, 'CloneArray', { value: function () { return Utility.CloneArray(this) }} );
Object.defineProperty( Array.prototype, 'Select', { value: function (predicate) { return Utility.Select(this, predicate) }} );
Object.defineProperty( Array.prototype, 'SelectRandom', { value: function (predicate) { return Utility.SelectRandom(this, predicate) }} );
Object.defineProperty( Array.prototype, 'FirstOrDefault', { value: function (predicate) { return Utility.FirstOrDefault(this, predicate) }} );
Object.defineProperty( Array.prototype, 'IsSet', { value: function (flag) { return Utility.IsSet(this, flag) }} );
Object.defineProperty( Array.prototype, 'ISSET', { value: function (flag) { return Utility.IsSet(this, flag) }} );
Object.defineProperty( Array.prototype, 'IsSetAny', { value: function (...flags) { return Utility.IsSetAny(this, flags) }} );
Object.defineProperty( Array.prototype, 'RemoveFlag', { value: function (flag) { return Utility.RemoveFlag(this, flag) }} );
Object.defineProperty( Array.prototype, 'Remove', { value: function (item) { 
		var index = this.indexOf(item);
		if(index != -1)
			this.splice(index, 1);
		return index != -1;
	} 
});

Object.defineProperty( Object.prototype, 'Select', { value: function (predicate) { return Utility.Select(this, predicate) }} );
Object.defineProperty( Object.prototype, 'SelectRandom', { value: function (predicate) { return Utility.SelectRandom(this, predicate) }} );
Object.defineProperty( Object.prototype, 'FirstOrDefault', { value: function (predicate) { return Utility.FirstOrDefault(this, predicate) }} );
Object.defineProperty( Object.prototype, 'IsSet', { value: function (flag) { return Utility.IsSet(this, flag) }} );
Object.defineProperty( Object.prototype, 'IsSetAny', { value: function (...flags) { return Utility.IsSetAny(this, flags) }} );
Object.defineProperty( Object.prototype, 'ISSET', { value: function (flag) { return Utility.IsSet(this, flag) }} );
Object.defineProperty( Object.prototype, 'SETBIT', { value: function (flag) { return Utility.SETBIT(this, flag) }} );
Object.defineProperty( Object.prototype, 'RemoveFlag', { value: function (flag) { return Utility.RemoveFlag(this, flag) }} );
Object.defineProperty( Object.prototype, 'isString', { value: function () { return this instanceof String || typeof this == "string" || Object.prototype.toString.call(this) === "[object String]" }} );
Object.defineProperty( Object.prototype, 'Clone', { value: function () { 
	var result = {};
	Object.assign(result, this); 
	return result;
}} );

module.exports = Utility;
