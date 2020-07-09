/**
 * 视图数据管理
 * Created by j on 20/7/5.
 */

export default function () {
    const list = [];
    let activeItem;
    return {
        get (isActiveItem) {
            return isActiveItem ? activeItem : list;
        },
        add (item) {
            if (!this.has(item)) {
                list.push(item);
                this.active(item);
            }
        },
        remove (item) {
            let index = this.getIndex(item);
            item = this.find(item);
            if (item) {
                if (activeItem === item) {
                    let nextItem = list[index + 1] || list[0];
                    nextItem && this.active(nextItem);
                }
                if (this.isUrl()) {
                    item.$webView.remove();
                } else {
                    item.$webView = null;
                }
                list.splice(index, 1);
            }
        },
        has (item) {
            return this.getIndex(item) !== -1;
        },
        isUrl () {
            return /\.html?$/img.test(this.url);
        },
        active (item) {
            item = this.find(item);
            if (activeItem) {
                activeItem.active = false;
                activeItem.$webView.hide();
            }
            item.active = true;
            item.$webView.show();
            activeItem = item;
        },
        getIndex (item) {
            return list.findIndex((v) => {
                return v.url === item.url;
            });
        },
        /**
         * 参数里的item只有url属性, 并不等于list里存储的item
         * @param item
         * @returns {null}
         */
        find (item) {
            let index = this.getIndex(item);
            return index !== -1 ? list[index] : null
        }
    }
}
