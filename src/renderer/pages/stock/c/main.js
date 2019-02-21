/*!
 * Created by j on 18/9/20.
 */

brick.reg('c_ctrl', function(){

    var scope = this;

    var query = brick.utils.get_query() || {};
    var code = query.code;
    var edit = query.edit;

    var c;

    $.ajax({url:`/stock/c/${code}`, dataType:'json'}).done(function(data){
        c = data;
        $('title').text(data['名称']);
        if(edit) {
            scope.set_c(data);
        }else{
            set_c_done({}, data);
        }
    });

    scope.set_c = function(e){
        scope.$elm.hide();
        scope.emit('set_c', c);
    };

    function set_c_done(e, data){
        data && scope.render('c', data);
        scope.$elm.show();
    }

    scope.on('set_c_done', set_c_done);
});


brick.reg('set_c_ctrl', function(){

    var scope = this;

    if(window.screen.screenLeft >= 1700 || window.innerWidth == 1200) {

        scope.done = function(data){
            window.close();
        };

        scope.close = function(e){
            window.close();
        };

    } else {

        scope.done = function(data){
            scope.$elm.hide();
            scope.emit('set_c_done', data);
        };

        scope.close = function(e){
            scope.$elm.hide();
            scope.emit('set_c_done');
        };

    }


    scope.on('set_c', function(e, data){
        scope.render('set_c', data);
        scope.$elm.show();
    });

});