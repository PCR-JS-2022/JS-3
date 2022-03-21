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

 function checkClientName(name){
    return typeof(name) == 'string';
};

function checkBalance(balance){
    return typeof(balance) == 'number';
};

function checkBankName(bankName){
    return typeof(bankName) == 'string';
};

function checkClient(client){
    return (typeof(client) !== "object" || checkClientName(client.name) || 
    checkBalance(client.balance));
};

function checkBank(bank){
    return typeof(bank) == 'object';
};

function checkBankNotesRepository(bankNotesRepository){
    return typeof(bankNotesRepository) == 'Object'; 
};

/**
 * @name createClient
 * @description Функция для создания клиента
 * @param {string} name Имя клиента
 * @param {number} balance Баланс клиента
 * @returns {Client} Объект клиента
 */

function createClient(name, balance = 0) {
    if(!checkClientName(name) || !checkBalance(balance))
        throw new Error('Входные данные не корректны');
        
    return {name, balance};   
};

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */

function createBank(bankName, clients = []) {
    if (!checkBankName(bankName) || !Array.isArray(clients)){
        throw new Error('Входные данные не корректны');
    }
    return {
        bankName,
        clients,
        addClient(client) {
            if (!checkClient(client)) {
                throw new Error('Входные данные не корректны');
            }
            if (this.clients.includes(client)){
                throw new Error('Такой клиент уже имеется в банке');
            }
            this.clients.push(client) 
            return true;
        },
    
        removeClient(client) {
            if (!checkClient(client)){
                throw new Error('Входные данные не корректны');
            };
            if (!clients.includes(client)){
                throw new Error('Такой клиент отсутствует в банке');
            };
            this.clients = this.clients.filter(part => part !== client);
            return true;
        }
    };
};

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */

function createBankomat(bankNotesRepository, bank) {
    if (!checkBank(bank) && !checkBankNotesRepository(bankNotesRepository)){
        throw new Error('Входные данные не корректны');
    }
    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        
        setClient(client) {
            if (!this.bank.clients.includes(client)){
                throw new Error('Вы не являетесь клиентом этого банка');
            }
            if (this.currentClient){
                throw new Error('Банк занят другим пользователем');
            }
            this.currentClient = client;
            return true;
        },
        
        removeClient() {
           
            this.currentClient = undefined;
            return true;
        },

        addMoney (...args) {
            if (!this.currentClient) {
              throw new Error('Клиент не выбран');
            };
            for (let part of args) {
                for (let bill in part) {
                    this.notesRepository[bill] += part[bill];
                    this.currentClient.balance += part[bill] * bill;
                };
            };
            return this.addMoney.bind(this);
          },

        giveMoney(getCash){
            if (!typeof(getCash) == 'Number' || (getCash % 10) !== 0){
                throw new Error('Введите сумму списания кратную 10');
            };
            if(this.currentClient === undefined){
                throw new Error('Выполните вход в систему');
            };
            if(this.currentClient.balance < getCash){
                throw new Error('Недостаточно средств на балансе');
            };

            let summa = 0;
            const notes = [5000, 2000, 1000, 500, 200, 100, 50, 10];
            for (let note in notes)
                summa = summa + note * this.notesRepository[note];
        
            if( summa < getCash){
            throw new Error('В банкомате не достаточно средств');
            };

            let noteIssuance = {};
            let getMoney = getCash;

            for (const note of notes) {
				let bill = Math.floor(money / note);
				const noteCount = this.notesRepository[note];
				if (bill !== 0) {
					if (noteCount <= bill) {
						bill = noteCount;
					}
					getMoney -= bill * note;
					this.notesRepository[note] -= bill;
					noteIssuance[note] = bill;
				}
			};
            this.currentClient.balance -= getMoney;
            return noteIssuance;
        }
    };
};

module.exports = { createClient, createBank, createBankomat };


