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
function createClient(name, balance) {
    if (typeof name !== 'string' || typeof balance !== 'number') {
        throw new Error();
    }
    return {
        name: name,
        balance: balance || 0
    }
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
    if (typeof bankName !== 'string' || !clients instanceof Array) {
        throw new Error();
    }
    return {
        bankName: bankName,
        clients: clients || [],
        addClient(person) {
            if (!person instanceof Client || clients.includes(person)) throw new Error();
            this.clients.push(person);
            return true;
        },
        removeClient(person) {
            if (!person instanceof Client || !clients.includes(person)) throw new Error();
            this.clients = this.clients.filter(client => client !== person);
            return true;
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
function createBankomat(bankNotesRepository, bank) {
    return {
        bank: bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient(person) {
            if (!bank.clients.includes(person) || this.currentClient) throw new Error();
            this.currentClient = person;
            return true
        },
        removeClient(person) {
            if (this.currentClient !== person || !this.currentClient) throw new Error();
            this.currentClient = undefined;
            return true;
        },
        addMoney(banknotes) {

        },
        giveMoney(banknotes) {

        }
    }
}

module.exports = {createClient, createBank, createBankomat};
