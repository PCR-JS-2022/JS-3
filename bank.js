const { 
    validateClient
} = require("./validator")


function checkClientInBank (bank, client) {
    if (!validateClient(client)) {
        throw new Error("Неверные данные")
    }
    if (!bank.clients.some((x) => x.name == client.name))
        throw new Error("Клиента нет в массиве")
    return true
}


module.exports = {
    checkClientInBank
}