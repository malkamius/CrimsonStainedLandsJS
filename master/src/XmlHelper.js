Utility = require("./Utility");
class XmlHelper {
	static  GetElement(xml, name) {
		for(var key in xml) {
			if(Utility.Compare(key, name))
				return xml[key];
		}
		return undefined;
	}

	static GetElementValue(xml, name, defaultvalue = "") {
		for(var key in xml) {
			if(Utility.Compare(key, name))
			{
				return xml[key]._ ? xml[key]._ : xml[key][0]._? xml[key][0]._ : xml[key][0];
			}
			
		}
		return defaultvalue;
	}

	static GetElementValueInt(xml, name, defaultvalue = 0) {
		return parseInt(XmlHelper.GetElementValue(xml, name, defaultvalue));
	}

	static GetElementValueFloat(xml, name, defaultvalue = 0) {
		return parseFloat(XmlHelper.GetElementValue(xml, name, defaultvalue));
	}

	static GetAttributeValue(xml, name, defaultvalue = "") {
		if(!xml.$ && Object.keys(xml).length == 1) {
			xml = xml[Object.keys(xml)[0]];
		}
		if(xml.$) {
			for(var key in xml.$) {
				if(Utility.Compare(key, name)) {
					
					return xml.$[key]? xml.$[key] : defaultvalue;
				}
			}
		}
		return defaultvalue;
	}


	static GetAttributeValueInt(xml, name, defaultvalue = 0) {
		return parseInt(XmlHelper.GetAttributeValue(xml, name, defaultvalue));
	}

	static GetAttributeValueFloat(xml, name, defaultvalue = 0) {
		return parseFloat(XmlHelper.GetAttributeValue(xml, name, defaultvalue));
	}
}
Object.defineProperty( Object.prototype, 'GetElementValue', { value: function (name, defaultvalue = "") { return XmlHelper.GetElementValue(this, name, defaultvalue); }} );
Object.defineProperty( Object.prototype, 'GetElementValueInt', { value: function (name, defaultvalue = 0) { return XmlHelper.GetElementValueInt(this, name, defaultvalue); }} );
Object.defineProperty( Object.prototype, 'GetElementValueFloat', { value: function (name, defaultvalue = 0) { return XmlHelper.GetElementValueFloat(this, name, defaultvalue); }} );

Object.defineProperty( Object.prototype, 'GetAttributeValue', { value: function (name, defaultvalue = "") { return XmlHelper.GetAttributeValue(this, name, defaultvalue); }} );
Object.defineProperty( Object.prototype, 'GetAttributeValueInt', { value: function (name, defaultvalue = 0) { return XmlHelper.GetAttributeValueInt(this, name, defaultvalue); }} );
Object.defineProperty( Object.prototype, 'GetAttributeValueFloat', { value: function (name, defaultvalue = 0) { return XmlHelper.GetAttributeValueFloat(this, name, defaultvalue); }} );

module.exports = XmlHelper;