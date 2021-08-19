require('dotenv').config()
const express = require('express')
const axios = require('axios')
const pug = require('pug')
const Path = require('path')
const { PrismaClient } = require('@prisma/client')

const Product = require('./product.template')
const qiriBaseURL = process.env.QIRI_URL

const prisma = new PrismaClient()

const app = express()
const port = 3000

app.use(express.json())


/*
* This is just to seed the database with all the products that can be found at the endpoint
* provided in the case for Sellvation. The SKU's should be provided as an array in the payload (body)
* to start the procces. If a retrieval or insertion failed it will be returned in the response. 
*/

app.post('/seed/skus', async (req, res) => {
    const skus = req.body?.skus
    if(!skus || skus.length === 0 || !Array.isArray(skus)) return res.status(400).json({message: `No SKU's provided, please provide an array of SKU's`}) 
    
    let failedToRetrieve = []
    let failedToInsert = []

    try{
        for(let sku of skus){
            const product = (await axios.get(`${qiriBaseURL}&sku=${sku}`).catch(err => {
                console.error(err.response.data)
                failedToRetrieve = [...failedToRetrieve, {sku, reason: err.response.data.message}]
            }))?.data
            
            if(!product) continue
            
            await prisma.products.create({data: new Product(product)}).catch(err => {
                failedToInsert = [...failedToInsert, {sku, reason: err.message}]
            })
        }
    }catch(error){
        res.status(500).json({message: 'Could not update the DB with the provided skus'})
        return
    }

    return res.status(200).json({
        message: 'Inserted the products into the DB', 
        ...failedToInsert.length > 0 && {failedToInsert},
        ...failedToRetrieve.length > 0 && {failedToRetrieve},
    })
})


app.get('/product/:sku', async (req, res) => {
    const sku = req.params?.sku

    if(!sku) return res.status(400).json({message: 'No SKU was provided, please provide a sku to retrieve the product.'})

    try{
        const response = (await axios.get(`${qiriBaseURL}&sku=${sku}`))?.data

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
    const seedSKUs = ['103580','103613', '103664', '103850', '105146', '105149', '105167']
    const skus = bodySKUs ? bodySKUs : seedSKUs

    const template = Path.resolve(__dirname, `./productTable.template.pug`)
    let products = []

    for (let sku of skus){
        const product = (await axios.get(`${qiriBaseURL}&sku=${sku}`).catch(err => {
            console.error(err.response.data)
            failedToRetrieve = [...failedToRetrieve, {sku, reason: err.response.data.message}]
        }))?.data
        
        /* 
        * If product is undefined the product should not be rendered in the HTML-table. 
        * So we can skip this product and continue with the rest. 
        */ 
        if(!product) continue
    
        products = [...products, new Product(product)]
    }

    // Create an HTML-string based on the template
    const file = pug.renderFile(template, {products})

    if(file) return res.send(file)
    else return res.status(404).json({message: 'Could not find products'})
})


app.get('/pgTable', async (req, res) => {
    const template = Path.resolve(__dirname, `./productTable.template.pug`)
    
    const products = await prisma.products.findMany({
        select: {
            sku: true, 
            name: true, 
            list_price: true
        }
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

    if(!sku) return res.status(400).json({message: 'Please provide a SKU'})

    const product = await prisma.products.findFirst({
        where: {
            sku: sku
        },
        select:  {
            sku: true, 
            name: true,
            list_price: true
        }
    })
    
    if(product) {
        const {list_price, sku, name} = product
        return res.status(200).json({sku, name, listPrice: list_price})
    }
    else return res.status(404).json({message: `Could not find a product with sku ${sku}`})
})


app.listen(port, () => {
    console.log(`Qiri app listening at http://localhost:${port}`)
})