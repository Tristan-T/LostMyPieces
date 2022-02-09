//File management
const fs = require('fs');

async function main() {
  try {
    //Read the file containing the list of kanjis
    let db = JSON.parse(fs.readFileSync(process.argv[2]));
    let nbKanjis = 0;
    let nbWords = 0;
    let nbVariants = 0;
    let nbDefinitons = 0;

    for(let kanji of db) {
      nbKanjis++;
      for(let derivative of kanji.derivatives) {
        nbWords++;
        for(let variant of derivative.variants) {
          nbVariants++;
        }
        for(let definition of derivative.definitions) {
          nbDefinitons++;
        }
      }
    }
    console.log("Nombre de kanjis dans la base : " + nbKanjis);
    console.log("Nombre de mots dans la base : " + nbWords);
    console.log("Nombre de variantes dans la base : " + nbVariants);
    console.log("Nombre de définitions dans la base : " + nbDefinitons);


  } catch (err) {
    console.error(err)
    process.exit()
  }
}

if(process.argv.length<3) {
  console.log("Invalid arguments")
  console.log("Usage: node countDatabase.js <kanjiDatabase.json>")
  process.exit(9)
}

main()
