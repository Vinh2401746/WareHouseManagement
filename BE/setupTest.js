const mongoose = require('mongoose');
const { User, InventoryTransaction, Product, Warehouse, Branch, Role } = require('./src/models');
const dotenv = require('dotenv');

dotenv.config();

const setupTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('--- SETUP TEST DATA ---');

        const roles = await Role.find();
        console.log('Available roles:', roles.map(r => r.code).join(', '));
        
        let branch = await Branch.findOne();
        if(!branch) {
           branch = await Branch.create({ name: 'Hanoi Branch', code: 'HN01', address: 'Hanoi' });
        }

        let warehouse = await Warehouse.findOne({ branch: branch._id });
        if(!warehouse) {
           warehouse = await Warehouse.create({ name: 'Hanoi Warehouse', code: 'HNW01', branch: branch._id });
        }

        let product = await Product.findOne();
        if(!product) {
           product = await Product.create({ name: 'Test Product', code: 'TP01', unit: 'Cái', minStock: 10 });
        }

        let user = await User.findOne({ email: 'admin@gmail.com' });
        if(!user) {
            console.log('Admin user not found!');
        } else {
            console.log('Creating pending transaction...');
            const trans = await InventoryTransaction.create({
                type: 'IMPORT',
                status: 'PENDING',
                warehouse: warehouse._id,
                createdBy: user._id,
                transactionDate: new Date(),
                items: [{
                    product: product._id,
                    quantity: 50,
                    price: 150000,
                    amount: 7500000
                }],
                totalAmount: 7500000,
                reason: 'Test E2E Dashboard'
            });
            console.log('Transaction created:', trans._id);
        }

        console.log('--- END SETUP ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
setupTestData();
