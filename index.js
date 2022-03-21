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

const banknote = [10, 50, 100, 200, 500, 1000, 2000, 5000];

function correctStr(name) {
    return (typeof name === 'string' && name.length !== 0);
}

function correctInt(balance) {
    return typeof balance === 'number';
}

function correctObj(obj) {
    return (typeof obj === 'object');
}

function correctBanknote(key) {
    banknote.forEach(element => {
        if (element === key) {
            return true;
        }
    });

    return false;
}

function sumMoney(...obj) {
    let sum = 0;
    for (let i = 0; i < obj.length; i++) {
        for (let key in obj[i]) {
            if (correctBanknote(key)) {
                sum += key * obj[i][key];
            } else {
                throw new Error('Некорректная купюра');
            }

        }
    }
    return sum;
}
function correctClient(client) {
    return (correctObj(client) && correctStr(client.name) && correctInt(client.balance));
}

function correctClients(clients) {
    let flag = true;
    for (let i = 0; i < clients.length; i++) {
        if (!correctClient(clients[i])) {
            flag = false;
        }
    };
    return (Array.isArray(clients) && clients.length !== 0 && flag);
}


function createClient(name, balance = 0) {
    if (!correctStr(name) && !correctInt(balance)) {
        throw new Error('Некорректные данные');
    }
    return {
        name,
        balance
    };
}


function createBank(bankName, clients = []) {
    if (!correctStr(bankName) && !correctClients(clients)) {
        throw new Error('Некорректные данные');
    }
    return {
        bankName,
        clients,

        addClient: function (client) {
            if (!correctClient(client)) {
                throw new Error('Некорректно переданы данные данные')
            }
            const isClient = this.clients.find(el => el.name === client.name);

            if (isClient !== undefined) {
                throw new Error('Клиент уже в списке');
            }
            this.clients.push(client);
            return true;
        },

        removeClient: function (client) {

            if (!correctClient(client)) {
                throw new Error('Некорректные переданы данные');
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
    if (!correctObj(bankNotesRepository) && !correctObj(bank)) {
        throw new Error('Некорректные данные');
    }

    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,

        setClient: function (client) {
            if (!correctClient(client)) {
                throw new Error('Некорректные переданы данные');
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

        addMoney: function (money) {
            if (!correctObj(money)) {
                throw new Error('Некорректные данные');
            }

            if (this.currentClient === undefined) {
                throw new Error('Клиента не использует банкомат')
            }

            let sum = sumMoney(money);

            function f(b) {
                sum += sumMoney(b);
                return f;
            }

            f.toString = function () {
                return sum;
            }
            return f;
        },

        giveMoney: function (money) {
            if (this.currentClient === undefined) {
                throw new Error('Клиента не использует банкомат')
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
            for (let i = 0; i < masStorage.length; i++) {
                const cur = masStorage[i];
                if (cur[1] === 0 || sumMoney < i[0]) {
                    continue;
                }
                let banknotes = 0;
                if (sumMoney >= cur[0]) {
                    banknotes = Math.floor(sumMoney / cur[0]);
                    if (cur[1] >= banknotes) {
                        sumMoney -= cur[0] * banknotes;
                        cur[1] -= banknotes;
                        storage[cur[0]] += banknotes;
                        if (sumMoney === 0) {
                            break;
                        }
                    } else {
                        sumMoney -= cur[0] * cur[1];
                        storage[cur[0]] += cur[1];
                        cur[1] = 0;
                    }
                }
            }

            this.notesRepository = Object.fromEntries(masStorage.map(([key, value]) => [key, value]));

            if (sumMoney !== 0) {
                throw new Error('Не хватает купюр');
            }

            this.currentClient.balance -= money;
            return storage;
        }


    };
}


module.exports = { createClient, createBank, createBankomat };
