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
    if (typeof name === 'string' && typeof balance === 'number') {
        return {
            name: name,
            balance: balance
        };
    } else {
        throw new Error('Не удалось создать клиента!');
    }

}

function isClient(client) {
    return (typeof client === 'object') &&
        (client.hasOwnProperty('name') && typeof client.name === 'string') &&
        (client.hasOwnProperty('balance') && typeof client.balance === 'number');
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
function createBankomat(bankNotesRepository, bank) {}

module.exports = {
    createClient,
    createBank,
    createBankomat
};