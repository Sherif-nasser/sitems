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
    allItems = frappe.get_list("Item")
    # print(f"here is the warehouse  {itemNames}")
    # [{'name': '005'}, {'name': '004'}, {'name': '003'}, {'name': '002'}]
    itemNames= [name['name'] for name in allItems] ##item names
    print(itemNames)
    allRows = []
    singleRow =[]
    priceListObjects = frappe.get_all("Item Price")
    priceListNames = [name['name'] for name in priceListObjects]

    # print(f"this is the PRIIIICE LIIIST {priceListNames}")
    #[{'name': '3701a8797a'}, {'name': '0a36f4f289'}]


    for itemCode in itemNames:
        defaultWarehous=""
        itemPrice = ""
        item_description = frappe.get_doc("Item",itemCode).as_dict().description
        item_name = frappe.get_doc("Item",itemCode).as_dict().item_name
        item_group = frappe.get_doc("Item",itemCode).as_dict().item_group
        item_defaultsTable = frappe.get_doc("Item",itemCode).as_dict().item_defaults
        defaultWarehouse = [itemDefault['default_warehouse'].lower() for itemDefault in item_defaultsTable]
        defaultWarehous = defaultWarehouse[0]
        print(f"this is the default wAREHOUSE {defaultWarehous} for {itemCode} , {item_description}, {item_group}")
        for name in priceListNames:
            itemPrices = frappe.get_doc("Item Price",name).as_dict()
       
            if itemPrices.price_list == priceListName and itemPrices.item_code == itemCode:
                itemPrice = itemPrices.price_list_rate 
                print(f"this is the PRIIIICE LIIIST {itemPrice}")
        actualQty = frappe.db.get_value("Bin",
        filters={"item_code": itemCode,"warehouse":defaultWarehous},
        fieldname=['actual_qty'])

        if actualQty:
            print(f"this is the ACTUAL QTY  {actualQty} for {itemCode}")
        singleRow = [itemCode,item_name,item_group,item_description,actualQty,itemPrice]
        allRows.append(singleRow)
        
    # allRows.append(singleRow)
    print(f"all rows are {allRows}")
    return allRows
    

