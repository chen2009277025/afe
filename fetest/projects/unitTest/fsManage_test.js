/**
 * Created by chenjianhui on 16/4/27.
 */

var setting = require(__dirname + "/../../../setting/setting");
var fsManage = require("../../../fe_classes/utils/fs/FSManage.feclass");


//读取文件夹
var files = fsManage.readDir(setting.workspace+"test");

//读取文件
//var fileData = fsManage.readFile("fetest/hello.html");

////创建文件
//fsManage.makeFile("./fetest.txt")
//
//fsManage.writeFile("./fetest.txt","hello world");
//
//fsManage.writeFile("./fetest.txt","hello my world");

//移除文件或目录
//fsManage.removeFileOrDir("fetest/fetest.txt");
//
console.log(JSON.stringify(files));

//拷贝文件
//fsManage.copyFile("fetest/hello.html","fetest/css");

//拷贝目录
//fsManage.copyDir("fetest/exports","test/css");