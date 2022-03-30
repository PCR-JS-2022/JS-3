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
function createClient(name, balance) { }
function createClient(name, balance = 0) {
    if (isValideClientData(name, balance))
        return { name, balance };
    throw new Error('Error: invalid person arguments');
}

/**
 *
 * @param {Client} client
 * @returns {boolean}
 */
function isValideClientData(name, balance) {
    return typeof name === 'string' && typeof balance === 'number';
}

/**
 *
 * @param {Client} client
 * @returns {boolean}
 */
function isValideClient(client) {
    return typeof client != 'object' ||
        !client.hasOwnProperty('name') || typeof client.name != 'string' || !client.name ||
        !client.hasOwnProperty('balance') || typeof client.balance != 'number';
}

function createBank(bankName, clients = []) {
    if (typeof bankName != 'string' || !bankName || !Array.isArray(clients)) {
        throw new Error('Error: Invalid bank arguments');
    }

    return {
        bankName,
        clients,

        addClient: function (client) {
            if (isValideClient(client) || this.clients.includes(client)) {
                throw new Error('Error: invalid person arguments');
            }
            this.clients = this.clients.concat(client);
            return true;
        },

        removeClient: function (client) {
            if (isValideClient(client)) {
                throw new Error('Error: invalid person arguments');
            }
            const newClients = this.clients.filter(item => item !== client);
            if (newClients.length === this.clients.length) {
                throw new Error('Error: Person is not a client');
            }
            this.clients = newClients;
            return true;
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
function CheckBank(bank) {
    return typeof bank === "object" && typeof bank.bankName === "string" &&
        Array.isArray(bank.clients) && typeof bank.addClient === "function" &&
        typeof bank.removeClient === "function"
}

function createBankomat(bankNotesRepository, bank) {

    if (!CheckBank(bank) || typeof bankNotesRepository !== "object")
        throw new Error('Error: Invalid bankomat arguments');

    const bankomat = {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,

        setClient(client) {

            if (bankomat.currentClient == undefined && !isValideClient(client) && this.bank.clients.includes(client)) {
                bankomat.currentClient = client;
                return true;
            }

            throw new Error('Error: This person is not our client');
        },

        removeClient() {
            bankomat.currentClient = undefined;
            return true;
        },

        addMoney(...cash) {
            if (!this.currentClient || !cash.length)
                throw new Error('Error: ATM does not have a client');

            for (const coins of cash) {
                for (const n in coins) {
                    this.notesRepository[n] += coins[n];
                    this.currentClient.balance += coins[n] * n;
                }
            }
            return this.addMoney.bind(this);
        },

        giveMoney(count) {

            if (typeof count !== 'number' || !this.currentClient ||
                count > this.currentClient.balance || count % 10 !== 0) {
                throw new Error('Error: Incorrect cash to give');
            }

            const result = {};
            const cash = count;
            const bankNotes = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]);

            bankNotes.forEach(([banknote, banknoteCount], i) => {

                let cly = Math.floor(count / banknote);

                if (banknoteCount !== 0 && count >= banknote) {

                    if (banknoteCount * banknote <= count) {
                        cly = banknoteCount;
                    }

                    result[banknote] = cly;
                    bankNotes[i] = [banknote, banknoteCount - cly];
                    this.notesRepository[banknote] -= cly;

                    count -= banknote * cly;
                }
            });
            if (count != 0) {
                throw new Error('Error: There is no cash in ATM');
            }

            this.currentClient.balance -= cash;
            return result;
        }
    }
    return bankomat;
}


module.exports = { createClient, createBank, createBankomat };
