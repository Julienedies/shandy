/**
 * Created by j on 18/6/16.
 */

function screenshotWrap (){
    screenshot({
        returnType: 'dataUrl',
        crop: {x: 2372,y: 88, width: 220,height: 42},
        callback: function(dataUrl){
            baiduOcr({
                image: dataUrl,
                callback: showStock
            });
        }
    });
}