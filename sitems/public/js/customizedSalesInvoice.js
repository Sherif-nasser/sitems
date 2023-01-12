///// Method ///////////
frappe.ui.form.on("Sales Invoice", "customized", function(frm) {
    var priceListName = cur_frm.fields_dict.selling_price_list.input.value;
    console.log(priceListName);
    return make(priceListName,frm)
});


function make(priceListName,frm) {
    var dialog = new frappe.ui.Dialog({
        title: "Select Items",
        fields: [{
                fieldtype: "Data",
                fieldname: "txt",
                label: "Beginning with",
                description: "You can use wildcard %",
            },
            {
                fieldtype: "HTML",
                fieldname: "results",
            }
            // {
            //     fieldtype: "Button",
            //     fieldname: "more",
            //     label: "More",
            //     click: () => {
            //         console.log("button working")
            //     },
            // },
        ],
        primary_action_label: __("Search"),
        primary_action: function() {
            search(priceListName,frm);
        },
    });
    try {
        frappe.call({
            method: "sitems.customQueriesSalesInvoice.getItemsForSearch",
            // type: "GET",
            args: {
                priceListName
            },
            callback: function(r) {
                var parent = dialog.fields_dict.results.$wrapper;
                // console.log(parent);
                // console.log("its hereeee");
                var allValues = (r.message).reverse();
                console.log(allValues);
                for (var i = 0; i < (allValues).length; i++) {
                    var pricelistRate = allValues[i][5];
                    console.log("this is the pricelistRate " + pricelistRate);
                    var row = $(
                        repl(
                            '<div class="row link-select-row">\
                    <div class="col-xs-2">\
                        <b><a href="#">%(name)s</a></b></div>\
                    <div class="col-xs-10">\
                        <span class="text-muted">%(values)s</span></div>\
                    </div>', {
                                name: allValues[i][0],
                                values: allValues[i].splice(1).join(", "),
                            }
                        )
                    ).appendTo(parent);
                    row.find("a")
                        .attr("data-value", allValues[i][0])
                        .attr("data-name", pricelistRate)
                        .click(function() {
                            var value = $(this).attr("data-value");
                            var price = $(this).attr("data-name");
                            set_in_grid(value, price,frm);
                            // console.log("item clicked ya sherif");
                        });
                }

            },

        });
    } catch (e) {
        alert(e);
        console.log(e);
    }
    dialog.show();
}

function search(priceListName,frm) {
    var txt = cur_dialog.fields_dict.txt.get_value();
    try {
        frappe.call({
            method: "sitems.customQueriesSalesInvoice.getItemsForSearch",
            // type: "GET",
            args: {
                priceListName
            },
            callback: function(r) {
                var parent = cur_dialog.fields_dict.results.$wrapper.children("div").remove();
                var updatedParent = cur_dialog.fields_dict.results.$wrapper;
                var allValues = (r.message).reverse();
                if (txt) {
                    for (var i = 0; i < (allValues).length; i++) {
                        if (allValues[i][0].includes(txt) || allValues[i][1].includes(txt)) {
                            var name = allValues[i][0];
                            var values = allValues[i];
                            var pricelistRate = allValues[i][5];
                            var row = $(
                                repl(
                                    '<div class="row link-select-row">\
                        <div class="col-xs-2">\
                            <b><a href="#">%(name)s</a></b></div>\
                        <div class="col-xs-10">\
                            <span class="text-muted">%(values)s</span></div>\
                        </div>', {
                                        name: name,
                                        values: values.splice(1).join(", "),
                                    }
                                )
                            ).appendTo(updatedParent);


                            row.find("a")
                                .attr("data-value", allValues[i][0])
                                .click(function() {
                                    var value = $(this).attr("data-value");
                                    var price = pricelistRate;
                                    // console.log("item clicked ya sherif");
                                    set_in_grid(value, price,frm);
                                });
                        }
                    }
                }
            },

        });
    } catch (e) {
        console.log(e)
        alert(e);
    }
    // dialog.show();


}

function set_in_grid(value, price,frm) {
    var add = false;
    var existing = false;
    // console.log("set in grip");
    return new Promise((resolve) => {
        var alertString = "";
        var allGridData = frm.fields_dict.items.grid.data;
        if (allGridData.length > 0) {
            for (var i = 0; i < allGridData.length && existing == false; i++) {
                // console.log(allGridData[i].item_code);
                if (allGridData[i].item_code === value) {
                    // console.log("this is the item code similar " + allGridData[i].item_code)
                    add = false;
                    existing = true;
                    alertString = "موجودة في الصف";
                    msgprint(__("{1} " + alertString + " Item{0} ", [value, allGridData[i].idx]));
                }

                if (allGridData[i].item_code !== value) {
                    // console.log("item added");
                    add = true;
                    alertString = "added";

                }
            }


            if (allGridData.length == 0 || add == true) {
                // console.log("add is true");
                let d = frm.fields_dict.items.grid.add_new_row();
                frappe.model.set_value(
                    d.doctype,
                    d.name,
                );
                frappe.model.set_value(d.doctype, d.name, d.item_code = value, d.rate = price).then(() => {
                    frm.refresh_field("items");
                    frappe.show_alert(__("{0} " + alertString, [value]));
                    resolve()
                });
                add = false;
                // console.log("last add status " + add);
            }
        }

    });
}
///// END Method ///////////