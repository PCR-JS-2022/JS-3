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


/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */


/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */

const correctBanknotes = [10, 50, 100, 200, 500, 1000, 2000, 5000];

function addStorage(listMoney, bank) {
    listMoney.forEach(money => {
        for (let banknote in money) {
            bank.notesRepository[banknote] += money[banknote];
            bank.currentClient.balance += banknote * money[banknote];
        };
    });
}

function isStr(name) {
    return (typeof name === 'string' && name.length !== 0);
}

function isInt(balance) {
    return typeof balance === 'number';
}

function isObject(object) {
    return (typeof object === 'object');
}

function isMoney(listMoney) {
    listMoney.forEach(money => {
        for (let banknote in money) {
            if (!correctBanknotes.includes(banknote)) {
                return false;
            }
        }
    });
    return true;
}

function isClient(client) {
    return (isObject(client) && isStr(client.name) && isInt(client.balance));
}

function isClients(clients) {
    clients.forEach(client => {
        if (!isClient(client)) {
            return false;
        }
    });
    return (Array.isArray(clients) && clients.length !== 0);
}


function createClient(name, balance = 0) {
    if (!isStr(name) && !isInt(balance)) {
        throw new Error('Некорректные данные');
    }
    return {
        name,
        balance
    };
}


function createBank(bankName, clients = []) {
    if (!isStr(bankName) && !isClients(clients)) {
        throw new Error('Некорректные данные');
    }
    return {
        bankName,
        clients,

        addClient: function (client) {
            if (!isClient(client)) {
                throw new Error('Некорректные данные')
            }
            
            const isClients = this.clients.find(el => el.name === client.name);

            if (isClients !== undefined) {
                throw new Error('Клиент уже в списке');
            }
            this.clients.push(client);
            return true;
        },

        removeClient: function (client) {

            if (!isClient(client)) {
                throw new Error('Некорректные данные');
            }
            if (!this.clients.includes(client)) {
                throw new Error('Клиента нет в списке');
            }

            this.clients = this.clients.filter(el => el.name !== client.name)
            return true;
        }
    }
}

function createBankomat(bankNotesRepository, bank) {
    if (!isObject(bankNotesRepository) && !isObject(bank)) {
        throw new Error('Некорректные данные');
    }

    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,

        setClient: function (client) {
            if (!isClient(client)) {
                throw new Error('Некорректные данные');
            }
            const clientIsBank = this.bank.clients.find(el => el.name === client.name);
            if (clientIsBank === undefined) {
                throw new Error('Данный клиент не принадлежит этому банку')
            }
            if (this.currentClient !== undefined) {
                throw new Error('Банкомат занят');
            }
            this.currentClient = client;
            return true;
        },

        removeClient: function () {
            this.currentClient = undefined;
            return true;
        },

        addMoney: function (...money) {
            if (!isObject(money) && !isMoney(money)) {
                throw new Error('Некорректные данные');
            }

            if (this.currentClient === undefined) {
                throw new Error('Клиента не использует банкомат')
            }

            addStorage(money, this);

            return this.addMoney.bind(this);
        },

        giveMoney: function (money) {
            if (this.currentClient === undefined) {
                throw new Error('Клиент не использует банкомат')
            }

            if (this.currentClient.balance < money) {
                throw new Error('На балансе не хватает средств');
            }

            if (money % 10 !== 0 && money > 0) {
                throw new Error('Сумма должна быть корректная');
            }
            let sumMoney = money;
            let storage = {
                5000: 0,
                2000: 0,
                1000: 0,
                500: 0,
                200: 0,
                100: 0,
                50: 0,
                10: 0,
            };

            let masStorage = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]);
            masStorage.forEach(el => {
                let banknotes = 0;
                if (sumMoney >= el[0] && el[1] !== 0) {
                    banknotes = Math.floor(sumMoney / el[0]);
                    if (el[1] >= banknotes) {
                        sumMoney -= el[0] * banknotes;
                        el[1] -= banknotes;
                        storage[el[0]] += banknotes;
                    } else {
                        sumMoney -= el[0] * el[1];
                        storage[el[0]] += el[1];
                        el[1] = 0;
                    }
                }
            });
            if (sumMoney !== 0) {
                throw new Error('Не хватает купюр');
            }
            this.notesRepository = Object.fromEntries(masStorage.map(([key, value]) => [key, value]));
            this.currentClient.balance -= money;
            return storage;
        }
    };
}


module.exports = { createClient, createBank, createBankomat };
