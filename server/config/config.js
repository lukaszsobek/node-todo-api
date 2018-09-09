const env = process.env.NODE_ENV || "development";
console.log(`**** Current env: ${env} ****`);

if(env === "development" || env === "test") {
    const config = require("./config.json")[env];
    Object.keys(config).forEach(key => {
        process.env[key] = config[key];
    });
}
