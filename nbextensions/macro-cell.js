define( function () {

    // Try to read JSON file specifying cell macros
    $.getJSON("http://54.152.26.131:7654/datasources", function(data) {
        // Cach DOM
        var $container = $("div#maintoolbar-container");

        var tag = $("<span></span>").attr("class", "navbar-text")
                                    .text("Databases:");

        var dbselect = $("<select></select>").attr("id", "dbselect");

        $.each(data, function() {
            var option = $("<option></option>")
                         .attr("value", this.dbName)
                         .text(this.title+":"+this.dbName)
                         .attr("info", this.description)
                         .attr("ip", this.ipAddress)
                         .attr("port",this.port)
                         .attr("username",this.username)
                         .attr("password",this.password)
                         .attr("db",this.dbName);
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
                var db = selected.attr("db")

                // Create new cell
                var new_cell = IPython.notebook.insert_cell_above('code');
                new_cell.set_text("#connect to "+selected.attr("value")+
                "\n#execute SQL \n#example: 'show databases'");
                new_cell.focus_cell();

                // Make database connections
                var command = "MySQL = pymysql.connect(host='"+host+"', port="+port+", user='"+username+"', passwd='"+password+"', db='"+db+"')\n"
                command += "cur = MySQL.cursor()";
                console.log("Executing Command: " + command);
                var kernel = IPython.notebook.kernel;
                kernel.execute(command);
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

                // Display table
                var command2 = "from prettytable import PrettyTable\n\n"
                command2 += "cur.execute(\"" + command1 + "\")\n";
                command2 += "col_names = [i[0] for i in cur.description]\n"
                command2 += "x=PrettyTable(col_names)\n"
                command2 += "x.padding_width = 1\n"
                command2 += "for r in cur.fetchall():\n"
                command2 += "    x.add_row(r)\n"
                command2 += "print(x)"
                console.log("Executing Command: \n" + command2);

                var cell=IPython.notebook.get_selected_cell();
                cell.set_text(command2);
                cell.focus_cell();
                IPython.notebook.execute_cell();

                cell.set_text(command1);
                cell.focus_cell();
            }
        }]);
    });

});

//send sq to MultiDBs-Query-Server
function send_sql (sql,databasid) {
    //input sql is like "select * from table"
    //modify it to "select * from databaseid.table"
    var newsql = "";
    var sql = {
        "query": newsql;
    }

    $.ajax({
        type: "PUT",
        url: "http://54.174.80.167:7654/Query/",
        contentType: "application/json",
        success: function(data) {
            //transfer the data into a python array variable
            //the detailed structure of data is on https://github.com/infsci2711/MultiDBs-Query-Server/blob/master/restful-api-brief.txt
        },
        error: function(){
            alert("Fail to load the data from MultiDB server");
        }
    })
}
