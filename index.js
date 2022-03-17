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
  if (!isValideClientData(name, balance)) {
    throw new Error();
  }
  return {
    name,
    balance,
  };
}

function isValideClientData(name, balance) {
  return typeof name === 'string' && typeof balance === 'number';
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
  if (!isValidBankData(bankName, clients)) {
    throw new Error();
  }

  return {
    bankName,
    clients,

    addClient: client => {
      if (!isValideClient(client) || clients.includes(client)) {
        throw new Error();
      }
      clients.push(client);
      return true;
    },

    removeClient: client => {
      const clientIndex = clients.indexOf(client);
      if (!clientIndex) {
        throw new Error();
      }
      clients.splice(clientIndex, 1);
      return true;
    },
  };
}

function isValidBankData(bankName, clients) {
  return typeof bankName === 'string' && isValideClients(clients);
}

function isValideClients(clients) {
  return Array.isArray(clients) && clients.every(isValideClient);
}

function isValideClient(client) {
  return client && isValideClientData(client.name, client.balance);
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
  if (!isValidBank(bank) || !isValidRepository(bankNotesRepository)) {
    throw new Error();
  }
  return {
    bank,
    notesRepository: bankNotesRepository,
    currentClient: undefined,

    setClient: function(client) {
      if (
        this.currentClient
        || !isValideClient
        || !bank.clients.includes(client)
      ) {
        throw new Error();
      }
      this.currentClient = client;
      return true;
    },

    removeClient: function(client) {
      if (!this.currentClient || this.currentClient !== client) {
        throw new Error();
      }
      this.currentClient = undefined;
      return true;
    },

    addMoney: function addMoneyFn(...args) {
      if (
        !this.currentClient
        || !args.length
        || !args.every(isValidRepository)
      ) {
        throw new Error();
      }
      args.forEach(cash => {
        Object.entries(cash).forEach(([banknote, count]) => {
          this.notesRepository[banknote] += count;
          this.currentClient.balance += banknote * count;
        });
      });
      return addMoneyFn.bind(this);
    },

    giveMoney: function(sumToGive) {
      if (
        typeof sumToGive !== 'number'
        || !this.currentClient
        || sumToGive > this.currentClient.balance
      ) {
        throw new Error();
      }

      const giveMoneyTry = Object.entries(this.notesRepository)
        .sort((a, b) => b[0] - a[0])
        .reduce((result, [banknote, count]) => {
          const sumToAccumulate = sumToGive - result.accumulatedSum;
          if (count === 0 || sumToAccumulate < banknote) {
            return result;
          }
          const optimalBanknotesCount = Math.floor(sumToAccumulate / banknote);
          if (count > optimalBanknotesCount) {
            return {
              accumulatedSum: result.accumulatedSum + optimalBanknotesCount * banknote,
              banknotesSet: result.banknotesSet.concat([[banknote, optimalBanknotesCount]]),
            }
          } else {
            return {
              accumulatedSum: result.accumulatedSum + count * banknote,
              banknotesSet: result.banknotesSet.concat([[banknote, count]]),
            }
          }
        }, {
          accumulatedSum: 0,
          banknotesSet: [],
        });

      if (giveMoneyTry.accumulatedSum !== sumToGive) {
        throw new Error();
      }
      const cash = {};
      giveMoneyTry.banknotesSet.forEach(([banknote, count]) => {
        this.notesRepository[banknote] -= count;
        cash[banknote] = count;
      });
      this.currentClient.balance -= sumToGive;
      return cash;
    },
  };
}

function isValidBank(bank) {
  return bank
    && isValidBankData(bank.bankName, bank.clients)
    && typeof bank.addClient === 'function'
    && typeof bank.removeClient === 'function';
}

function isValidRepository(repository) {
  const banknotes = ['5000', '2000', '1000', '500', '200', '100', '50', '10'];
  return Object.entries(repository)
    .every(([banknote, count]) => typeof count === 'number' && banknotes.includes(banknote));
}

module.exports = { createClient, createBank, createBankomat };
