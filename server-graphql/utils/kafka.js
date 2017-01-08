const {
    Client, Producer, Consumer,
} = require('kafka-node');

const client = new Client();
const producer = new Producer(client);

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

exports.listChannels = () =>
    new Promise((resolve, reject) => {
        client.loadMetadataForTopics([], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(
                    Object.keys(results[1].metadata)
                );
            }
        });
    });
