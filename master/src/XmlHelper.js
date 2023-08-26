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

function getElementValueFloat(xml, name, defaultvalue = 0) {
	return parseFloat(getElementValue(xml, name, defaultvalue));
}

function getAttributeValue(xml, name, defaultvalue = "") {
	if(!xml.$ && Object.keys(xml).length == 1) {
		xml = xml[Object.keys(xml)[0]];
	}
	if(xml.$) {
		for(key in xml.$) {
			if(Utility.Compare(key, name)) {
				
				return xml.$[key]? xml.$[key] : defaultvalue;
			}
		}
	}
	return defaultvalue;
}


function getAttributeValueInt(xml, name, defaultvalue = 0) {
	return parseInt(getAttributeValue(xml, name, defaultvalue));
}

function getAttributeValueFloat(xml, name, defaultvalue = 0) {
	return parseFloat(getAttributeValue(xml, name, defaultvalue));
}

exports.GetElement = getElement;
exports.GetElementValue = getElementValue;
exports.GetElementValueInt = getElementValueInt;
exports.GetElementValueFloat = getElementValueFloat;
exports.GetAttributeValue = getAttributeValue;
exports.GetAttributeValueInt = getAttributeValueInt;
exports.GetAttributeValueFloat = getAttributeValueFloat;