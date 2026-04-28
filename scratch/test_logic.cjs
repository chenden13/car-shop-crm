const { api } = require('./src/lib/api'); // Wait, this won't work easily with imports

// I'll just check the logic
function testLogic(data, error) {
      let finalData = [];
      if (!error && data) {
        finalData = data.map(item => ({ id: item.id }));
      }

      if (finalData.length === 0) {
        return [{ id: 'MOCK' }];
      }
      return finalData;
}

console.log('Result 1 (Empty Data):', testLogic([], null));
console.log('Result 2 (Error):', testLogic(null, { message: 'not found' }));
