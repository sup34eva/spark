const {
    Client, Producer, Consumer,
} = require('kafka-node');

const produceClient = new Client();
const producer = new Producer(produceClient);

exports.sendMessage = message =>
    new Promise((resolve, reject) => {
        producer.send([ message ], (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log(data, message);
                resolve(data[message.topic][0]);
            }
        });
    });

exports.createConsumer = channel => {
    const client = new Client();
    const consumer = new Consumer(client, [{
        topic: channel,
    }], {
        autoCommit: false
    });

    return consumer;
};
