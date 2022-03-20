/**
 * @typedef Client
 * @type {object}
 * @property {string} name
 * @property {number} balance
 *//*
const clientVasiliy = createClient('Василий', 2500);
let bobo = [
    {
        name: 'петр',
        balance: 1488,
    },
    {
        name: 'хуетр',
        balance: 2500,
    },
    {
        name: 'асетр',
        balance: 1555,
    },

]
const greenBank = createBank('GREENBANK', bobo);*/
/*let provero4ka = greenBank.addClient(bobo[1]);
provero4ka =greenBank.removeClient(bobo[1]);*//*
const notesRepository = {
    5000: 2,
    2000: 5,
    1000: 77,
    500: 3,
    200: 2,
    100: 2,
    50: 1,
    10: 6,
};

let provero4ka = createBankomat(notesRepository, greenBank);
let adiin = 1;
let huet = provero4ka.giveMoney(2000);
huet = provero4ka.addMoney([{ 1000: 1, 500: 2 }]);
let adin = 1;*/
/**
 * @typedef Bank
 * @type {object}
 * @property {string} bankName
 * @property {Array<Client>} clients
 * @property {(client: Client) => boolean | Error} addClient
 * @property {(client: Client) => boolean | Error} removeClient
 */

const { throws } = require("assert");

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
    const biba = new Error('Ошибка ввода "createClient"')
    if (isNaN(balance) || typeof name != 'string' )
        throw biba;
    return {
        name: name,
        balance: balance,
    }
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */
function createBank(bankName, clients) {
    const biba = new Error('Ошибка ввода "createBank"');
    if (typeof bankName !='string' || !Array.isArray(clients))
        throw biba;

    return {
        bankName: bankName,
        clients: clients,
        addClient: function (client) {
            const boba = new Error('Ошибка ввода "addClient"');
            const weAlreadyHaveThisClient = new Error('Такой клиент уже есть 2х нам не надо');

            if (client === undefined || typeof client !== "object")
                throw boba;
            if (!clients.includes(client)) {
                clients.push(client);
                return true;
            }
            throw weAlreadyHaveThisClient;
        },
        removeClient: function (client) {
            const boba = new Error('Ошибка ввода "removeClient"');
            const WeDontHaveThisClient = new Error('Такой клиент уже есть 2х нам не надо');
            
            if (client === undefined || typeof client !== "object")
                throw boba;
            for (let i = 0; i < clients.length; i++) {
                if (clients[i] === client) {
                    clients.splice(i, 1);
                    return true;
                }
            }
            throw WeDontHaveThisClient;
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
    const biba = new Error('Ошибка ввода "createBankomat"');
    if (typeof bankNotesRepository !='object')
        throw biba;
    let currentClient = undefined;
    let allbanknotes = {
        1: 5000,
        2: 2000,
        3: 1000,
        4: 500,
        5: 200,
        6: 100,
        7: 50,
        8: 10,
    };
    return {
        bank: bank,
        notesRepository: bankNotesRepository,
        currentClient: currentClient,
        setClient: function (client) {
            const AtmIsBusy = new Error('Ббанкомат занят жди очередь');
            if(currentClient !== undefined)
                throw AtmIsBusy;
            
            currentClient = client;
            return true;
        },
        removeClient: function () {
            currentClient = undefined;
            return true;
        },
        addMoney: function (moooney) {
            const NoCustomer = new Error('Клиента нет')
            if (currentClient !== undefined) 
                throw NoCustomer;

            moooney.forEach(moneyobj => {
                for (let i = 1; i < 9; i++) {
                    if (!isNaN(moneyobj[allbanknotes[i]]))
                        notesRepository[allbanknotes[i]] += moneyobj[allbanknotes[i]];
                }
            });
            return notesRepository;
        },
        giveMoney: function (moooney) {
            let allMoneyInAtf=0;
            for (let i = 1; i < 9; i++){
                allMoneyInAtf += allbanknotes[i]*bankNotesRepository[allbanknotes[i]];
            }
            const WeNeedMoreMoney = new Error('В банкомате недостаточно средств')
            if (this.currentClient && this.currentClient.balance < moooney) 
                throw WeNeedMoreMoney;
            const Mod10NotEqualTo0 = new Error('Сумма не кратна 10');
            if (moooney % 10 !== 0) 
                throw Mod10NotEqualTo0;
            const NoCustomer = new Error('Клиента нет')
            if (currentClient !== undefined) 
                throw NoCustomer;
            const noRequiredBanknotes = new Error('В банкомате нет нужных банкнот');

            let banknotes = {
                5000: 0,
                2000: 0,
                1000: 0,
                500: 0,
                200: 0,
                100: 0,
                50: 0,
                10: 0,
            };
            let isSumMoreThenNominals;
            let isSumMoreThenAllBanknotes;
            for (let i = 1; i < 9; i++) {
                isSumMoreThenNominals = moooney >= allbanknotes[i];
                isSumMoreThenAllBanknotes = moooney <= allbanknotes[i] * notesRepository[allbanknotes[i]];

                if (isSumMoreThenNominals)
                    if (isSumMoreThenAllBanknotes)
                        banknotes[allbanknotes[i]] = Math.floor(moooney / allbanknotes[i]);
                    else banknotes[allbanknotes[i]] = notesRepository[allbanknotes[i]];

                moooney -= banknotes[allbanknotes[i]] * allbanknotes[i];
            }
            if (moooney != 0)
                throw noRequiredBanknotes;
            for (let i = 1; i < 9; i++){
                notesRepository[allbanknotes[i]] -= banknotes[allbanknotes[i]];
            }
            return banknotes;
        }
    };
}

module.exports = { createClient, createBank, createBankomat };
