// Copyright (c) IPython Development Team.
// Distributed under the terms of the Modified BSD License.

require([
    'base/js/namespace',
    'jquery',
    'notebook/js/notebook',
    'contents',
    'services/config',
    'base/js/utils',
    'base/js/page',
    'base/js/events',
    'auth/js/loginwidget',
    'notebook/js/maintoolbar',
    'notebook/js/pager',
    'notebook/js/quickhelp',
    'notebook/js/menubar',
    'notebook/js/notificationarea',
    'notebook/js/savewidget',
    'notebook/js/actions',
    'notebook/js/keyboardmanager',
    'notebook/js/kernelselector',
    'codemirror/lib/codemirror',
    'notebook/js/about',
    //'notebook/js/macro-cell',
    // only loaded, not used, please keep sure this is loaded last
    'custom/custom'
], function(
    IPython,
    $,
    notebook,
    contents,
    configmod,
    utils,
    page,
    events,
    loginwidget,
    maintoolbar,
    pager,
    quickhelp,
    menubar,
    notificationarea,
    savewidget,
    actions,
    keyboardmanager,
    kernelselector,
    CodeMirror,
    about,
    // please keep sure that even if not used, this is loaded last
    custom
    ) {
    "use strict";

    // compat with old IPython, remove for IPython > 3.0
    window.CodeMirror = CodeMirror;

    var common_options = {
        ws_url : utils.get_body_data("wsUrl"),
        base_url : utils.get_body_data("baseUrl"),
        notebook_path : utils.get_body_data("notebookPath"),
        notebook_name : utils.get_body_data('notebookName')
    };

    var config_section = new configmod.ConfigSection('notebook', common_options);
    config_section.load();
    var common_config = new configmod.ConfigSection('common', common_options);
    common_config.load();
    var page = new page.Page();
    var pager = new pager.Pager('div#pager', {
        events: events});
    var acts = new actions.init();
    var keyboard_manager = new keyboardmanager.KeyboardManager({
        pager: pager,
        events: events,
        actions: acts });
    var save_widget = new savewidget.SaveWidget('span#save_widget', {
        events: events,
        keyboard_manager: keyboard_manager});
    var contents = new contents.Contents({
          base_url: common_options.base_url,
          common_config: common_config
        });
    var notebook = new notebook.Notebook('div#notebook', $.extend({
        events: events,
        keyboard_manager: keyboard_manager,
        save_widget: save_widget,
        contents: contents,
        config: config_section},
        common_options));
    var login_widget = new loginwidget.LoginWidget('span#login_widget', common_options);
    var toolbar = new maintoolbar.MainToolBar('#maintoolbar-container', {
        notebook: notebook,
        events: events,
        actions: acts});
    var quick_help = new quickhelp.QuickHelp({
        keyboard_manager: keyboard_manager,
        events: events,
        notebook: notebook});
    keyboard_manager.set_notebook(notebook);
    keyboard_manager.set_quickhelp(quick_help);
    var menubar = new menubar.MenuBar('#menubar', $.extend({
        notebook: notebook,
        contents: contents,
        events: events,
        save_widget: save_widget,
        quick_help: quick_help},
        common_options));
    var notification_area = new notificationarea.NotebookNotificationArea(
        '#notification_area', {
        events: events,
        save_widget: save_widget,
        notebook: notebook,
        keyboard_manager: keyboard_manager});
    notification_area.init_notification_widgets();
    var kernel_selector = new kernelselector.KernelSelector(
        '#kernel_logo_widget', notebook);

    $('body').append('<div id="fonttest"><pre><span id="test1">x</span>'+
                     '<span id="test2" style="font-weight: bold;">x</span>'+
                     '<span id="test3" style="font-style: italic;">x</span></pre></div>');
    var nh = $('#test1').innerHeight();
    var bh = $('#test2').innerHeight();
    var ih = $('#test3').innerHeight();
    if(nh != bh || nh != ih) {
        $('head').append('<style>.CodeMirror span { vertical-align: bottom; }</style>');
    }
    $('#fonttest').remove();

    page.show();

    var first_load = function () {
        var hash = document.location.hash;
        if (hash) {
            document.location.hash = '';
            document.location.hash = hash;
        }
        notebook.set_autosave_interval(notebook.minimum_autosave_interval);
        // only do this once
        events.off('notebook_loaded.Notebook', first_load);
    };
    events.on('notebook_loaded.Notebook', first_load);

    IPython.page = page;
    IPython.notebook = notebook;
    IPython.contents = contents;
    IPython.pager = pager;
    IPython.quick_help = quick_help;
    IPython.login_widget = login_widget;
    IPython.menubar = menubar;
    IPython.toolbar = toolbar;
    IPython.notification_area = notification_area;
    IPython.keyboard_manager = keyboard_manager;
    IPython.save_widget = save_widget;
    IPython.tooltip = notebook.tooltip;

    events.trigger('app_initialized.NotebookApp');
    utils.load_extensions_from_config(config_section);
    utils.load_extensions_from_config(common_config);
    notebook.load_notebook(common_options.notebook_path);

var datasources;
var count = 0; //variable count
// Try to read JSON file specifying cell macros
$.getJSON("http://54.152.26.131:7654/datasources", function(data) {
    // Update variable
    datasources = data;
    // Cach DOM
    var $container = $("div#maintoolbar-container");

    var tag = $("<span></span>").attr("class", "navbar-text")
        .text("Databases:");

    var dbselect = $("<select></select>").attr("id", "dbselect");

    $.each(data, function() {
        var option = $("<option></option>")
            .attr("value", this.dbName)
            .text(this.title + ":" + this.dbName)
            .attr("info", this.description)
            .attr("ip", this.ipAddress)
            .attr("id", this.id)
            .attr("port", this.port)
            .attr("username", this.username)
            .attr("password", this.password)
            .attr("db", this.dbName);
        dbselect.append(option);
    });

    $container.append(tag);
    $container.append(dbselect);

    // Add a button to the toolbar for inserting a macro cell
    IPython.toolbar.add_buttons_group([{
        // The button's label.
        'label': 'database connection',

        // The button's icon.
        // See a list of Font-Awesome icons here:
        // http://fortawesome.github.io/Font-Awesome/icons/
        'icon': 'icon-cloud',

        // The callback function.
        'callback': function() {
            // Cach DOM
            var selected = $("select#dbselect").find(":selected");

            var host = selected.attr("ip");
            var port = selected.attr("port");
            var username = selected.attr("username");
            var password = selected.attr("password");
            var db = selected.attr("db");
            var id = selected.attr("id");

            // Create new cell
            var new_cell = IPython.notebook.insert_cell_above('code');
            var success = "#Switch to " + selected.attr("value") + "\n";
            success += "dabaseid: " + id + "\n";
            for (var i = datasources.length - 1; i >= 0; i--) {
                if (datasources[i].id == id) {
                    for (var j = datasources[i].tables.length - 1; j >= 0; j--) {
                        var columns = datasources[i].tables[j].columns;
                        success += datasources[i].tables[j].tableName;
                        success += "\n";
                        success += "---------------\n";
                        for (var k = columns.length - 1; k >= 0; k--) {
                            success = success + columns[k].columnName + " | ";
                        };
                        success += "\n---------------\n";
                    };
                }
            };
            success += "\n#execute SQL \n#example: 'select * from databaseid.table'";
            new_cell.set_text(success);
            new_cell.focus_cell();

            // Make database connections
            //var command = "MySQL = pymysql.connect(host='"+host+"', port="+port+", user='"+username+"', passwd='"+password+"', db='"+db+"')\n"
            //command += "cur = MySQL.cursor()";
            //console.log("Executing Command: " + command);
            //var kernel = IPython.notebook.kernel;
            //kernel.execute(command);
        }
    }]);

    IPython.toolbar.add_buttons_group([{
        // The button's label.
        'label': 'display table',

        // The button's icon.
        // See a list of Font-Awesome icons here:
        // http://fortawesome.github.io/Font-Awesome/icons/
        'icon': 'icon-table',

        // The callback function.
        'callback': function() {
            // get the execution that user inputs
            var command1 = IPython.notebook.get_selected_cell().get_text();
            console.log("Command1: " + command1);
            send_sql(command1, function(object) {
                console.log(object);
                var createVariable = "import json\n";
                createVariable += "data" + count + "= json.loads('" + object + "')\n";
                createVariable += "print (\"variable name : data" + count + "\")\n";
                createVariable += "print (data" + count + ")\n";
                count++;
                // Display table
                //var command2 = "from prettytable import PrettyTable\n\n"
                //command2 += "cur.execute(\"" + command1 + "\")\n";
                //command2 += "col_names = [i[0] for i in cur.description]\n"
                //command2 += "x=PrettyTable(col_names)\n"
                //command2 += "x.padding_width = 1\n"
                //command2 += "for r in cur.fetchall():\n"
                //command2 += "    x.add_row(r)\n"
                //command2 += "print(x)"
                console.log("Executing Command: \n" + createVariable);

                var cell = IPython.notebook.get_selected_cell();
                cell.set_text(createVariable);
                cell.focus_cell();
                IPython.notebook.execute_cell();

                cell.set_text(command1);
                cell.focus_cell();
            });
        }
    }]);
});

function send_sql(inputsql, callBack) {
    //input sql is like "select * from table"
    //modify it to "select * from databaseid.table"
    var sql = {
        "query": inputsql
    }

    $.ajax({
        type: "PUT",
        url: "http://54.174.80.167:7654/Query/",
        contentType: "application/json",
        data: JSON.stringify(sql),
        success: function(data) {
            //transfer the data into a python array variable
            //the detailed structure of data is on https://github.com/infsci2711/MultiDBs-Query-Server/blob/master/restful-api-brief.txt
            var ret = JSON.stringify(data);
            return callBack(ret);
        },
        error: function() {
            alert("Fail to load the data from MultiDB server");
        }
    });
}
});
