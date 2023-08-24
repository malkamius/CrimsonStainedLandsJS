
const Compare = (str1, str2) => {
	return str1 && str2 && str1.toLowerCase() == str2.toLowerCase();
};

const Prefix = (str1, str2) => {
	return str1 && str2 && str1.length >= str2.length && str1.toLowerCase().startsWith(str2.toLowerCase());
};

const Includes = (str1, str2) => {
	return str1 && str2 && str1.toLowerCase().includes(str2.toLowerCase());
};

const Capitalize = (str) => {
	return str && str.length > 1? (str[0].toUpperCase() + str.substr(1)) : (str? str.toUpperCase() : "");
}

function TrimStart(text, characters) {
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

function IsNullOrEmpty(str) {
	return !str || str.length == 0;
}

function IsName(namelist, thename, disallowPrefix = false)
{
	var part = "";
	var originalString = "";
	var list = "";
	var name = "";
	
	if (IsNullOrEmpty(thename) || IsNullOrEmpty(namelist))
		return false;

	originalString = thename;

	do
	{
		thenameparts = OneArgument(thename);
		thename = thenameparts[1];
		part = thenameparts[0];

		if (IsNullOrEmpty(part))
			return false;

		list = namelist;
		var found = false;
		do
		{
			listparts = OneArgument(list);
			list = listparts[1];
			name = listparts[0];

			if (IsNullOrEmpty(name))
				return false;

			if (disallowPrefix == false)
			{
				if (Prefix(name, part))
				{
					found = true;
					break;
				}
			}


			if (Compare(originalString, name))
			{
				return true;
			}
			if (Compare(part, name))
			{
				found = true;
				break;
			}
		} while (!IsNullOrEmpty(name) && !IsNullOrEmpty(list));

		if (!found) return false;
	} while (!IsNullOrEmpty(part) && !IsNullOrEmpty(thename));


	return true;
}

function OneArgument(text) {
	if(!text || text.length == 0)
	{
		return ["", ""];
	}
	
	var Delimiter = " ";
	var SingleArgument = "";
	text = TrimStart(text, ['\0', ' ', '\n', '\r', '\t']);
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

function NumberArgument(args)
{
	var index = 0;
	var result = 0;
	if(!IsNullOrEmpty(args)) {
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

function ParseFlags(array, flags) {
	var args = OneArgument(flags);
	flags = args[1];
	while(args[0]) {
		array[args[0]] = true;
		args = OneArgument(flags);
		flags = args[1];
	}
}

exports.Compare = Compare;
exports.Includes = Includes;
exports.Prefix = Prefix;
exports.Capitalize = Capitalize;
exports.OneArgument = OneArgument;
exports.NumberArgument = NumberArgument;
exports.ParseFlags = ParseFlags;
exports.TrimStart = TrimStart;
exports.IsName = IsName;
exports.IsNullOrEmpty = IsNullOrEmpty;
