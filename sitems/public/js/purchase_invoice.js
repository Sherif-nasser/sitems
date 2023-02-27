///// Method ///////////
frappe.ui.form.on("Purchase Invoice", "add_multiple", function(frm) {
    console.log("clicked");
    var priceListName = cur_frm.fields_dict.buying_price_list.input.value;
    return make(priceListName,frm);
});


function make(priceListName,frm) {
    var dialog = new frappe.ui.Dialog({
        title: "Select Items",
        fields: [{
                fieldtype: "Data",
                fieldname: "txt",
                label: "Beginning with",
                description: "You can use wildcard %",
                change() {
                    var text = dialog.fields_dict.txt.get_value();
                    // var txtClass = dialog.fields_dict.txt.$wrapper[0].className;
                    search(priceListName,frm,text);
                    console.log(text);
                }
            },
            {
                fieldtype: "HTML",
                fieldname: "results",
            }
        ],
        primary_action_label: __("Search"),
        primary_action: function() {
            search(priceListName,frm);
            // frappe.prompt('txt', ({ value }) => console.log(value))
        },
       
    });
    dialog.show();
    // try {
    //     frappe.call({
    //         method: "sitems.customQueriesSalesInvoice.getItemsForSearch",
    //         // type: "GET",
    //         args: {
    //             priceListName
    //         },
    //         callback: function(r) {
    //             var parent = dialog.fields_dict.results.$wrapper;
    //             // console.log(parent);
    //             // console.log("its hereeee");
    //             var allValues = (r.message).reverse();
    //             console.log(allValues);
    //             for (var i = 0; i < (allValues).length; i++) {
    //                 var pricelistRate = allValues[i][5];
    //                 console.log("this is the pricelistRate " + pricelistRate);
    //                 var row = $(
    //                     repl(
    //                         '<div class="row link-select-row">\
    //                 <div class="col-xs-2">\
    //                     <b><a href="#">%(name)s</a></b></div>\
    //                 <div class="col-xs-10">\
    //                     <span class="text-muted">%(values)s</span></div>\
    //                 </div>', {
    //                             name: allValues[i][0],
    //                             values: allValues[i].splice(1).join(", "),
    //                         }
    //                     )
    //                 ).appendTo(parent);
    //                 row.find("a")
    //                     .attr("data-value", allValues[i][0])
    //                     .attr("data-name", pricelistRate)
    //                     .click(function() {
    //                         var value = $(this).attr("data-value");
    //                         var price = $(this).attr("data-name");
    //                         set_in_grid(value, price,frm);
    //                         // console.log("item clicked ya sherif");
    //                     });
    //             }

    //         },

    //     });
    // } catch (e) {
    //     alert(e);
    //     console.log(e);
    // }
    // autoInvoke(frm,priceListName);
    
}



function search(priceListName,frm,text=null) {
    // console.log(cur_dialog.fields_dict.txt);
    var txt = "";

    if(text){
         txt = text;
    }else{
         txt = cur_dialog.fields_dict.txt.get_value();
    }
    
    try {
        if(txt){
        frappe.call({
            method: "sitems.customQueriesSalesInvoice.get_items_for_search_PI",
            // type: "GET",
            args: {
                priceListName,
                txt
            },
            callback: function(r) {
                var parent = cur_dialog.fields_dict.results.$wrapper.children("div").remove();
                var updatedParent = cur_dialog.fields_dict.results.$wrapper;
                var tableHeads = $(
                    repl(
                        `
                        <div class="container" style="padding-right:0px !important;padding-left:0px !important;">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                    <th scope="col">Item code</th>
                                    <th scope="col">Item name</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Partial Quantity</th>
                                    <th scope="col">Stock price</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        `
                    )
                ).appendTo(updatedParent)
              
                
                
                var allValues = (r.message).reverse();
                
                    for (var i = 0; i < (allValues).length; i++) {
                        if (allValues[i][0].includes(txt) || allValues[i][1].includes(txt)) {
                            var code = allValues[i][0];
                            // var values = allValues[i];
                            var item_name = allValues[i][1];
                            var item_group = allValues[i][2];
                            var item_description = allValues[i][3];
                            var Quantity = allValues[i][4];
                            var partialQty = allValues[i][5];
                            var price = allValues[i][6]; 
                            
                            var pricelistRate = allValues[i][6];
                            var row = $(

                                repl(
                                    `
                                    
                                        <tbody>
                                            <tr>
                                            <th scope="row">
                                                <b><a href="#">%(code)s</a></b>
                                            </th>
                                            <td>
                                                <span class="text-muted">%(item_name)s</span>
                                            </td>
                                          
                                            <td>
                                                <span class="text-muted">%(Quantity)s</span>
                                            </td>
                                            <td>
                                                <span class="text-muted">%(partialQty)s</span>
                                            </td>
                                            <td>
                                                <span class="text-muted">%(price)s</span>
                                            </td>
                                            
                                            </tr>
                                        </tbody>
                                 
                                            `                            
                                    , {
                                        code: code,
                                        item_name:item_name,
                                        item_group:item_group,
                                        item_description:item_description,
                                        Quantity:Quantity,
                                        partialQty:partialQty,
                                        price:price

                                    }
                                )
                   
                            ).appendTo(updatedParent.children()[0].children[0])
                           


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
                
            },

        });
        }
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