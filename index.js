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
    if(typeof name !== "string" || typeof balance !== "number"){
        throw new Error('Некорректные данные при создании клиента');
    }
        
    return {
        name,
        balance
    };
}

function isClient(client){
    return client.name && client.balance;
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
    if(typeof bankName !== "string" || !Array.isArray(clients)){
        throw new Error('Некорректные данные при создании банка');
    };

    return {
        bankName, clients,
        addClient: function(client) {
            if(!isClient(client)){
                throw new Error('Некорректные данные');
            }
            if(this.clients.some(e => e.name === client.name)){
                throw new Error('Клиент уже существует');
            }

            this.clients.push(client);
            return true;
        },
        removeClient: function(client) {
            if(!isClient(client)){
                throw new Error('Некорректные данные');
            }
            if(this.clients.findIndex(e => e.name === client.name) === -1){
                throw new Error('Такого клиента не существует');
            }

            this.clients = this.clients.filter(e => e.name !== client.name);
            return true;
        }
    };
}

function isBank(bank){
    return bank.bankName && bank.clients && bank.addClient && bank.removeClient;
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
    if(!isBank(bank) || typeof bankNotesRepository !== 'object'){
        throw new Error('Некорректные данные при создании банкомата');
    }

    return {
        bank, 
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient: function(client) {
            if(!isClient(client)){
                throw new Error('Некорректные данные');
            }
            if(!this.bank.clients.some(e => e.name === client.name)) {
                throw new Error('Пользователь не является клиентом банка');
            }
            if(this.currentClient !== undefined){
                throw new Error('Банкомат занят другим клиентом');
            }

            this.currentClient = client;
            return true;
        },
        removeClient: function() {
            this.currentClient = undefined;
            return true;
        },
        addMoney: function(...cash) {
            if(this.currentClient === undefined){
                throw new Error('Клиент не установлен');
            }
            
            cash.forEach(e => {
                Object.entries(e).forEach(([key, value]) => {
                   this.notesRepository[key] = value;
                   this.currentClient.balance += key * value;
                })
            })

            return this.addMoney.bind(this);
        },
        giveMoney: function(sum) {
            if(typeof sum !== 'number'){
                throw new Error('Некорректные данные');
            }
            if(sum % 10 !== 0){
                throw new Error('Сумма не кратна 10');
            }
            if(this.currentClient === undefined){
                throw new Error('Клиент не установлен');
            }
            if(sum > this.currentClient.balance){
                throw new Error('Недостаточно средств');
            }

            let tempSum = sum;
            const tempRep = this.notesRepository;
            const result = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]).reduce((a, [key, value]) => {
                let count = 0;

                if(value !== 0){
                    const flCount = Math.floor(tempSum / key);
                    count = flCount > value ? value : flCount;
                }

                tempSum -= key * count;
                this.notesRepository[key] -= count;
                if(count !== 0){
                    a[key] = count;
                } 
                return a;
            }, {});

            if(tempSum !== 0) {
                this.notesRepository = tempRep;
                throw new Error('У банкомата нет необходимых купюр');
            }

            return result;
        }
    };
}

module.exports = { createClient, createBank, createBankomat };
