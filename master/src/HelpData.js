
class HelpData {
    static Helps = {};
    Area = null;
    VNum = 0;
    Keyword = "";
    LastEditedBy = "";
    LastEditedOn = "";
    Text = "";

    constructor(area, xml, vnum) {
        const XmlHelper = require("./XmlHelper");
        this.VNum = vnum;
        if(xml) {
            this.VNum = xml.GetAttributeValueInt("VNum");
            this.Keyword = xml.GetAttributeValue("Keyword");
            this.LastEditedBy = xml.GetAttributeValue("LastEditedBy");
            this.LastEditedOn = xml.GetAttributeValue("LastEditedOn");
            this.Text = xml._;
        }
        HelpData.Helps[this.VNum] = this;
    }

    Element(xml) {
        var element = xml.element("Help", this.Text);
        element.attribute("VNum", this.VNum);
        element.attribute("Keyword", this.Keyword);
        element.attribute("LastEditedBy", this.LastEditedBy);
        element.attribute("LastEditedOn", this.LastEditedOn);
    }

}

module.exports = HelpData;