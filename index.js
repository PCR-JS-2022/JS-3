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
function createBank(bankName, clients = []) {
    if(typeof bankName !== "string" || !Array.isArray(clients)) {
        throw new Error("Невалидные данные");
    }
    return {
        bankName,
        clients,
        addClient(client) {
            if(this.clients.filter(i => i === client).length !== 0) {
                throw new Error("Этот клиент уже есть");
            }
            if(typeof client !== "object" || typeof client.name !== "string" || typeof client.balance !== "number") {
                throw new Error("Невалидные данные");
            }
            this.clients.push(client);
            return true;
        },
        removeClient(client) {
            if(clients.filter(i => i === client).length === 0) {
                throw new Error("Такого клиента нет");
            }
            if(typeof client !== "object" || typeof client.name !== "string" || typeof client.balance !== "number") {
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
function createBankomat(bankNotesRepository, bank) {
    if(typeof bankNotesRepository !== "object" || !isBank(bank)) {
        throw new Error("Невалидные данные");
    }
    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient(client) {
            if(this.bank.clients.filter(i => i === client).length === 0) {
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
            let banknotes = 0;
            let result = {};

            if(currentSum > 0 && currentSum >= 5000 && this.notesRepository.hasOwnProperty("5000")) {
                banknotes = Math.floor(currentSum / 5000);
                if(banknotes > this.notesRepository["5000"]) {
                    currentSum -= 5000 * this.notesRepository["5000"];
                    result["5000"] = this.notesRepository["5000"];
                    this.notesRepository["5000"] = 0;
                } else {
                    currentSum -= 5000 * banknotes;
                    result["5000"] = banknotes;
                    this.notesRepository["5000"] = this.notesRepository["5000"] - banknotes;
                }
            }

            if(currentSum > 0 && currentSum >= 2000 && this.notesRepository.hasOwnProperty("2000")) {
                banknotes = Math.floor(currentSum / 2000);
                if(banknotes > this.notesRepository["1000"]) {
                    currentSum -= 2000 * this.notesRepository["2000"];
                    result["2000"] = this.notesRepository["2000"];
                    this.notesRepository["1000"] = 0;
                } else {
                    currentSum -= 2000 * banknotes;
                    result["2000"] = banknotes;
                    this.notesRepository["2000"] = this.notesRepository["2000"] - banknotes;
                }
            }

            if(currentSum > 0 && currentSum >= 1000 && this.notesRepository.hasOwnProperty("1000")) {
                banknotes = Math.floor(currentSum / 1000);
                if(banknotes > this.notesRepository["1000"]) {
                    currentSum -= 1000 * this.notesRepository["1000"];
                    result["1000"] = this.notesRepository["1000"];
                    this.notesRepository["1000"] = 0;
                } else {
                    currentSum -= 1000 * banknotes;
                    result["1000"] = banknotes;
                    this.notesRepository["1000"] = this.notesRepository["1000"] - banknotes;
                }
            }

            if(currentSum > 0 && currentSum >= 500 && this.notesRepository.hasOwnProperty("500")) {
                banknotes = Math.floor(currentSum / 500);
                if(banknotes > this.notesRepository["500"]) {
                    currentSum -= 500 * this.notesRepository["500"];
                    result["500"] = this.notesRepository["500"];
                    this.notesRepository["500"] = 0;
                } else {
                    currentSum -= 500 * banknotes;
                    result["500"] = banknotes;
                    this.notesRepository["500"] = this.notesRepository["500"] - banknotes;
                }
            }

            if(currentSum > 0 && currentSum >= 100 && this.notesRepository.hasOwnProperty("100")) {
                banknotes = Math.floor(currentSum / 100);
                if(banknotes > this.notesRepository["100"]) {
                    currentSum -= 100 * this.notesRepository["100"];
                    result["100"] = this.notesRepository["100"];
                    this.notesRepository["100"] = 0;
                } else {
                    currentSum -= 100 * banknotes;
                    result["100"] = banknotes;
                    this.notesRepository["100"] = this.notesRepository["100"] - banknotes;
                }
            }

            if(currentSum > 0 && currentSum >= 50 && this.notesRepository.hasOwnProperty("50")) {
                banknotes = Math.floor(currentSum / 50);
                if(banknotes > this.notesRepository["50"]) {
                    currentSum -= 50 * this.notesRepository["50"];
                    result["50"] = this.notesRepository["50"];
                    this.notesRepository["50"] = 0;
                } else {
                    currentSum -= 50 * banknotes;
                    result["50"] = banknotes;
                    this.notesRepository["50"] = this.notesRepository["50"] - banknotes;
                }
            }

            if(currentSum > 0 && currentSum >= 10 && this.notesRepository.hasOwnProperty("10")) {
                banknotes = Math.floor(currentSum / 10);
                if(banknotes > this.notesRepository["10"]) {
                    currentSum -= 10 * this.notesRepository["10"];
                    result["10"] = this.notesRepository["10"];
                    this.notesRepository["10"] = 0;
                } else {
                    currentSum -= 10 * banknotes;
                    result["10"] = banknotes;
                    this.notesRepository["10"] = this.notesRepository["10"] - banknotes;
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

function isBank(bank) {
    return typeof bank === "object" 
        && typeof bank.bankName === "string" 
        && Array.isArray(bank.clients) 
        && typeof bank.addClient === "function" 
        && typeof bank.removeClient === "function";
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
greenBankBankomat.giveMoney(1610);
greenBankBankomat.addMoney({ 10: 2 })({ 50: 1, 10: 1 })({ 10: 3 }, { 100: 1 });
//console.log(clientVasiliy.balance);

//console.log(greenBank.clients)

module.exports = { createClient, createBank, createBankomat };
