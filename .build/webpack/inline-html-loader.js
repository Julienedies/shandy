/*!
 * Created by j on 2019-02-17.
 */

const loaderUtils = require("loader-utils");


let loader = require('html-loader')
const path = require('path')
const fs = require('fs')


module.exports = function(arg){
    console.log(111111,typeof arg, arguments)
    let str = fs.readFileSync(arg.realResource, 'utf-8')
    //console.log(typeof str, str, typeof arg.realResource)
    /*str.replace(/\<[^<]*\s+href\s*=\s*['"]?\s*([^'"]+)\?__inline\s*['"]?\s*\/\s*\>/img, function ($0, $1) {
        console.log(22222, arguments)
        return ''
    })*/
    
    //return `${JSON.stringify(str)}`
    //return 'module.exports=' + "${str}"
    return 'module.exports=function(scope){ return `' + str + '`};';
    return str;
}