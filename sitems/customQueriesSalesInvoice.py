import json
from collections import defaultdict

import frappe
from frappe import scrub
from frappe.desk.reportview import get_filters_cond, get_match_cond
from frappe.utils import nowdate, unique

import erpnext
from erpnext.stock.get_item_details import _get_item_tax_template


@frappe.whitelist()
def getItemsForSearch(priceListName):
    # Get defalut warehouse for each item and get the actual_qty from the mentioned
    # warehouse
    allItems = frappe.get_all("Item")
    # priceListObjects = frappe.get_all("Item Price")
    allRows = []
    singleRow =[]

    for itemCode in allItems:
        defaultWarehous=""
        itemPrice = ""
        item = frappe.get_doc("Item",itemCode['name']).as_dict()
        # item_description = frappe.get_doc("Item",itemCode['name']).as_dict().description
        # item_name = frappe.get_doc("Item",itemCode['name']).as_dict().item_name
        # item_group = frappe.get_doc("Item",itemCode['name']).as_dict().item_group
        item_defaultsTable = item.item_defaults
        defaultWarehouse = [itemDefault['default_warehouse'].lower() for itemDefault in item_defaultsTable]
        defaultWarehous = defaultWarehouse[0]

        itemPrices = frappe.get_all(
		"Item Price",
		filters={
			"price_list": priceListName,
			"item_code": itemCode['name'],
		},
		fields=["price_list_rate"],
	    )
        if itemPrices:
            itemPrice = itemPrices[0].price_list_rate
        actualQty = frappe.db.get_value("Bin",
        filters={"item_code": itemCode['name'],"warehouse":defaultWarehous},
        fieldname=['actual_qty'])
    
        singleRow = [itemCode['name'],item.item_name,item.item_group,item.description,actualQty,itemPrice,defaultWarehous]
        allRows.append(singleRow)
        
    print(f"all rows are {allRows}")
    return allRows
    

