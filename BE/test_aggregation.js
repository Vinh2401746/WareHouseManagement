const mongoose = require('mongoose');
const config = require('./src/config/config');
const { InventoryTransaction } = require('./src/models');

const run = async () => {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  try {
    const res = await InventoryTransaction.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate', timezone: 'Asia/Ho_Chi_Minh' } }
          }
        }
      }
    ]);
    console.log("SUCCESS:", res.length);
  } catch (err) {
    console.error("Aggregation Error:", err.message);
  }
  process.exit(0);
}
run();
