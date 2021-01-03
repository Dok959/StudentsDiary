const pool = require('./pool')

describe('Работа с базой', () => {
    test('Подключение к базе данных', ()=>{
        pool.execute('SELECT COUNT(*) FROM users', (err, results)=>{
            expect(results.status_code).toBe(200)
        })
        // expect(result.status_code).toBe(200)
    })
})