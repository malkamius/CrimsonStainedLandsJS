
class HelpData {
    VNum = 0;
    Keyword = "";
    LastEditedBy = "";
    LastEditedOn = "";
    Text = "";

    constructor(xml) {
        const XmlHelper = require("./XmlHelper");

        this.VNum = xml.GetAttributeValueInt("VNum");
        this.Keyword = xml.GetAttributeValue("Keyword");
        this.LastEditedBy = xml.GetAttributeValue("LastEditedBy");
        this.LastEditedOn = xml.GetAttributeValue("LastEditedOn");
        this.Text = xml._;
    }


}

module.exports = HelpData;