/**
 *  处理apple script发过来的http请求
 * Created by j on 2019-08-22.
 */

import helper from '../../../../renderer/pages/viewer/helper';
import setting from '../../../../libs/setting'

export default {

    rename: () => {
        let dir = setting.get('viewer.MQ_DIR');
        let crop = setting.get('viewer.crop');
        let arr = helper.getImages(dir, true);
        helper.renameByOcr(dir, crop, (info) => {
            console.log(info);
        });
    }


};
