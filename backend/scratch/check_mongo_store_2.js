const ms = require("connect-mongo");
console.log("ms.create type:", typeof ms.create);
console.log("ms.MongoStore type:", typeof ms.MongoStore);
if (ms.MongoStore) {
    console.log("ms.MongoStore.create type:", typeof ms.MongoStore.create);
}
console.log("ms.default type:", typeof ms.default);
if (ms.default) {
    console.log("ms.default.create type:", typeof ms.default.create);
}
