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

function checkClient(client) {
    return typeof client != 'object' ||
    !client.hasOwnProperty('name') || typeof client.name != 'string' || !client.name ||
    !client.hasOwnProperty('balance') || typeof client.balance != 'number';
}

function checkBank(bank) {
    return typeof bank === 'object' &&
    bank.hasOwnProperty('bankName') && typeof bank.bankName === 'string' && bank.bankName &&
    bank.hasOwnProperty('clients') && Array.isArray(bank.clients) &&
    bank.hasOwnProperty('addClient') &&
    bank.hasOwnProperty('removeClient');
}

/**
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */
function createClient(name, balance = 0) {
    if (typeof name != 'string' || !name || typeof balance != 'number') {
        throw new Error('Ошибка "createClient"');
    }
    return {name, balance};
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
    if (typeof bankName != 'string' || !bankName || !Array.isArray(clients)){
        throw new Error('Ошибка createBank');
    }
    return {
        bankName,
        clients,
        addClient: function addClient(client) {
            if (checkClient(client) ||
                this.clients.includes(client)) {
                throw new Error('Ошибка "addClient"');
            }
            this.clients.push(client);
            return true;
        },
        removeClient: function removeClient(client) {
            if (checkClient(client) ||
                !this.clients.includes(client)) {
                throw new Error('Ошибка "removeClient"');
            }
            this.clients = this.clients.filter(x => x !== client);
            return true;
        },
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
    if(!checkBank(bank) ||
    typeof bankNotesRepository != 'object' || !bankNotesRepository){
        throw new Error('Ошибка createBankomat');
    }
    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient: function setClient(client) {
            if (checkClient(client) || this.currentClient || !this.bank.clients.includes(client))
                throw new Error('Ошибка "setClient"');
            this.currentClient = client;
            return true;
        },
        removeClient: function removeClient() {
            this.currentClient = undefined;
            return true;
        },
        addMoney: function addMoney(...moneyPool) {
            if(!this.currentClient){
                throw new Error('Клиент не найден');
            }
            for (const money of moneyPool)
                for (const value in money) {
                    this.notesRepository[value] += money[value];
                    this.currentClient.balance += money[value] * value;
                }
            return this.addMoney.bind(this);
        },
        giveMoney: function giveMoney(money) {
            if(!this.currentClient){
                throw new Error('Клиент не найден');
            }
            if (money % 10 !== 0) {
                throw new Error('Невозможно выдать сумму не кратную 10');
            }
            if (this.currentClient.balance < money) {
                throw new Error('На счёте недостаточно денежных средств');
            }
            const values = [5000, 2000, 1000, 500, 200, 100, 50, 10];
            let moneyToGive = money;
            const notesToGive = values.reduce((notesToGive, value) => {
                let banknotesNeeded = Math.floor(moneyToGive / value);
                const keepingNotes = this.notesRepository[value];
                if (banknotesNeeded === 0){
                    return notesToGive;
                }
                if (keepingNotes < banknotesNeeded){
                    banknotesNeeded = keepingNotes;
                }
                moneyToGive -= banknotesNeeded * value;
                this.notesRepository[value] -= banknotesNeeded;
                notesToGive[value] = banknotesNeeded;
                return notesToGive;
            }, {});
            if(moneyToGive > 0){
                throw new Error('Недостаточно купюр в банкомате');
            }
            this.currentClient.balance -= money;
            return notesToGive;
        }
    }
}

module.exports = { createClient, createBank, createBankomat };
