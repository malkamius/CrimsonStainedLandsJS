const Clear = "\u0001B[0m";
const Underline = "\u0001B[4m";
const Reverse = "\u0001B[7m";
const Flash = "\u0001B[5m";

function ColorString(text, StripColor = false, Support256 = false) {
	var newtext = "";
	var EscapeChar = '\0';
	var LastIndex = 0;
	var ColorCodeOffset = 0;
	var base = 38;
	
	for (var ColorMarkerIndex = text.indexOf("\\", LastIndex); ColorMarkerIndex > -1; ColorMarkerIndex = text.indexOf("\\", LastIndex)) {
		ColorCodeOffset = 0;
		if (ColorMarkerIndex > 0)
		{
			if (LastIndex < ColorMarkerIndex)
				newtext = newtext + text.substr(LastIndex, ColorMarkerIndex - LastIndex);
		}
		if (text.length > (ColorMarkerIndex + 1)) {
			var Bold = false;
			var color = -1;

			var ColorCodeCharacter = text.substr(ColorMarkerIndex + 1, 1);
			if (ColorCodeCharacter == ColorCodeCharacter.toUpperCase())
			{
				Bold = true;
			}
			
			if (ColorCodeCharacter == '!' && !StripColor)
			{
				newtext = newtext + Reverse;
			}
			else if ((ColorCodeCharacter == '*' || ColorCodeCharacter == 'f') && !StripColor)
			{
				newtext = newtext + Flash;
			}
			else if (ColorCodeCharacter == '#')
			{
				base = 48;
			}
			else if (ColorCodeCharacter == '@' && !StripColor)
			{
				newtext = newtext + Underline;
			}

			switch (ColorCodeCharacter.toLowerCase())
			{
				case '\\':
					newtext = newtext + "\\";
					color = -1;
					break;
				case 'n':
					newtext = newtext + "\n";
					color = -1;
					break;
				case 't':
					newtext = newtext + "\t";
					color = -1;
					break;
				case 'd':
					color = 0;
					break;
				case 'r':
					color = 1;
					break;
				case 'g':
					color = 2;
					break;
				case 'y':
					color = 3;
					break;
				case 'b':
					color = 4;
					break;
				case 'm':
					color = 5;
					break;
				case 'c':
					color = 6;
					break;
				case 'w':
					color = 7;
					break;

				case 'x':
					newtext = newtext + "\u001b[0m";
					color = -1;
					break;
				case 'e':
				{
					var number = "";
					var ended = false;
					while (text.length > ColorMarkerIndex + number.length + 2 &&
						(((ColorCodeCharacter = text.substr(ColorMarkerIndex + number.length + 2, 1)) >= '0' && ColorCodeCharacter <= '9')
						|| ColorCodeCharacter == ';') &&
						number.length < 3)
					{
						ColorCodeOffset++;
						if (ColorCodeCharacter == ';')
						{
							ended = true;
							break;
						}
						number = number + ColorCodeCharacter;

					}
					color = parseInt(number);
					if (!ended && text.length > ColorMarkerIndex + number.length + 2 &&
					   ((ColorCodeCharacter = text.substr(ColorMarkerIndex + number.length + 2, 1)) == ';') &&
					   number.length <= 3)
						ColorCodeOffset++;
					break;
				}
				case '&':
				{
					var number = "";
					var ended = false;
					while (text.length > ColorMarkerIndex + number.length + 2 &&
						(((ColorCodeCharacter = text.substr(ColorMarkerIndex + number.length + 2, 1)) >= '0' && ColorCodeCharacter <= '9')
						|| (ColorCodeCharacter >= 'A' && ColorCodeCharacter <= 'F')
						|| ColorCodeCharacter == ';') &&
						number.length < 6)
					{
						ColorCodeOffset++;
						if (ColorCodeCharacter == ';')
						{
							ended = true;
							break;
						}
						number = number + ColorCodeCharacter;

					}
					// int.TryParse(number, System.Globalization.NumberStyles.HexNumber, CultureInfo.InvariantCulture, out color);
					// if (SupportRGB)
					// {
						// newtext = newtext + `\x001b[${base};2;` + (color >> 16 & 0xFF) + ";" + (color >> 8 & 0xFF) + ";" + (color & 0xFF) + "m";
					// }
					color = -1;
					if (!ended && text.length > ColorMarkerIndex + number.length + 2 &&
					   ((ColorCodeCharacter = text.substr(ColorMarkerIndex + number.length + 2, 1)) == ';') &&
					   number.length <= 6)
						ColorCodeOffset++;
					break;
				}
				default:
					break;
			}

			if (color >= 0 && !StripColor)
			{
				if (Support256)
				{
					if (color < 8 && Bold)
						color = 8 + color;
					newtext = newtext + `\u001b[${base};5;${color}m`;
				}
				else if (color < 8)
				{
					if (base == 38) base = 30;
					if (base == 48) base = 40;
					newtext = newtext +"\u001b[" + (Bold ? "1;" : "") + `${base + color}m`;
				}
				color = 0;
				base = 38;
			}
		}
		if (text.length > (ColorMarkerIndex + 2))
		{
			LastIndex = ColorMarkerIndex + 2 + ColorCodeOffset;
		}
		else
		{
			LastIndex = text.length;
		}
	}
	if(LastIndex < text.length)
	{
		newtext = newtext + text.substr(LastIndex);
	}
	
	return newtext;
}

function EscapeColor(text) {
	text = text.replace("\\", "\\\\");
	return text;
}
exports.ColorString = ColorString;
exports.EscapeColor = EscapeColor;