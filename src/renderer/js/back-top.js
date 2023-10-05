/**
 * Created by j on 17/9/10.
 */


export default function () {

    console.log('I am back-top.js.');

    let div = document.createElement('div');
    div.style.cssText = `
z-index:10001;
position:fixed;
bottom:24%;
right:62%;
width:94px;
height:64px;
background-color:rgba(0,0,0,0.5);
color:white;
text-align:center;
line-height:64px;
-webkit-user-select: none;
user-select: none;
cursor: pointer;`;

    div.title = '单击向上，双击向下';

    div.appendChild(document.createTextNode(' ^ '));

    div.onclick = function () {
        document.documentElement.scrollTop = document.body.scrollTop = 0;
    };
    div.ondblclick = function () {
        document.documentElement.scrollTop = document.body.scrollHeight - 100;
    };

// ----------------------------------------------------------------------
    setTimeout( () => {

        document.body.appendChild(div);

    }, 1000);


}

