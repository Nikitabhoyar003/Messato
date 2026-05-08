const MongoStore = require("connect-mongo");
console.log("Type of MongoStore:", typeof MongoStore);
console.log("MongoStore keys:", Object.keys(MongoStore));
if (MongoStore.default) {
    console.log("Default keys:", Object.keys(MongoStore.default));
}
