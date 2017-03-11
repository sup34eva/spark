const {
    Client, Producer, Consumer,
    Offset, KeyedMessage
} = require('kafka-node');

const client = new Client();
const producer = new Producer(client, {
    partitionerType: 3,
});
const offset = new Offset(client);

exports.sendMessage = ({ key, topic, value }) =>
    new Promise((resolve, reject) => {
        const msg = new KeyedMessage(key, value);
        producer.send([
            { topic, messages: [ msg ] },
        ], (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log(data, msg);
                resolve(data[topic][0]);
            }
        });
    });

const getCurrentOffset = topic =>
    new Promise((resolve, reject) => {
        offset.fetchLatestOffsets([ topic ], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data[topic][0]);
            }
        });
    });

exports.getCurrentOffset = getCurrentOffset;

exports.createConsumer = async topic => {
    const offset = await getCurrentOffset(topic);
    return new Consumer(
        new Client(),
        [{ topic, offset }],
        {
            autoCommit: false,
            fromOffset: true,
        }
    );
};

exports.listChannels = () =>
    new Promise((resolve, reject) => {
        client.loadMetadataForTopics([], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(
                    Object.keys(
                        results[1].metadata
                    ).filter(
                        name => !name.startsWith('__')
                    )
                );
            }
        });
    });

exports.createChannel = name =>
    new Promise((resolve, reject) => {
        producer.createTopics([ name ], true, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

exports.listMessages = (topic, from, to) =>
    new Promise((resolve, reject) => {
        const consumer = new Consumer(
            new Client(),
            [{ topic, offset: from }],
            {
                autoCommit: false,
                fromOffset: from > 0,
            }
        );

        const messages = [];
        consumer.on('message', ({ value, offset, key }) => {
            const node = JSON.parse(value);
            messages.push(Object.assign({}, node, {
                id: `${topic}:${offset}`,
                uuid: key,
            }));

            if (offset === to) {
                resolve(messages);
                consumer.close();
            }
        });
    });
