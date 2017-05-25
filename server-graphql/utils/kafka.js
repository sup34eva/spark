const {
    Client, Producer, Consumer,
    Offset, KeyedMessage
} = require('kafka-node');

const client = new Client();
const producer = new Producer(client, {
    partitionerType: 3,
});
const offset = new Offset(client);

const timeout = time => new Promise((resolve, reject) => {
    setTimeout(() => reject('timeout'), time);
});

exports.sendMessage = ({ key, topic, value }) =>
    new Promise((resolve, reject) => {
        const msg = new KeyedMessage(key, value);
        producer.send([
            { topic, messages: [ msg ] },
        ], (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log('sendMessage', data, msg);
                resolve(data[topic][0]);
            }
        });
    });

const getCurrentOffset = async topic => {
    try {
        return await Promise.race([
            new Promise((resolve, reject) => {
                    offset.fetchLatestOffsets([ topic ], (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data[topic][0]);
                        }
                    });
            }),
            timeout(1000),
        ]);
    } catch (err) {
        return 0;
    }
};

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

exports.listMessages = (topic, from, to) => Promise.race([
    new Promise((resolve, reject) => {
        const consumer = new Consumer(
            new Client(),
            [{ topic, offset: from }],
            {
                autoCommit: false,
                fromOffset: true,
            }
        );

        const messages = [];
        consumer.on('message', ({ value, offset, key }) => {
            console.log('message', value, offset, key);

            const node = JSON.parse(value);
            messages.push(Object.assign({}, node, {
                id: `${topic}:${offset}`,
                uuid: key.toString(),
            }));

            if (offset === to) {
                resolve(messages);
                consumer.close();
            }
        });

        const onError = err => {
            console.error('error', err);
            reject(err);
            consumer.close();
        };

        consumer.on('error', onError);
        consumer.on('offsetOutOfRange', onError);
    }),
    timeout(1000),
]);
