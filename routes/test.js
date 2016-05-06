/**
 * Created by chenjianhui on 16/4/27.
 */
/* GET home page. */
var express = require('express');
var router = express.Router();

//var TestModule = require("../fe_classes/components/TestModule.feclass");
//
//var t = new TestModule();
//
//router.get('/', function(req, res, next) {
//    res.render('test/index', {modules:[t]});
//});

var moduleManage = require("../fe_classes/utils/project/ModuleManage.feclass");

router.get('/', function(req, res, next) {
    var modules = [];
    var modulefuncs = moduleManage.getAllModule();
    modulefuncs.forEach(function(modulefunc){
        modules.push(new modulefunc());
    })
    res.render('test/index', {modules:modules});
});

module.exports = router;
