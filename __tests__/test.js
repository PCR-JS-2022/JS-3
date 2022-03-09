const { createClient, createBank, createBankomat } = require("../index");
const assert = require("assert");

describe("createClient", () => {
  it("должна корректно обрабатывать валидные данные", async () => {
    const client = createClient("Nikita", 1000);
    const expectedResult = {
      name: "Nikita",
      balance: 1000,
    };

    assert.deepEqual(client, expectedResult);
  });

  it("должна корректно обрабатывать невалидные аргументы", async () => {
    assert.throws(
      () => {
        createClient(1000, "Nikita");
      },
      (error) => {
        assert(error instanceof Error);

        return true;
      },
      "Error in function createClient thrown"
    );
  });
});

describe("createBank", () => {
  it("должна корректно обрабатывать валидные данные", async () => {
    const clients = Array.from((_, index) =>
      createClient(`name ${index}`, 100 + index)
    );
    const bank = createBank("Bibici", clients);

    assert.equal(bank.bankName, "Bibici");
    assert.equal(bank.clients, clients);
    assert.equal(typeof bank.addClient, "function");
    assert.equal(typeof bank.removeClient, "function");
  });

  it("должна корректно обрабатывать невалидные аргументы", async () => {
    assert.throws(
      () => {
        createBank();
      },
      (error) => {
        assert(error instanceof Error);

        return true;
      },
      "Error in function createBank thrown"
    );
  });
});

describe("createBankomat", () => {
  it("должна корректно обрабатывать валидные данные", async () => {
    const clients = Array.from((_, index) =>
      createClient(`name ${index}`, 100 + index)
    );
    const bank = createBank("Bibici", clients);
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
    const bankomat = createBankomat(notesRepository, bank);

    assert.deepEqual(bankomat.bank, bank);
    assert.deepEqual(bankomat.notesRepository, notesRepository);
    assert.deepEqual(bankomat.currentClient, undefined);
    assert.deepEqual(typeof bankomat.setClient, "function");
    assert.deepEqual(typeof bankomat.removeClient, "function");
    assert.deepEqual(typeof bankomat.giveMoney, "function");
    assert.deepEqual(typeof bankomat.addMoney, "function");
  });

  it("должна корректно обрабатывать невалидные аргументы", async () => {
    assert.throws(
      () => {
        const bankomat = createBankomat();
      },
      (error) => {
        assert(error instanceof Error);

        return true;
      },
      "Error in function createBankomat thrown"
    );
  });
});
