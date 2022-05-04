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
    if (typeof name !== "string" || typeof balance !== "number") {
        throw Error("Введены некоректные данные")
    }
    return {
        name: name,
        balance: balance
    }
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
    if (typeof bankName !== "string" || !Array.isArray(clients)) {
        throw Error("Введены некоректные данные")
    }

    function addClient(client) {
        if (typeof client === "undefined") {
            throw Error("Введены некоректные данные")
        }

        createClient(client.name, client.balance)

        if (clients.includes(client)) {
            throw Error("Данный клиент уже есть в списке клиентов банка")
        }
        this.clients.push(client)
        return true
    }

    function removeClient(client) {
        if (typeof client === "undefined") {
            throw Error("Введены некоректные данные")
        }
        createClient(client.name, client.balance)

        if (!clients.includes(client)) {
            throw Error("Данного клиента ещё нет в списке клиентов банка")
        }
        this.clients = this.clients.filter(i => {
            if (i !== client) {
                return i
            }
        })
        return true
    }

    return {
        bankName: bankName,
        clients: clients,
        addClient: addClient,
        removeClient: removeClient
    }
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
    createBank(bank.bankName, bank.clients)

    if (typeof bankNotesRepository !== "object" || typeof bank !== "object") {
        throw Error("Введены некоректные данные")
    }

    let currentClient = undefined

    function setClient(client) {
        createClient(client.name, client.balance)

        if (!bank.clients.includes(client)) {
            throw Error("Данного клиента ещё нет в списке клиентов банка")
        }
        if (this.currentClient !== undefined) {
            throw Error("Банкомат занят")
        }
        this.currentClient = client
        return true
    }

    function removeClient() {
        if (this.currentClient == undefined) {
            throw Error("Банкомат и так пуст")
        }
        this.currentClient = undefined
        return true
    }

    function addMoney(...bankNotes) {
        if (typeof bankNotes !== "object" || typeof this.currentClient == "undefined") {
            throw Error("Нет текущего клиента")
        }
        currentClient = this.currentClient
        
        nextAddMoney(...bankNotes)

        function nextAddMoney(...bankNotes) {
            Object.keys(bankNotesRepository).forEach(bankKey => {
                bankNotes.forEach(bankNote => {
                    Object.keys(bankNote).forEach(clientKey => {
                        if (bankKey == clientKey) {
                            bankNotesRepository[bankKey] += bankNote[clientKey]
                            currentClient.balance += clientKey * bankNote[clientKey]
                        }
                    })
                })
            })
            return nextAddMoney
        }

        return nextAddMoney
    }

    function giveMoney(money) {
        if (typeof this.currentClient == "undefined") {
            throw Error("Нет текущего клиента")
        }
        if (money <= 0) {
            throw Error("Введите сумму больше 0")
        }
        if (money > this.currentClient.balance) {
            throw Error("Недостаточно средств на балансе")
        }
        if (money % 10 != 0) {
            throw Error("Введите сумму кратную 10")
        }
        let bankNotes = {}
        Object.keys(bankNotesRepository)
            .reverse()
            .forEach(bankKey => {
                while (money - bankKey >= 0 && bankNotesRepository[bankKey] > 0) {
                    if (bankNotes[bankKey] == undefined) {
                        bankNotes[bankKey] = 0
                    }
                    bankNotes[bankKey] += 1
                    bankNotesRepository[bankKey] -= 1
                    money -= bankKey
                    this.currentClient.balance -= bankKey
                }
            })
        if (money != 0) {
            throw Error("В банкомате не хватает купюр")
        }
        return bankNotes
    }

    return {
        bank: bank,
        notesRepository: bankNotesRepository,
        currentClient: currentClient,
        setClient: setClient,
        removeClient: removeClient,
        addMoney: addMoney,
        giveMoney: giveMoney
    }
}

module.exports = { createClient, createBank, createBankomat };