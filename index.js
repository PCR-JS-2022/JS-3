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

function checkAddMoney(addMoney){
    const trueMoney = [5000, 2000, 1000, 500, 200, 100, 50, 10]

    return typeof(addMoney) == 'Object' &&
        addMoney.length > 0 && 
        Object.keys(addMoney).forEach(element => {
            trueMoney.includes(element)  
        });
};

function getTrueMoney(){
    return [5000, 2000, 1000, 500, 200, 100, 50, 10];
}

function checkGetCash(cash){
    return cash > 0 && typeof(cash) == 'Number' || cash % 10 !== 0;
};

function checkBankomatFulness(){
    let summa = 0
    for (let note of Object.keys(bankNotesRepository))
        summa += note * bankNotesRepository[note]
    return summa;
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
        bankNotesRepository,
        
        setClient(client) {
            if (!this.clients.includes(client)){
                throw new Error('Вы не являетесь клиентом этого банка');
            }
            if (!this.currentClient === undefined){
                throw new Error('Банк занят другим пользователем');
            }
            this.currentClient = client;
            return true;
        },
        
        removeClient() {
            if (this.currentClient === undefined){
                throw new Error('Свободная касса!!!');
            }
            this.currentClient = undefined;
            return true;
        },

        addMoney(...addCash) {
            if (!this.clients.includes(client)){
                throw new Error('Вы не являетесь клиентом этого банка');
            }
            if (!checkAddMoney(addMoney)){
                throw new Error('Входные данные не корректны');
            }
            if (this.currentClient === undefined){
                throw new Error('Клиент не выбран');
            }
            addCash.forEach(part => {
                for (let element of Object.entries(part)){
                if (!Object.keys(bankNotesRepository).includes(Object.keys(element))){
                    bankNotesRepository[Object.keys(element)] = Object.values(element);
                    this.currentClient.balance += Object.values(element) * Object.keys(element);
                };

                if (Object.keys(bankNotesRepository).includes(Object.keys(element))){
                bankNotesRepository[Object.keys(element)] += Object.values(element);
                this.currentClient.balance += Object.values(element) * (Object.keys(element))
                };
            }});
        },

        giveMoney(getCash){
            if (!clients.includes(client)){
                throw new Error('Вы не являетесь клиентом этого банка');
            }
            if (!checkGetCash(getCash)){
                throw new Error('Введите сумму списания кратную 10');
            }
            if(!this.currentClient){
                throw new Error('Выполните вход в систему');
            }
            if(!this.currentClient.balance > getCash){
                throw new Error('Недостаточно средств на балансе');
            }
            if(!checkBankomatFulness() > getCash){
            throw new Error('В банкомате не достаточно средств');
            }
            this.currentClient.balance -= getCash;
            let noteIssuance = {};
            let getMoney = getCash;
        
            for(let note of getTrueMoney()){
                var bill = Math.floor(getMoney/note);
                if (bill >= 1){
                    if(bankNotesRepository[note] >= bill){
                    bankNotesRepository[note] -= bill;
                    noteIssuance[note] = bill;
                    getMoney -= note * bill;
                        if(getMoney === 0 )
                            break
                    }
                    else{
                        bill = bankNotesRepository[note];
                        noteIssuance[note] = bill;
                        getMoney -= note * bill;
                        if(getMoney === 0 )
                        break
                    }
                }
            };
        }
    }
};

module.exports = { createClient, createBank, createBankomat };


