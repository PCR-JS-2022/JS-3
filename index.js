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
function createClient(name, balance) {
    if (!name || typeof name !== 'string' || typeof balance !== 'number') {
        throw new Error('невалидные аргументы');
    }
    return { name, balance };
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
    if (!bankName || typeof bankName !== 'string') {
        throw new Error('невалидные аргументы');
    }

    if (clients && !Array.isArray(clients) && (!clients.hasOwnProperty('name') || clients.hasOwnProperty('balance'))) {
        throw new Error('невалидные аргументы');
    }

    return {
        bankName,
        clients: clients || [],
        addClient(client) {
            if (!client || this.clients.some(c => c.name === client.name && c.balance === client.balance)) {
                throw new Error('Клиент уже добавлен либо не передан аргумент');
            } else {
                this.clients.push(client);

                return true;
            }
        },
        removeClient(client) {
            if (!client || !this.clients.some(c => c.name === client.name && c.balance === client.balance)) {
                throw new Error('Не передан клиент которого надо удалить либо такого клиента нет');
            } else {
                this.clients = this.clients.filter(c => c.name === client.name && c.balance === client.balance);

                return true;
            }
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
    if (!bank.hasOwnProperty('bankName') || !bank.hasOwnProperty('clients') || !bank.hasOwnProperty('addClient') || !bank.hasOwnProperty('removeClient')) {
        throw new Error('невалидные аргументы');
    }

    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient(client) {
            if (this.currentClient) {
                throw new Error('Единовременно работать с банкоматом может только один клиент');
            } else if (!this.bank.clients.some(c => c.name === client.name && c.balance === client.balance)) {
                throw new Error('Работать с банкоматом может только клиент банка, к которому привязан этот банкомат');
            } else {
                this.currentClient = client;

                return true;
            }
        },
        removeClient() {
            if (!this.currentClient) {
                throw new Error('Клиента нет');
            } else {
                this.currentClient = undefined;

                return true;
            }
        },
        addMoney(...notesRepository) {
            let currencyObject = {
                5000: 0,
                2000: 0,
                1000: 0,
                500: 0,
                200: 0,
                100: 0,
                50: 0,
                10: 0,
            };

            //собираем все в один объект
            notesRepository = combineObject(notesRepository);
            //увеличиваем хранилище
            this.notesRepository = combineObject(
                [currencyObject, notesRepository, this.notesRepository]
            );
            if (Object.keys(notesRepository).length > 1 && Object.values(notesRepository).length > 1) {
                this.currentClient.balance = Object.keys(notesRepository).reduce((prev, curr, index) => {
                    this.currentClient.balance += parseInt(curr) * parseInt(Object.values(notesRepository)[index]);

                    return this.currentClient.balance;
                }, 0)
            } else {
                //увеличиваем баланс
                this.currentClient.balance += parseInt(Object.keys(notesRepository)) * parseInt(Object.values(notesRepository));
            }

            func = (...b) => {
                b = combineObject(b);
                //увеличиваем хранилище
                this.notesRepository = combineObject(
                    [currencyObject, b, this.notesRepository]
                );

                if (Object.keys(b).length > 1 && Object.values(b).length > 1) {
                    this.currentClient.balance = Object.keys(b).reduce((prev, curr, index) => {
                        this.currentClient.balance += parseInt(curr) * parseInt(Object.values(b)[index]);

                        return this.currentClient.balance;
                    }, 0)
                } else {
                    this.currentClient.balance += parseInt(Object.keys(b)) * parseInt(Object.values(b));
                }

                return func;
            }

            return func;
        },
        giveMoney(sumTogive) {
            if (this.currentClient.balance < sumTogive) {
                throw new Error('Метод giveMoney не может выдать сумму, которая больше баланса клиента');
            } else if (sumTogive % 10 !== 0) {
                throw new Error('Метод giveMoney может выдать сумму только кратную 10');
            } else if (!this.currentClient) {
                throw new Error('Клиента нет');
            }

            const money = Object.entries(this.notesRepository).sort((a, b) => {
                return parseInt(b[0]) - parseInt(a[0]);
            });

            if (!money.length) {
                throw new Error('Денег нет, но вы держитесь');
            }

            let sum = sumTogive;
            const result = money.reduce((acc, curr) => {
                //если валюта номиналом не больше суммы которую надо выдать
                //и ее количество не ноль, тогда она может быть рассмотрена
                if (parseInt(curr[0]) <= sum && parseInt(curr[1])) {
                    //проверяем можем ли выдать все одной валютой
                    //если у нас ее достаточно то выдаем
                    if (curr[1] >= parseInt(sum / parseInt(curr[0]))) {
                        acc[curr[0]] = parseInt(sum / parseInt(curr[0]));
                        sum -= parseInt(acc[curr[0]]) * parseInt(curr[0]);
                        this.notesRepository[curr[0]] -= (parseInt(acc[curr[0]]) * parseInt(curr[0])) / parseInt(curr[0]);
                    } else {
                        //иначе если одной валютой не выдать то выдаем хотя бы сколько есть
                        acc[curr[0]] = curr[1];
                        sum -= parseInt(curr[1]) * parseInt(curr[0]);
                        this.notesRepository[curr[0]] -= curr[1];
                    }
                }

                return acc;
            }, {});

            this.currentClient.balance -= sumTogive;

            return result;
        }
    }
}

/** 
 * Если передаются два объекта {1: 10}, {5: 10} удобнее работать с одним
 * но использовать Object.assign порой нельзя {1: 10}, {1: 15} тк значение возьмется последнее
 * поэтому объединияем объекты и увеличиваем свойства
 * @param {Array<{[key: string]: number}>} object 
 * @returns {{[key: string]: number}}
 */
function combineObject(object) {
    if (object.length <= 1) {
        return { ...object }[0];
    }

    if (!Array.isArray(object)) {
        return;
    }

    let result = {};
    object.forEach(obj => {
        if (!Object.keys(result).length) {
            Object.assign(result, obj);
        } else {
            Object.keys(obj).reduce((prev, curr, index) => {
                if (result.hasOwnProperty(curr)) {
                    result[curr] += parseInt(Object.values(obj)[index]);
                } else {
                    result[curr] = parseInt(Object.values(obj)[index]);
                }

                return result[curr];
            }, 0);
        }
    });

    return result;
}

module.exports = { createClient, createBank, createBankomat };
