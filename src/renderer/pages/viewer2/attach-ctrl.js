/**
 *
 * Created by j on 2020-01-01.
 */

/*import 'babel-polyfill'*/
import $ from 'jquery'

import utils from '../../../libs/utils'
import brick from '@julienedies/brick'
import path from 'path'
import ju from '../../../libs/jodb-user'

function getViewerDb () {
    return ju('viewer', [], {key: 'img'});
}



export default function (scope) {

    // 拷贝图片到目标目录，图片从父scope获取
    function copyImageToDist (dirPath) {
        let imgObj = scope.viewerCurrentImg;  // 从父scope获取
        let pathArr = imgObj.f.split(/\\|\//img);
        let fileName = pathArr.pop();
        let dirOfImg = pathArr.join('/')
        let distPath = path.normalize(`${ dirPath }/${ dirOfImg }/${ fileName }`);
        utils.copy(imgObj.f, distPath)
            .then(() => {
                $.icMessage(`${ imgObj.f } 已经拷贝到 => ${ distPath }.`);
            })
            .catch(err => {
                utils.err('error, 查看控制台.');
                console.error(err)
            });
    }

    // 标记错误, 已经废弃
    scope.markMistake = () => {
        //copyImageToDist('/Users/j/截图/交易错误/');
    };

    // 标记行情，把竞价系统获交易记录里的图片复制到对应的行情记录文件夹
    scope.markQuotation = () => {
        let imgObj = scope.viewerCurrentImg;
        let imgFullPath = imgObj.f;
        let distPath = imgFullPath;
        let pathArr = imgObj.f.split(/\\|\//img);
        let dayDir = pathArr[-2]; // 倒数第二位的日期目录
        // 交易记录里的日期目录是4位简写
        if (distPath.includes('交易记录') || /^\d{4}$/.test(dayDir)) {
            //let reg = /([\/\\]+)(\d{2})(\d{2})(?:-\d{2})?(\1)[\D]+(\d{4}-\d{2})/;
            let reg = /([\/\\]+)(\d{4}(?:-\d{2})?)(\1[\D]+)(\d{4}-\d{2})/;
            distPath = distPath.replace(reg, '$1$4$3$4');
            console.log(distPath);
        }
        distPath = distPath.replace(/交易记录|竞价系统/img, '目标行情');

        if (confirm(`是否复制\r\n ${ imgFullPath } \r\n到\r\n ${ distPath }?`)) {
            utils.copy(imgObj.f, distPath)
                .then(() => {
                    $.icMessage(`${ imgObj.f } \r\n已经拷贝到 =>\r\n ${ distPath }.`);
                    let viewerJodb = getViewerDb();
                    let result = viewerJodb.get2(imgFullPath, 'img');
                    if(typeof result === 'object'){
                        result.img = distPath;
                        delete result.id;
                        delete result.timestamp;
                        delete result.tradeInfo;
                        viewerJodb.set(result);
                    }
                })
                .catch(err => {
                    utils.err('error, 查看控制台.');
                    console.error(err)
                });
        }

    };

    // 回收站， 移动图片到对应目录的C文件夹
    scope.moveToTrash = () => {
        let imgObj = scope.viewerCurrentImg;
        let pathArr = imgObj.f.split(/\\|\//img);
        let fileName = pathArr.pop();
        let dirOfImg = pathArr.join('/')
        let trashPath = path.normalize(`${ dirOfImg }/C/${ fileName }`);
        utils.move(imgObj.f, trashPath)
            .then(() => {
                let viewerJodb = getViewerDb();
                viewerJodb.remove(imgObj.f, 'img');
                $.icMessage('ok!');
            })
            .catch(err => {
                utils.err('error, 查看控制台.');
                console.error(err);
            });
    };


    // 编辑图片， windows还没有完成
    scope.editImg = () => {
        let imgObj = scope.viewerCurrentImg;
        //utils.preview(imgObj.f);
    };

    // 打开图片所在文件夹
    scope.viewItemInFolder = () => {
        utils.showItemInFolder(scope.viewerCurrentImg.f);
    };

    // 通达信中查看
    scope.viewInTdx = () => {
        console.log(scope.viewerCurrentImg);
        utils.viewInTdx(scope.viewerCurrentImg.code);
    };

    // 富途牛牛中查看
    scope.viewInFtnn = () => {
        utils.viewInFtnn(scope.viewerCurrentImg.code);
    };


    // 标记图片
    scope.viewerMarkTag = () => {
        brick.emit('viewer-markTag', scope.viewerCurrentImg);
    };


}
