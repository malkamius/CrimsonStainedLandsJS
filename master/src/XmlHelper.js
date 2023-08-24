Utility = require("./Utility");
function getElement(xml, name) {
	for(key in xml) {
		if(Utility.Compare(key, name))
			return xml[key];
	}
	return undefined;
}

function getElementValue(xml, name, defaultvalue = "") {
	for(key in xml) {
		if(Utility.Compare(key, name))
		{
			return xml[key]._ ? xml[key]._ : xml[key][0]._? xml[key][0]._ : xml[key][0];
		}
		
	}
	return defaultvalue;
}

function getElementValueInt(xml, name, defaultvalue = 0) {
	return parseInt(getElementValue(xml, name, defaultvalue));
}

function getAttributeValue(xml, name, defaultvalue) {
	if(xml.$)
		for(key in xml.$) {
			if(Utility.Compare(key, name))
				return xml.$[key]? xml.$[key] : defaultvalue;
		}
	return defaultvalue;
}


function getAttributeValueInt(xml, name, defaultvalue = 0) {
	return parseInt(getAttributeValue(xml, name, defaultvalue));
}


exports.GetElement = getElement;
exports.GetElementValue = getElementValue;
exports.GetElementValueInt = getElementValueInt;
exports.GetAttributeValue = getAttributeValue;
exports.GetAttributeValueInt = getAttributeValueInt;