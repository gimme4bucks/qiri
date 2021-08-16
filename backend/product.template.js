class ProductInsert {
    /**
     * @typedef Pricing
     * @property {number} vat
     * @property {string} currency
     * @property {number} listPrice
     * @property {number} sellingPrice
     * @property {number} unitQuantity
     * 
     * @typedef Availability
     * @property {boolean} unavailable
     * @property {boolean} availableInWebshop
     * 
     * @typedef Classification
     * @property {boolean} isOrganic
     * @property {boolean} isEcological
     * @property {boolean} isPrivateLabel 
     * 
     * @param {Object} args
     * @param {string} args.sku
     * @param {Object} args.product
     * @param {string} args.product.name
     * @param {string} args.product.unitType - for example 'stuks'
     * @param {Pricing} args.product.pricing 
     * @param {Availability} args.product.availabiltiy
     * @param {Classification} args.product.classification
     */
    constructor(args){
        console.log(args)
        const {
            sku,
            product,
            
        } = args
        const {
            name, 
            productID,
            unitType,
            pricing,
            unitQuantity,
            availability,
            classification,
        } = product
        const {
            listPrice,
            vat, 
            currency,
            sellingPrice, 
        } = pricing
        const {
            unavailable,
            availableInWebshop,
        } = availability
        const {
            isOrganic,
            isEcological,
            isPrivateLabel
        } = classification

        this.sku = sku
        this.name = name
        this.product_id = productID
        this.unit_type = unitType
        this.vat = vat
        this.currency = currency
        this.list_price = listPrice
        this.selling_price = sellingPrice
        this.unit_quantity = unitQuantity
        this.unavailable = unavailable
        this.available_in_webshop = availableInWebshop
        this.is_organic = isOrganic
        this.is_ecological = isEcological
        this.is_private_label = isPrivateLabel
    }
}
module.exports = ProductInsert
