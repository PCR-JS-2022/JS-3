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
	if (typeof name !== 'string' || !name || typeof balance !== 'number')
		throw new Error('Не удалось создать клиента')

	return {name, balance}
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {string} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
	if (typeof bankName !== 'string' || !bankName || !Array.isArray(clients))
		throw new Error('Не удалось создать банк')

	return {
		bankName,
		clients,

		addClient: function (client) {
			if (this.clients.some(bankClient => bankClient === client))
				throw new Error('Не удалось добавить клиента в банк')

			this.clients.push(client)
			return true
		},

		removeClient: function (client) {
			if (!this.clients.some(bankClient => bankClient === client))
				throw new Error('Не удалось удалить клиента из банка')

			this.clients = this.clients.filter(bankClient => bankClient !== client)
			return true
		}
	}
}

/**
 * @name createBankomat
 * @description Функция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
	if (!isBank(bank) || typeof bankNotesRepository !== 'object')
		throw new Error('Не удалось создать банкомат')

	return {
		bank,
		notesRepository: bankNotesRepository,
		currentClient: undefined,

		setClient: function (client) {
			if (this.currentClient)
				throw new Error('В настоящий момент банкоматом пользуется другой клиент')

			if (!this.bank.clients.some(bankClient => bankClient === client))
				throw new Error('Пользователь не является клиентом банка')

			this.currentClient = client
			return true
		},

		removeClient: function () {
			this.currentClient = undefined
			return true
		},

		addMoney: function (...money) {
			if (!this.currentClient)
				throw new Error('Клиент не найден')

			const add = (notes) => {
				let clientSum = 0
				for (const note in notes) {
					this.notesRepository[note] += notes[note]
					clientSum += notes[note] * note
				}
				this.currentClient.balance += clientSum
			}

			for (const m of money) {
				add(m)
			}

			return this.addMoney.bind(this)
		},

		giveMoney: function (money) {
			if (!this.currentClient)
				throw new Error('Клиент не найден')

			if (money > this.currentClient.balance)
				throw new Error('Недостаточно средств для снятия')

			if (money % 10 !== 0)
				throw new Error('Запрошенная сумма некорректна')

			const result = {}
			const fullMoney = money
			for (const note of notes) {
				let cnt = Math.floor(money / note)
				const noteCount = this.notesRepository[note]
				if (cnt !== 0) {
					if (noteCount <= cnt) {
						cnt = noteCount
					}
					money -= cnt * note
					this.notesRepository[note] -= cnt
					result[note] = cnt
				}
			}

			if (money !== 0)
				throw Error('Не удалось выдать наличные. Недостаточно купюр.')

			this.currentClient.balance -= fullMoney
			return result
		}
	}
}

/**
 * @name isBank
 * @description Проверяет, является ли объект банком
 * @param {Bank} bank Объект банка
 * @returns {boolean} Результат проверки
 */
function isBank(bank) {
	return typeof bank === 'object' &&
		bank.bankName &&
		bank.clients &&
		bank.addClient &&
		bank.removeClient
}

const notes = [5000, 2000, 1000, 500, 200, 100, 50, 10]

module.exports = {createClient, createBank, createBankomat};
