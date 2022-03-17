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

function checkObject(anyObject){

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
        checkClient(this.name) && checkBalance(this.balance);
    };
};    


function createClient(name, balance = 0) {
    if(!checkObject.checkClientName(name) || !checkObject.checkBalance(balance))
        throw new UserException('Введите корректные данные');
        
    return Client = {
        name: name,
        balance: balance
        };
};

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */

function createBank(bankName, clients) {};

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {}

module.exports = { createClient, createBank, createBankomat };
