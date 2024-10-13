"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Counter {
    value;
    constructor() {
        this.value = 0;
    }
    increment() {
        this.value++;
    }
    reset() {
        this.value = 0;
    }
    getValue() {
        return this.value;
    }
}
exports.default = Counter;
