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
  return { name: checkName(name), balance: checkBalance(balance) };
}

function checkName(name) {
  if (typeof name == "string") return name;
  throw "Incorrect name for client";
}

function checkBalance(balance) {
  if (typeof balance == "number" && Number.isFinite(balance))
    return balance;
  throw "Incorrect balance value";
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
  return {
    bankName: checkName(bankName),
    clients: checkClientsList(clients),

    addClient(client) {
      if (!isClient(client)) return false;
      // check if client is already in list
      var ind = clients.findIndex((x) => x.name == client.name);
      if (ind != -1) throw "Client already added";
      clients.push(client);
      return true;
    },

    removeClient(client) {
      if (!isClient(client)) return false;
      // check if client is already in list
      var ind = clients.findIndex((x) => x.name == client.name);
      if (ind == -1) throw "Client does not exist";
      clients.splice(ind, 1);
      return true;
    },
  };
}

function checkClientsList(list) {
  if (!Array.isArray(list)) throw "Wrong clients list format";
  if (list.length > 0 && !list.every((x) => isClient(x))) {
    throw "Wrong clients list format";
  }
  return list;
}

function isClient(client) {
  if (typeof client != "object") return false;
  if (typeof client.name != "string" || typeof client.balance != "number")
    return false;
  return Number.isFinite(client.balance);
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
    bankNotesRepository: bankNotesRepository,
    bank: isBank(bank),
    currentClient: undefined,

    setClient(client) {
      if (!isFromBank(client, this.bank)) throw "Client from unsupported bank";
      if (this.currentClient != undefined)
        throw "Cannot process multiple clients at once";

      if (!isClient(client)) return false;
      this.currentClient = client;
      return true;
    },

    removeClient() {
      if (this.currentClient === undefined) return false;
      this.currentClient = undefined;
      return true;
    },

    addMoney: function (...args) {
      if (this.currentClient === undefined) throw "No client";

      args.forEach((el, ind) => {
        let sum = 0;
        for (let nominal in el) {
          this.bankNotesRepository[nominal] += el[nominal];
          sum += Number(nominal) * el[nominal];
        }
        this.currentClient.balance += sum;
      });
      return this.addMoney.bind(this);
    },

    /*
    addMoney: curry(function (notesRepository) {
      if (this.currentClient === undefined) throw "No client";
      let sum = 0;
      for (key in notesRepository) {
        this.bankNotesRepository[key] += notesRepository[key];
        sum += Number(key) * notesRepository[key];
      }
      this.currentClient.balance += sum;
      return this.addMoney.bind(this);
    }),
    */

    giveMoney(sumToGive) {
      if (this.currentClient === undefined) throw "No client";
      if (typeof sumToGive != "number") return false;
      if (sumToGive % 10 != 0)
        throw "Cannot give sum which is not a multiple of 10";
      if (sumToGive > this.currentClient.balance) throw "Insufficient balance";

      let nominals = [];
      for (let nominal in this.bankNotesRepository) nominals.push(nominal);
      nominals
        .sort((first, second) => {
          if (Number(first) > Number(second)) return 1;
          if (Number(first) < Number(second)) return -1;
          return 0;
        })
        .reverse();
      let result = {};
      let sum = sumToGive;

      nominals.forEach((el, ind) => {
        while (el <= sum && this.bankNotesRepository[el] > 0) {
          if (result[el] === undefined) result[el] = 0;
          result[el] += 1;
          sum -= el;
          this.bankNotesRepository[el] -= 1;
          if (sum == 0) break;
        }
      });

      if (sum != 0) throw "Cannot form sum";
    },
  };
}

function checkRepository(rep) {
  if (typeof rep != "object") throw "Wrong repository format";
  return rep;
}

/*
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
        return func.apply(this, args);
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}
*/

function isBank(bank) {
  if (typeof bank != "object") throw "Wrong bank format";
  if (typeof bank.bankName != "string" || !Array.isArray(bank.clients)) {
    throw "Wrong bank format";
  }
  if (bank.clients.length > 0 && !bank.clients.every((x) => isClient(x))) {
    throw "Wrong bank format";
  }
  return bank;
}

function isFromBank(client, bank) {
  if (!isBank(bank) || !isClient(client)) return false;

  var ind = bank.clients.findIndex((x) => x.name == client.name);
  return ind != -1;
}

module.exports = { createClient, createBank, createBankomat };

/*
const bank = createBank("myBank");
const client = createClient("Jhohn Doe", 100);
const anotherBank = createBank("Jane Doe", [client]);
console.log("stop");
*/

/*
console.log(bank.addClient({name: 'Correct name', balance: 'Incorrect balance'}));
console.log(bank.addClient({name: 123, balance: 123}));
console.log(bank.addClient({name: 'Correct name', balance: 123}));
console.log(bank.addClient({name: 'Correct name'}));
console.log(bank.addClient({name: 'Correct name', balance: Number.POSITIVE_INFINITY}));
*/

/*
console.log(bank.addClient({ name: "John Doe", balance: 100 }));
console.log(bank.addClient({ name: "John Doe", balance: 200 }));

console.log(bank.removeClient({ name: "John Doe", balance: 100 }));
console.log(bank.removeClient({ name: "John Doe", balance: 200 }));
console.log("stop");
*/
const greenBankNotesRepository = {
  5000: 2,
  2000: 3,
  1000: 13,
  500: 20,
  200: 10,
  100: 5,
  50: 2,
  10: 5,
};

const greenBank = createBank("GREENBANK");
/**
 * {
 *   bankName: 'GREENBANK',
 *   clients: [],
 *   ...
 * }
 */
const greenBankBankomat = createBankomat(greenBankNotesRepository, greenBank);
/**
 * {
 *   notesRepository: greenBankNotesRepository,
 *   bank: greenBank,
 *   ...
 * }
 */

const clientVasiliy = createClient("Василий", 2500);
/**
 * {
 *   name: 'Василий',
 *   balance: 2500,
 * }
 */

greenBank.addClient(clientVasiliy); // true
//greenBank.addClient(clientVasiliy); // Error

greenBankBankomat.setClient(clientVasiliy); // true

greenBankBankomat.addMoney({ 10: 2 })({ 50: 1, 10: 1 })({ 10: 3 }, { 100: 1 });

greenBankBankomat.giveMoney(1000);
/**
 * {
 *   1000: 1,
 * }
 */

greenBankBankomat.removeClient(); // true
