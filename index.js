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
 * Словарь со всеми возможнными банкнотами
 */
const bankNotesDictionary = [5000, 2000, 1000, 500, 200, 100, 50, 10];
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
function createClient(name, balance) {
    if (typeof name === 'string' && typeof balance === 'number') {
        return {
            name: name,
            balance: balance
        };
    } else {
        throw new Error('Не удалось создать клиента!');
    }

}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
    if (typeof bankName === 'string' && Array.isArray(clients)) {
        return {
            bankName: bankName,
            clients: clients,
            addClient: function (client) {
                if (isClient(client)) {
                    const findClient = this.clients.includes(client);
                    if (!findClient) {
                        this.clients.push(client);
                        return true;
                    } else {
                        throw new Error('Не удалось добавить клиента!');
                    }
                }
            },
            removeClient: function (client) {
                if (!isClient(client)) {
                    throw new Error('Не удалось удалить клиента!');
                }
                const findClient = this.clients.includes(client);
                if (findClient) {
                    this.clients = this.clients.filter((client) => client !== client);
                    return true;
                } else {
                    throw new Error('Не удалось удалить клиента!');
                }
            }
        };
    } else {
        throw new Error('Не удалось создать банк!');
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
    if (!isBankNotesRepository(bankNotesRepository) && !isBank(bank)) {
        throw new Error('Не удалось создать бакномат!');
    }
    return {
        bank: bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,

        setClient: function (client) {
            if (isClient(client) && bank.clients.includes(client) && this.currentClient === undefined) {
                this.currentClient = client;
                return true;
            } else {
                throw new Error('Произошла ошибка при установке клиента!');
            }
        },
        removeClient: function (client) {
            if (isClient(client) && bank.clients.includes(client) && this.currentClient === client) {
                this.currentClient = undefined;
                return true;
            } else {
                throw new Error('Произошла ошибка при удалении клиента!');
            }
        },
        addMoney: function (...bankNotesRepositories) {
            if (this.currentClient === undefined) {
                throw new Error('Ошибка: отсутствует клиент!');
            }
            let clientBankNotesSum = 0;
            for (let bankNotesRepository of bankNotesDictionary) {
                this.notesRepository[bankNotesRepository] = 0;
            }
            for (let bankNotesRepository of bankNotesRepositories) {
                if (!isBankNotesRepository(bankNotesRepository)) {
                    throw new Error("Ошибка: передано не хранилище банкнот! ");
                }
                this.notesRepository[bankNotesRepository.keys()[0]] += bankNotesRepository[bankNotesRepository.keys()[0]];
                clientBankNotesSum += number(bankNotesRepository[bankNotesRepository.keys()[0]]);
            }
            this.currentClient.balance += clientBankNotesSum;

            return this.addMoney.bind(this);
        },
        giveMoney: function (sumToGive) {
            if (this.currentClient === undefined) {
                throw new Error("Ошибка: отсутствует клиент!");
            }
            if (number(sumToGive) > this.currentClient.balance) {
                throw new Error('На вашем счёте не достаточно денег для снятия!');
            }
            let sumToGiveClient = sumToGive;
            const resultAsnwer = {};
            for (let bankNote of bankNotesDictionary) {
                if (sumToGiveClient <= 0) {
                    break;
                }
                let remainder = (Math.floor(number(sumToGiveClient) / bankNote));
                if (remainder >= this.notesRepository[bankNote]) {
                    resultAsnwer[bankNote] += this.notesRepository[bankNote];
                    sumToGiveClient -= number(bankNote) * this.notesRepository[bankNote];
                } else if (remainder < this.notesRepository[bankNote] && remainder > 0) {
                    resultAsnwer[bankNote] += remainder;
                    sumToGiveClient -= number(bankNote) * remainder;
                }
            }
            this.currentClient.balance -= number(sumToGive);

            return resultAsnwer;
        }
    };
}


module.exports = {
    createClient,
    createBank,
    createBankomat
};