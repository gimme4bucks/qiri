require('dotenv').config()
const express = require('express')
const axios = require('axios')
const pug = require('pug')
const Path = require('path')
const { PrismaClient } = require('@prisma/client')

const ProductInsert = require('./product.template')
const selectPermissions = require('./selectPermissions')
const qiriBaseURL = process.env.QIRI_URL

const prisma = new PrismaClient()

const app = express()
const port = 9000

app.use(express.json())

/*
* This is just to seed the database with all the products that can be found at the endpoint
* provided in the case for Sellvation. The SKU's should be provided as an array in the payload (body)
* to start the procces. If a retrieval or insertion failed it will be returned in the response. 
*/

app.post('/seed/skus', async (req, res) => {
    const skus = req.body?.skus
    // At the moment I chose to let the call fail when no array was provided
    if(!skus || skus.length === 0 || !Array.isArray(skus)) return res.status(400).json({message: `No SKU's provided, please provide an array of SKU's`}) 
    
    let failedToRetrieve = []
    let failedToInsert = []

    try{
        for(let sku of skus){
            // Get the products from Qiri, if an SKU is entered that is not in Qiri product should default to undefined. 
            const product = (await axios.get(`${qiriBaseURL}&sku=${sku}`).catch(err => {
                console.error(err.response.data)
                failedToRetrieve = [...failedToRetrieve, {sku, reason: err.response.data.message}]
            }))?.data
            
            // If product is undefined the insert into the DB should not happen and we should skip to the next sku (if any)
            if(!product) continue

            // Create insertable objects from the response
            await prisma.products.create({data: new ProductInsert(product)}).catch(err => {
                failedToInsert = [...failedToInsert, {sku, reason: err.message}]
            })
            
        }
    }catch(error){
        res.status(500).json({message: 'Could not update the DB with the provided products'})
        return
    }

    // Return only the arrays if there are items in them. 
    return res.status(200).json({
        message: 'Inserted the products into the DB', 
        ...failedToInsert.length > 0 && {failedToInsert},
        ...failedToRetrieve.length > 0 && {failedToRetrieve},
    })
})


app.get('/product/:sku', async (req, res) => {
    const sku = req.params?.sku

    // If no sku was provided return an object indicating this. 
    if(!sku) return res.status(400).json({message: 'No SKU was provided, please provide a sku to retrieve the product.'})
    
    try{
        // Get the products from Qiri, if an SKU is entered that is not in Qiri product should default to undefined. 
        const response = (await axios.get(`${qiriBaseURL}&sku=${sku}`))?.data

        // If there is a response, format the object to the specified data points described in the case
        if(response) {
            const {product} = response
            const {name, pricing} = product
            const {listPrice, currency} = pricing
            return res.status(200).json({sku, name, listPrice, currency})
        }else {
            return res.status(404).json({message: 'Could not find product'})
        }
    }catch(err){
        console.error(err)
        return res.status(500).json({message: 'Something went wrong trying to retreive product, please look at the logs.'})
    }
})

app.get('/table', async (req, res) => {
    const bodySKUs = req.body?.skus

    // If no array was provided take the default array as described in the case. 
    const seedSKUs = ['103850','103580','103613', '103664', '103850', '105146', '105149', '105167']
    const skus = bodySKUs ? bodySKUs : seedSKUs

    // Get the path to the pug template to render the HTML-table. 
    const template = Path.resolve(__dirname, `./productTable.template.pug`)
    let products = []

    for (let sku of skus){
        // Retrieve the product with the provided sku. 
        const product = (await axios.get(`${qiriBaseURL}&sku=${sku}`).catch(err => {
            console.error(err.response.data)
            failedToRetrieve = [...failedToRetrieve, {sku, reason: err.response.data.message}]
        }))?.data
        
        /* 
        * If product is undefined the product should not be rendered in the HTML-table. 
        * So we can skip this product and continue with the rest. 
        */ 
        if(!product) continue
    
        products = [...products, new ProductInsert(product)]
    }

    // Create an HTML-string based on the template
    const file = pug.renderFile(template, {products})

    /* 
    * If the HTML-string was created send the string to the browser. 
    * Else return a 404 error telling that the products could nog be found
    */ 

    if(file) return res.send(file)
    else return res.status(404).json({message: 'Could not find products'})
})

app.get('/pgTable', async (req, res) => {
    // Get the path to the pug template to render the HTML-table. 
    const template = Path.resolve(__dirname, `./productTable.template.pug`)
    
    // Retrieve the products from the database. 
    const products = await prisma.products.findMany({
        select: selectPermissions['enitireTable']
    })

    /* 
    * Create an HTML-string based on the template if the products were found
    * Unlike the endpoint /table there does not need to be a check on if a HTML-string
    * was created since we can asume the database was filled with products and there 
    * should be enough info to create a table
    */

    if(products) return res.send(pug.renderFile(template, {products}))
    else return res.status(404).json({message: 'Could not find products in the table.'})
})

app.get('/pgTable/:sku', async (req, res) => {
    const sku = req.params?.sku

    // If no SKU was provided a message should be returned the request was malformed and a SKU should be provided
    if(!sku) return res.status(400).json({message: 'Please provide a SKU'})

    // Select the product matching the SKU
    const product = await prisma.products.findFirst({
        where: {
            sku: sku
        }
    })

    // If  a product was found, return it, otherwise return 404 with a message the product could not be found. 
    if(product) return res.status(200).json({data: product})
    else return res.status(404).json({message: `Could not find a product with sku ${sku}`})
})

app.listen(port, () => {
    console.log(`Qiri app listening at http://localhost:${port}`)
})