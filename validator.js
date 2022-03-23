const validateName = (name) => typeof name == "string"


const validateBalance = (balance) => typeof balance == "number"


function validateClient (client) {
    if (typeof client != "object") {
        return false
    }
    if (!validateName(client.name) || !validateBalance(client.balance)){
        return false
    }
    return true
}


function validateClients (clients) {
    if (!Array.isArray(clients)) {
        return false
    }
    if (clients.length > 0) {
        return clients.every((client) => validateClient(client))
    }
    return true
}


function validateBank (bank) {
    
    if (typeof bank != "object") {
        return false
    }
    
    if (!validateName(bank.bankName) || !validateClients(bank.clients)) {
        return false
    }
    if ((typeof bank.addClient != "function") || (typeof bank.addClient != "function")) {
        return false
    }
    return true
}


const validateNotesRepository = (notesRepository) => typeof notesRepository == "object"


module.exports = {
    validateName,
    validateBalance,
    validateClient,
    validateClients,
    validateBank,
    validateNotesRepository
}