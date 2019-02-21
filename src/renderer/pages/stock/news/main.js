/*!
 * Created by j on 18/9/20.
 */
brick.reg('news_ctrl', function(){

    var scope = this;

    this.done = function(data){
        scope.render('news', data);
    };

    this.removed = this.done;
});