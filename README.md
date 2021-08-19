# Case for Sellvation 
A small backend server with some logic to interact with a DB and REST API. 

## SQL Syntax for inserting data 
INSERT INTO products 
VALUES () 

## SQL Syntax for retrieving all rows
SELECT sku, name, list_price
FROM products

## SQL Syntax for retrieving single item based on sku
SELECT sku, name, list_price
FROM products
WHERE sku = {sku}