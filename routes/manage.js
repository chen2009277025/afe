var express = require('express');
var router = express.Router();

var moduleManage = require("../fe_classes/utils/project/ModuleManage.feclass");
var projectManager = require("../fe_classes/utils/project/ProjectManager.feclass");

/***
 * 进入编辑页面
 */
router.get('/', function (req, res, next) {
    var baseCss = [];
    var javascript = [];
    var toolconponent = [];
    var modulefuncs = moduleManage.getAllModule();
    modulefuncs.forEach(function (modulefunc) {
        m = new modulefunc();
        switch (m.mType) {
            case "baseCss":
                baseCss.push(m);
                break;
            case "javascript":
                javascript.push(m);
                break;
            case "toolconponent":
                toolconponent.push(m);
                break;
        }
    })
    res.render('manage', {
        modules: {"baseCss": baseCss, "javascript": javascript, "toolconponent": toolconponent},
        projectName: "test"
    });
});

/***
 * 获取项目文件数据
 */
router.use('/getProjectFile', function (req, res) {
    var projectName = req.body.projectName;
    var resultJson = {};
    if (projectName == "" || projectName == null) {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }
    var files = projectManager.readProjectFiles(projectName);
    resultJson.code = 1;
    resultJson.data = files;
    resultJson.msg = "success";
    res.json(resultJson);
})

/***
 * 新建文件
 */
router.post("/makeFile", function (req, res) {

    var fileName = req.body.fileName;
    var fileType = req.body.fileType;

    var resultJson = {};

    if (fileName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }

    resultJson = projectManager.makeFile(fileName, fileType);

    return res.json(resultJson);

})


/***
 * 新建文件
 */
router.post("/makeDir", function (req, res) {

    var fileName = req.body.fileName;

    var resultJson = {};

    if (fileName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }

    resultJson = projectManager.makeDir(fileName);

    return res.json(resultJson);

});

/***
 * 重名名
 */
router.post("/rename", function (req, res) {

    var fileName = req.body.fileName
        , oldFileName = req.body.oldFileName
        , resultJson = {};

    if (fileName == "" || oldFileName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }

    var newFileName = oldFileName.substring(0, oldFileName.lastIndexOf("/") + 1) + fileName;

    resultJson.code = projectManager.renameFileOrDir(oldFileName, newFileName);

    if (resultJson.code == 1) {
        resultJson.msg = "重命名成功";
    } else if (resultJson.code == 2) {
        resultJson.msg = "已经存在的文件";
    } else if (resultJson.code == 3) {
        resultJson.msg = "不存在的目标文件";
    } else {
        resultJson.msg = "未知错误";
    }
    return res.json(resultJson);
});

/***
 * 删除
 */
router.post("/del", function (req, res) {
    var fileName = req.body.fileName;

    var resultJson = {};

    if (fileName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }

    resultJson = projectManager.removeFileOrDir(fileName);

    return res.json(resultJson);
});

/***
 * 获得文件内容
 */
router.post("/ajaxGetFile", function (req, res) {
    var fileName = req.body.fileName;
    var resultJson = {};
    if (fileName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }
    return res.json(projectManager.readOneFile(fileName));
});

/***
 * 保存文件的操作
 */
router.post("/saveFile", function (req, res) {
    var fileName = req.body.fileName;
    var fileData = req.body.fileData;
    var resultJson = {};
    if (fileName == "") {
        resultJson.code = 0;
        resultJson.msg = "错误的请求参数";
        return res.json(resultJson);
    }
    return res.json(projectManager.writeOneFile(fileName, fileData));
});

module.exports = router;
