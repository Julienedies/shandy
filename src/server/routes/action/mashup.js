/**
 * Created by j on 18/8/13.
 */

import fs from 'fs'
import path from 'path'

import request from 'request'

import fetch from '../../../libs/fetch/fetch.js'


export default {

    news: function(req, res){



    },

    basic: function(req, res){

    },

    get: function(req, res){
        var code = req.params.code;
        let str = fs.readFileSync(`/Users/j/dev/csd/s/${code}.json`, 'utf-8');
        let data = JSON.parse(str);
        res.json(data);
    },

    _get: function (req, res) {
        var code = req.params.code;
        var sources = ['ths_new', 'ths_p', 'ycj'];
        var data = {};
        var callback = function (result, id, code){
            //Object.assign(data, result);
            data[id] = result;
            sources.j_remove(id);
            if(sources.length === 0){
                res.json(data);
            }
        };

        sources.map(id => {
            fetch(code, id, callback);
        });

    },

    post: function (req, res) {
        var obj = req.body;
    }

}