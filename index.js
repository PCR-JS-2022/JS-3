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
function createClient(name, balance= 0) {
    if (typeof name === "string" && typeof balance === "number")
        return {name,balance}
    else throw new Error("Ошибка ввода данных");
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients= []) {
    if (typeof bankName === "string" && Array.isArray(clients)) {
        return {
            bankName,
            clients,

            isValidClient(client) {
                return (client !== undefined && client.hasOwnProperty("name") && client.hasOwnProperty("balance")
                    && typeof client.name === "string" && typeof client.balance === "number")
            },

            findClient(client) {
                return this.clients.find(elem => elem.name === client.name)
            },

            addClient(client) {
                if (!this.findClient(client) && this.isValidClient(client)) {
                    clients.push(client);
                    return true
                } else throw new Error("Клиент не найден")
            },

            removeClient(client) {
                if (this.isValidClient(client)) {
                    const newArray = this.clients.filter(elem => elem.name !== client.name);
                    if (this.clients.length !== newArray.length) {
                        this.clients = newArray;
                        return true
                    }
                } else throw new Error("Клиент не удален")
            },
        }
    } else throw new Error("Ошибка создания банка");
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
    if (typeof bankNotesRepository === "object" && bank.hasOwnProperty("bankName")) {
        return {
            bank,
            notesRepository: bankNotesRepository,
            currentClient: undefined,

            isValidClient(client) {
                return (client !== undefined && client.hasOwnProperty("name") && client.hasOwnProperty("balance")
                    && typeof client.name === "string" && typeof client.balance === "number")
            },

            findClient(client) {
                return this.bank.clients.find(elem => elem.name === client.name)
            },

            setClient(client) {
                if (this.currentClient === undefined && this.isValidClient(client)
                    && this.findClient(client)) {
                    this.currentClient = client;
                    return true
                } else throw new Error("Клиент не установлен")
            },

            removeClient() {
                if (this.currentClient !== undefined && this.findClient(this.currentClient)) {
                    this.currentClient = undefined;
                    return true;
                } else throw new Error("Клиент не удален")
            },

            addMoney(...banknotes) {
                if (this.currentClient !== undefined && this.findClient(this.currentClient)) {
                    banknotes.forEach(banknote => {
                        for (let i in banknote) {
                            this.notesRepository[i] += banknote[i];
                            this.currentClient.balance += i * banknote[i];
                        }
                    })
                } else throw new Error("Деньги не зачислены");
                return this.addMoney.bind(this);
            },

            giveMoney(sum) {
                if (this.currentClient !== undefined && this.findClient(this.currentClient)) {
                    if (sum > this.currentClient.balance) {
                        throw new Error("Привышен лимит выдачи")
                    }
                    if (sum % 10 !== 0) {
                        throw new Error("Сумма не кратна 10")
                    }

                    const givenMoney = {
                        5000: 0,
                        2000: 0,
                        1000: 0,
                        500: 0,
                        200: 0,
                        100: 0,
                        50: 0,
                        10: 0
                    }

                    const sortedBankNotes = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]);
                    let currentSum = sum;
                    for (let bankNote of sortedBankNotes) {
                        if (bankNote[0] <= currentSum) {
                            while (currentSum >= bankNote[0] && currentSum !== 0
                            && this.notesRepository[bankNote[0]] !== 0) {
                                currentSum -= bankNote[0];
                                this.notesRepository[bankNote[0]] -= 1;
                                givenMoney[bankNote[0]] += 1
                            }
                        }
                    }
                    if (currentSum === 0) {
                        this.currentClient.balance -= currentSum;
                        return givenMoney
                    } else throw new Error("Не хватает купюр");
                } else throw new Error("Клиент не найден");
            },
        }
    } else throw new Error("Невалидные данные банка");
}

module.exports = { createClient, createBank, createBankomat };
