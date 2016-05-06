function handleSaveLayout() {
  var e = $(".editor").html();
  if (e != window.editorHtml) {
    saveLayout();
    window.editorHtml = e
  }
}
function handleJsIds() {
  handleModalIds();
  handleAccordionIds();
  handleCarouselIds();
  handleTabsIds()
}
function handleAccordionIds() {
  var e = $(".editor #myAccordion");
  var t = randomNumber();
  var n = "panel-" + t;
  var r;
  e.attr("id", n);
  e.find(".panel").each(function (e, t) {
    r = "panel-element-" + randomNumber();
    $(t).find(".panel-title").each(function (e, t) {
      $(t).attr("data-parent", "#" + n);
      $(t).attr("href", "#" + r)
    });
    $(t).find(".panel-collapse").each(function (e, t) {
      $(t).attr("id", r)
    })
  })
}
function handleCarouselIds() {
  var e = $(".editor #myCarousel");
  var t = randomNumber();
  var n = "carousel-" + t;
  e.attr("id", n);
  e.find(".carousel-indicators li").each(function (e, t) {
    $(t).attr("data-target", "#" + n)
  });
  e.find(".left").attr("href", "#" + n);
  e.find(".right").attr("href", "#" + n)
}
function handleModalIds() {
  var e = $(".editor #myModalLink");
  var t = randomNumber();
  var n = "modal-container-" + t;
  var r = "modal-" + t;
  e.attr("id", r);
  e.attr("href", "#" + n);
  e.next().attr("id", n)
}
function handleTabsIds() {
  var e = $(".editor #myTabs");
  var t = randomNumber();
  var n = "tabs-" + t;
  e.attr("id", n);
  e.find(".tab-pane").each(function (e, t) {
    var n = $(t).attr("id");
    var r = "panel-" + randomNumber();
    $(t).attr("id", r);
    $(t).parent().parent().find("a[href=#" + n + "]").attr("href", "#" + r)
  })
}
function randomNumber() {
  return randomFromInterval(1, 1e6)
}
function randomFromInterval(e, t) {
  return Math.floor(Math.random() * (t - e + 1) + e)
}
function gridSystemGenerator() {
  $(".lyrow .preview input").bind("keyup", function () {
    var e = 0;
    var t = "";
    var n = false;
    var r = $(this).val().split(" ", 12);
    $.each(r, function (r, i) {
      if (!n) {
        if (parseInt(i) <= 0) n = true;
        e = e + parseInt(i);
        t += '<div fe-conponent="col-md-' + i + ' column"></div>'
      }
    });
    if (e == 12 && !n) {
      $(this).parent().next().children().html(t);
      $(this).parent().prev().show()
    } else {
      $(this).parent().prev().hide()
    }
  })
}
function configurationElm(e, t) {
  $(".editor").delegate(".configuration > a", "click", function (e) {
    e.preventDefault();
    var t = $(this).parent().next().next().children();
    $(this).toggleClass("active");
    t.toggleClass($(this).attr("rel"))
  });
  $(".editor").delegate(".configuration .dropdown-menu a", "click", function (e) {
    e.preventDefault();
    var t = $(this).parent().parent();
    var n = t.parent().parent().next().next().children();
    t.find("li").removeClass("active");
    $(this).parent().addClass("active");
    var r = "";
    t.find("a").each(function () {
      r += $(this).attr("rel") + " "
    });
    t.parent().removeClass("open");
    n.removeClass(r);
    n.addClass($(this).attr("rel"))
  })
}
function removeElm() {
  $(".editor").delegate(".remove", "click", function (e) {
    e.preventDefault();
    $(this).parent().remove();
    if (!$(".editor .lyrow").length > 0) {
      clearEditor()
    }
  })
}
function clearEditor() {
  $(".editor").empty()
}
function removeMenuClasses() {
  $("#menu-layoutit li button").removeClass("active")
}
function changeStructure(e, t) {
  $("#download-layout ." + e).removeClass(e).addClass(t)
}
function cleanHtml(e) {
  $(e).parent().append($(e).children().html())
}
function downloadLayoutSrc() {
  var e = "";
  $("#download-layout").children().html($(".editor").html());
  var t = $("#download-layout").children();
  t.find(".preview, .configuration, .drag, .remove").remove();
  t.find(".lyrow").addClass("removeClean");
  t.find(".box-element").addClass("removeClean");
  t.find(".lyrow .lyrow .lyrow .lyrow .lyrow .removeClean").each(function () {
    cleanHtml(this)
  });
  t.find(".lyrow .lyrow .lyrow .lyrow .removeClean").each(function () {
    cleanHtml(this)
  });
  t.find(".lyrow .lyrow .lyrow .removeClean").each(function () {
    cleanHtml(this)
  });
  t.find(".lyrow .lyrow .removeClean").each(function () {
    cleanHtml(this)
  });
  t.find(".lyrow .removeClean").each(function () {
    cleanHtml(this)
  });
  t.find(".removeClean").each(function () {
    cleanHtml(this)
  });
  t.find(".removeClean").remove();
  $("#download-layout .column").removeClass("ui-sortable");
  $("#download-layout .row-fluid").removeClass("clearfix").children().removeClass("column");
  if ($("#download-layout .container").length > 0) {
    changeStructure("row-fluid", "row")
  }
  formatSrc = $.htmlClean($("#download-layout").html(), {
    format: true,
    allowedAttributes: [
      ["id"],
      ["class"],
      ["data-toggle"],
      ["data-target"],
      ["data-parent"],
      ["role"],
      ["data-dismiss"],
      ["aria-labelledby"],
      ["aria-hidden"],
      ["data-slide-to"],
      ["data-slide"]
    ]
  });
  $("#download-layout").html(formatSrc);
  $("#downloadModal textarea").empty();
  $("#downloadModal textarea").val(formatSrc)
}



var currentDocument = null;

var timerSave = 2e3;
var editorHtml = $(".editor").html();
$(window).resize(function () {
  $("body").css("min-height", $(window).height() - 90);
  $(".editor").css("min-height", $(window).height() - 160)
});

$(document).ready(function () {

  $("body").css("min-height", $(window).height() - 90);
  $(".editor").css("min-height", $(window).height() - 160);

  $(".editor, .editor .column").sortable({
    connectWith: ".column",
    opacity: .35,
    handle: ".drag"
  });

  $(".sidebar-nav .lyrow").draggable({
    connectToSortable: ".editor",
    helper: "clone",
    handle: ".drag",
    drag: function (e, t) {
      t.helper.width(400)
    },
    stop: function (e, t) {
      $(".editor .column").sortable({
        opacity: .35,
        connectWith: ".column"
      })
    }
  });

  $(".sidebar-nav .box").draggable({
    connectToSortable: ".column",
    helper: "clone",
    handle: ".drag",
    drag: function (e, t) {
      t.helper.width(400)
    },
    stop: function () {
      handleJsIds()
    }
  });

  $("[data-target=#downloadModal]").click(function (e) {
    e.preventDefault();
    downloadLayoutSrc()
  });

  $("#download").click(function () {
    downloadLayout();
    return false
  });

  $("#downloadhtml").click(function () {
    downloadHtmlLayout();
    return false
  });

  $("#edit").click(function () {
    $("body").removeClass("devpreview sourcepreview");
    $("body").addClass("edit");
    removeMenuClasses();
    $(this).addClass("active");
    return false
  });

  $("#clear").click(function (e) {
    e.preventDefault();
    clearEditor()
  });

  $("#devpreview").click(function () {
    $("body").removeClass("edit sourcepreview");
    $("body").addClass("devpreview");
    removeMenuClasses();
    $(this).addClass("active");
    return false
  });
  $("#sourcepreview").click(function () {
    $("body").removeClass("edit");
    $("body").addClass("devpreview sourcepreview");
    removeMenuClasses();
    $(this).addClass("active");
    return false
  });
  $(".nav-header").click(function () {
    $(".sidebar-nav .boxes, .sidebar-nav .rows").hide();
    $(this).next().slideDown()
  });

  removeElm();
  configurationElm();
  gridSystemGenerator();
  setInterval(function () {
    handleSaveLayout()
  }, timerSave)
})