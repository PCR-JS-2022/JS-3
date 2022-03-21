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
 * @name validateClient
 * @description Функция валидации клиента
 * @param {Client} client Клиент
 * @returns {Client} Объект клиента
 */
function validateClient(client) {

	if (!(typeof client === "object"
		&& client.hasOwnProperty("name")
		&& client.hasOwnProperty("balance")
		&& typeof client.name === "string" && client.name
		&& typeof client.balance === "number"
	)) {
		throw new TypeError("incorrect input data");
	}

	return client;
}

/**
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */
function createClient(name, balance) {
	return validateClient({ name, balance });
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {string} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
	if (!(typeof bankName === "string" && clients instanceof Array && bankName)) {
		throw new TypeError("incorrect input data");
	}

	return {
		bankName,
		clients,
		addClient: (client) => {
			if (!(validateClient(client) && clients.includes(client))) {
				throw new Error("Not possible to add an existing client");
			}
			this.clients.push(client);
			return true;
		},
		removeClient: (client) => {
			validateClient(client);
			clients.forEach((c, index) => {
				if (c === client) {
					clients.splice(index, 1);
					return true;
				}
			})
			throw new Error("Not possible to delete a non-existent client");
		}
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

}

module.exports = { createClient, createBank, createBankomat };
