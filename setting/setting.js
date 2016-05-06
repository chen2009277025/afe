/**
 * Created by chenjianhui on 16/4/28.
 */

var setting = {};
var baseDir = __dirname;

//工程目录
setting.workspace = baseDir + "/../workspace/";

//根目录
setting.projectDir = baseDir + "/../";

//向外公开的模块
setting.moduleOutPut = [
    "baseCss/Button",
    "baseCss/Form",
    "baseCss/Head",
    "baseCss/Paragraph",
    "toolconponent/ButtonGroup",
    "toolconponent/Dropdown",
    "javascript/Tab",
    "javascript/Modal"
]


module.exports = setting;