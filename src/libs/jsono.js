/*!
 * Created by j on 18/11/9.
 * 把json文件包装成对象进行增删改查
 */

import fs from 'fs'
import path from 'path'

class Jo {

    /**
     *
     * @param jsonPath {String} json file path
     */
    constructor (jsonPath) {

        jsonPath = path.resolve(__dirname, `${ jsonPath }`)
        this.jsonPath = jsonPath

        if (!fs.existsSync(jsonPath)) {
            //fs.createWriteStream(jsonPath)
            fs.writeFileSync(jsonPath, '{}')
            this.json = {}
        } else {
            try {
                let str = fs.readFileSync(this.jsonPath, 'utf8')
                this.json = JSON.parse(str)
            } catch (e) {
                throw new Error(e)
            }
        }
    }

    merge (obj) {
        Object.assign(this.json, obj)
    }

    save () {
        fs.writeFileSync(this.jsonPath, JSON.stringify(this.json, null, '\t'))
    }

    get (key) {
        if (!key) return this.json

        let keys = key.split('.')

        return (function fx (namespace, keys) {
            let k = keys.shift()
            let o = namespace[k]
            if (o && keys.length) return fx(namespace[k], keys)
            return o
        })(this.json, keys)
    }

    match (key) {
        return this.get(key)
    }

}


export { Jo }


export default function (jsonFile) {
    return new Jo(jsonFile)
}