// simple-css-path-processor.js
module.exports = function(content) {
  // 匹配 html-loader 生成的 require 语句
  const requireRegex = /var (\w+) = require\(["'](.*?\.css)["']\);/g;
  
  // 直接替换为公共路径
  return content.replace(requireRegex, 
    'var $1 = __webpack_public_path__ + "$2";');
};