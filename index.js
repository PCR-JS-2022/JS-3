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
    if (typeof name !== 'string' || !name || typeof balance !== 'number') {
        throw new Error(`Неверные входные данные createClient ${name} : ${balance}`);
    }


    return {name, balance};
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients = []) {
    if (typeof bankName !== 'string') {
        throw new Error('Неверные входные данные bankName');
    }


    return {
        bankName, clients,
        addClient(client) {
            if (!isTypeOfClient(client) || this.clients.includes(client))
                throw new Error('Не удалось добавить клиента в банк');
            this.clients.push(client);
            return true;
        },
        removeClient(client) {
            if (this.clients.find((bc) => bc === client)) {
                this.clients = this.clients.filter((bc) => bc !== client)
                return true;
            } else {
                throw new Error('Не удалось удалить клиента из банка')
            }

            return false;
        }
    };
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} bankNotesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */
function createBankomat(bankNotesRepository, bank) {
    if (!bank || !isTypeOfBank(bank)) {
        throw Error("Неверные входные данные createBankomat");
    }

    let currentClient = undefined;

    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: currentClient,
        setClient(client) {
            if (client === undefined) {
                throw Error("Такого клиента нету");
            }

            if (!isTypeOfClient(client)) {
                throw Error("Некорректные входные параметры");
            }

            if (!bank.clients.find((bc) => bc.name === client.name)) {
                throw Error("Такого клиента нету");
            }


            this.currentClient = client;
            return true;
        },
        removeClient() {
            this.currentClient = undefined;
            return true;
        },
        addMoney(...money) {
            if (!this.currentClient) {
                throw new Error('Текущий пользователь нету');
            }



            for (let moneyObjs of money) {
                for (let key in moneyObjs) {
                    const nominal = key;
                    const count = moneyObjs[key];
                    this.currentClient.balance = this.currentClient.balance + ((+nominal) * (count));
                    if (this.notesRepository[nominal]) {
                        this.notesRepository[nominal] += count;
                    } else {
                        this.notesRepository[nominal] = count;
                    }
                }
            }


            return this.addMoney.bind(this);
        },
        giveMoney(money) {
            let moneyCopy = money;
            if (!this.currentClient) {
                throw new Error('Текущий пользователь нету');
            }

            if (moneyCopy > this.currentClient.balance) {
                throw new Error('Бабок нету, грустна');
            }

            const res = {};

            for (let i of Object.keys(this.notesRepository).sort((a, b) => -a + b)) {
                if (moneyCopy > +i) {
                    const count = Math.min(Math.floor(moneyCopy / +i), this.notesRepository[i]);
                    this.notesRepository[i] -= count;
                    moneyCopy -= count * +i;
                    res[i] = count;
                }
            }

            this.currentClient.balance -= money;
            return res;
        },
    }
}


function isTypeOfBank(bank) {
    return typeof bank === 'object' && bank.bankName && bank.clients && bank.addClient && bank.removeClient
}

function isTypeOfClient(client) {
    return typeof client === 'object' &&
        ((client.balance && typeof client.balance === 'number') || client.balance === 0) &&
        client.name && typeof client.name === 'string'
}


module.exports = {createClient, createBank, createBankomat};
