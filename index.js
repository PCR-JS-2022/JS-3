function createClient(name, balance = 0) {
    if (typeof balance !== 'number' || typeof name !== 'string' || !name) {
        throw new Error("Ошибка создания клиента");
    }

    return {
        name,
        balance,
    };
};

function createBank(bankName, clients = []) {
    if (!bankName || typeof bankName !== 'string' || !Array.isArray(clients)) {
        throw new Error("Ошибка создания банка");
    };

    return {
        bankName,
        clients,
        addClient(client) {
            if (clientIsNotValid(client) || this.clients.includes(client)) {
                throw new Error("Ошибка добавления клиента");
            };

            this.clients.push(client);
            return true;
        },

        removeClient(client) {
            if (clientIsNotValid(client) || !this.clients.includes(client)) {
                throw new Error("Ошибка добавления клиента");
            };

            this.clients = this.clients.filter(c => c !== client);
            return true;
        }
    };
};

function clientIsNotValid(client) {
    return typeof client.balance !== 'number' || typeof client.name !== 'string' || !client.balance ||
        !client.name || typeof client !== 'object' || client.balance < 0;
};

function bankomatIsNotValid(bankNotesRepository, bank) {
    return typeof bankNotesRepository !== 'object' || typeof bank !== 'object' ||
        !bank.bankName || typeof bank.bankName !== 'string' || !Array.isArray(bank.clients);
};

function createBankomat(bankNotesRepository, bank) {
    if (bankomatIsNotValid(bankNotesRepository, bank)) {
        throw new Error("Ошибка создания банкомата");
    };
    return {
        bank,
        notesRepository: bankNotesRepository,
        currentClient: undefined,
        setClient(client) {
            if (this.currentClient) {
                throw new Error("C банкоматом уже работают");
            };

            if (!this.bank.clients.includes(client)) {
                throw new Error("Работать с банкоматом может только клиент банка");
            };

            this.currentClient = client;
            return true;
        },

        removeClient() {
            this.currentClient = undefined;
            return true;
        },

        addMoney(...banknotesList) {
            if (!this.currentClient) {
                throw new Error("С банкоматом никто не работает(addMoney)");
            };

            banknotesList.forEach(banknotes => {
                for (let banknote in banknotes) {
                    let banknotesCount = banknotes[banknote];
                    this.notesRepository[banknote] += banknotesCount;
                    this.currentClient.balance += banknote * banknotesCount;
                }
            })
            return this.addMoney.bind(this);
        },

        giveMoney(sum) {
            if (this.currentClient === undefined) {
                throw new Error("С банкоматом никто не работает(giveMoney)");
            };

            if (sum % 10 !== 0) {
                throw new Error("Сумма должна быть кратна 10");
            };

            if (sum > this.currentClient.balance) {
                throw new Error("Недостаточно средств");
            };

            let banknotesList = {};
            let amountIssued = sum;
            let moneyInBankomat = 0;
            const banknotes = [5000, 2000, 1000, 500, 200, 100, 50, 10];

            for (let banknote of banknotes) {
                moneyInBankomat += banknote * this.notesRepository[banknote];
            };
            if (sum > moneyInBankomat) {
                throw new Error("Недостаточно средств в банкомате");
            };

            for (let banknote of banknotes) {
                let requiredBanknotes = Math.floor(amountIssued / banknote);
                let banknotesCount = this.notesRepository[banknote]

                if (requiredBanknotes !== 0) {
                    if (banknotesCount <= requiredBanknotes) {
                        requiredBanknotes = banknotesCount;
                    };
                    this.notesRepository[banknote] -= requiredBanknotes;
                    amountIssued -= requiredBanknotes * banknote;
                    banknotesList[banknote] = requiredBanknotes;
                };
            };
            this.currentClient.balance -= amountIssued;

            for (let banknote in banknotesList) {
                if (banknotesList[banknote] === 0) {
                    throw new Error("Данная сумма не может быть выдана");
                };
            };
            return banknotesList;
        }
    };
};

const greenBankNotesRepository = {
    5000: 2,
    2000: 3,
    1000: 13,
    500: 20,
    200: 10,
    100: 5,
    50: 2,
    10: 5,
};

const greenBank = createBank('GREENBANK');
const greenBankBankomat = createBankomat(greenBankNotesRepository, greenBank);
const clientVasiliy = createClient('Василий', 2500);
greenBank.addClient(clientVasiliy); // true

greenBankBankomat.setClient(clientVasiliy); // true

console.log(greenBankBankomat.giveMoney(1000));

greenBankBankomat.removeClient() // true

module.exports = { createClient, createBank, createBankomat };