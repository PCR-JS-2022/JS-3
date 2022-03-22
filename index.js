'use strict'

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


// ПРОВЕРКИ
function strParamValid(param) {
    return param && typeof (param) === 'string' && param !== '';
}
function clientValid(name, balance) {
    return strParamValid(name) && typeof balance === 'number'
}
function bankValid(bankName, clients) {
    return strParamValid(bankName) && Array.isArray(clients) && clients.every((client) => {
        return clientValid(client.name, client.balance)
    })
}
function bankNotesRepositoryValid(bankNotesRepository) {
    const avaliableBankNotes = ['5000', '2000', '1000', '500', '200', '100', '50', '10'];
    return bankNotesRepository && typeof (bankNotesRepository) === 'object' &&
        Object.entries(bankNotesRepository).every(
            ([key, value]) => {
                return typeof (key) === 'string'
                    && typeof (value) === 'number'
                    && avaliableBankNotes.includes(key)
            })
}

function bankomatValid(bankNotesRepository, bank) {
    return bankNotesRepositoryValid(bankNotesRepository)
        && bankValid(bank.bankName, bank.clients)
}
// ПРОВЕРКИS

function createClient(name, balance = 0) {
    if (!clientValid(name, balance)) {
        throw new Error('Создать клиента не есть возможно');
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


function createBank(bankName, clients = []) {
    if (!(bankValid(bankName, clients))) {
        throw new Error('Введенное про банк не есть верно');
    };
    return {
        bankName,
        clients,
        addClient(client) {
            if (!clientValid(client.name, client.balance) || this.clients.includes(client)) {
                throw new Error('Добавить клиента не есть возможно');
            }
            clients.push(client);
            return true
        },
        removeClient(client) {
            if (!(clientValid(client.name, client.balance)) || !this.clients.includes(client)) {
                throw new Error('Удалить клиента не есть возможно');
            }
            this.clients = this.clients.filter((badClient) => badClient !== client);
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
function createBankomat(bankNotesRepository, bank) {
    if (!bankomatValid(bankNotesRepository, bank)) {
        throw new Error('Создать банкомат не есть возможно')
    }
    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient(client) {
            if (!this.bank.clients.includes(client) ||
                this.currentClient !== undefined ||
                !clientValid(client.name, client.balance)) {
                throw new Error('Установить клиента не есть возможно')
            }
            this.currentClient = client;
            return true
        },
        removeClient() {
            if (this.currentClient === undefined) {
                throw new Error('Удалить клиента не есть возможно ибо нет действующего клиента')
            };
            this.currentClient = undefined;
            return true
        },
        addMoney(...green) {
            if (this.currentClient === undefined || !green.every((value) => { return bankNotesRepositoryValid(value) })
            ) {
                throw new Error('Добавить деняк не есть возможно')
            };
            green.forEach((lettice) => {
                Object.entries(lettice)
                    .forEach(([bankNote, qty]) => {
                        this.notesRepository[bankNote] += qty;
                        this.currentClient.balance += bankNote * qty;
                    })
            });
            return this.addMoney.bind(this)
        },
        giveMoney(cash) {
            if (typeof (cash) !== 'number' || cash === 0
                || this.currentClient === undefined
                || cash > this.currentClient.balance
                || cash % 10 !== 0) {
                throw new Error('Выдать деняк не есть возможно')
            };
            const avaliableNominals = Object.keys(this.notesRepository).map(Number).sort((a, b) => b - a);
            const localThis = this;
            function collect(money, avaliableNominals) {
                if (money === 0) return {};
                if (!avaliableNominals.length) return;
                const curNominal = avaliableNominals[0];
                const avaliableNotes = localThis.notesRepository[curNominal];
                const notesToGive = money / curNominal | 0;
                const numOfNotes = Math.min(avaliableNotes, notesToGive);

                for (let i = numOfNotes; i >= 0; i--) {
                    const result = collect(money - i * curNominal, avaliableNominals.slice(1));
                    if (result) {
                        return i ? { [curNominal]: i, ...result } : result;
                    };
                };
            };
            const total = collect(cash, avaliableNominals);
            if (total === undefined) {
                throw new Error('Выдать деняк не есть возможно');
            } else {
                Object.entries(total)
                    .forEach(([bankNote, qty]) => {
                        this.notesRepository[bankNote] -= qty;
                        this.currentClient.balance -= bankNote * qty;
                    })
                return total
            };
        }
    };
};


module.exports = { createClient, createBank, createBankomat };
