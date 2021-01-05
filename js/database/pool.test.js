require('iconv-lite').encodingExists('foo')
const pool = require('../database/pool')

describe('Работа с базой', () => {
    test('Подключение к базе данных', async ()=>{
        await pool.execute('SELECT COUNT(*) FROM users', (err, results)=>{
            if (err) { throw err; }
            else{
            expect(results.status_code).toBe(200)}
        })
    })
})