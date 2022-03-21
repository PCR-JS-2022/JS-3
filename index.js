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
        throw new Error();
    }
        
    return {
        name,
        balance
    };
}

function isClient(client){
    return client.hasOwnProperty('name') && client.hasOwnProperty('balance');
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
        throw new Error();
    };

    return {
        bankName, clients,
        addClient: function(client) {
            if(!isClient(client) || this.clients.some(e => e.name === client.name)){
                throw new Error();
            }

            this.clients.push(client);
            return true;
        },
        removeClient: function(client) {
            if(this.clients.findIndex(e => e.name === client.name) === -1 || !isClient(client)){
                throw new Error();
            }

            this.clients = this.clients.filter(e => e.name !== client.name);
            return true;
        }
    };
}

function isBank(bank){
    return bank.hasOwnProperty('bankName')
        && bank.hasOwnProperty('clients')
        && bank.hasOwnProperty('addClient')
        && bank.hasOwnProperty('removeClient');
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
        throw new Error();
    }

    return {
        bank, 
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient: function(client) {
            if(!isClient(client) || bank.clients.some(e => e.name === client.name)
                || this.currentClient !== undefined) {
                throw new Error();
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
                throw new Error();
            }
            
            cash.forEach(e => {
                Object.entries(e).forEach(x => {
                   this.notesRepository[x[0]] = x[1];
                   this.currentClient.balance += x[0] * x[1];
                })
            })

            return this.addMoney.bind(this);
        },
        giveMoney: function(sum) {
            if(typeof sum !== 'number' || sum % 10 !== 0 
                || this.currentClient === undefined 
                || sum > this.currentClient.balance){
                throw new Error();
            }

            let tempSum = sum;
            const tempRep = this.notesRepository;
            const result = Object.entries(this.notesRepository).sort((a, b) => b[0] - a[0]).map(e => {
                let count = 0;

                if(e[1] !== 0){
                    const flCount = Math.floor(tempSum / e[0]);
                    count = flCount > e[1] ? e[1] : flCount;
                }

                tempSum -= e[0] * count;
                this.notesRepository[e[0]] -= count;
                if(count !== 0) return { [e[0]]: count };
            }).filter(e => e !== undefined);

            if(sum !== 0) {
                this.notesRepository = tempRep;
                throw new Error();
            }

            return result;
        }
    };
}

module.exports = { createClient, createBank, createBankomat };
