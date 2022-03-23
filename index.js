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

 function isValidBank (bank) {
  return (
    typeof bank.bankName === 'string' && Array.isArray(bank.clients) && typeof bank.addClient === 'function' && typeof bank.removeClient === 'function'
  );
} 

function createBankomat(bankNotesRepository, bank) {
  if (!isValidBank(bank) || typeof bankNotesRepository !== 'object') {
    throw new Error('Ошибка');
  }

  return {
    bank,
    notesRepository: bankNotesRepository,
    currentClient: undefined,
    setClient: function(client) {
      if (
        this.currentClient !== undefined ||
        typeof client.name !== 'string' || typeof client.balance !== 'number' ||
        !bank.clients.includes(client)
        ) {
          throw new Error('Ошибка');
        }

      this.currentClient = client;
      return true;
    },

    removeClient: function() {
      this.currentClient = undefined;
      return true;
    },

    addMoney(...objects) {
      if (!this.currentClient) {
        throw new Error('Ошибка');
      }

      let sum = 0;
      objects.forEach((item) => {
        for (let key in item) {
          this.notesRepository[key] += item[key];
          sum += key * item[key];
        }
      })
      this.currentClient.balance += sum;
      console.log(sum);
      return this.addMoney.bind(this);
    },

    giveMoney: function (allMoneyToClient) {
      if (!this.currentClient || allMoneyToClient > this.currentClient.balance || allMoneyToClient % 10 !== 0) {
        throw new Error('Ошибка');
      }

      let allSum = allMoneyToClient;
      let result = {};
      let bankNotes = [5000, 2000, 1000, 500, 200, 100, 50, 10];

      while (allSum !== 0 && bankNotes.length) {
        let note = bankNotes[0];
        let emptyNotes = this.notesRepository[note];
        let needNote = Math.floor(allSum / note);
        let numberOfAllNotes = Math.min(emptyNotes, needNote);
        allSum -= note * numberOfAllNotes;
        if (numberOfAllNotes !== 0) {
          result[note] = numberOfAllNotes;
          this.notesRepository[note] -= numberOfAllNotes;
        }
        bankNotes = bankNotes.slice(1);
      }
      if (allSum === 0) {
        this.currentClient.balance -= allMoneyToClient;
        return result;
      } 
      else throw new Error('Ошибка');
    }
    
  }

 }

module.exports = { createClient, createBank, createBankomat };
