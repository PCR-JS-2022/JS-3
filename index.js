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
      throw new Error('Ошибка')
    }
    return {
      name,
      balance
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
    if (typeof bankName !== 'string' || !Array.isArray(clients)) {
      throw new Error('Ошибка')
    }
  
    return {
      bankName,
      clients,
  
      addClient: function (client) {
        if (this.clients.includes(client) || typeof client.name !== 'string' || typeof client.balance !== 'number') {
          throw new Error('Ошибка');
        }
  
        this.clients.push(client);
        return true;
      },
  
      removeClient: function (client) {
        if (typeof client.name !== 'string' || typeof client.balance !== 'number') {
          throw new Error('Ошибка');
        }
  
        const presentClient = this.clients.indexOf(client);
        if (presentClient === -1) {
          throw new Error('Ошибка');
        }
  
        this.clients = this.clients.filter((index) =>  index !== client);
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
function createBankomat(bankNotesRepository, bank) {}

module.exports = { createClient, createBank, createBankomat };
