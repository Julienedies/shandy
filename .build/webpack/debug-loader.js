// debug-loader.js
module.exports = function(source) {
  //console.log(11111, arguments);
  console.log("=== HTML-LOADER OUTPUT ===");
  console.log(source);
  return source; // 继续传递结果
};