/**
 * Created by chenjianhui on 16/4/27.
 */

require.config({
    baseUrl: '/js',
    shim: {
        'lib/jquery-ui': {
            deps: ['lib/jquery']
        },
        'lib/jquery.htmlClean': {
            deps: ['lib/jquery']
        },
        'lib/bootstrap': {
            deps: ['lib/jquery']
        }
    }
});

require(['lib/jquery-ui', 'lib/jquery.htmlClean', 'lib/bootstrap'], function (jqueryUI, htmlClean, bootstrap) {

    var ProjectManager = {
        historyProjects: null,
        createProjectBtn: null,
        createArea: null,
        cancleBtn: null,
        searchBtn: null,
        saveProjectBtn: null,
        searchInput: null,
        projectName_create: null,
        searchUrl: "/search",
        saveProjectUrl: "/save",
        historyProjectList: null,
        /***
         *  初始化项目
         */
        init: function () {
            var _self = this;
            _self.createProjectBtn = $(".createBtn");
            _self.createArea = $(".createProject-inputs");
            _self.cancleBtn = $(".btn-cancle");
            _self.searchBtn = $(".btn-search");
            _self.saveProjectBtn = $(".btn-submit");
            _self.searchInput = $(".searchInput");
            _self.projectName_create = $(".projectNameInput");
            _self.historyProjectList = $(".hisProjectList ul");

            _self.initHistoryProjects();
            _self.initEvent();
        },
        initEvent: function () {
            var _self = this;
            _self.createProjectBtn.on("click", function () {
                _self.createArea.show();
            });

            _self.cancleBtn.on("click", function () {
                _self.createArea.hide();
            });

            _self.historyProjectList.on("click","li",function(){
                var projectName = $(this).text();
                _self.openProject(projectName);
            })

            _self.searchBtn.on("click", function () {
                var searchVal = _self.searchInput.val();
                if (searchVal) {
                    $.ajax({
                        type: "post",
                        url: _self.searchUrl,
                        data: {projectName: searchVal},
                        success: function (response) {
                            if (response.code == 1) {
                                _self.openProject(searchVal);
                            } else {
                                alert(response.msg);
                            }
                        }, error: function () {

                        }
                    })
                }
            });

            _self.saveProjectBtn.on("click", function () {
                var projectName = _self.projectName_create.val();
                if (projectName) {
                    $.ajax({
                        type: "post",
                        url: _self.saveProjectUrl,
                        data: {projectName: projectName},
                        success: function (response) {
                            if (response.code == 1) {
                                _self.openProject(response.projectName);
                            } else {
                                alert(response.msg);
                            }
                        }, error: function () {

                        }
                    })
                }
            });
        },
        openProject:function(projectName){
            ProjectManager.saveProjectInStory(projectName);
            location.href = "/manage?projectName=" + projectName;
        },
        initHistoryProjects: function () {
            var _self = this;
            if (window.localStorage) {
                var historyProject = window.localStorage.getItem("historyProjects");
                if (historyProject) {
                    historyProject = _self.historyProjects = JSON.parse(historyProject).reverse();
                    var html = "";
                    for (var i = 0; i < historyProject.length; i++) {
                        html += "<li>" + historyProject[i] + "</li>"
                    }
                    _self.historyProjectList.html(html);
                }

            } else {
                console.log("不支持localstory");
            }
        },
        /***
         * 将项目存储到story里面
         */
        saveProjectInStory: function (projectName) {
            var _self = this;

            if (window.localStorage) {
                var historyProject = window.localStorage.getItem("historyProjects");
                if (historyProject) {
                    historyProject = JSON.parse(historyProject);
                } else {
                    historyProject = [];
                }

                for (var i = 0; i < historyProject.length; i++) {
                    if (projectName == historyProject[i]) {
                        historyProject.splice(i,1);
                    }
                }
                historyProject.push(projectName);
                _self.historyProjects = historyProject;
                window.localStorage.setItem("historyProjects", JSON.stringify(historyProject));
                window.localStorage.setItem("projectName", projectName);
            } else {
                console.log("不支持localstory");
            }
        }
    }

    ProjectManager.init();

});