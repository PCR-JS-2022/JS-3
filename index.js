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
    if (typeof name !== 'string' || !name || typeof balance !== 'number') {
        throw new Error('Invalid arguments given');
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
        throw new Error('Invalid arguments given');
    }

    return {
        bankName,
        clients: clients,
        addClient: function(client) {
            if (!isClient(client)) {
                throw new Error('Invalid argument client given');
            }

            const alreadyExists = this.clients.some(bankClient => bankClient.name === client.name);
            if (alreadyExists) {
                throw new Error(`Client with name ${client.name} is already exists`);
            }

            this.clients.push(client);
            return true;
        },
        removeClient: function(client) {
            if (!isClient(client)) {
                throw new Error('Invalid argument client given')
            }

            const prevLength = this.clients.length;
            this.clients = this.clients.filter(bankClient => bankClient.name !== client.name);

            if (this.clients.length === prevLength) {
                throw new Error(`There is no client with name ${client.name}`)
            }

            return true;
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
    if (typeof bankNotesRepository !== 'object' || typeof bank !== 'object') {
        throw new Error('Invalid arguments given');
    }

    const bankomat = {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient: function(client) {
            if (this.currentClient !== undefined) {
                throw new Error('There is already a client at the bankomat');
            }

            if (!isClient(client)) {
                throw new Error('Invalid argument given');
            }

            this.currentClient = client;
            return true;
        },
        removeClient: function() {
            isCurrentClientExists();

            this.currentClient = undefined;
            return true;
        },
        addMoney: function(money) {
            isCurrentClientExists();

            if (!money || typeof money !== 'object') {
                throw new Error('Wrong money given');
            }

            const notes = Object.entries(money).map(el => [parseInt(el[0]), el[1]]);
            const invalidMoney = notes.some(note => note[0] % 10 !== 0);
            if (invalidMoney) {
                throw new Error('Invalid money given');
            }

            let sum = 0;

            for (const [note, noteAmount] of notes) {
                sum += note * noteAmount;
                if (!this.notesRepository[note]) {
                    this.notesRepository[note] = noteAmount;
                    continue;
                }

                this.notesRepository[note] += noteAmount;
            }

            this.currentClient.balance += sum;

            return this.addMoney.bind(this);
        },
        giveMoney: function(money) {
            isCurrentClientExists();

            if (this.currentClient.balance < money) {
                throw new Error('Current client balance is too low');
            }

            if (typeof money !== 'number' || money < 0 || money % 10 !== 0) {
                throw new Error(`Invalid value given for argument money`);
            }

            let sum = 0;
            const sortedNotesRepository = 
                Object.entries(this.notesRepository)
                .map(note => [parseInt(note[0]), note[1]])
                .filter(note => note[0] <= money)
                .sort((note1, note2) => note2[0] - note1[0]); //reverse sort

            const banknotesToRemove = {};

            for (const [banknote, banknoteAmount] of sortedNotesRepository) {
                const maxbanknoteAmount = Math.floor((money - sum) / banknote);
                const banknoteAmountToGive = Math.min(banknoteAmount, maxbanknoteAmount);

                sum += banknote * banknoteAmountToGive;
                banknotesToRemove[banknote] = banknoteAmountToGive

                if (sum === money) {
                    break;
                }
            }

            if (sum !== money) {
                throw new Error(`Not enough money in bankomat to give ${money} money`);
            }

            for (const banknote in banknotesToRemove) {
                this.notesRepository[banknote] -= banknotesToRemove[banknote];
            }

            this.currentClient.balance -= money;
            return true;
        }
    }

    const isCurrentClientExists = () => {
        if (bankomat.currentClient === undefined) {
            throw new Error('There is no client at bankomat');
        }
    }

    return bankomat;
}

/**
 * @returns {boolean} Является ли объект клиентом
 */
const isClient = (client) => {
    if (!client || typeof client.balance !== 'number' || typeof client.name !== 'string') {
        return false;
    }

    return true;
}

// eslint-disable-next-line no-undef
module.exports = { createClient, createBank, createBankomat };
