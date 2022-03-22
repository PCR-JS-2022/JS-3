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
    if (typeof name !== 'string' || typeof balance !== 'number') {
        throw new Error();
    }
    return {
        name: name,
        balance: balance
    }
}

function isValidClient(client) {
    return (client.hasOwnProperty('balance') && client.hasOwnProperty('name'));
}
/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} bankName Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
    if (typeof bankName !== 'string' || !clients instanceof Array) {
        throw new Error();
    }
    return {
        bankName: bankName,
        clients: clients,
        addClient(person) {
            if (!isValidClient(person) || this.clients.includes(person)) throw new Error();
            this.clients.push(person);
            return true;
        },
        removeClient(person) {
            if (!this.clients.includes(person)) throw new Error();
            this.clients = this.clients.filter(client => client !== person);
            return true;
        }
    }
}

function isValidBank(bank) {
    return (bank.hasOwnProperty('bankName') && bank.hasOwnProperty('clients')
        && bank.hasOwnProperty('addClient') && bank.hasOwnProperty('removeClient'));
}
/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
    if (typeof bankNotesRepository !== 'object' || !isValidBank(bank)) {
        throw new Error();
    }
    return {
        bank: bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient(person) {
            if (!this.bank.clients.includes(person) || this.currentClient) throw new Error();
            this.currentClient = person;
            return true
        },
        removeClient() {
            this.currentClient = undefined;
            return true;
        },
        addMoney(...banknotes) {
            if (!this.currentClient || banknotes.length === 0) throw new Error();
            for (const notes of banknotes) {
                for (const note in notes) {
                    this.notesRepository[note] += notes[note];
                    this.currentClient.balance += notes[note] * note;
                }
            }
            return this.addMoney.bind(this);
        },
        giveMoney(money) {
            if (!this.currentClient || money > this.currentClient.balance || money % 10 !== 0) throw new Error();
            let result = {};
            let notes = [5000, 2000, 1000, 500, 200, 100, 50, 10];
            let sum = money;
            let repository = this.notesRepository;
            while (sum !== 0 && notes.length) {
                let note = notes[0];
                let freeNotes = repository[note];
                let notesNeeded = Math.floor(sum / note);
                let numberOfNotes = Math.min(freeNotes, notesNeeded);
                sum -= note * numberOfNotes;
                if (numberOfNotes !== 0) {
                    result[note] = numberOfNotes;
                }
                notes = notes.slice(1);
            }
            if (sum === 0) {
                this.currentClient.balance -= money;
                return result;
            } else throw new Error();
        }
    }
}

const greenBankNotesRepository = {
    5000: 2,
    2000: 3,
    1000: 13,
    500: 20,
    200: 10,
    100: 5,
    50: 2,
    10: 5,
};

const greenBank = createBank('GREENBANK');
//console.log(greenBank)
const greenBankBankomat = createBankomat(greenBankNotesRepository, greenBank);
//console.log(greenBankBankomat)
const clientVasiliy = createClient('Василий', 2500);
//console.log(clientVasiliy)
console.log(greenBank.addClient(clientVasiliy)); // true
// console.log(greenBank.addClient(clientVasiliy)); // Error
console.log(greenBankBankomat.setClient(clientVasiliy)); // true
console.log(clientVasiliy)
console.log(greenBankBankomat.giveMoney(2000));
console.log(clientVasiliy)
console.log(greenBankBankomat.addMoney({ 10: 3 })({ 50: 1, 10: 1 })({ 10: 3 }, { 100: 1 }));
console.log(clientVasiliy);
//console.log(greenBankBankomat.notesRepository);
//console.log(greenBankBankomat.removeClient());

module.exports = {createClient, createBank, createBankomat};
