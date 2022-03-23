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
    if (typeof name !== 'string' || typeof balance !== 'number')
        throw new Error('Invalid name or balance');

    return {
        name,
        balance
    };
}

/**
 * @name createBank
 * @description Функция для создания банка
 * @param {bankName} name Имя банка
 * @param {Array<Client>} clients Список клиентов банка
 * @returns {Bank} Объект банка
 */

function correctInput(client) {
    if (typeof client !== "object"
        || typeof client.name !== "string"
        || typeof client.balance !== "number")
        return false;

    return true;
}

function createBank(bankName, clients = []) {
    if (typeof bankName !== 'string' || !Array.isArray(clients)) {
        throw new Error('Incorrect bank name or list of clients');
    }

    function addClient(client) {
        if (!correctInput(client) || this.clients.includes(client))
            throw new Error('Failed to add a client');

        this.clients.push(client);
        return true;
    }

    function removeClient(client) {
        if (!correctInput(client) || !this.clients.includes(client)) {
            throw new Error('Failed to remove a client');
        }

        this.clients = this.clients.filter(c => c !== client);
        return true;
    }

    return {
        bankName,
        clients,
        addClient,
        removeClient
    }
}

/**
 * @name createBankomat
 * @description Фукнция для создания банкомата
 * @param {{[key: string]: number}} notesRepository Репозиторий валют
 * @param {Bank} bank Объект банка
 * @returns {Bankomat} Объект банкомата
 */

function createBankomat(notesRepository, bank) {
    function setClient(client) {
        if (!this.bank.clients.includes(client))
            throw new Error('Sorry, you are not a client of this bank');

        if (this.currentClient !== undefined) {
            throw new Error('Sorry, bankomat is able to process only one client at a time');
        }

        if (!correctInput(client)) {
            throw new Error('Incorrect input');
        }

        this.currentClient = client;
        return true;
    }

    function removeClient() {
        this.currentClient = undefined;
        return true;
    }

    function addMoney(...banknotes) {
        if (this.currentClient === undefined) {
            throw new Error('No client');
        }

        banknotes.forEach((banknote) => {
            for (let nominal in banknote) {
                this.notesRepository[nominal] += banknote[nominal];
                this.currentClient.balance += Number(nominal) * banknote[nominal];
            }
        });
        
        return this.addMoney.bind(this);
    }

    function giveMoney(money) {
        if (this.currentClient === undefined) {
            throw new Error('No client');
        }

        if (money > this.currentClient.balance) {
            throw new Error('Insufficient funds');
        }

        if (money % 10 !== 0) {
            throw new Error('Sum has to be multiple of 10');
        }

        const banknotes = [5000, 2000, 1000, 500, 200, 100, 50, 10];

        let sumInBankomat = 0;
        for (let banknote in banknotes)
            sumInBankomat += banknote * this.notesRepository[banknote];

        if (sumInBankomat < money) {
            throw new Error('Lack of banknotes');
        };


        let moneyToGive = money;
        const newRepository = {};
        for (let banknote in banknotes) {
            let amount = Math.floor(moneyToGive / banknote);
            if (amount === 0) {
                continue;
            }
            if (amount <= this.notesRepository[banknote]) {
                this.notesRepository[banknote] -= amount;
                moneyToGive -= banknote * amount;
                newRepository[banknote] = amount;
            }
        }
        this.currentClient.balance -= moneyToGive;
        return newRepository;
    }

    return {
        bank,
        notesRepository,
        currentClient: undefined,
        setClient,
        removeClient,
        addMoney,
        giveMoney
    }
}

module.exports = { createClient, createBank, createBankomat };

// const greenBankNotesRepository = {
//     5000: 2,
//     2000: 3,
//     1000: 13,
//     500: 20,
//     200: 10,
//     100: 5,
//     50: 2,
//     10: 5,
//   };
  
//   const greenBank = createBank('GREENBANK');
//   console.log(JSON.stringify(greenBank));
//   /**
//    * {
//    *   bankName: 'GREENBANK',
//    *   clients: [],
//    *   ...
//    * }
//    */
//   const greenBankBankomat = createBankomat(greenBankNotesRepository, greenBank);
//   console.log(JSON.stringify(greenBankBankomat));
//   /**
//    * {
//    *   notesRepository: greenBankNotesRepository,
//    *   bank: greenBank,
//    *   ...
//    * }
//    */
  
//   const clientVasiliy = createClient('Василий', 2500);
//   console.log(JSON.stringify(clientVasiliy));
//   /**
//    * {
//    *   name: 'Василий',
//    *   balance: 2500,
//    * }
//    */
  
//   console.log(JSON.stringify(greenBank.addClient(clientVasiliy)));
//  // console.log(JSON.stringify(greenBank.addClient(clientVasiliy)));
  
//   console.log(JSON.stringify(greenBankBankomat.setClient(clientVasiliy))); // true
  
//   console.log(JSON.stringify(greenBankBankomat.giveMoney(1000)));
//   /**
//    * {
//    *   1000: 1,
//    * }
//    */
  
//    console.log(JSON.stringify(greenBankBankomat.removeClient()));// true
