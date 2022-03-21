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
  if (typeof name === "string" && typeof balance === "number")
    return { name, balance };
  throw new Error("Ты втираешь мне какую-то дичь");
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {string} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
  if (typeof bankName !== "string" || !Array.isArray(clients))
    throw new Error("Ты снова втираешь мне какую-то дичь");

  return {
    bankName,
    clients,
    addClient: (newClient) => {
      if (this.clients.some((client) => client.name === newClient.name))
        throw new Error("Клиент с таким именем уже существует");
      else {
        this.clients.push(newClient);
        return true;
      }
    },
    removeClient: (clientToRemove) => {
      if (this.clients.some((client) => client.name === clientToRemove.name)) {
        this.clients = this.clients.filter(
          (client) => client.name !== clientToRemove.name
        );
        return true;
      } else throw new Error("Пытаемся удалить несуществующего клиента");
    },
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
  if (
    typeof bankNotesRepository !== "object" ||
    !Object.prototype.hasOwnProperty.call(bank, "bankName") ||
    !Object.prototype.hasOwnProperty.call(bank, "clients") ||
    !Object.prototype.hasOwnProperty.call(bank, "addClient") ||
    !Object.prototype.hasOwnProperty.call(bank, "removeClient")
  )
    throw new Error("Мне не нравится то, что ты мне втираешь");

  const nominals = [10, 50, 100, 200, 500, 1000, 2000, 5000].reverse();

  return {
    bank,
    notesRepository: bankNotesRepository,
    currentClient: undefined,
    setClient: (clientToSet) => {
      if (
        this.bank.clients.some((client) => client.name === clientToSet.name) &&
        this.currentClient === undefined
      ) {
        this.currentClient = clientToSet;
        return true;
      } else
        throw new Error(
          "Пытаемся установить пользователя к банкомату банка, клиентом которого он не ялвяется, либо у банкомата уже стоит клиент"
        );
    },
    removeClient: () => {
      this.currentClient = undefined;
      return true;
    },
    addMoney: (...moneysToAdd) => {
      if (this.currentClient === undefined)
        throw new Error("С капустой никто не работает");

      moneysToAdd.forEach((moneyToAdd) => {
        nominals.forEach((nominal) => {
          if (moneyToAdd[nominal] !== undefined)
            this.notesRepository[nominal] += moneyToAdd[nominal];
        });
      });
      return this.addMoney;
    },
    giveMoney: (sumToGive) => {
      if (sumToGive > this.currentClient.balance)
        throw new Error("Сумма выдачи больше баланса клиента");
      if (sumToGive % 10 !== 0) throw new Error("Сумма выдали не кратна 10");
      if (this.currentClient === undefined)
        throw new Error("С капустой никто не работает");

      const moneyToGive = {};
      nominals.forEach((nominal) => {
        if (sumToGive === 0 || nominal > sumToGive) return;
        const count = Math.min(
          Math.trunc(sumToGive / nominal),
          this.notesRepository[nominal]
        );
        sumToGive -= nominal * count;
        this.notesRepository[nominal] -= count;
        moneyToGive[nominal] = count;
      });

      if (sumToGive !== 0) throw new Error("Не хватило капусты");

      return moneyToGive;
    },
  };
}

module.exports = { createClient, createBank, createBankomat };
