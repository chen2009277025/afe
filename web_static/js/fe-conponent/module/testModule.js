/**
 * Created by chenjianhui on 16/4/27.
 *
 * 模块测试案例
 *
 */
define(['fe-conponent/module/base/BaseModule'],function(BaseModule){
   var ModuleClass = BaseModule.extend({
       mView:"<div data-toggle='modal' data-target='#myModal'>hello wolrd</div>",
       mEvent:{
           showModal_2:function(){
                alert("this is what you want");
           }
       }
   });
    return ModuleClass;
})