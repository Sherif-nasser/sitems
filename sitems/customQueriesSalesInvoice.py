import json
from collections import defaultdict

import frappe
from frappe import scrub
from frappe.desk.reportview import get_filters_cond, get_match_cond
from frappe.utils import nowdate, unique

import erpnext
from erpnext.stock.get_item_details import _get_item_tax_template


@frappe.whitelist()
def getItemsForSearch(priceListName,txt):
    # Get defalut warehouse for each item and get the actual_qty from the mentioned
    # warehouse
    # allItems = frappe.get_all("Item")
    if isinstance(txt, str):
        print("inside string")
        print(isinstance(txt, str))
        searchItems = frappe.get_list("Item",
        filters={
            'item_name':['like',f'%{txt}%'],
        },
        fields=["item_code"]
        )
        print(f'this is the search items{searchItems}')
    if txt.isdigit():
        print("inside int")
        print(isinstance(txt, str))
        searchItems = frappe.get_list("Item",
        filters={
            'item_code':['like',f'%{txt}%'],
        },
        fields=["item_code"]
        )
        print(f'this is the search items INTEGER{searchItems}')

    allRows = []
    singleRow =[]
    
    for itemCode in searchItems:
        defaultWarehous=""
        itemPrice = ""
        item = frappe.get_doc("Item",itemCode['item_code']).as_dict()
        item_defaultsTable = item.item_defaults
        defaultWarehouse = [itemDefault['default_warehouse'].lower() for itemDefault in item_defaultsTable]
        defaultWarehous = defaultWarehouse[0]

        itemPrices = frappe.get_all(
		"Item Price",
		filters={
			"price_list": priceListName,
			"item_code": itemCode['item_code'],
		},
		fields=["price_list_rate"],
	    )

        if itemPrices:
            itemPrice = itemPrices[0].price_list_rate
        actualQty = frappe.db.get_value("Bin",
        filters={"item_code": itemCode['item_code'],"warehouse":defaultWarehous},
        fieldname=['actual_qty'])
    
        singleRow = [itemCode['item_code'],item.item_name,item.item_group,item.description,actualQty,itemPrice,defaultWarehous]
        allRows.append(singleRow)
        
    print(f"all rows are {allRows}")
    return allRows
    

