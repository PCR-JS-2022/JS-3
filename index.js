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
        throw new Error("Невалидные данные");
    }
    return { name, balance }
}
//console.log(createClient("Nastya", 2000))
/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */

function isClient(client) {
    return typeof client === "object" && typeof client.name === "string" && typeof client.balance === "number";
}

function createBank(bankName, clients = []) {
    if(typeof bankName !== "string" || !Array.isArray(clients)) {
        throw new Error("Невалидные данные");
    }
    return {
        bankName,
        clients,
        addClient(client) {
            if(this.clients.includes(client)) {
                throw new Error("Этот клиент уже есть");
            }
            if(!isClient(client)) {
                throw new Error("Невалидные данные");
            }
            this.clients.push(client);
            return true;
        },
        removeClient(client) {
            if(!this.clients.includes(client)) {
                throw new Error("Такого клиента нет");
            }
            if(!isClient(client)) {
                throw new Error("Невалидные данные");
            }
            this.clients = this.clients.filter(i => i !== client);
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

function isBank(bank) {
    return typeof bank === "object" 
        && typeof bank.bankName === "string" 
        && Array.isArray(bank.clients) 
        && typeof bank.addClient === "function" 
        && typeof bank.removeClient === "function";
}

function createBankomat(bankNotesRepository, bank) {
    if(typeof bankNotesRepository !== "object" || !isBank(bank)) {
        throw new Error("Невалидные данные");
    }
    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient(client) {
            if(!this.bank.clients.includes(client)) {
                throw new Error("Этот клиент не привязан к банку")
            };
            if(this.currentClient !== undefined) {
                throw new Error("Банкомат занят");
            }
            this.currentClient = client;
            return true;
        },
        removeClient() {
            this.currentClient = undefined;
            return true;
        },
        addMoney(...money) { 
            if (this.currentClient === undefined) {
                throw new Error('Выберите клиента');
            }
            let sum = 0;
            for(let i = 0; i < money.length; i ++) { 
                let currentObj = money[i]; 
                for(const k in currentObj) { 
                    this.notesRepository[k] += currentObj[k];
                    sum += k * currentObj[k]; 
                }
            }
            this.currentClient.balance += sum;
            return this.addMoney.bind(this);
        },
        giveMoney(money) { //нужно выдать такую сумму
            if (this.currentClient === undefined) {
                throw new Error('Выберите клиента');
            }
            if(this.currentClient.balance < money) {
                throw new Error('Недостаточно средств');
            }
            if(money % 10 !== 0) {
                throw new Error('Сумма денег должна быть кратна 10');
            }
            let currentSum = money;
            const result = {};

            let sortMoney = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]);
            for(let i = 0; i < sortMoney.length; i++) { 
                let current = sortMoney[i];
                const [note, noteCount] = current;
                const noteAsNumber = Number(note);
                if(currentSum > 0 && currentSum >= noteAsNumber) {
                    const banknotes = Math.floor(currentSum / noteAsNumber);
                    if(banknotes > noteCount) {
                        currentSum -= noteAsNumber * noteCount;
                        result[note] = noteCount;
                        this.notesRepository[note] = 0;
                    } else {
                        currentSum -= noteAsNumber * banknotes;
                        result[note] = banknotes;
                        this.notesRepository[note] = noteCount - banknotes;
                    }
                }
            }

            if(currentSum !== 0) {
                throw new Error("Недостаточно нужных купюр")
            } else {
                this.currentClient.balance -= money;
                return result;
            }
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
//console.log(greenBank); 
const greenBankBankomat = createBankomat(greenBankNotesRepository, greenBank);
//console.log(greenBankBankomat)
const clientVasiliy = createClient('Василий', 2500);
//console.log(clientVasiliy);
//console.log(greenBank.addClient(clientVasiliy)); // true)
//console.log(greenBank.addClient(clientVasiliy)); // Error)
//greenBank.addClient(clientVasiliy);
greenBank.addClient(clientVasiliy);
greenBankBankomat.setClient(clientVasiliy);
//console.log(greenBankBankomat.giveMoney(1610));
//console.log(greenBankBankomat.giveMoney(1610));
//greenBankBankomat.addMoney({ 10: 2 })({ 50: 1, 10: 1 })({ 10: 3 }, { 100: 1 });
//console.log(clientVasiliy.balance);

//console.log(greenBank.clients)

module.exports = { createClient, createBank, createBankomat };
