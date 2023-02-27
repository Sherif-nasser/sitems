var outstanding_amount = 0;
var paid_amount = 0;
var check = 1;
frappe.ui.form.on('Payment Entry', {

    refresh(frm){
        outstanding_amount = frm.doc.references[0].outstanding_amount;
        paid_amount = frm.doc.references[0].allocated_amount;

        // console.log(outstanding_amount);
        // console.log(paid_amount);
        // console.log(frm.doc.docstatus != 1);
        // console.log(outstanding_amount != paid_amount);

        if(frm.doc.docstatus != 1 || outstanding_amount !=paid_amount)
        {
                frm.toolbar.print_icon.hide();
        }
        

    },

    on_submit:function(frm){
        frm.toolbar.print_icon.show();
    },


});


