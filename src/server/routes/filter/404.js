/**
 * Created by julien.zhang on 2015/2/27.
 */

//var logger = require(CONF_DIR + 'logger.js').logger();

module.exports = function (req, res) {

    //logger.warn(req.url);
    //console.log('action 404 =>', req.url);

    res.status(404);

    if(req.xhr) return res.send({msg:404});

    res.send('404')
    //res.render('error/404.html');
};
