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

function checkObject(){

    function checkClientName(name){
        return typeof(name) === String && name.length > 0;
    };

    function checkBalance(balance){
        return typeof(balance) === Number && client.balance >= 0;
    };

    function checkBankName(bankName){
        return typeof(bankName) === String && bankName.length !== 0;
    };

    function checkClientObject(client){
        return typeof(client) === Object && Object.keys(client) === [ 'name', 'balance' ] &&
        checkClient(client.name) && checkBalance(client.balance);
    };

    function checkBank(bank){
        return typeof(bank) === Object && typeof(Object.values(bank)) === Object;
    };

    function checkBankNotesRepository(bankNotesRepository){
        return typeof(bankNotesRepository) === Object;
    };

    function checkAddMoney(addMoney){
        const trueMoney = [5000, 2000, 1000, 500, 200, 100, 50, 10]
        return typeof(addMoney) === Object &&
            addMoney.length > 0 && 
            Object.keys(addMoney).forEach(element => {
                trueMoney.includes(element)  
            });
    };
};    


function createClient(name, balance = 0) {
    if(!checkObject.checkClientName(name) || !checkObject.checkBalance(balance))
        throw new UserException('Входные данные не корректны');
        
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
    if (!checkBankName(bankName) && !checkClientObject(clients))
        throw new UserException('Входные данные не корректны');
    
    return {
        bankName,
        clients,
        addClient: client => {
            if (!checkClientObject(client)) 
                throw new UserException('Входные данные не корректны');

            if (Object.values(clients).some(client))
                throw new UserException('Такой клиент уже имеется в банке');
                
            this.clients.push(client);
            return true;
        },
    
        removeClient: client => {
            if (!checkClientObject(client))
                throw new UserException('Входные данные не корректны');
            
            if (!Object.values(clients).some(client))
                throw new UserException('Такой клиент отсутствует в банке');
            
            clients = clients.filter(!client);
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
    if (!checkObject.checkBank && !checkObject.checkBankNotesRepository)
        throw new UserException('Входные данные не корректны');
    
    return {
        bank,
        bankNotesRepository,
        currentClient: undefined,
        
        setClient: client => {
            if (!Object.values(bank.clients).some(client))
                throw new UserException('Вы не являетесь клиентом этого банка');

            if (!this.currentClient === undefined)
                throw new UserException('Банк занят другим пользователем');
            
            this.currentClient = client;
            return true;
        },
        
        removeClient: () => {
            if (this.currentClient === undefined)
                throw new UserException('Свободная касса!!!');
            
            this.currentClient = undefined;
            return true;
        },

        addMoney: (...addCash) => {
            if (!checkObject.checkAddMoney)
                throw new UserException('Входные данные не корректны');

            if (this.currentClient === undefined)
                throw new UserException('Клиент не выбран');
            
            addCash.forEach(part => {
                Object.entries(part).forEach(element => {
                if (!Object.keys(bankNotesRepository).includes(element.keys)){
                    bankNotesRepository.push(element);
                    this.currentClient.balance += element.values * element.keys;
                };

                if (Object.keys(bankNotesRepository).includes(element.keys)){
                bankNotesRepository[element.key].values += element.values;
                this.currentClient.balance += element.values * element.keys;
                };
            })})
        },

        giveMoney: (getCash) => {}
        }
    };
}

module.exports = { createClient, createBank, createBankomat };
