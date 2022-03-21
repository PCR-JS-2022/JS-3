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
 * Все возможные банкноты
 * @type {number[]}
 */
const banknotes = [5000, 2000, 1000, 500, 200, 100, 50, 10];

/**
 * Check: is variable client or not
 * Проверить: переданная переменная является клиентом или нет
 * @param {object} client
 * @returns {boolean}
 */
function isClient(client) {
    return (typeof client === 'object') &&
        (client.hasOwnProperty('name') && typeof client.name === 'string') &&
        (client.hasOwnProperty('balance') && typeof client.balance === 'number');
}

/**
 * Check: is variable bank or not
 * Проверить: переданная переменная является банком или нет
 * @param {object} bank
 * @returns {boolean}
 */
function isBank(bank) {
    return (typeof bank === 'object') &&
        (bank.hasOwnProperty('bankName') && typeof bank.bankName === 'string') &&
        (bank.hasOwnProperty('clients') && Array.isArray(bank.clients)) &&
        (bank.hasOwnProperty('addClient') && typeof bank.addClient === 'function') &&
        (bank.hasOwnProperty('removeCLient') && typeof bank.removeClient === 'function');
}

/**
 * Check: is variable bankNotesRepository or not
 * Проверить: переданная переменная является объектом хранилища купюр или нет
 * @param {object} bankNotesRepository
 * @returns {boolean}
 */
function isBankNotesRepository(bankNotesRepository) {
    return (typeof bankNotesRepository === 'object');
}

/**
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */
function createClient(name, balance = 0) {
    if (typeof name !== 'string' || typeof balance !== 'number' || !name) {
        throw new Error('Не удалось создать клиента!');

    } else {
        return {
            name: name,
            balance: balance
        };
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
    if (typeof bankName !== 'string' || !Array.isArray(clients) || !bankName) {
        throw new Error('Не удалось создать банк!');
    }
    return {
        bankName: bankName,
        clients: clients,
        addClient: function (client) {
            if (!isClient(client) || this.clients.some((clientBank) => clientBank === client)) {
                throw new Error('Не удалось добавить клиента!');
            }
            this.clients.push(client);
            return true;
        },
        removeClient: function (client) {
            if (!isClient(client) || !this.clients.some((clientBank) => clientBank === client)) {
                throw new Error('Не удалось удалить клиента!');
            }
            this.clients = this.clients.filter((clientBank) => clientBank !== client);
            return true;
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
    if (!isBankNotesRepository(bankNotesRepository) && !isBank(bank)) {
        throw new Error('Не удалось создать бакномат!');
    }
    return {
        bank: bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,

        setClient: function (client) {
            if (!isClient(client)) {
                throw new Error('Передан не клиент!');
            }
            if (this.currentClient !== undefined) {
                throw new Error('Банкомат занят работой с другим клиентом!');
            }
            if (!this.bank.clients.some((clientBank) => clientBank === client)) {
                throw new Error('Клиент не является клиентом банка!');
            }
            this.currentClient = client;
            return true;
        },
        removeClient: function () {
            this.currentClient = undefined;
            return true;
        },
        addMoney: function (...bankNotesRepositories) {
            if (this.currentClient === undefined) {
                throw new Error('Отсутствует клиент!');
            }
            let clientBankNotesSum = 0;
            for (let bankNotesRepository of bankNotesRepositories) {
                if (!isBankNotesRepository(bankNotesRepository)) {
                    throw new Error('Передано не хранилище банкнот!');
                }
                for (const bankNote in bankNotesRepository) {
                    this.notesRepository[bankNote] += Number(bankNotesRepository[bankNote]);
                    clientBankNotesSum += Number(Number(bankNote) * bankNotesRepository[bankNote]);
                }
            }
            this.currentClient.balance += Number(clientBankNotesSum);

            return this.addMoney.bind(this);
        },
        giveMoney: function (sumToGive) {
            if (this.currentClient === undefined) {
                throw new Error("Ошибка: отсутствует клиент!");
            }
            if (typeof sumToGive !== "number" || Number(sumToGive) < 0) {
                throw new Error("Передана невалидная сумма!");
            }
            if (Number(sumToGive) > this.currentClient.balance) {
                throw new Error('На вашем счёте не достаточно денег для снятия!');
            }
            let sumToGiveClient = sumToGive;
            const resultAnswer = {};
            for (const banknote of banknotes) {
                let remainder = Math.floor(sumToGiveClient / banknote);
                if (remainder === 0) {
                    continue;
                }
                if (remainder <= this.notesRepository[banknote]) {
                    this.notesRepository[banknote] -= remainder;
                    sumToGiveClient -= banknote * remainder;
                    resultAnswer[banknote] = remainder;
                }
            }

            if (sumToGiveClient > 0) {
                throw new Error('В банкомате недостаточно средств!');
            }
            this.currentClient.balance -= sumToGiveClient;
            return resultAnswer;
        }
    };
}

module.exports = {
    createClient,
    createBank,
    createBankomat
};