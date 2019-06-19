var fs = require('fs');
var path = require('path');

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
            console.log(files)
            // do something upload
            binding.value.call(el, files[0].path);
        });
    }
})


var app = new Vue({
    el: '#app',
    data: {
        url: null,
        currentIndex: -1,
        imgWrapHeight: 100,
        files: [],
        image: {
            src: null,
            height: 0,
            width: 0
        }
    },
    methods: {
        switchKeyborad: function (e) {
            //按键切换 上一张和下一张
            var keymaps = {
                37: this.prev,
                39: this.next,
            }
            keymaps[e.keyCode].call(this);
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
            //读取当前文件的目录
            var dir = path.dirname(obj);
            var fiels = fs.readdirSync(dir);
            var suffixs = ['.png', '.jpg', '.gif', '.bmp', '.tif', '.jp2', '.webp'];
            var currentIndex = 0;
            fiels.forEach(((value, index) => {
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
            //异步生成缩略图
            console.log(app.currentIndex)
            console.log(`文件打开：${obj}`)
            console.log(`files:${app.files}`)
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
            _image.onload = () => {
                console.log(_image.width)
                console.log(_image.height)

                //获取
                self.image.width = _image.width;
                self.image.height = _image.height;
                self.image.src = newValue;
            }
            _image.src = newValue;
            //
        }
    },
    created() {
        //注册ipc
        const {ipcRenderer} = require('electron')
        ipcRenderer.send('register');
        var self = this;
        ipcRenderer.on('openFile', (event, url) => {
            self.openFile(url);
        })

        //测试用

    }
});
window.onload = window.onresize = function () {
    app.openFile('/Users/panjing/Downloads/8d5494eef01f3a29f863534d9725bc315d607c8e.jpg')

    var toolbar = 100;
    var height = document.body.offsetHeight;
    app.imgWrapHeight = height - toolbar;
    // app.$forceUpdate();
}