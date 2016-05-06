/**
 * Created by chenjianhui on 16/4/29.
 */

define(function(){
    return BaseClass.extend({
        name:"测试组件2",
        init:function(){
        },
        showText:function(txt){
            alert(txt+" " + this.name);
        }
    });
})