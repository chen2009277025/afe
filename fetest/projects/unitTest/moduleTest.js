/**
 * Created by chenjianhui on 16/4/30.
 */
var moduleManage = require("../../../fe_classes/utils/project/ModuleManage.feclass");

var modules = moduleManage.getAllModule();

modules.forEach(function(module){
    var m = new module();
    console.log(m.view);
})