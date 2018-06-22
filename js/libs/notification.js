/**
 * Created by j on 18/6/22.
 */


module.exports = function(title, body){
    let myNotification = new Notification(title, {
        body: body
    })
};