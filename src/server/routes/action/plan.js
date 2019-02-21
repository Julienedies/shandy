/**
 * Created by j on 18/7/22.
 */

const dob = require('../../libs/dob.js');

const plans = dob('plan');

const tags = require('./tags.js').tags;

function data(){
    return {plans:plans.get(), tags: tags.convert()};
}

module.exports = {

    get: function (req, res) {
        res.json(data());
    },

    // 创建一个计划
    post: function (req, res) {
        var obj = req.body;
        obj['股票名称'] && plans.set(obj);  // 临时处理 jhandy 下无法通过get方法获取计划数据, 使用空post替代get获取数据
        res.json(data());
    },

    del: function (req, res) {
        var id = req.params.id;
        plans.find(id).remove();
        res.json(data());
    }
};