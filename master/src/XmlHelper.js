StringUtility = require("./StringUtility");
function getElement(xml, name) {
	for(key in xml) {
		if(StringUtility.Compare(key, name))
			return xml[key];
	}
	return undefined;
}

function getElementValue(xml, name, defaultvalue) {
	for(key in xml) {
		if(StringUtility.Compare(key, name))
		{
			return xml[key]._ ? xml[key]._ : xml[key][0]._? xml[key][0]._ : xml[key][0];
		}
		
	}
	return defaultvalue;
}

function getAttributeValue(xml, name, defaultvalue) {
	if(xml.$)
		for(key in xml.$) {
			if(StringUtility.Compare(key, name))
				return xml.$[key]? xml.$[key] : defaultvalue;
		}
	return defaultvalue;
}

exports.GetElement = getElement;
exports.GetElementValue = getElementValue;
exports.GetAttributeValue = getAttributeValue;