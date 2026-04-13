const mongoose = require('mongoose');
const { ProductBatch, Product } = require('./src/models');
const dotenv = require('dotenv');

dotenv.config();

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('--- VERIFY DATA AFTER SALE ---');
        
        const product = await Product.findOne({ code: 'TEST_SP01' });
        if(!product) {
           console.log('Test product not found!');
        } else {
           const batches = await ProductBatch.find({ product: product._id }).sort({ expiryDate: 1 });
           
           console.log(`Product: ${product.name}`);
           batches.forEach((b, i) => {
               console.log(`Batch ${i+1} (${b.batchCode}) - Expiry: ${b.expiryDate.toISOString().split('T')[0]} - Remaining Qty: ${b.quantity}`);
           });

           const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
           console.log(`Total Stock: ${totalStock}`);
        }

        console.log('--- END VERIFY ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
verifyData();
