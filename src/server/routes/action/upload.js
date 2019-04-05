/*!
 * 处理图片上传
 * Created by j on 2019-04-05.
 */
import util from 'util'
import formidable from 'formidable'
import config from '../../../libs/config'

export default function (req, res) {

    let form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8'
    form.uploadDir = config.UPLOAD_DIR
    form.keepExtensions = true    //保留后缀
    form.maxFieldsSize = 100 * 1024 * 1024   //文件大小

    form.parse(req, function (err, fields, files) {
        if (err) {
            return res.json({err: err})
        }
        console.log(files)
        // return res.send(util.inspect({fields: fields, files: files}))

        let data = []
        for (let i in files) {
            let file = files[i]
            //fs.renameSync(file.path, file.path.replace(/\[^\/\\]+.\w$/, file.name))
            let url = file.path.replace(config.UPLOAD_DIR, `/upload/`)
            data.push({url})
        }

        res.json(data)

    });

}
