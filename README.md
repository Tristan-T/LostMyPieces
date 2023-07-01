# Lost my pieces
Web interactive app in development to play with Japanese kanjis inspired by [Little Achemist](https://littlealchemy.com/). Hosted [here](https://lostmypieces.com).

![Demo](./demo/demo.png)

## Installation of the website
If you'd like to host your own version of the website, you can do so by using the following instructions :

### On Windows : 
1. Grab the latest Node version from [nodejs.dev](https://nodejs.dev/).
2. Run the installer and wait for it to complete.
3. Clone the Github repository on your hard drive.
4. Open a command prompt and navigate to the cloned repository. Open the `/client` folder.
5. Type `npm install` to install the needed dependencies.
6. Run `npm start` to make sure the website is working locally.
7. Once you have confirmed that the website works, you can run `npm run build` to export the website.
8. Copy the content of the `build` folder in your web server.

The website should be successfully running.

### On Linux :
1. Install the latest node version from the node website.
> :warning: **The version of node available inside the Ubuntu repositories is heavily outdated and will not work** : Instead use the instructions available on node website. You can also use the following commands on Ubuntu.
> ```bash
> curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
> sudo apt install -y nodejs
> ```
2. Clone the Github repository on your hard drive.
3. Open a terminal and navigate to the cloned repository. Open the `/client` folder.
4. Type `npm install` to install the needed dependencies.
5. Run `npm start` to make sure the website is working locally.
6. Once you have confirmed that the website works, you can run `npm run build` to export the website.
7. Copy the content of the `/client/build` folder in your web server.

The website should be successfully running.

## Deploying my own API
If you'd like to make your own database to host, you can use the following instructions :
>:exclamation: Make sure your server has at least 1 Gb of RAM for the best performance. We also recommend using an SSD to store the database.
### On Linux :
1. Make sure Node is properly installed.
2. Install Neo4j.
```bash
curl -fsSL https://debian.neo4j.com/neotechnology.gpg.key |sudo gpg --dearmor -o /usr/share/keyrings/neo4j.gpg

echo "deb [signed-by=/usr/share/keyrings/neo4j.gpg] https://debian.neo4j.com stable 4.1" | sudo tee -a /etc/apt/sources.list.d/neo4j.list

sudo apt update

sudo apt install neo4j
```
3. Log into your Neo4j database and follow the instructions.
```bash
cypher-shell
```
> Additionally you may use the [tutorial at DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-neo4j-on-ubuntu-20-04) to learn more about the installation process of Neo4j.

4. Import your database using the following script :
```cypher
CALL apoc.load.json("MY_URL_HERE")
YIELD value
MERGE (k:Kanji {kanji:value.kanji})
SET k.meaning = value.meaning
SET k.kun_readings = value.kun_readings
SET k.on_readings = value.on_readings
SET k.romaji_kun = value.romaji_kun
SET k.romaji_on = value.romaji_on
SET k.strokeCount = value.strokeCount
SET k.JLPT = value.JLPT
SET k.strokeGif = value.strokeGif

WITH value

UNWIND value.derivatives AS derivative
MERGE (d:Word {word: derivative.id})
SET d.trueReading = derivative.trueReading
SET d.priorities = derivative.priorities
SET d.actualWord= derivative.actualWord

    WITH DISTINCT d, derivative

    UNWIND derivative.variants AS variant
    MERGE (v:Variant {variant:variant.written, pronounced:variant.pronounced})
    MERGE (d)-[:VARIANT]->(v)

    WITH DISTINCT d, derivative

    UNWIND derivative.definitions as definition
    MERGE (def:Definition {def:definition})
    MERGE (d)-[:DEFINITION]->(def)

    WITH DISTINCT d, derivative

    UNWIND derivative.components AS component
    MATCH (c:Kanji {kanji:component})
    CALL apoc.merge.relationship(c, derivative.relationship, {}, {}, d) YIELD rel

    WITH DISTINCT apoc.coll.duplicatesWithCount(derivative.components) AS dupeList, d, derivative
    UNWIND dupeList as dupe
    MATCH (c:Kanji {kanji:dupe.item})
    UNWIND RANGE(1, dupe.count-1) AS i
    CALL apoc.create.relationship(c, derivative.relationship, {}, d) YIELD rel
    RETURN rel;
```
> Replace MY_URL_HERE with the URL of your json database. You can use the following databases as examples \
> **Small (3 kanjis)** : [https://lostmypieces.torisu.fr/databaseKanjiSmall.json](https://lostmypieces.torisu.fr/databaseKanjiSmall.json) \
> **Test (5 kanjis)** : [https://lostmypieces.torisu.fr/databaseKanjiTest.json](https://lostmypieces.torisu.fr/databaseKanjiTest.json) \
> **Lost My Pieces (101 kanjis)** : [https://lostmypieces.torisu.fr/databaseKanjiBig.json](https://lostmypieces.torisu.fr/databaseKanjiBig.json) \
> **Jōyō (2 136 kanjis)** : [https://lostmypieces.torisu.fr/databaseKanjiJoyo.json](https://lostmypieces.torisu.fr/databaseKanjiJoyo.json) \
> :warning: This process might take a while, especially for the Jōyō database, it's only useful for demonstration purposes, not  for the game.
5. The database runs on port 8000 by default, if you wish to change it, you can do so in `/backend/index.js` at the line 42. Change the port for `app.listen(8000, (err, address) => {`.
6. Copy the file `config_sample.json` and rename it to `config.json`. Fill in the informations.
7. Inside the `/backend` folder you should run `npm install`.
8. You can now launch the server using `node index.js`.
> :warning: Make sure to modify the file `api.js` located at `client\src\services`, line 1 if you wish to call your own API to deploy the website.

## Making my own database
If you wish to make your own kanji database, you can do so by providing a list of kanjis and using the following instructions.
1. Make sure Node is properly installed.
2. Clone the Github repository on your hard drive.
3. Navigate to the `/database` folder.
4. Run the `npm install` command.
5. Create your own `listKanjis_custom.json` file and populate it, following the example inside `listKanjis_small.json`.
6. Use the `node buildDatabase.js listKanjis_custom.json databaseKanjiCustom.json` command to create your own JSON database.
7. Make sure you also change the default kanjis inside the `config.json` at the root of the project.
8. You can now follow the `Deploying my own API` section to run your own API.
> **Note :** If you'd like to learn more about the database you generated, you may use `node countDatabase.js databaseKanjiCustom.json` to display more informations
