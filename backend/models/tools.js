const db = require('../util/database');

module.exports = class tools {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    };

}