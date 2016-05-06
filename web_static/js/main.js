/**
 * Created by chenjianhui on 16/4/26.
 */

require.config({
    baseUrl: '/js',
    shim: {
        'lib/jquery-ui': {
            deps: ['lib/jquery']
        },
        'lib/jquery.htmlClean': {
            deps: ['lib/jquery']
        },
        'lib/bootstrap': {
            deps: ['lib/jquery']
        },
        'lib/jquery.ztree.core': {
            deps: ['lib/jquery']
        }
    }
});

require(['afeTool'
        , 'lib/jquery-ui'
        , 'lib/jquery.htmlClean'
        , 'lib/bootstrap'
        , 'lib/jquery.ztree.core'
        , 'lib/codemirror/lib/codemirror'
        , 'lib/codemirror/addon/hint/show-hint'
        , 'lib/codemirror/addon/hint/xml-hint'
        , 'lib/codemirror/addon/hint/html-hint'
        , 'lib/codemirror/addon/hint/javascript-hint'
        , 'lib/codemirror/addon/hint/css-hint'
        , 'lib/codemirror/mode/javascript/javascript'
        , 'lib/codemirror/mode/htmlmixed/htmlmixed'
        , 'lib/codemirror/mode/css/css'],
    function (afeTool
        , jqueryUI
        , htmlClean
        , bootstrap
        , ztree
        , CodeMirror
        , showHint
        , xmlHint
        , htmlHint
        , javascriptHint
        , cssHint
        , cm_javascript
        , cm_htmlmixed
        , cm_css) {

        var TabManager = {
            contextMenu: null,
            currentLiveTab: null,
            currentRightLiveTab: null,
            tabContent: null,//对应dom里面的tabContent
            tabList: null,//对应dom的tabList容器
            tab_memory: [],//存储已经打开的文件
            operateEditor: null,
            afeCodePreView: null,
            refreshPreviewBtn: null,
            tabIndex: 1,
            _codePreViewDelay: 0,
            _saveFileUrl: "/manage/saveFile",
            init: function () {
                var _self = this;
                _self.contextMenu = $(".contextMenu");
                _self.tabList = $("#afe-tabList");
                _self.tabContent = $("#afe-tabContent");
                _self.operateEditor = $(".afe-operate-area");
                _self.afeCodePreView = $("#afeCodePreview");
                _self.refreshPreviewBtn = $(".btn-preview-refresh");

                _self.initEvent();
            },
            initEvent: function () {
                var _self = this;
                //右键菜单
                _self.tabList.on("contextmenu", ".afe-tabItem", _self.on_showContextMenu);

                //隐藏右键菜单
                _self.operateEditor.on("click", function () {
                    _self.on_hideContextMenu();
                });

                /***
                 * 刷新的按钮,暂时弃用
                 */
                _self.refreshPreviewBtn.on("click", function () {
                    //_self.afeCodePreView.reload(true);
                })

                //组织ctrl+s保存
                $(window).off("keydown.codemirror").on("keydown.codemirror", function () {
                    if (window.event.ctrlKey && (window.event.keyCode == 83)) {
                        if (_self.currentLiveTab.hasClass("tab-warning-hack")) {
                            _self._onSaveFileDate(_self.currentLiveTab.find("a").attr("aria-controls"));
                        }

                    }
                });

                _self.contextMenu.on("click", ".menu-close-btn", _self.on_contextMenuDel)
                    .on("click", ".menu-save-btn", _self.on_contextMenuSave);

            },
            /***
             * 右键保存
             */
            on_contextMenuSave: function () {
                if (TabManager.currentRightLiveTab.hasClass("tab-warning-hack")) {
                    TabManager._onSaveFileDate(TabManager.currentRightLiveTab.find("a").attr("aria-controls"));
                }
                TabManager.on_hideContextMenu();
            },
            /***
             * 初始化code编辑器
             */
            iniCodeMiiror: function (pannel, treeNode) {
                var _self = this;
                var textarea = pannel.find(".afecodeTextarea")[0];

                var mode = "text/html";
                switch (treeNode.ext) {
                    case "fhtml":
                        mode = "text/html";
                        break;
                    case "css":
                        mode = "text/css";
                        break;
                    case "js":
                        mode = "text/javascript";
                        break;
                    case "txt":
                        mode = "text";
                        break;
                }
                var codeMirror = CodeMirror.fromTextArea(textarea, {
                    mode: mode
                    ,extraKeys: {"Alt-/": "autocomplete"}
                });

                if (treeNode.ext == "fhtml") {
                    codeMirror.on("change", function () {
                        clearTimeout(TabManager._codePreViewDelay);
                        TabManager.textChangeListener(pannel);
                        TabManager._codePreViewDelay = setTimeout(TabManager.timerCallFunc(_self.afeCodePreView[0], codeMirror), 300);
                    });
                    TabManager.updatePreview(_self.afeCodePreView[0], codeMirror);
                } else {
                    codeMirror.on("change", function () {
                        TabManager.textChangeListener(pannel);
                    });
                }
                return codeMirror;
            },
            /***
             * 内容发生改变的监听
             */
            textChangeListener: function (pannel) {
                this.tabList.find(".afe-tabItem.active").addClass("tab-warning-hack");
            },
            /***
             * codemirror定时任务
             * @param previewFrame
             * @param codeMiirror
             * @returns {Function}
             */
            timerCallFunc: function (previewFrame, codeMiirror) {
                return function () {
                    TabManager.updatePreview(previewFrame, codeMiirror);
                }
            },
            /***
             * 更新preview
             * @param previewFrame
             * @param codeMiirror
             */
            updatePreview: function (previewFrame, codeMiirror) {
                var preview_doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
                preview_doc.open();
                preview_doc.write(codeMiirror.getValue());
                preview_doc.close();
                //只有预览界面加载完成之后才能初始化编辑的界面
                $(preview_doc).ready(function () {
                   setTimeout(ManageMain.initEditView,200);
                })

            },
            /**
             * 创建新的tab
             *同时只能打开一个fhtml文件
             *
             */
            on_addNewTab: function (treeNode, fileData) {
                var _self = this;
                var _id = "tab_file_" + _self.tabIndex * 1;
                //生成一个tab
                _self.makeTabView(_id, treeNode);
                _self.makeTabContentView(_id, treeNode, fileData);
                _self.tabIndex++;
            },
            /**
             * tab上的鼠标右键事件
             */
            on_showContextMenu: function (event) {
                var _self = this;
                var mouseX = event.pageX;
                var mouseY = event.pageY - 50;
                event.preventDefault();
                TabManager.currentRightLiveTab = $(event.currentTarget);//设置当前右键激活的tab
                TabManager.contextMenu.css({"left": mouseX, top: mouseY});
                TabManager.contextMenu.show();
            },

            /**
             * 隐藏右键菜单方法
             */
            on_hideContextMenu: function () {
                this.contextMenu.hide();
            },

            /**
             *移除tab的操作
             * 移除面板需要注意几项
             * 1.提示可能需要删除已经保存的数据,是否继续
             * 2.
             */
            on_contextMenuDel: function () {
                if (!TabManager.currentRightLiveTab) {
                    var content = "当前没有激活的tab!";
                    alert(content);
                    return;
                }
                var _id = TabManager.currentRightLiveTab.find("a").attr("aria-controls");
                var _tabContent = TabManager.tabContent.find("#" + _id);
                var _tab = TabManager.currentRightLiveTab;
                //删除tab的时候需要检查tab是否需要保存
                if (_tab.hasClass("tab-warning-hack")) {
                    _self._onSaveFileDate(_id, function () {
                        _tabContent.remove();//移除内容区域
                        _tab.remove();//移除自身tab
                        for (var i = 0, mlen = TabManager.tab_memory.length; i < mlen; i++) {
                            if (TabManager.tab_memory[i].id == _id) {
                                TabManager.tab_memory.splice(i, 1);//删除已经删除掉的tab的对应数据
                            }
                        }
                    });
                } else {
                    _tabContent.remove();//移除内容区域
                    _tab.remove();//移除自身tab
                    for (var i = 0, mlen = TabManager.tab_memory.length; i < mlen; i++) {
                        if (TabManager.tab_memory[i].id == _id) {
                            TabManager.tab_memory.splice(i, 1);//删除已经删除掉的tab的对应数据
                        }
                    }
                }
                TabManager.on_hideContextMenu();
            },

            /**
             * 生成tab的视图
             * @param id
             * @param text
             */
            makeTabView: function (id, treeNode) {
                this.tabList.append("<li role='presentation' class='afe-tabItem'><a href='#" + id + "' aria-controls='" + id + "' data-fileType='" + treeNode.ext + "' role='tab' data-toggle='tab' data-status='0'>" + treeNode.name + "</a></li>");
            },

            /**
             * 生成tabContent
             * 在编辑的时候,会传进来响应的数据
             * 这里需要用到一个我们自己定义的数据类型匹配器,因为这里操作几乎都在前端做,所以不能用freemarker的宏定义样式了
             * @param id
             * @param data
             */
            makeTabContentView: function (id, treeNode, fileData) {
                var pannel = $("<div role='tabpanel' class='tab-pane' id='" + id + "'>" +
                    "<textarea class='afecodeTextarea'>" + fileData + "</textarea>" +
                    "</div>");
                this.tabContent.append(pannel);
                this.makeTabCallBack(id);
                var codeMirror = this.iniCodeMiiror(pannel, treeNode);
                this.tab_memory.push({id: id, path: treeNode.path, name: treeNode.name, codeMirror: codeMirror});
            },
            /***
             * 创建tab之前的检验
             * @param treeNode
             */
            makeTabCheck: function (treeNode) {
                var _self = this;
                if (!_self.tab_memory && _self.tab_memory.length <= 0) {
                    return true;
                }
                //遍历所有已经打开的页面
                for (var i = 0; i < _self.tab_memory.length; i++) {
                    if (_self.tab_memory[i].path == treeNode.path) {//此时双击的页面是否已经打开,如果已经打开则选中当前tab
                        _self.tabList.find(".afe-tabItem a[aria-controls='" + _self.tab_memory[i].id + "']").tab("show");
                        return false;
                    }
                }
                if (treeNode.ext == "fhtml") {//不是,则查找页面里面是否有fhtml,同一个时间只能编辑一个fhtml
                    var fhtml = _self.tabList.find(".afe-tabItem a[data-filetype='fhtml']");
                    if (fhtml.size() > 0) {
                        if (confirm("同一时间只能打开一个fhtml文件,继续将关闭原来的文件,确定继续?")) {
                            for (var i = 0; i < _self.tab_memory.length; i++) {
                                if (_self.tab_memory[i].id == fhtml.attr("aria-controls")) {
                                    _self.tab_memory.splice(i, 1);
                                }
                            }
                            fhtml.parent().remove();//移除内容区域
                            _self.tabContent.find("#" + fhtml.attr("aria-controls")).remove();//移除自身tab
                        } else {
                            return false;
                        }
                    }
                }

                return true;
            },

            /***
             * 生成tab的回调方法
             * 此方法需要做的事情:
             * 判断当前创建的tab是否是第一个,如果是则需要激活当前的tab
             */
            makeTabCallBack: function (id) {
                this.tabList.find(".afe-tabItem a[aria-controls='" + id + "']").tab("show");
                this.currentLiveTab = this.tabList.find(".afe-tabItem a[aria-controls='" + id + "']").parent();
            },

            /***
             * 移除tab的回调方法
             */
            removeTabCallBack: function (tab) {
                var tab_needActive = $(".afe-tabItem:last-child");
                if (tab.hasClass("active")) {
                    tab_needActive.find("a").tab('show');
                    this.currentLiveTab = tab_needActive;
                }
            },
            /***
             * 保存页面
             * @private
             */
            _onSaveFileDate: function (id, callback) {
                if (!TabManager.tab_memory) {
                    return;
                }
                var _tab;
                for (var i = 0; i < TabManager.tab_memory.length; i++) {
                    _tab = TabManager.tab_memory[i];
                    if (_tab.id == id) {
                        break;
                    }
                }
                //找到对应的tab数据
                if (_tab) {
                    $.ajax({
                        type: "post",
                        url: TabManager._saveFileUrl,
                        data: {fileName: _tab.path, fileData: _tab.codeMirror.getValue()},
                        success: function (response) {
                            if (response.code == 1) {
                                //保存文件成功
                                TabManager.tabList.find(".afe-tabItem").removeClass("tab-warning-hack");
                                if (callback) {
                                    callback();
                                }
                            } else {
                                alert("保存文件失败");
                            }
                        }, error: function () {

                        }
                    })
                }
            }
        }

        /***
         * MainManage
         * @type {{currentDocument: null, timerSave: number, editor: null, projectTreeSetting: null, projectTree: null, projectFileUrl: string, componentBarBtn: null, projectBtn: null, mouseMenu: null, projectwindow: null, currentTreeNode: null, newFileModal: null, newDirModal: null, renameModal: null, confirmModal: null, mkNewFileUrl: string, mkNewDirUrl: string, delUrl: string, renameUrl: string, ajaxGetFile: string, projectName: string, devCodeBtn: null, Body: null, _codeMirror_fhtml: null, _codeMirror_js: null, _codeMirror_css: null, afeCodeTextArea_fhtml: null, currentFileHtml: null, surportFileType: string[], init: Function, initProjectTree: Function, addEvent: Function, initGridRowDragable: Function, initCoponentsDragable: Function, initEditorSortable: Function, initClomunSortable: Function, onDelFileOrDir: Function, treeOnRightClick: Function, treeOnDBClick: Function}}
         */
        var ManageMain = {
            currentDocument: null,
            timerSave: 2e3,
            editor: null,
            projectTreeSetting: null,
            projectTree: null,
            projectFileUrl: "/manage/getProjectFile",
            componentBarBtn: null,
            projectBtn: null,
            mouseMenu: null,
            projectwindow: null,
            currentTreeNode: null,
            newFileModal: null,
            newDirModal: null,
            renameModal: null,
            confirmModal: null,
            mkNewFileUrl: "/manage/makeFile",
            mkNewDirUrl: "/manage/makeDir",
            delUrl: "manage/del",
            renameUrl: "/manage/rename",
            ajaxGetFile: "manage/ajaxGetFile",
            projectName: "",
            devCodeBtn: null,//编辑按钮
            Body: null,
            _codeMirror_fhtml: null,
            _codeMirror_js: null,
            _codeMirror_css: null,
            afeCodeTextArea_fhtml: null,
            currentFileHtml: null,
            exportBtn:null,
            surportFileType: ["js", 'fhtml', 'css', 'txt'],
            init: function () {
                var _self = this;

                _self.Body = $("body");
                _self.componentBarBtn = $(".componentBarBtn");
                _self.projectBtn = $(".projectWindowBtn");
                _self.mouseMenu = $(".mouse-menu");
                _self.projectwindow = $(".projectwindow");
                _self.newFileModal = $("#newFileModal");
                _self.newDirModal = $("#newDirModal");
                _self.renameModal = $("#renameModal");
                _self.confirmModal = $("#confirmModal");
                _self.devCodeBtn = $("#button-develop-code");
                _self.afeCodeTextArea_fhtml = $("#afeCodeTextArea_fhtml");
                _self.exportBtn = $("#button-export");

                _self.currentDocument = null;
                _self.timerSave = 2e3;
                _self.editor = $(".editor");

                _self.projectTreeSetting = {
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onRightClick: _self.treeOnRightClick,
                        onDblClick: _self.treeOnDBClick
                    }
                };
                _self.initProjectTree();
                _self.addEvent();
                TabManager.init();
            },
            /***
             * 初始化项目树
             */
            initProjectTree: function () {
                var _self = this;

                var projectName = localStorage.getItem("projectName");

                if (!projectName) {
                    alert("打开项目失败");
                    return;
                }

                _self.projectName = projectName;

                $.ajax({
                    type: "post",
                    url: _self.projectFileUrl,
                    data: {projectName: projectName},
                    dataType: "json",
                    success: function (response) {
                        if (response.code == 1) {
                            _self.projectTree = $.fn.zTree.init($("#projectTree"), _self.projectTreeSetting, response.data);
                        }
                    }, error: function () {

                    }
                });
            },
            addEvent: function () {

                var _self = this;

                //左边组件栏的展开和关闭那妞
                _self.componentBarBtn.on("click", function () {
                    var btn_self = $(this);
                    if (btn_self.hasClass("glyphicon-menu-left")) {//目前展开
                        _self.Body.addClass("hideComponent");
                        btn_self.removeClass("glyphicon-menu-left").addClass("glyphicon-menu-right");
                    } else {
                        _self.Body.removeClass("hideComponent");
                        btn_self.removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
                    }
                });

                /***
                 * 右边项目窗口
                 */
                _self.projectBtn.on("click", function () {
                    var btn_self = $(this);
                    if (btn_self.hasClass("glyphicon-menu-right")) {//目前展开
                        _self.Body.addClass("hideProject");
                        btn_self.removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
                    } else {
                        _self.Body.removeClass("hideProject");
                        btn_self.removeClass("glyphicon-menu-left").addClass("glyphicon-menu-right");
                    }
                });

                /***
                 * 右键菜单隐藏
                 */
                _self.projectwindow.on("click", function () {
                    _self.mouseMenu.hide();
                });

                _self.mouseMenu.on("click", ".menu-item", function () {
                    var _item = $(this);

                    if (ManageMain.currentTreeNode == null) {
                        return;//当前操作的节点为空,返回
                    }

                    switch (_item.data("menurole")) {
                        case "newfile"://新建文件
                            console.log("新建文件");
                            _self.newFileModal.modal("show");
                            break;
                        case "newdir"://新建文件夹
                            console.log("新建文件夹");
                            _self.newDirModal.find(".fileName").val("").end().find(".modal-title").text("新建文件夹").end().modal("show");
                            break;
                        case "rename"://重命名
                            console.log("重命名");
                            var fileName = _self.currentTreeNode.name;
                            var realName = fileName, fileExt;
                            if (fileName.indexOf(".") >= 0) {
                                realName = fileName.substring(0, fileName.indexOf("."));
                                fileExt = fileName.substring(fileName.indexOf("."));
                            }
                            _self.renameModal.find(".fileExt").val(fileExt).end()
                                .find(".fileName").val(realName).end()
                                .find(".oldFileName").val(fileName).end()
                                .find(".modal-title").text("重命名").end().modal("show");
                            break;
                        case "del"://删除文件
                            console.log("删除文件");
                            _self.onDelFileOrDir();
                            break;
                    }
                    _self.mouseMenu.hide();
                });

                /***
                 * 新建文件确定事件
                 */
                _self.newFileModal.on("click", ".btn-confirm", function () {

                    var fileName = _self.newFileModal.find(".fileName").val();
                    var fileType = _self.newFileModal.find(".fileType").val();

                    fileName = _self.currentTreeNode.getFilePath() + "/" + fileName;

                    if (fileName) {
                        $.ajax({
                            type: "post",
                            url: _self.mkNewFileUrl,
                            data: {fileName: fileName, fileType: fileType},
                            success: function (response) {
                                console.log(response);
                                if (response.code == 1) {
                                    _self.initProjectTree();
                                } else {
                                    alert(response.msg);
                                }
                            }, error: function (err) {
                                console.log(err);
                            }
                        })
                    }
                });

                /***
                 * 新建目录
                 */
                _self.newDirModal.on("click", ".btn-confirm", function () {
                    var fileName = _self.newDirModal.find(".fileName").val();
                    fileName = _self.currentTreeNode.getFilePath() + "/" + fileName;
                    if (fileName) {
                        $.ajax({
                            type: "post",
                            url: _self.mkNewDirUrl,
                            data: {fileName: fileName},
                            success: function (response) {
                                console.log(response);
                                if (response.code == 1) {
                                    _self.initProjectTree();
                                } else {
                                    alert(response.msg);
                                }
                            }, error: function (err) {
                                console.log(err);
                            }
                        })
                    }
                });

                /***
                 * 重命名
                 */
                _self.renameModal.on("click", ".btn-confirm", function () {
                    var fileName, fileExt, oldFileName;
                    fileName = _self.renameModal.find(".fileName").val();
                    fileExt = _self.renameModal.find(".fileExt").val();
                    oldFileName = _self.renameModal.find(".oldFileName").val();
                    if (fileName == "" && !/\w\d/.test(fileName)) {
                        alert("名称不合法,不能为空,且是英文字母");
                        return;
                    }

                    fileName = fileName + fileExt;
                    oldFileName = _self.currentTreeNode.getFilePath();

                    $.ajax({
                        type: "post",
                        url: _self.renameUrl,
                        data: {fileName: fileName, oldFileName: oldFileName},
                        success: function (response) {
                            if (response.code == 1) {
                                _self.initProjectTree();
                            } else {
                                alert(response.msg);
                            }
                        }, error: function (e) {
                            console.log(e);
                        }
                    })
                });

                /***
                 * 点击编码按钮
                 */
                _self.devCodeBtn.on("click", function () {
                    _self.Body.removeClass("editView").addClass("devcodeview");
                    afeTool.removeMenuClasses();
                    $(this).addClass("active");
                    var html = afeTool.makeUpDevCode($(".editor").html());
                    TabManager.afeCodePreView.contents().find("body").html(html);
                    var id = TabManager.currentLiveTab.find("a").attr("aria-controls");
                    for(var i=0;i<TabManager.tab_memory.length;i++){
                        if(TabManager.tab_memory[i].id == id){
                            var iframeDoc = TabManager.afeCodePreView[0].contentDocument || TabManager.afeCodePreView[0].contentWindow.document
                            TabManager.tab_memory[i].codeMirror.setValue(iframeDoc.documentElement.innerHTML);
                            break;
                        }
                    }
                    return false
                });

                _self.exportBtn.on("click",function(){
                   alert("导出功能有待完善");
                });

                $(window).resize(function () {
                    $("body").css("min-height", $(window).height() - 90);
                    $(".editor").css("min-height", $(window).height() - 160)
                });

                $("body").css("min-height", $(window).height() - 90);
                $(".editor").css("min-height", $(window).height() - 160);

                _self.initEditorSortable();
                _self.initClomunSortable();
                _self.initGridRowDragable();
                _self.initCoponentsDragable();

                /***
                 * ps:暂时不消除这个按钮
                 */
                $("[data-target=#downloadModal]").click(function (e) {
                    e.preventDefault();
                    var html = afeTool.removeModualTag($(".editor").html()).html();
                    $("#download-layout").html(html);
                    $("#downloadModal textarea").empty();
                    $("#downloadModal textarea").val(html);
                });

                $("#download").click(function () {
                    return false
                });

                $("#downloadhtml").click(function () {
                    downloadHtmlLayout();
                    return false
                });

                /***
                 * 编辑按钮点击事件
                 *
                 * 1.将界面设置成可编辑状态
                 * 2.代码的
                 */
                $("#editBtn").click(function () {
                    _self.Body.removeClass("devcodeview").addClass("editView");
                    afeTool.removeMenuClasses();
                    $(this).addClass("active");
                    _self.initEditView();
                    return false;
                });

                $("#clear").click(function (e) {
                    e.preventDefault();
                    afeTool.clearEditor()
                });

                $("#sourcepreviewBtn").click(function () {
                    $("body").removeClass("editView").addClass("devcodeview");
                    afeTool.removeMenuClasses();
                    $(this).addClass("active");
                    return false
                });
                $(".nav-header").click(function () {
                    $(".left-component-bar .boxes, .left-component-bar .rows").hide();
                    $(this).next().slideDown()
                });

                afeTool.removeElm();
                afeTool.configurationElm();
                afeTool.gridSystemGenerator();
                setInterval(function () {
                    afeTool.handleSaveLayout()
                }, _self.timerSave);

                $('#modal-download-sign-in-button').click(function (event) {
                    $('.help-inline').hide();
                    var form = $('#boxDownloadLoginForm');
                    var ajaxLoginUrl = '/login/ajaxLogin';
                    jQuery.ajax({
                        type: "post",
                        dataType: "json",
                        url: ajaxLoginUrl,
                        data: form.serialize(),
                        success: function (response) {
                            if (response.success) {
                                $('#download-not-logged').hide();
                                $('#download').removeClass('hide');
                                $('#download').show();
                                $('#downloadhtml').removeClass('hide');
                                $('#downloadhtml').show();
                                $('#download-logged').removeClass('hide');
                                $('#download-logged').show();
                            } else {
                                if (response.errors && response.errors.length > 0) {
                                    $.each(response.errors, function (i, item) {
                                        $('#' + item.field + '-download-error').html(item.error);
                                        $('#' + item.field + '-download-error').show();
                                    });
                                }
                            }
                        },
                        error: function (response) {
                            alert("获取项目文件出错了");
                        }
                    });

                    return false;
                });
            },
            /***
             * 初始化编辑界面
             */
            initEditView: function () {
                var _self = ManageMain;
                var editorContent = TabManager.afeCodePreView.contents().find("body").clone();
                var edit_pre = afeTool.findModuleTag(editorContent);
                if (edit_pre.find(".container").size() > 0) {
                    // afeTool.changeStructure(edit_pre, "row", "row-fluid");
                    _self.editor.html(edit_pre.find(".container").first().html());
                } else {
                    _self.editor.html(edit_pre.html());
                }
                _self.initClomunSortable();
            },
            /***
             * 初始化栅栏的拖拽
             */
            initGridRowDragable: function () {
                var _self = this;
                $(".left-component-bar .grid-row").draggable({
                    connectToSortable: ".editor",
                    helper: "clone",
                    handle: ".draghandler",
                    drag: function (e, t) {
                        t.helper.width(400)
                    },
                    stop: function (e, t) {
                        _self.initClomunSortable();
                    }
                });
            },
            /***
             * 初始化组件的拖拽事件
             */
            initCoponentsDragable: function () {
                $(".left-component-bar .box").draggable({
                    connectToSortable: ".afe-column",
                    helper: "clone",
                    handle: ".draghandler",
                    drag: function (e, t) {
                        t.helper.width(400)
                    },
                    stop: function () {
                        afeTool.handleJsIds();
                        afeTool.handleViewIds();
                    }
                });
            },
            /***
             * 初始化Edtor的sortable
             */
            initEditorSortable: function () {
                var _self = this;
                _self.editor.sortable({
                    connectWith: ".afe-column",
                    opacity: .35,
                    handle: ".draghandler"
                });
            },
            /***
             * 初始化列的sortable
             */
            initClomunSortable: function () {
                var _self = this;
                _self.editor.find(".afe-column").sortable({
                    connectWith: ".afe-column",
                    opacity: .35,
                    handle: ".draghandler"
                });
            },
            /***
             * 删除文件或者文件夹
             */
            onDelFileOrDir: function () {
                var _self = this;
                var noticeContent = "确定要删除该文件?";

                var fileName = _self.currentTreeNode.getFilePath();
                var fileType = _self.currentTreeNode.getNodeFileType();

                if (fileType == "dir") {
                    noticeContent = "删除该文件夹将同时删除里面的文件,继续?";
                }

                if (confirm(noticeContent)) {
                    $.ajax({
                        type: "post",
                        url: _self.delUrl,
                        data: {fileName: fileName},
                        success: function (response) {
                            console.log(response);
                            if (response.code = 1) {
                                _self.initProjectTree();
                            } else {
                                alert(response.msg);
                            }
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    })
                }
            },
            /**
             *书上的节点点击的操作
             * @param event
             * @param treeId
             * @param treeNode
             */
            treeOnRightClick: function (event, treeId, treeNode) {
                var mouseX = event.pageX;
                var mouseY = event.pageY - 50;
                switch (treeNode.getNodeFileType()) {
                    case "root"://根节点
                        ManageMain.mouseMenu.find(".menu-item").show()
                            .end().find(".menu-item[data-menurole='del']").hide()
                            .end().css({"left": mouseX, top: mouseY}).show();
                        break;
                    case "file"://文件
                        ManageMain.mouseMenu.find(".menu-item").show()
                            .end().find(".menu-item[data-menurole='newdir']").hide()
                            .end().find(".menu-item[data-menurole='newfile']").hide()
                            .end().css({"left": mouseX, top: mouseY}).show();
                        break;
                    case "dir"://目录
                        ManageMain.mouseMenu.find(".menu-item").show()
                            .end().css({"left": mouseX, top: mouseY}).show();
                        break;
                }
                ManageMain.currentTreeNode = treeNode;
            },
            /***
             * treeNode双击事件
             * @param event
             * @param treeId
             * @param treeNode
             */
            treeOnDBClick: function (event, treeId, treeNode) {
                var filePath = treeNode.path;
                switch (treeNode.type) {
                    case "file"://文件
                        var fileExt = treeNode.ext;
                        if ($.inArray(fileExt, ManageMain.surportFileType) < 0) {
                            alert("暂时不支持的文件类型");
                            return;
                        }
                        $.ajax({
                            type: "post",
                            url: ManageMain.ajaxGetFile,
                            data: {fileName: filePath},
                            success: function (response) {
                                if (response.code == 1) {
                                    if (TabManager.makeTabCheck(treeNode)) {
                                        TabManager.on_addNewTab(treeNode, response.data);
                                    }
                                } else {
                                    alert(response.msg);
                                }
                            }, error: function (e) {
                                console.log(e);
                            }
                        })
                        break;
                }

                ManageMain.currentTreeNode = treeNode;
            }
        };

        ManageMain.init();
    });