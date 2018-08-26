/**
 * Created by j on 18/8/5.
 * 简单指令合集
 */

/**
 * Created by j on 18/8/11.
 */

brick.directives.reg({
    name: 'ic-popup',
    selfExec: true,
    once: true,
    fn: function () {

        var on_show_cla = 'on-ic-popup-show';
        var $body = $(document.body);

        function on_show($popup){
            $popup.on('scroll', on_scroll);
            $popup.show();
            $popup.scrollTop(0);
            $body.addClass(on_show_cla);
        }

        function on_hide($popup){
            $popup.off('scroll', on_scroll);
            $popup.hide();
            $popup[0].scrollTop = 0;
            $body.removeClass(on_show_cla);
        }

        function on_scroll (e){
            e.stopPropagation();
        }

        // jquery接口
        $.fn.icPopup = $.fn.icPopup || function(opt){
            opt ? on_show(this) : on_hide(this);
        };

        $body.on('click', '[ic-popup-target]', function (e) {
                var name = $(this).attr('ic-popup-target');
                var $popup = $('[ic-popup=?]'.replace('?', name));
                on_show($popup);
                //$body.scrollTop() + $body.height()
            })
            .on('click', '[ic-popup-close]', function(e){
                var name = $(this).attr('ic-popup-close');
                var $popup = name ? $('[ic-popup=?]'.replace('?', name)) : $(this).closest('[ic-popup]');
                on_hide($popup);
            });
    }
});;


brick.directives.reg('ic-input-select', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-input-select]', function (e) {

        });
    }
});

/**
 * 定义ic-toggle指令;
 */
brick.directives.reg('ic-toggle', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-toggle]', function (e) {
            var name = $(this).attr('ic-toggle');
            $('[ic-toggle-target=?]'.replace('?', name)).toggle();
        });
    }
});

/**
 * 定义ic-close指令;
 */
brick.directives.reg('ic-close', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-close]', function (e) {
            var $th = $(this);
            $th.closest('[ic-close-target]').toggle();
        });
    }
});

/**
 * 定义ic-checkbox指令;
 */
brick.directives.reg('ic-checkbox', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-checkbox]', function (e) {
            if(this !== e.target) return;
            var $th = $(this);
            if (this.hasAttribute('selected')) {
                $th.removeAttr('selected').removeClass('selected');
            } else {
                $th.attr('selected', true).addClass('selected');
            }
            $th.trigger('ic-checkbox.change', {name: $th.attr('ic-checkbox')});
        });
    }
});

/**
 * 定义ic-dom-clone指令;
 */
brick.directives.reg('ic-dom-clone', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-dom-clone]', function (e) {
            var $th = $(this);
            $th.prev('[ic-dom]').clone(true).insertBefore($th);
        });
    }
});

/**
 * 定义ic-dom-remove指令;
 */
brick.directives.reg('ic-dom-remove', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-dom-remove]', function (e) {
            var nextAll = $(this).nextAll('[ic-dom]');
            nextAll.length > 1 && nextAll.eq(nextAll.length - 1).remove();
        });
    }
});

