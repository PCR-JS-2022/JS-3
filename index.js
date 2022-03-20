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
        return typeof(bank) === Object && typeof(Object.entries(bank)) === Object;
    };

    function checkBankNotesRepository(bankNotesRepository){
        return typeof(bankNotesRepository) === Object; 
    };

    function checkAddMoney(addMoney){
        const trueMoney = [5000, 2000, 1000, 500, 200, 100, 50, 10]
        function getTrueMoney(){
            return trueMoney;
        };
        return typeof(addMoney) === Object &&
            addMoney.length > 0 && 
            Object.keys(addMoney).forEach(element => {
                trueMoney.includes(element)  
            });
    };

    function checkGetCash(cash){
        return cash > 0 && typeof(cash) === Number || cash % 10 !== 0;
    };

    function bankomatFulness(){
        let summa = 0
        for (let note of Object.keys(bankNotesRepository))
            summa += note * bankNotesRepository[note]
        return summa;
    }

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

            if (clients.includes(client))
                throw new UserException('Такой клиент уже имеется в банке');

            clients = clients.concat(client) 
            return true;
        },
    
        removeClient: client => {
            if (!checkClientObject(client))
                throw new UserException('Входные данные не корректны');
            
            if (clients.includes(client))
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
    if (!checkObject.checkBank(bank) && !checkObject.checkBankNotesRepository(bankNotesRepository))
        throw new UserException('Входные данные не корректны');
    
    return {
        bank,
        bankNotesRepository,
        currentClient: undefined,
        
        setClient: client => {
            if (!clients.includes(client))
                throw new UserException('Вы не являетесь клиентом этого банка');

            if (!this.currentClient === undefined)
                throw new UserException('Банк занят другим пользователем');
            
            currentClient = client;
            return true;
        },
        
        removeClient: () => {
            if (currentClient === undefined)
                throw new UserException('Свободная касса!!!');
            
            currentClient = undefined;
            return true;
        },

        addMoney: (...addCash) => {
            if (!client.includes(currentClient))
                throw new UserException('Вы не являетесь клиентом этого банка');

            if (!checkObject.checkAddMoney(addMoney))
                throw new UserException('Входные данные не корректны');

            if (this.currentClient === undefined)
                throw new UserException('Клиент не выбран');
            
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

        giveMoney: (getCash) => {
            if (!client.includes(currentClient))
                throw new UserException('Вы не являетесь клиентом этого банка');

            if (!checkObject.getCash(getCash))
                throw new UserException('Введите сумму списания кратную 10');

            if(!this.currentClient)
                throw new UserException('Выполните вход в систему');

            if(!this.currentClient.balance > getCash)
                throw new UserException('Недостаточно средств на балансе');

            if(!checkObject.bankomatFulness > getCash)
            throw new UserException('В банкомате не достаточно средств');

            currentClient.balance -= getCash;
            let noteIssuance = {};
            let getMoney = getCash;
        
            for( let note of checkObject.checkAddMoney.getTrueMoney()){
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
