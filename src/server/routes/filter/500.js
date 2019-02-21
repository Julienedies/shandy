/**
 * Created by julien.zhang on 2015/2/27.
 */

//var logger = require(CONF_DIR + 'logger.js').logger();

module.exports = function (err, req, res, next) {
    //记录错误到日志
    //logger.error(err);

    console.error('action 500 => ', err);

    res.status(500);

    if (req.xhr) return res.send({msg: 500});

    res.render('error/500.html');
};