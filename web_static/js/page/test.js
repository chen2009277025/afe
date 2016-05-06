function saveLayout() {
    return;
    $.ajax({
        type: "POST",
        url: "/build_v3/saveLayout",
        data: {'layout-v3': $('.demo').html()},
        success: function (data) {
            //updateButtonsVisibility();
        }
    });
}

//下载代码
function downloadLayout() {
    $.ajax({
        type: "POST",
        url: "/build_v3/downloadLayout",
        data: {'layout-v3': $('#download-layout').html()},
        success: function (data) {
            window.location.href = '/build_v3/download';
        }
    });
}

function downloadHtmlLayout() {
    $.ajax({
        type: "POST",
        url: "/build_v3/downloadLayout",
        data: {'layout-v3': $('#download-layout').html()},
        success: function (data) {
            window.location.href = '/build_v3/downloadHtml';
        }
    });
}

function undoLayout() {

    $.ajax({
        type: "POST",
        url: "/build_v3/getPreviousLayout",
        data: {},
        success: function (data) {
            undoOperation(data);
        }
    });
}

function redoLayout() {

    $.ajax({
        type: "POST",
        url: "/build_v3/getPreviousLayout",
        data: {},
        success: function (data) {
            redoOperation(data);
        }
    });
}

$(document).on('hidden.bs.modal', function (e) {
    $(e.target).removeData('bs.modal');
});

$('body').on('click', '#continue-share-non-logged', function () {
    $('#share-not-logged').hide();
    $('#share-logged').removeClass('hide');
    $('#share-logged').show();
});

$('body').on('click', '#continue-download-non-logged', function () {
    $('#download-not-logged').hide();
    $('#download').removeClass('hide');
    $('#download').show();
    $('#downloadhtml').removeClass('hide');
    $('#downloadhtml').show();
    $('#download-logged').removeClass('hide');
    $('#download-logged').show();
});
