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

function findClientIndex(clients, client) {
    return clients.findIndex(e => e.name == client.name &&
        e.balance == client.balance &&
        typeof client.name == "string" &&
        typeof client.balance == "number");
}


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
    if (typeof bankName !== "string" || !Array.isArray(clients)) {
        throw new Error();
    }

    const bank = {
        bankName,
        clients,

        addClient(client) {
            const checkClient = findClientIndex(this.clients, client);

            if (checkClient == -1) {
                this.clients.push(client);
                return true;
            }

            throw new Error();
        },

        removeClient(client) {
            const checkClient = findClientIndex(this.clients, client);

            if (checkClient !== -1) {
                this.clients.splice(checkClient, 1);
                return true;
            }

            throw new Error();
        },
    }
    return bank;
}


/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */


function createBankomat(bankNotesRepository, bank) {
    if (typeof bank !== "object" || typeof bankNotesRepository !== "object")
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
            if (!this.currentClient)
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
            if (!this.currentClient || this.currentClient.balance < count || count % 10 !== 0) {
                throw new Error();
            }

            const cash = count;
            let sum = 0;

            const arrNotes = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]);
            const result = {};

            for (let i = String(count).length; i > 1; i--) {
                let e = Math.floor(count / Math.pow(10, i - 1));
                e = e * Math.pow(10, i - 1);

                arrNotes.forEach(([banknote, banknoteCount], i) => {
                    if (banknoteCount !== 0 && e >= banknote && banknoteCount * banknote >= e) {

                        const toFloor = Math.floor(e / banknote);
                        (result[banknote]) ? result[banknote] += toFloor: result[banknote] = toFloor;
                        arrNotes[i] = [banknote, banknoteCount - toFloor];

                        sum += banknote * toFloor;
                        e -= banknote * toFloor;

                    } else if (banknoteCount !== 0 && e >= banknote) {

                        (result[banknote]) ? result[banknote] += banknoteCount: result[banknote] = banknoteCount;
                        arrNotes[i] = [banknote, 0];

                        sum += banknote * banknoteCount;
                        e -= banknote * banknoteCount;
                    }
                });

                count = count % Math.pow(10, i - 1);
            }

            if (sum != cash) {
                throw new Error();
            }

            this.currentClient.balance -= sum;
            return result;
        }
    }

    return bankomat;
}


module.exports = { createClient, createBank, createBankomat };

// const notesRepository = {
//     5000: 1,
//     2000: 3,
//     1000: 2,
//     500: 0,
//     200: 1,
//     100: 0,
//     50: 10,
//     10: 13,
// };

// const clients = [
//     { name: 'чел', balance: 1488 },
//     { name: 'name 0', balance: 100 },
//     { name: 'name 1', balance: 101 },
//     { name: 'name 2', balance: 102 },
//     { name: 'name 3', balance: 103 },
//     { name: 'name 4', balance: 104 },
//     { name: 'name 5', balance: 105 },
//     { name: 'name 6', balance: 106 },
//     { name: 'name 7', balance: 107 },
//     { name: 'name 8', balance: 108 },
//     { name: 'name 9', balance: 109 },
//     { name: 'кент', balance: 2500000 },
// ]
// const bank = createBank("Bibici", clients);
// const crtBank = createBankomat(notesRepository, bank);
// crtBank.setClient(createClient("кент", 2500000));
// //console.log(crtBank.addMoney({ 10: 2 }));
// // console.log(crtBank.addMoney({ 10: 2 })({ 50: 1, 10: 1 })({ 10: 3 }, { 100: 1 }));
// console.log(crtBank);
// console.log(crtBank.giveMoney(12670)); 
// // console.log(crtBank);
// // console.log(crtBank);
// // console.log(bank.removeClient());
// // console.log(crtBank);
// // console.log(createClient("1212", 1450))
// // console.log(createBank(bnk, cl))
// // const cl1 = createClient("чел", 1487);
// // const cl2 = createClient("чел", 1488);
// // const crtBank = createBank("Bibici", clients);
// // console.log(crtBank);
// // console.log(crtBank.addClient(cl1));
// // console.log(crtBank);
// // console.log(crtBank.removeClient(cl2));
// // console.log(crtBank);