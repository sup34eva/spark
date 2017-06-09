Spark
==========

# Prérequis
- [Node 7.7+](https://nodejs.org/)
- NPM 5
- [Watchman](https://facebook.github.io/watchman/)
- [Kafka](http://kafka.apache.org/)

# Lancement
Dans l'archive de Kafka:
- `bin/windows/zookeeper-server-start.bat config/zookeeper.properties`
- `bin/windows/kafka-server-start.bat config/server.properties`

Dans `server-graphql`:
- `npm install`
- `npm start`

Dans `client`:
- `npm install`
- `npm start`

# Structure
- `client`: Code source sur client avec Electron
- `functions`: Fonctions déployées sur Firebase
- `server-graphql`: Code source du serveur d'API

# Configuration
- Pour des raisons de sécurité, le client doit communiquer avec le serveur en HTTPS. Il est donc
nécéssaire de créér des fichiers `key.pem` et `cert.pem` placés a la racine du projet pour lancer le
serveur.
- Le serveur a aussi besoin de clés d'accès en administration à Firebase, qui peuvent être générées
depuis le panneau `Comptes de services` dans la console d'administration. Le fichier
`serviceAccountKey.json` doit être placé dans `server-graphql/utils`
- La configuration de firebase doit aussi être renseignée dans  `client/utils/firebase/index.js`
- Enfin, l'adresse du serveur Kafka doit être fournie au serveur par la variable d'environnement
`KAFKA_URI`. Il est possible d'injecter ces valeurs en créant un fichier `.env` dans `server-graphql`
- Pour déployer les fonctions Firebase il est aussi nécéssaire de changer le fichier `.firebaserc`
