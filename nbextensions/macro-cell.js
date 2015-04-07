define( function () {

    // Try to read JSON file specifying cell macros
    $.getJSON("/static/custom/database.json", function(data) {
        // Cach DOM
        var $container = $("div#maintoolbar-container");

        var tag = $("<span></span>").attr("class", "navbar-text")
                                    .text("Databases:");

        var dbselect = $("<select></select>").attr("id", "dbselect");

        $.each(data['databases'], function(key, cell) {
            var option = $("<option></option>")
                         .attr("value", cell['name'])
                         .text(cell['name'])
                         .attr("info", cell['info'].join('\n'));
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

                // Create new cell
                var new_cell = IPython.notebook.insert_cell_above('code');
                new_cell.set_text(selected.attr("info"));
                new_cell.focus_cell();

                // Make database connections
                var command = "cur = "+selected.attr("value")+".cursor()";
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
