var fs = require('fs');
var path = require('path');
const {ipcRenderer} = require('electron')

Vue.directive('dragfile', {
    // 当被绑定的元素插入到 DOM 中时……
    bind: function (el, binding) {
        console.log(binding)
        console.log(binding.value)
        // 聚焦元素
        el.addEventListener('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        el.addEventListener("drop", function (e) {
            e.stopPropagation();
            e.preventDefault();
            var files = e.dataTransfer.files;
            if (files.length == 0) {
                return;
            }
            // do something upload
            binding.value.call(el, files[0].path);
        });
    }
});

Vue.directive('focus', {
    inserted: function (el) {
        el.focus();
    }
});


var app = new Vue({
    el: '#app',
    data: {
        top: false,
        t: null,//定时器
        url: null,
        toolbarHeight: 100,
        currentIndex: -1,
        currentName: '',
        isMouseEnter: true,
        files: [],
        image: {
            src: null,
            height: 0,
            width: 0,
            //旋转
            rotate: 0,
            //缩放
            zoom: 100
        },
        window: {
            width: 0,
            height: 0
        }
    },
    methods: {
        //设置缩放
        setScale(type) {

        },
        setTop() {
            this.top = !this.top;
            ipcRenderer.send('top', this.top);
        },
        rotate() {
            //图片向左旋转
            this.image.rotate -= 90;
        },
        mouseenter(e) {
            console.log('鼠标进入')
            this.isMouseEnter = true;
            if (this.t) {
                window.clearTimeout(this.t);
            }
        },
        mouseout(e) {
            console.log('鼠标离开')
            var self = this;
            this.t = window.setTimeout(function () {
                self.isMouseEnter = false;
            }, 3000);
        },
        switchKeyborad: function (e) {
            //按键切换 上一张和下一张
            var keymaps = {
                37: this.prev,
                39: this.next,
            }
            var fun = keymaps[e.keyCode];
            if (fun) {
                //切换的时候 一张出去，一张进来
                fun.call(this);
            }
            // console.log(e.keyCode)
        },
        prev: function () {
            //上一张
            if (this.currentIndex > 0) {
                this.currentIndex -= 1;
            } else {
                this.currentIndex = this.files.length - 1;
            }
        },
        next: function () {
            //下一张
            if (this.currentIndex >= this.files.length - 1) {
                this.currentIndex = 0;
            } else {
                this.currentIndex += 1;
            }
        },
        openFile: function (obj) {
            app.files = [];

            this.url = obj;

            this.$nextTick(() => {
                //渲染好界面后在读取文件夹下面的图片
                //读取当前文件的目录
                var dir = path.dirname(obj);
                var suffixs = ['.png', '.jpg', '.gif', '.bmp', '.tif', '.jp2', '.webp'];
                fs.readdir(dir, (err, files) => {
                    var currentIndex = 0;
                    files.forEach(((value, index) => {
                        var s = path.extname(value).toLocaleLowerCase();
                        if (suffixs.indexOf(s) != -1) {
                            var file = path.join(dir, value);

                            app.files.push(file);
                            if (file == obj) {
                                app.currentIndex = currentIndex;
                            } else {
                                currentIndex++;
                            }

                        }
                    }));
                });

            });

            //如果缩略图 异步生成缩略图
            console.log(app.currentIndex)
            console.log(`文件打开：${obj}`)
            console.log(`files:${app.files}`)
        },
        scale: function (w1, h1, w2, h2) {

            var v1 = w1 / w2;
            var v2 = h1 / h2;
            var r1 = w1, r2 = h1;

            let zoom = 1;

            if (w1 > w2) {
                r1 = w2;
                r2 = (w2 / w1) * h1;
                zoom = w2 / w1;
                if (r2 > h2) {
                    r2 = h2;
                    zoom = h2 / h1;
                    r1 = (h2 / h1) * w1;
                }
            }

            if (h1 > h2) {
                r2 = h2;
                zoom = h2 / h1;
                r1 = (h2 / h1) * w1;
                if (r1 > w2) {
                    r1 = w2;
                    zoom = h2 / h1;
                    r2 = (h2 / h1) * w1;
                }
            }

            return {
                width: r1,
                height: r2,
                zoom: zoom
            }
        }
    },
    watch: {
        currentIndex(newValue, oldValue) {

            this.url = this.files[newValue];
        },
        url(newValue, oldValue) {
            if (!newValue) {
                return
            }
            var self = this;
            var _image = new Image();
            if (self.image.rotate != 0) {
                self.image.src = '';
                self.image.rotate = 0;
            }
            _image.onload = () => {
                console.log(_image.width)
                console.log(_image.height)


                var width = self.window.width;
                var height = self.window.height;

                var result = this.scale(_image.width, _image.height, width, height);

                self.image.width = result.width;
                self.image.height = result.height;
                self.image.zoom = Math.round(result.zoom * 100);

                //获取
                self.image.src = newValue;
                self.currentName = path.basename(newValue);
            }
            _image.src = newValue;
            //
        }
    },
    created() {
        //注册ipc
        ipcRenderer.send('register');
        var self = this;
        ipcRenderer.on('openFile', (event, url) => {
            self.openFile(url);
        })
        this.$nextTick(() => {
            document.getElementById('app').style.display = 'block';
        })
        //测试用

    }
});
window.onload = function () {
    setSzie();
    app.openFile('/Users/panjing/Downloads/8d5494eef01f3a29f863534d9725bc315d607c8e.jpg')

}

function setSzie() {
    app.window = {
        height: document.body.offsetHeight - 100,
        width: document.body.offsetWidth
    }
}

window.onresize = function () {
    setSzie();
}
