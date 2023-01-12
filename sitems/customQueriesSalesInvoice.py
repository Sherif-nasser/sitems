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
    priceListObjects = frappe.get_all("Item Price")
    allRows = []
    singleRow =[]

    for itemCode in allItems:
        defaultWarehous=""
        itemPrice = ""
        item_description = frappe.get_doc("Item",itemCode['name']).as_dict().description
        item_name = frappe.get_doc("Item",itemCode['name']).as_dict().item_name
        item_group = frappe.get_doc("Item",itemCode['name']).as_dict().item_group
        item_defaultsTable = frappe.get_doc("Item",itemCode['name']).as_dict().item_defaults
        defaultWarehouse = [itemDefault['default_warehouse'].lower() for itemDefault in item_defaultsTable]
        defaultWarehous = defaultWarehouse[0]
        print(f"this is the default wAREHOUSE {defaultWarehous} for {itemCode['name']} , {item_description}, {item_group}")
        for name in priceListObjects:
            itemPrices = frappe.get_doc("Item Price",name['name']).as_dict()
            if itemPrices.price_list == priceListName and itemPrices.item_code == itemCode['name']:
                itemPrice = itemPrices.price_list_rate 
                # print(f"this is the PRIIIICE LIIIST {itemPrice}")
        actualQty = frappe.db.get_value("Bin",
        filters={"item_code": itemCode['name'],"warehouse":defaultWarehous},
        fieldname=['actual_qty'])

        # if actualQty:
        #     print(f"this is the ACTUAL QTY  {actualQty} for {itemCode['name']}")
        singleRow = [itemCode['name'],item_name,item_group,item_description,actualQty,itemPrice]
        allRows.append(singleRow)
        
    print(f"all rows are {allRows}")
    return allRows
    

