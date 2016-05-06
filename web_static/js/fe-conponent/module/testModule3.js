/**
 * Created by chenjianhui on 16/4/29.
 */

define(function(){
    var ModuleClass = BaseClass.extend({
        name:"测试组件3",
        text:"haha",
        init:function(){
        },
        showText:function(txt){
            alert(this.name);
        }
    });
    return ModuleClass;
})