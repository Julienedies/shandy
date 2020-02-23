/**
 *
 * Created by j on 20/2/20.
 */

let CW = document.documentElement.clientWidth;
let CH = document.documentElement.clientHeight;
//** 颜色类
Color = function (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b
};

Color.prototype = {
    copy: function () {
        return new Color(this.r, this.g, this.b);
    },
    add: function (c) {
        return new Color(this.r + c.r, this.g + c.g, this.b + c.b);
    },
    multiply: function (s) {
        return new Color(this.r * s, this.g * s, this.b * s);
    },
    modulate: function (c) {
        return new Color(this.r * c.r, this.g * c.g, this.b * c.b);
    },
    saturate: function () {
        this.r = Math.min(this.r, 1);
        this.g = Math.min(this.g, 1);
        this.b = Math.min(this.b, 1);
    }
};

Color.black = new Color(0, 0, 0);
Color.white = new Color(1, 1, 1);
Color.red = new Color(1, 0, 0);
Color.green = new Color(0, 1, 0);
Color.blue = new Color(0, 0, 1);
Color.yellow = new Color(1, 1, 0);
Color.cyan = new Color(0, 1, 1);
Color.purple = new Color(1, 0, 1);

//** 速率类
Vector2 = function (x, y) {
    this.x = x;
    this.y = y;
};

Vector2.prototype = {
    reset: function (x, y) {
        return new Vector2(x, y);
    },
    add: function (v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    },
    subtract: function (v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    },
    multiply: function (f) {
        return new Vector2(this.x * f, this.y * f);
    },
    negate: function () {
        return new Vector2(-this.x, -this.y);
    },
    sqrLength: function () {
        return this.x * this.x + this.y * this.y;
    },
    copy: function () {
        return new Vector2(this.x, this.y);
    },
    dot: function (v) {
        return this.x * v.x + this.y * v.y;
    },
    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    divide: function (f) {
        let invf = 1 / f;
        return new Vector2(this.x * invf, this.y * invf);
    },
    normalize: function () {
        let inv = 1 / this.length();
        return new Vector2(this.x * inv, this.y * inv);
    }
};

Vector2.zero = new Vector2(0, 0);

//** Canvas类 管理所有动画实体sprites
let Canvas = function (dom, w, h) {
    //关联dom元素
    this.dom = dom;
    this.w = w;
    this.h = h;
    //精灵字典
    this.sprites = [];
    //当前帧数
    this.frame;
    this.frameNum;
    //帧长
    this.stepTime;
    //触发器
    this.sT;
}

Canvas.prototype = {
    //初始化
    init: function () {
        this.fps = 0;
        //记录最后一帧的时间
        this.lastFrameTime = (new Date()).getTime();
        this.frame = 0;//当前帧数归0
        this.frameNum = 30;//每30帧计算一次fps
        this.stepTime = 1;//和fps成反比
    },
    //开始
    begin: function () {
        this.sT = setTimeout((function (param) {
            return function () {
                param.render();
            }
        })(this), this.stepTime);
    },
    //渲染,
    render: function () {
        //计算fps,参考oldj http://oldj.net/
        this.frame++;
        if (this.frame % this.frameNum == 0) {
            t = (new Date()).getTime();
            this.fps = Math.round((this.frameNum * 10000) / (t - this.lastFrameTime)) / 10;
            this.lastFrameTime = t;
            showFps(this.fps);
            // 动态调整 step_time ，保证 fps 恒定
            if (this.fps < 29.6 && this.stepTime > 10) {
                this.stepTime--;
            } else if (this.fps > 30.4) {
                this.stepTime++;
            }
        }
        //调用每个精灵的运动方程
        for (let i in this.sprites) {
            if (typeof (this.sprites[i]) == "function") continue;
            this.sprites[i].countMotionFun(this.stepTime);
        }
        this.sT = setTimeout((function (param) {
            return function () {
                param.render();
            }
        })(this), this.stepTime);
    },
    //添加动画元素
    addSprite: function (name, sprite) {
        sprite.ctx = this.dom;
        sprite.name = name;
        this.sprites[name] = sprite;
        this.dom.appendChild(sprite.dom);
    },
    //删除动画元素
    removeSprite: function (name) {
        if (this.sprites[name]) {
            this.dom.removeChild(this.sprites[name].dom);
            delete this.sprites[name];
        }
    },
    //停止动画
    stop: function () {
        clearInterval(this.sT)
    },
    clear: function () {
        for (let i in this.sprites) {
            if (typeof (this.sprites[i]) == "function") continue;
            delete this.sprites[i];
        }
    }
}

//** 精灵父类
let Sprite = function () {
};
Sprite.prototype = {
    //每个精灵对象自己的draw函数
    draw: function () {
    },
    //添加运动方式
    addMotionWay: function (fun) {
        this.motionFunc.push(fun);
    },
    //运动计算
    countMotionFun: function (stepTime) {
        for (let i = this.motionFunc.length; i--;) {
            this.motionFunc[i].call(this, stepTime / 100);
        }
        this.draw();
        if (this.isOverflow()) {
            //this.cont.removeSprite(this.name);
        }
        if (this.isCoincide(window.circle2)) {
            this.cont.removeSprite(window.circle2.name);
        }
    },
    //碰撞检测
    isCoincide: function (_obj2) {
        if (this != _obj2) {
            let _XDif = Math.abs(this.x() - _obj2.x());
            let _YDif = Math.abs(this.y() - _obj2.y());
            return (_XDif < this.width() && _YDif < this.height()) || (_XDif < _obj2.width() && _YDif < _obj2.height());
        }
    },
    //溢出检测
    isOverflow: function () {
        return (this.x() > 600 || this.x() < -50 || this.y() > 400 || this.y() < -50);
    },

    css: function (style) {
        for (let i in style) {
            this.dom.style[i] = style[i];
        }
    },

    x: function () {
        return Math.round(this.position.x);
    },
    y: function () {
        return Math.round(this.position.y);
    },
    width: function () {
        return Math.round(this.radius);
    },
    height: function () {
        return Math.round(this.radius);
    }
}

//显示fps
function showFps (fps) {
    //document.getElementById("fps").innerHTML = "FPS:" + fps;
}

//** 圆对象
let Circle = function (x, y, radius, color, cont) {
    //运动方程字典
    this.motionFunc = [];
    //位移矢量
    this.position = new Vector2(x, y);
    this.radius = radius;
    this.color = color;
    this.cont = cont;
    this.w = 700;
    this.h = 200;
    //设置样式
    this.dom = document.createElement("div");
    this.dom.appendChild(document.createTextNode(' ******************* '));
    this.dom.style.left = this.position.x + "px";
    this.dom.style.top = this.position.y + "px";
    this.dom.style.position = "absolute";
    this.dom.style.zIndex = '1000001';
    this.dom.style.width = radius + "px";
    this.dom.style.height = radius + "px";
/*    this.dom.style.cssText = `
z-index:10001;
background-color:rgba(0,0,0,0.5);
color:white;
text-align:center;
cursor: pointer;`;*/
    //this.dom.style.borderRadius = radius/2 + "px";
    /*		this.dom.style.backgroundColor ="rgba("
                + Math.floor(this.color.r * 255) + ","
                + Math.floor(this.color.g * 255) + ","
                + Math.floor(this.color.b * 255) + ","
                + "1)";
    */
}
//实现接口
Circle.prototype = new Sprite();
Circle.prototype.draw = function () {
    this.dom.style.left = this.position.x + "px";
    this.dom.style.top = this.position.y + "px";
}


let canvas;
let ctx;
let cont;
let i = 3;


//直线运动
function way0 (stepTime) {
    this.position = this.position.subtract(this.speed.multiply(stepTime));
    this.speed = this.speed.add(this.acceleration.multiply(stepTime));
}

//往返运动
function way1 () {
    if (this.position.x > CW || this.position.x < 0) {
        this.speed.x = -this.speed.x;
    }
    if (this.position.y > CH || this.position.y < 0) {
        this.speed.y = -this.speed.y;
    }
}

//360°自由方向
function direction () {
    let theta = Math.random() * 1 * Math.PI;
    return new Vector2(Math.cos(theta), Math.sin(theta));
}

//颜色变化
function colorChange (color1, color2) {
    let t = Math.random();
    return color1.multiply(t).add(color2.multiply(1 - t));
}

function add () {
    let circle = new Circle(600, 200, 10, colorChange(Color.blue, Color.red), cont);
    circle.acceleration = new Vector2(0, 0);
    //circle.speed=direction().multiply(100);
    circle.speed = new Vector2(Math.random() * 10 + 100, 0);
    circle.addMotionWay(way0);
    //circle.addMotionWay(way1);

    cont.addSprite("circle" + i, circle);
    i++;
}

function stop () {
    cont.stop();
}

function start () {
    ctx = document.getElementById('canvas');
    cont = new Canvas(ctx, CW, CH);
    //实例化一个圆
    //let circle1 = new Circle(10,200,20,Color.blue,cont);
    //初始化加速度矢量
    //circle1.acceleration=new Vector2(0, 10);
    //初始化速度矢量
    //circle1.speed=new Vector2(50, -50);
    //增加运动方式
    //circle1.addMotionWay(way0);
    //同上
    window.circle2 = new Circle(Math.random() * CW, Math.random() * CH, 80, Color.blue, cont);
    circle2.acceleration = new Vector2(Math.random() * 2, Math.random() * 2);
    circle2.speed = new Vector2(Math.random() * 10, Math.random() * 10);
    //直线运动
    circle2.addMotionWay(way0);
    circle2.addMotionWay(way1);
    //加入can对象
    //cont.addSprite("circle1",circle1);
    cont.addSprite("circle2", circle2);
    cont.init();
    cont.begin();

}

start();
