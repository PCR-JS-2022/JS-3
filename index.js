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
 * @property {() => boolean} removeClient
 * @property {(notesRepository: {[key: string]: number}) => void} addMoney
 * @property {(sumToGive: number) => boolean | Error} giveMoney
 */

/**
 * @name validateClient
 * @description Функция валидации клиента
 * @param {Client} client Клиент
 * @returns {Client} Объект клиента
 */
function validateClient(client) {
	if (!(typeof client === "object"
		&& client.hasOwnProperty("name")
		&& client.hasOwnProperty("balance")
		&& client.name && typeof client.name === "string"
		&& typeof client.balance === "number"
	)) {
		throw new Error("Invalid input data");
	}
	return client;
}

/**
 * @name validateBank
 * @description Функция валидации банка
 * @param {Bank} bank Банк
 * @returns {Bank} Объект банка
 */
function validateBank(bank) {
	if (!(typeof bank === "object"
		&& bank.hasOwnProperty("addClient")
		&& bank.hasOwnProperty("removeClient")
		&& bank.hasOwnProperty("clients")
		&& bank.clients instanceof Array
		&& bank.bankName && typeof bank.bankName === "string"
	)) {
		throw new Error("Invalid input data");
	}
	return bank;
}

/**
 * @name validateBankomat
 * @description Функция валидации банкомата
 * @param {Bankomat} bankomat Банкомат
 * @returns {Bankomat} Объект банкомата
 */
function validateBankomat(bankomat) {
	if (!(typeof bankomat === 'object'
		&& validateBank(bankomat.bank)
		&& typeof bankomat.notesRepository === 'object'
	)) {
		throw new Error("Invalid input data");
	}
	return bankomat;
}

/**
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */
function createClient(name, balance = 0) {
	return validateClient({ name, balance });
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {string} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
	return validateBank({
		bankName,
		clients,
		addClient: function (client) {
			if (!validateClient(client) || this.clients.includes(client)) {
				throw new Error("Not possible to add an existing client");
			}
			this.clients.push(client);
			return true;
		},
		removeClient: function (client) {
			if (!validateClient(client) || !this.clients.includes(client)) {
				throw new Error("Not possible to delete a non-existent client");
			}
			this.clients = this.clients.filter(c => c !== client);
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
	return validateBankomat({
		bank,
		notesRepository,
		currentClient: undefined,

		setClient: function (client) {
			if (!this.bank.clients.includes(client)) {
				throw new Error("Bankomat don't work with not a bank clients");
			}
			if (this.currentClient !== undefined) {
				throw new Error("Bankomat can't work with multiple clients at the same time");
			}
			this.currentClient = client;
			return true;
		},

		removeClient: function () {
			this.currentClient = undefined;
			return true;
		},

		addMoney: function (...moneyRepository) {
			if (this.currentClient === undefined) {
				throw new Error("Client does not exist");
			}
			moneyRepository.reduce((moneyObject) => {
				let amount = 0;
				for (const nominal in moneyObject) {
					this.notesRepository[nominal] += moneyRepository[nominal];
					amount += moneyRepository[nominal] * parseInt(nominal);
				}
				this.currentClient.balance += amount;
			})
			return this.addMoney.bind(this);
		},

		giveMoney: function (money) {
			if (money % 10 !== 0) {
				throw new Error("Impossible to issue such a sum of money");
			}
			if (this.currentClient === undefined) {
				throw new Error("Client does not exist");
			}
			if (money > this.currentClient.balance) {
				throw new Error("Not enough money in the bank account");
			}

			let requiredMoney = money;
			const banknotes = [5000, 2000, 1000, 500, 200, 100, 50, 10];

			const moneyRepository = banknotes.reduce((moneyRepository, banknote) => {
				let requiredBanknotes = Math.floor(requiredMoney / banknote);
				const stockBanknotes = this.notesRepository[banknote];

				if (requiredBanknotes === 0) {
					return moneyRepository;
				}
				if (stockBanknotes < requiredBanknotes) {
					requiredBanknotes = stockBanknotes;
				}

				requiredMoney -= banknote * requiredBanknotes;
				this.notesRepository[banknote] -= requiredBanknotes;
				moneyRepository[banknote] = requiredBanknotes;
				return moneyRepository;
			}, {})

			if (requiredMoney !== 0) {
				throw Error("There are not enough banknotes in bankomat");
			}

			this.currentClient.balance -= money;
			return moneyRepository;
		}
	});
}

module.exports = { createClient, createBank, createBankomat };
