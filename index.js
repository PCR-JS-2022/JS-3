"use strict";

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
    if (typeof name !== 'string' || typeof balance !== 'number') {
        throw new Error('Переданы некорректные данные.');
    }
    return {
        name,
        balance
    };
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
    if (typeof bankName !== 'string' || !Array.isArray(clients)) {
        throw new Error('Переданы некорректные данные.');
    }
    return {
        bankName,
        clients,
        addClient: function (client) {
            if (isInvalidClient(client)) {
                throw new Error('Некорректные данные клиента.');
            } else if (this.clients.some(existingClient => existingClient.name === client.name)) {
                throw new Error('Клиент уже существует.');
            } else {
                this.clients.push(client);
                return true;
            }
        },
        removeClient: function (client) {
            if (isInvalidClient(client)) {
                throw new Error('Некорректные данные клиента.');
            } else if (!this.clients.some(existingClient => existingClient.name === client.name)) {
                throw new Error('Клиента не существет');
            } else {
                this.clients = clients.filter(existingClient => existingClient.name !== client.name);
                return true;
            }
        }
    };
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
    if (typeof bankNotesRepository !== 'object' || isInvalidBank(bank)) {
        throw new Error('Переданы некорректные данные.');
    }
    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient: function (client) {
            if (this.currentClient !== undefined) {
                throw new Error('Одновременно с банкоматом может работать только 1 клиент.');
            } else if (!this.bank.clients.some(existingClient => existingClient.name === client.name)) {
                throw new Error('Банкоматом может пользоваться только клиент банка.');
            } else {
                this.currentClient = client;
                return true;
            }
        },
        removeClient: function () {
            this.currentClient = undefined;
            return true;
        },
        addMoney: function(...notes) {
            if (this.currentClient === undefined) {
                throw new Error('Клиент не ввыбран.');
            }
            notes.forEach((note) => {
                for (const key in note) {
                    this.notesRepository[key] += note[key];
                    const sum = key * note[key];
                    this.currentClient.balance += sum;
                }
            });
            return this.addMoney.bind(this);
        },
        giveMoney: function (notesSum) {
            if (this.currentClient === undefined) {
                throw new Error('Клиент не ввыбран.');
            } else if (this.currentClient.balance < notesSum) {
                throw new Error('Недостаточно средств.');
            } else if (notesSum % 10 !== 0) {
                throw new Error('Сумма не кратна 10.');
            }
            const resultObject = {};
            const keysArr =  Object.keys(this.notesRepository).reverse();
            console.log(keysArr);
            keysArr.forEach((e) => {
                const integerDiveder = parseInt(notesSum/e);
                if (notesRepository[e] === 0 || integerDiveder === 0 || integerDiveder > notesRepository[e]) return;
                resultObject[+e] = integerDiveder;
                notesRepository[e] -= integerDiveder;
                notesSum -= e * integerDiveder;
            });
            console.log(notesRepository);
            if (isEmptyObject(resultObject)) {
                throw new Error('У банкомата нет необходимых купюр для выдачи данной суммы.');
            }
            return resultObject;
        }
    }
}

function isInvalidClient(client) {
    return typeof client !== 'object' || 
        typeof client.name !== 'string' ||
        typeof client.balance !== 'number';
}

function isInvalidBank(bank) {
    return typeof bank !== 'object' ||
        typeof bank.bankName !== 'string' ||
        !Array.isArray(bank.clients) ||
        typeof bank.addClient !== 'function' ||
        typeof bank.removeClient !== 'function';
}

function isEmptyObject(obj) {
    for (const key in obj) {
        return false;
    }
    return true;
}

const notesRepository = {
    5000: 3,
    2000: 0,
    1000: 3,
    500: 5,
    200: 0,
    100: 0,
    50: 5,
    10: 5,
};

module.exports = { createClient, createBank, createBankomat };
