
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

exports.Compare = Compare;
exports.Includes = Includes;
exports.Prefix = Prefix;
exports.Capitalize = Capitalize;