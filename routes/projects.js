/**
 * Created by chenjianhui on 16/4/27.
 */

var express = require('express');
var router = express.Router();

var projectManager = require("../fe_classes/utils/project/ProjectManager.feclass");

router.get('/', function(req, res) {
    res.render('projects', { title: 'Express' });
});

router.post('/save', function(req, res) {
    var projectName = req.body.projectName;
    var resultJson = {};
    if (projectName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }
    resultJson.code = projectManager.createProject(projectName);
    if(resultJson.code == 4){
        resultJson.msg = "已经存在的项目";
    }else if(resultJson.code == 9){
        resultJson.msg = "未知错误";
    }else if(resultJson.code == 1){
        resultJson.msg = "新建成功";
        resultJson.projectName = projectName;
    }
    return res.json(resultJson);
});

router.post('/search', function(req, res) {
    var projectName = req.body.projectName;
    var resultJson = {};
    if (projectName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }

    resultJson.code = projectManager.findProject(projectName);

    if(resultJson.code == 1){
        resultJson.msg = projectName;
    }else{
        resultJson.msg = "不存在的项目";
    }
    return res.json(resultJson);
});

module.exports = router;
