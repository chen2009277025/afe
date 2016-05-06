/**
 * Created by chenjianhui on 16/4/27.
 *
 * 这是定义积累的基础方法
 *
 */

define(function(){
    var BaseClass = Class.extend({
        /***
         * 初始化方法
         */
        init:function(){},
        /***
         * 名称
         */
        name:"name",
        /**
         * 属性
         */
        attr:{
            width:0,
            height:0,
            margin:"",
            padding:"",
            backgroundColor:"",
            borderColor:"",
            border:""
        },
        /**
         * 简介
         */
        digest:"这是模块的基类",
        /***
         * 视图
         * 返回对应模块的视图
         *
         */
        mView:function(){},
        /***
         *声明该模块中能使用的事件方法
         */
        mEvent:{}
    });
    return BaseClass;
})