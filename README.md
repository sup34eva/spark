Spark
==========

# Prérequis
- [Node 7.7+](https://nodejs.org/)
- NPM 5
- [Watchman](https://facebook.github.io/watchman/)
- [Kafka](http://kafka.apache.org/)

# Start me up
Dans l'archive de Kafka:
- `bin/windows/zookeeper-server-start.bat config/zookeeper.properties`
- `bin/windows/kafka-server-start.bat config/server.properties`

Dans `server-graphql`:
- `npm install`
- `npm start`

Dans `client`:
- `npm install`
- `npm start`
