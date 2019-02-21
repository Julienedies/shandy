/*!
 * Created by j on 18/11/25.
 */

brick.reg('main_ctrl', function(){
    var scope = this;
    var $elm = this.$elm;

    var query = brick.utils.get_query() || {};
    var name = query.name;

    $('title').text(name);

    $.ajax({url:`/stock/concept/${name}`, dataType:'json'}).done(function(data){
        scope.render('list', data);
    });

});