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
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */
 function createClient(name, balance = 0) {
	if (!name || typeof name !== "string" || typeof balance !== "number")
		throw new Error("Ошибка валидации");
	return { name, balance };
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {string} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
	if (!clients instanceof Array || typeof bankName !== "string" || !bankName)
		throw new Error("Ошибка валидации");

	return {
		bankName,
		clients,
		addClient: function (client) {
			if (!ClientIsValid(client)) throw new Error("Ошибка валидации");
			if (this.clients.includes(client)) throw new Error("Банкомат уже занят!");
			this.clients.push(client);
			return true;
		},
		removeClient: function (client) {
			if (!ClientIsValid(client)) throw new Error("Ошибка валидации");
			if (!this.clients.includes(client)) throw new Error("Клиента и так нет!");
			this.clients = this.clients.filter(c => c !== client);
			return true;
		}
	};
}

function ClientIsValid(client) {
	if (typeof client !== "object" || !client.name || typeof client.name !== "string" || typeof client.balance !== "number")
		throw new Error("Ошибка валидации");
	return true;
}

/**
 * @name createBankomat
 * @description Функция для создания банкомата
 * @param {{[key: string]: number}} notesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(notesRepository, bank) {
	if (typeof notesRepository !== 'object' || typeof bank !== "object" || !bank.bankName
		|| typeof bank.bankName !== "string" || !bank.clients instanceof Array)
		throw new Error("Ошибка валидации");

	return {
		bank,
		notesRepository,
		currentClient: undefined,
		removeClient: function () {
			this.currentClient = undefined;
			return true;
		},
		setClient: function (client) {
			if (this.currentClient !== undefined) throw new Error("Банкомат занят!");
			if (!this.bank.clients.includes(client)) throw new Error("Клиент не клиент банка!");
			this.currentClient = client;
			return true;
		},
		addMoney: function (...banknotesRepository) {
			if (this.currentClient === undefined) throw new Error("Нет клиента!");
			for (const banknotes of banknotesRepository) {
				for (const banknote in banknotes) {
					this.currentClient.balance += banknotes[banknote] * banknote;
					this.notesRepository[banknote] += banknotes[banknote];
				}
			}
			return this.addMoney.bind(this);
		},

		giveMoney: function (money) {
			if (this.currentClient === undefined) throw new Error("Нет клиента!");
			if (money % 10 !== 0) throw new Error("Некорректная сумма выдачи!");
			if (money > this.currentClient.balance) throw new Error("Недостаточно средств!");

			let request = money;
			let banknotes = [5000, 2000, 1000, 500, 200, 100, 50, 10];
			const moneyRepository = {};
			
			while (banknotes.length !== 0 && request !== 0) {
				const banknote = banknotes[0];
				const freeNotes = this.notesRepository[banknote];
				const needNotes = Math.floor(request / banknote);
				const issuedNotes = Math.min(freeNotes, needNotes);
				request -= banknote * issuedNotes;
				if (issuedNotes !== 0) {
					moneyRepository[banknote] = issuedNotes;
					this.notesRepository[banknote] -= issuedNotes;
				}
				banknotes = banknotes.slice(1);
			}

			if (request !== 0) throw Error("В банкомате не хватает банкнот :(");
			this.currentClient.balance -= money;
			return moneyRepository;
		}
	};
}

module.exports = { createClient, createBank, createBankomat };