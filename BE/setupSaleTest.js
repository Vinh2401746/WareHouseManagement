const mongoose = require('mongoose');
const { User, Product, Warehouse, Branch, ProductBatch, Customer, Unit } = require('./src/models');
const dotenv = require('dotenv');

dotenv.config();

const setupSaleTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('--- SETUP SALE TEST DATA ---');
        
        let branch = await Branch.findOne();
        if(!branch) branch = await Branch.create({ name: 'Hanoi Branch', code: 'HN01', address: 'Hanoi' });

        let warehouse = await Warehouse.findOne({ branch: branch._id });
        if(!warehouse) warehouse = await Warehouse.create({ name: 'Hanoi Warehouse', code: 'HNW01', branch: branch._id });

        let unit = await Unit.findOne();
        if(!unit) unit = await Unit.create({ name: 'Cái', code: 'CAI' });

        // Update product or create one with selling price
        const productCode = 'TEST_SP01';
        let product = await Product.findOne({ code: productCode });
        if(!product) {
           product = await Product.create({ name: 'Test Product Sale', code: productCode, unit: unit._id, minStock: 10, sellingPrice: 50000 });
        } else {
           product.sellingPrice = 50000;
           await product.save();
        }

        // Clean up old batches for this product
        await ProductBatch.deleteMany({ product: product._id });

        // Create Batch 1: Expiring earlier
        const batch1 = await ProductBatch.create({
            batchCode: 'B_EARLY',
            product: product._id,
            warehouse: warehouse._id,
            quantity: 3,
            importPrice: 30000,
            expiryDate: new Date('2030-01-01T00:00:00Z'),
            manufactureDate: new Date('2024-01-01T00:00:00Z')
        });

        // Create Batch 2: Expiring later
        const batch2 = await ProductBatch.create({
            batchCode: 'B_LATER',
            product: product._id,
            warehouse: warehouse._id,
            quantity: 7,
            importPrice: 30000,
            expiryDate: new Date('2030-02-01T00:00:00Z'),
            manufactureDate: new Date('2024-01-01T00:00:00Z')
        });

        // Create a customer
        let customer = await Customer.findOne({ phone: '0987654321' });
        if(!customer) {
            customer = await Customer.create({
                name: 'Test Customer',
                phone: '0987654321',
                email: 'customer@test.com',
                branch: branch._id
            });
        }

        console.log(`Product: ${product.name} (Selling Price: ${product.sellingPrice})`);
        console.log(`Batch 1 Qty: ${batch1.quantity}, Batch 2 Qty: ${batch2.quantity}`);
        console.log(`Total Stock: 10`);

        console.log('--- END SETUP ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
setupSaleTestData();
