/**
 * Created by chenjianhui on 16/4/27.
 */

require(['fe-conponent/module/testModule'],function(test){
    var modules = $("#modules");
    var t = new test();
    modules.append(t.mView);
})