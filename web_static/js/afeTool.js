/**
 * Created by chenjianhui on 16/4/26.
 *
 * 主要用于拖拽
 *
 * 这是工具操作方法
 *
 */


define("afeTool", function () {

    var afeTool = {};

    afeTool.handleSaveLayout = function () {
        var e = $(".editor").html();
        if (e != window.editorHtml) {
            // this.saveLayout();
            window.editorHtml = e;
        }
    }

    /***
     * 分配随机id
     */
    afeTool.handleJsIds = function () {
        this.handleModalIds();//模态框随机id
        this.handleAccordionIds();//手风琴随机id
        this.handleCarouselIds();//幻灯片随机id
        this.handleTabsIds();//tab随机id
    }

    /***
     * 给view添加一个id
     */
    afeTool.handleViewIds = function () {
        var e = $(".editor section[data-aferole='afeView']");
        var t = afeTool.randomNumber();
        var n = "afeview-" + t;
        e.attr("id", n).removeAttr("data-aferole");
    }

    /***
     * 手风琴随机id
     */
    afeTool.handleAccordionIds = function () {
        var e = $(".editor #afeAccordion");
        var t = afeTool.randomNumber();
        var n = "panel-" + t;
        var r;
        e.attr("id", n);
        e.find(".panel").each(function (e, t) {
            r = "panel-element-" + afeTool.randomNumber();
            $(t).find(".panel-title").each(function (e, t) {
                $(t).attr("data-parent", "#" + n);
                $(t).attr("href", "#" + r)
            });
            $(t).find(".panel-collapse").each(function (e, t) {
                $(t).attr("id", r)
            })
        })
    }

    afeTool.handleCarouselIds = function () {
        var e = $(".editor #afeCarousel");
        var t = this.randomNumber();
        var n = "carousel-" + t;
        e.attr("id", n);
        e.find(".carousel-indicators li").each(function (e, t) {
            $(t).attr("data-target", "#" + n)
        });
        e.find(".left").attr("href", "#" + n);
        e.find(".right").attr("href", "#" + n)
    }

    afeTool.handleModalIds = function () {
        var e = $(".editor #afeModalLink");
        var t = this.randomNumber();
        var n = "modal-container-" + t;
        var r = "modal-" + t;
        e.attr("id", r);
        e.attr("href", "#" + n);
        e.next().attr("id", n)
    }

    /***
     * 为了tab能实现级联动画,需要关联id
     */
    afeTool.handleTabsIds = function () {
        var e = $(".editor #afeTabs");
        var t = afeTool.randomNumber();
        var n = "tabs-" + t;
        e.attr("id", n);
        e.find(".tab-pane").each(function (e, t) {
            var n = $(t).attr("id");
            var r = "panel-" + afeTool.randomNumber();
            $(t).attr("id", r);
            $(t).parent().parent().find("a[href=#" + n + "]").attr("href", "#" + r)
        })
    }

    /***
     * 产生一个随机数
     */
    afeTool.randomNumber = function () {
        return this.randomFromInterval(1, 1e6)
    }

    /***
     * 由时间戳的大送随机数
     * @param e
     * @param t
     * @returns {number}
     */
    afeTool.randomFromInterval = function (e, t) {
        return Math.floor(Math.random() * (t - e + 1) + e)
    }

    /***
     * 栅栏系统
     */
    afeTool.gridSystemGenerator = function () {
        $(".grid-row .afe-preview input").bind("keyup", function () {
            var e = 0;
            var t = "";
            var n = false;
            var r = $(this).val().split(" ", 12);
            $.each(r, function (r, i) {
                if (!n) {
                    if (parseInt(i) <= 0) n = true;
                    e = e + parseInt(i);
                    t += '<div class="col-md-' + i + ' afe-column"></div>'
                }
            });
            if (e == 12 && !n) {
                $(this).parents(".grid-row").find("afespan").children().html(t);
                $(this).parents(".grid-row").find(".draghandler").show()
            } else {
                $(this).parents(".grid-row").find(".draghandler").hide()
            }
        })
    }

    /***
     * 配置参数
     * @param e
     * @param t
     */
    afeTool.configurationElm = function (e, t) {
        $(".editor").delegate(".configuration > a", "click", function (e) {
            e.preventDefault();
            var t = $(this).parents(".box-element").find("afespan").children();
            $(this).toggleClass("active");
            t.toggleClass($(this).attr("rel"))
        });
        $(".editor").delegate(".configuration .dropdown-menu a", "click", function (e) {
            e.preventDefault();
            var t = $(this).parent().parent();
            var n = t.parents(".box-element").find("afespan").children();
            t.find("li").removeClass("active");
            $(this).parent().addClass("active");
            var r = "";
            t.find("a").each(function () {
                r += $(this).attr("rel") + " "
            });
            t.parent().removeClass("open");
            n.removeClass(r);
            n.addClass($(this).attr("rel"))
        })
    }

    afeTool.removeElm = function () {
        $(".editor").delegate(".afe-removeBtn", "click", function (e) {
            e.preventDefault();
            $(this).parent().remove();
            if (!$(".editor .grid-row").length > 0) {
                afeTool.clearEditor()
            }
        })
    }

    /***
     * 清楚editor的代码
     */
    afeTool.clearEditor = function () {
        $(".editor").empty()
    }

    /***
     * 移除菜单激活状态
     */
    afeTool.removeMenuClasses = function () {
        $("#menu-afe li button").removeClass("active")
    }


    afeTool.changeStructure = function (dom, e, t) {
        dom.find("." + e).removeClass(e).addClass(t)
    }

    afeTool.cleanHtml = function cleanHtml(e) {
        $(e).parent().append($(e).children().html())
    }

    /***
     * 构建开发编码
     */
    afeTool.makeUpDevCode = function (html) {
        var e = "";
        $("#download-layout").html(html);
        var t = $("#download-layout");
        t.find(".afe-preview, .configuration, .draghandler, .afe-removeBtn").remove();
        t.find(".grid-row").addClass("removeClean");
        t.find(".box-element").addClass("removeClean");
        t.find(".grid-row .grid-row .grid-row .grid-row .grid-row .removeClean").each(function () {
            afeTool.cleanHtml(this)
        });
        t.find(".grid-row .grid-row .grid-row .grid-row .removeClean").each(function () {
            afeTool.cleanHtml(this)
        });
        t.find(".grid-row .grid-row .grid-row .removeClean").each(function () {
            afeTool.cleanHtml(this)
        });
        t.find(".grid-row .grid-row .removeClean").each(function () {
            afeTool.cleanHtml(this)
        });
        t.find(".grid-row .removeClean").each(function () {
            afeTool.cleanHtml(this)
        });
        t.find(".removeClean").each(function () {
            afeTool.cleanHtml(this)
        });
        t.find(".removeClean").remove();
        $("#download-layout .afe-column").removeClass("ui-sortable");
        $("#download-layout .row-fluid").removeClass("clearfix").children().removeClass("afe-column");
        if ($("#download-layout .container").length > 0) {
            afeTool.changeStructure($("#download-layout"), "row-fluid", "row")
        }
        var formatSrc = $.htmlClean($("#download-layout").html(), {
            format: true
            , allowedAttributes: [
                ["id"],
                ["class"],
                ["data-toggle"],
                ["data-target"],
                ["data-parent"],
                ["role"],
                ["data-dismiss"],
                ["aria-labelledby"],
                ["aria-hidden"],
                ["data-slide-to"],
                ["data-slide"],
                ["data-aferole"],
                ["data-module"]
            ]
        });
        return formatSrc;
    }

    /***
     * 反转生成编辑界面的代码
     * 实现思路,
     * 1.到html里面查找对应的afespan
     * 2.根据data-module进行替换成对应编辑区域代码
     * 3.这个地方需要用到递归findModule方法
     */
    afeTool.findModuleTag = function (dom) {
        if (typeof dom == "string" || !dom instanceof jQuery) {
            //如果传进来的是html代码则用jq转换成jQDOM对象
            dom = $(dom);
        }
        if (dom.find("afespan").length > 0) {//dom里面存在afespan
            var dom_children = dom.children();
            for (var i = 0; i < dom_children.length; i++) {
                afeTool.findModuleTag($(dom_children[i]));
            }
        }
        var tagName = dom.prop("tagName");
        if (tagName && tagName.toLowerCase() == "afespan") {
            dom.replaceWith(afeTool.getModuleEdit(dom));
        }
        return dom;
    }

    /***
     * 移除dom中的afespan
     * @returns {*|jQuery|HTMLElement}
     */
    afeTool.removeModualTag = function (dom) {
        if (typeof dom == "string" || !dom instanceof jQuery) {
            //如果传进来的是html代码则用jq转换成jQDOM对象
            dom = $(dom);
        }
        if (dom.find("afespan").length > 0) {//dom里面存在afespan
            var dom_children = dom.children();
            for (var i = 0; i < dom_children.length; i++) {
                afeTool.removeModualTag($(dom_children[i]));
            }
        }

        var tagName = dom.prop("tagName");
        if (tagName && tagName.toLowerCase() == "afespan") {
            var children = dom.contents();
            if(children.length <=0 ){
                dom.remove();
            }else{
                children.unwrap();
            }
        }
        return dom;
    }

    //
    ///***
    // * 查找moduleTag
    // * 1.dom里面找到moduleTag
    // * 2.将对应的module替换成可编辑的module的html
    // *
    // */
    //afeTool.findModuleTag = function(dom){
    //    if(typeof dom == "string" || !dom instanceof jQuery){
    //        //如果传进来的是html代码则用jq转换成jQDOM对象
    //        dom = $(dom);
    //    }
    //    if(dom.find("afespan").size() > 0){
    //        var afespans = dom.children("afespan");
    //        if(afespans)
    //            for(var i=0;i<afespans.length;i++){
    //                afeTool.findModuleTag($(afespans[i]));
    //            }
    //    }else{
    //        var module = afeTool.getModuleEdit(dom);
    //        dom.replaceWith(module);
    //    }
    //    return dom;
    //}


    /***
     * 得到组件的代码
     * @param afespan
     * @returns {*}
     */
    afeTool.getModuleEdit = function (afespan) {
        var moduleName = afespan.attr("data-module");
        var module_pre = null;
        if (moduleName && moduleName != "Grid") {
            module_pre = $(".left-component-bar").find(".box-element[data-module='" + moduleName + "']");
        } else {//如果是栅栏视图
            module_pre = $(".left-component-bar").find(".grid-row").first();
        }
        if (module_pre) {
            var module = module_pre.clone();
            var afespan_clone = afespan.clone();
            module.find("afespan").replaceWith(afespan_clone);
            return module;
        }
    }

    return afeTool;
});