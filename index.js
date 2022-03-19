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
    if (typeof name !== "string" || typeof balance !== "number") {
        throw new Error();
    }

    return {
        name,
        balance,
    };
}


/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */


function createBank(bankName, clients = []) {
    if (typeof bankName !== "string" || !Array.isArray(clients) || !bankName) {
        throw new Error();
    }

    const bank = {
        bankName,
        clients,

        addClient(client) {
            if (checkClient(client) || findClientIndex(this.clients, client) !== -1)
                throw new Error();

            this.clients.push(client);
            return true;
        },

        removeClient(client) {
            const clientIndex = findClientIndex(this.clients, client);

            if (clientIndex !== -1) {
                this.clients = this.clients.filter((e, index) => index !== clientIndex);
                return true;
            }

            throw new Error();
        },
    }
    return bank;
}

function findClientIndex(clients, client) {
    return clients.findIndex(e => e.name == client.name && e.balance == client.balance && typeof client === "object" &&
        client.balance && typeof client.name === "string" && client.balance && typeof client.balance === "number");
}

function checkClient(client) {
    return typeof client !== "object" ||
        (!client.balance || typeof client.balance !== "number" ||
            !client.name || typeof client.name !== "string")
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */


function createBankomat(bankNotesRepository, bank) {

    if (!CheckBank(bank) || typeof bankNotesRepository !== "object")
        throw new Error();

    const bankomat = {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,

        setClient(client) {

            if (bankomat.currentClient == undefined && findClientIndex(this.bank.clients, client) !== -1) {
                bankomat.currentClient = client;
                return true;
            }

            throw new Error();
        },

        removeClient() {
            if (bankomat.currentClient !== undefined) {
                bankomat.currentClient = undefined;
                return true;
            }

            throw new Error();
        },

        addMoney(...cashes) {
            if (!this.currentClient || !cashes.length)
                throw new Error();

            for (const cash of cashes) {
                for (const e in cash) {
                    this.notesRepository[e] += cash[e];
                    this.currentClient.balance += cash[e] * e;
                }
            }
            return this.addMoney.bind(this);
        },

        giveMoney(count) {

            if (typeof count !== 'number' || !this.currentClient ||
                count > this.currentClient.balance || count % 10 !== 0)
                throw new Error();

            const result = {};
            const cash = count;
            const arrNotes = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]);

            arrNotes.forEach(([banknote, banknoteCount], i) => {
                if (banknoteCount !== 0 && count >= banknote && banknoteCount * banknote > count) {

                    const toFloor = Math.floor(count / banknote);
                    (result[banknote]) ? result[banknote] += toFloor: result[banknote] = toFloor;
                    arrNotes[i] = [banknote, banknoteCount - toFloor];

                    count -= banknote * toFloor;

                } else if (banknoteCount !== 0 && count >= banknote) {

                    (result[banknote]) ? result[banknote] += banknoteCount: result[banknote] = banknoteCount;
                    arrNotes[i] = [banknote, 0];

                    count -= banknote * banknoteCount;
                }
            });

            if (count != 0) {
                throw new Error();
            }

            this.currentClient.balance -= cash;
            return result;
        }
    }

    return bankomat;
}

function CheckBank(bank) {
    return typeof bank === "object" && typeof bank.bankName === "string" &&
        Array.isArray(bank.clients) && typeof bank.addClient === "function" &&
        typeof bank.removeClient === "function"
}

const notesRepository = {
    5000: 3,
    2000: 0,
    1000: 3,
    500: 4,
    200: 7,
    100: 0,
    50: 5,
    10: 5,
};

const clients = [
    { name: 'чел', balance: 1488 },
    { name: 'name 0', balance: 100 },
    { name: 'name 1', balance: 101 },
    { name: 'name 2', balance: 102 },
    { name: 'name 3', balance: 103 },
    { name: 'name 4', balance: 104 },
    { name: 'name 5', balance: 105 },
    { name: 'name 6', balance: 106 },
    { name: 'name 7', balance: 107 },
    { name: 'name 8', balance: 108 },
    { name: 'name 9', balance: 109 },
    { name: 'кент', balance: 2500000 },
]
const bank = createBank("Bibici", clients);
const crtBank = createBankomat(notesRepository, bank);
crtBank.setClient(createClient("кент", 2500000));
// //console.log(crtBank.addMoney({ 10: 2 }));
// // console.log(crtBank.addMoney({ 10: 2 })({ 50: 1, 10: 1 })({ 10: 3 }, { 100: 1 }));
console.log(crtBank);
console.log(crtBank.giveMoney(12670));
// // console.log(crtBank);
// // console.log(crtBank);
// // console.log(bank.removeClient());
// // console.log(crtBank);
// // console.log(createClient("1212", 1450))
// // console.log(createBank(bnk, cl))
// const cl1 = { name: "кентик", balance: 1234 };
// const cl2 = { name: 14, balance: "1487" };
// // // const crtBank = createBank("Bibici", clients);
// console.log(bank.addClient(cl1));
// console.log(bank);
// // // console.log(crtBank);
// console.log(bank.removeClient(cl1));
// console.log(bank);
// // console.log(crtBank);

module.exports = { createClient, createBank, createBankomat };