const { 
    validateName,
    validateBalance,
    validateClient,
    validateClients,
    validateBank,
    validateNotesRepository
} = require("./validator")

const {
    checkClientInBank
} = require("./bank")


/**
 * @typedef Client
 * @type {object}
 * @property {string} name
 * @property {number} balance
 */

/**
 * @typedef Bank
 * @type {object}
 * @property {string} bankName
 * @property {Array<Client>} clients
 * @property {(client: Client) => boolean | Error} addClient
 * @property {(client: Client) => boolean | Error} removeClient
 */

/**
 * @typedef Bankomat
 * @type {object}
 * @property {Bank} bank
 * @property {{[key: string]: number}} notesRepository
 * @property {Client | undefined} currentClient
 * @property {(client: Client) => boolean} setClient
 * @property {(client: Client) => boolean} removeClient
 * @property {(notesRepository: {[key: string]: number}) => void} addMoney
 * @property {(sumToGive: number) => boolean | Error} giveMoney
 */

/**
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */
function createClient(name, balance = 0) {
    if (!validateName(name) || !validateBalance(balance)){
        throw new Error("Неверные данные")
    }
    return { name, balance }
}


/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
    if (!validateName(bankName)) {
        throw new Error("Невалидное имя банка")
    }
    if (!validateClients(clients)) {
        throw new Error("Неверные данные клиентов")
    }
    return {
        bankName,
        clients,
        addClient(client) {
            if (!validateClient(client)) {
                throw new Error("Неверные данные")
            }
            if (this.clients.some((x) => x.name == client.name))
                throw new Error("Клиента уже существует в массиве")
            this.clients.push(client)
            return true
        },
        removeClient(client) {
            checkClientInBank(this, client)
            this.clients = this.clients.filter((x) => x.name != client.name)
            return true
        }
    }
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(notesRepository, bank) {
    if (!validateNotesRepository(notesRepository)) {
        throw new Error("Неверные данные хранилища")
    }
    if (!validateBank(bank)) {
        throw new Error("Неверные данные банка")
    }
    return {
        notesRepository,
        bank,
        currentClient: undefined,
        setClient(client) {
            if (this.currentClient != undefined) {
                throw new Error("С банкоматом уже работает клиент")
            }
            checkClientInBank(this, client)
            this.currentClient = client
            return true
        },
        removeClient() {
            if (this.currentClient === undefined) {
                throw new Error("Нет клиентов работающих с банкоматом")
            }
            this.currentClient = undefined
            return true
        },
        addMoney(...money) {
            if (this.currentClient === undefined) {
                throw new Error("Нет клиентов работающих с банкоматом")
            }
            for (let nominals of money) {
                for (let nominal in nominals) {
                    this.notesRepository[nominal] += nominals[nominal]
                    this.currentClient.balance += nominal * nominals[nominal]
                }
            }
            return this.addMoney.bind(this)
        },
        giveMoney(sum) {
            if (this.currentClient === undefined) {
                throw new Error("Нет клиентов работающих с банкоматом")
            }
            if (typeof sum != "number") {
                throw new Error("Неправильно введена сумма")
            }
            if (sum % 10 != 0) {
                throw new Error("Банкомат не может выдавать сумму не кратную 10")
            }
            if (sum > this.currentClient.balance) {
                throw new Error("На счету недостаточно средств")
            }

            const banknotes = this.notesRepository.sort((first, second) => {
                if (first > second) {
                    return -1
                }
                if (first < second) {
                    return 1
                }
                return 0
            })

            const result = {}

            for (let nominal in banknotes) {
                while (nominal <= sum && this.notesRepository[nominal] > 0) {
                    if (result[nominal] === undefined) {
                        result[nominal] = 0
                    }
                    result[nominal] += 1
                    sum -= nominal
                    this.notesRepository[nominal] -= 1
                    if (sum == 0) {
                        break
                    }
                }
            }

            if (sum != 0) {
                throw new Error("Невозможно выдать заданную сумму")
            }
            this.currentClient.balance -= money
            return sum
        }
    }
}

module.exports = { 
    createClient, 
    createBank,
    createBankomat 
};



// const clients = Array.from({ length: 10 }, (_, index) =>
//     createClient(`name ${index}`, 100 + index)
// );
// const bank = createBank("Bibici", clients);
// // const notesRepository = {
// //     5000: 2,
// //     2000: 5,
// //     1000: 77,
// //     500: 3,
// //     200: 2,
// //     100: 2,
// //     50: 1,
// //     10: 6,
// // };
// // const bankomat = createBankomat(notesRepository, bank);
// const client = createClient("name", 200)
// bank.addClient(client)
// console.log(bank)