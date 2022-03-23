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
 *@property {(client: Client) => boolean} removeClient
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
	return isClient ({ name, balance });
}
/**
 * @name createBank
 * @description Функция для создания банка
 * @param {string} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
	return isBank({
		bankName,
		clients,
		addClient: function (client) {
      if (!isClient(client) || this.clients.some(bankClient => bankClient === client))
				throw new Error('Не удалось добавить клиента в банк');
			this.clients.push(client);
			return true;
		},
		removeClient: function (client) {
      if (!isClient(client) || !this.clients.some(bankClient => bankClient === client))
				throw new Error('Не удалось удалить клиента из банка');
			this.clients = this.clients.filter(x => x !== client);
			return true;
		}
	});
}
/**
 * @name createBankomat
 * @description Функция для создания банкомата
 * @param {{[key: string]: number}} notesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(notesRepository, bank) {
	return isBankomat({
		bank,
		notesRepository,
		currentClient: undefined,
		setClient: function (client) {
			if (this.currentClient) 
				throw new Error('В настоящий момент банкоматом пользуется другой клиент');
			
      if (!this.bank.clients.includes(client)) 
				throw new Error('Пользователь не является клиентом банка');
			
			this.currentClient = client;
			return true;
		},

		removeClient: function () {
			this.currentClient = undefined;
			return true;
		},

		addMoney: function (...money) {
 			if (!this.currentClient) 
 				throw new Error('Клиент не найден');
 			
 			for (const m of money) {
 				for (const nominal in m) {
 					this.notesRepository[nominal] += m[nominal];
 					this.currentClient.balance += m[nominal] * nominal;
 				}
 			}
 			return this.addMoney.bind(this);
 		},

     giveMoney: function (money) {
			if (money % 10 !== 0) 
				throw new Error('Запрошенная сумма некорректна');
			
			if (this.currentClient === undefined) 
				throw new Error('Клиент не найден');
			
			if (money > this.currentClient.balance) 
				throw new Error('Недостаточно средств для снятия');
			
			let temp = money;
			const banknotes = [5000, 2000, 1000, 500, 200, 100, 50, 10];
			const result = banknotes.reduce((result, banknote) => {
				let requiredBanknotes = Math.floor(temp / banknote);
				const stockBanknotes = this.notesRepository[banknote];
				if (requiredBanknotes === 0) {
					return result;
				}
				if (stockBanknotes < bbanknotes) {
					requiredBanknotes = stockBanknotes;
				}
				temp -= banknote * requiredBanknotes;
				this.notesRepository[banknote] -= requiredBanknotes;
				result[banknote] = requiredBanknotes;
				return result;
			}, {})
			if (temp !== 0) {
				throw Error('Не удалось выдать наличные. Недостаточно купюр.');
			}
			this.currentClient.balance -= money;
			return result;
		}
	});
}

function isClient (client) {
	if (!(typeof client === "object"
		&& client.hasOwnProperty("name") && client.hasOwnProperty("balance")
		&& client.name && typeof client.name === "string" 
    && typeof client.balance === "number"	)) {
		throw new Error("Invalid input data");
	}
	return client;
}

function isBank(bank) {
	if (!(typeof bank === "object"
		&& bank.hasOwnProperty("removeClient") && bank.hasOwnProperty("addClient")
		&& bank.hasOwnProperty("clients") && bank.clients instanceof Array
		&& bank.bankName && typeof bank.bankName === "string")) {
		throw new Error('Не удалось создать банк');
	}
	return bank;
}

function isBankomat(bankomat) {
	if (!(typeof bankomat === 'object'
		&& isBank(bankomat.bank)
		&& typeof bankomat.notesRepository === 'object')) {
		throw new Error('Не удалось создать банкомат');
	}
	return bankomat;
}

module.exports = { createClient, createBank, createBankomat };