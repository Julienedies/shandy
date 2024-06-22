/**
 *
 * Created by julien on 2024/6/22.
 */


export default {

    /**
     * 更改热点2023到热点2023-B
     */
    setTo: function (viewerJodb) {

        let result = [];

        viewerJodb.each((item, i) => {

            let d = item.d; // 日期
            let code = item.code;
            let fullPath = item.img;
            if (!d || !code) {
                let arr = fullPath.match(/\d{6}(?=\.png$)/) || [];
                code = arr[0];
                let f2 = fullPath.replace('上午', 'am').replace('下午', 'pm');

                let arr2 = f2.match(/(\d{4}-\d{2}-\d{2})\s*[ap]m\d{1,2}\.\d{1,2}\.\d{1,2}/);
                //console.log(f2, arr2);
                d = arr2[1];

                //console.log(fullPath, i);

                item.d = d;
                item.code = code;
            }

            let arr3 = d.split('-');
            // 如果图片日期为2023年，并且在8月份以后，如果有system标签里有热点2023的id，则替换成热点2023-b的id
            let y = arr3[0];
            let m = arr3[1];

            let system = item.system;

            // 2023:3290846, 2023-B: id_1718946154869_74907  2024:7032958
            if (system && y * 1 === 2024) {
                let systemIndex = system.indexOf('');
                if (systemIndex > -1) {
                    //system[systemIndex] = '';
                    result.push(item);
                }
            }

        });

        console.log(result);
        viewerJodb.save();
    },

    /**
     * 检测viewerJson里的重复数据，可能是多个窗口同时修改viewerJson造成的；
     * @param viewerJodb
     */
    checkRepeat: function (viewerJodb) {
        let imgArr = viewerJodb.get();
        let map = {};
        let result = [];
        let r2 = [];
        imgArr.forEach((item) => {
            let id = item.id;
            let img = item.img;
            let arr = map[id] = map[id] || [];
            let arr2 = map[img] = map[img] || [];
            arr.push(item);
            arr2.push(item);
        });

        for (let i in map) {
            let arr = map[i];
            // 是否有多个相同的img路径或id
            if (arr.length > 1) {
                let b = arr[0];
                let id = b.id;
                b.id = `id_${ b.timestamp }`;
                /* if (confirm(`是否修改此项${ id } ：\r\n ${ JSON.stringify(b, null, '\t') }`)) {
                     viewerJodb.set(b);
                 }*/

                /*arr.forEach((v) =>{
                    r2.push(v);
                });*/
                result.push(arr);
            }
        }

        console.log(result);
        let r3 = result.filter((a) => {
            return JSON.stringify(a[0]) === JSON.stringify(a[1]);
        });

        //console.log(JSON.stringify(r3, null, '\t'));
    }
}
