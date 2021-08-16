require('dotenv').config()
const express = require('express')
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')

const ProductInsert = require('./product.template')
const qiriBaseURL = process.env.QIRI_URL

const prisma = new PrismaClient()

const app = express()
const port = 9000

app.use(express.json())

app.post('/seed/skus', async (req, res) => {
    const skus = req.body?.skus
    if(!(skus.length > 0) || !(typeof skus === 'object')) {
        res.status(400).json({message: `No SKU's provided, please provide an array of SKU's`})
        return
    }

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

    return res.status(200).json({
        message: 'Inserted the products into the DB', 
        ...failedToInsert.length > 0 && {failedToInsert},
        ...failedToRetrieve.length > 0 && {failedToRetrieve},
    })
})


app.get('/product/:sku', async (req, res) => {
    const sku = req.params?.sku
    try{
        // Get the products from Qiri, if an SKU is entered that is not in Qiri product should default to undefined. 
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

})

app.get('/pgTable', async (req, res) => {
    const table = await prisma.products.findMany({
        select: {
            id: false,
            sku: true, 
            name: true, 
            product_id: true, 
            unit_type: true,
            currency: true,
            list_price: true,
            vat: true, 
            selling_price: true, 
            unit_quantity: true, 
            unavailable: true, 
            available_in_webshop: true,
            is_organic: true, 
            is_ecological: true, 
            is_private_label: true
        }
    })
    if(table){
        return res.status(200).json(table)
    }else{
        return res.status(500)
    }
})

app.get('/pgTable/:sku', async (req, res) => {
    const sku = req.params.sku
    const product = await prisma.products.findFirst({
        where: {
            sku: sku
        }
    })
    if(product) return res.status(200).json({data: product})
    else return res.status(404).json({message: `Could not find a product with sku ${sku}`})
})

app.listen(port, () => {
    console.log(`Qiri app listening at http://localhost:${port}`)
})