/*!
 * Created by j on 18/11/9.
 */


const fs = require('fs');
const path = require('path');

String.prototype.j_format = function(){
    return this.replace(/([{,])(?=".+"\s*[:]\s*)/img, '$1\r\n');
};


function F(json_file){
    let file_path = path.join(__dirname, `${json_file}`);
    this.file_path = file_path;
    //
    if(!fs.existsSync(file_path) ){
        fs.createWriteStream(file_path);
        //fs.writeFileSync(file_path, '{}');
        this._pool = {};
    }else{
        try{
            let str = fs.readFileSync(this.file_path, 'utf8');
            this._pool = JSON.parse(str);
        }catch(e){
            console.info(json_file);
            console.error(e);
            this._pool = {};
        }
    }
}

F.prototype.save = function(obj){
    Object.assign(this._pool, obj);
    let json = JSON.stringify(this._pool).j_format();
    fs.writeFileSync(this.file_path, json);
};

F.prototype.get = function(key){
    return key ? (this._pool[key]||'' ): this._pool;
};


module.exports = function(json_file){
    return new F(json_file);
};