const mongoose = require('mongoose');
const { InventoryTransaction, ProductBatch, Product } = require('./src/models');
const dotenv = require('dotenv');

dotenv.config();

const takeSnapshot = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('--- START SNAPSHOT BEFORE ---');
        
        const pendingImports = await InventoryTransaction.countDocuments({ type: 'IMPORT', status: 'PENDING' });
        const pendingExports = await InventoryTransaction.countDocuments({ type: 'EXPORT', status: 'PENDING' });
        
        const totalStockData = await ProductBatch.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: '$quantity' }
                }
            }
        ]);
        const totalStock = totalStockData.length > 0 ? totalStockData[0].totalStock : 0;
        
        console.log(`TOTAL_STOCK: ${totalStock}`);
        console.log(`PENDING_IMPORTS: ${pendingImports}`);
        console.log(`PENDING_EXPORTS: ${pendingExports}`);
        console.log('--- END SNAPSHOT ---');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
takeSnapshot();
