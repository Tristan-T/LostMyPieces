//File management
const fs = require('fs');
//HTTP GET request
const axios = require('axios');
//Transforming kana to romaji
const hepburn = require('hepburn');
//Jisho API
const JishoApi = require('unofficial-jisho-api');
const jisho = new JishoApi();
//Database creation duration
const { PerformanceObserver, performance } = require('perf_hooks');
//List of deduplicated loaded kanjis
let kanjisUniq = []





/**
* Return a JSON object with all the informations for the kanji in parameter
*
* @param {string} kanji The kanji to be treated.
* @return {json} All informations of kanji.
*/
async function getKanjiInfos(kanji) {
  const kanjiapi_data = getKanjiapiData(kanji);

  const jisho_data = getJishoData(kanji);

  const data = await Promise.all([kanjiapi_data, jisho_data])

  //Merge the results from KanjiAPI and Jisho
  return {...data[0], ...data[1]};
}





/**
* Return a JSON object with all the data for kanji obtained from KanjiAPI
*
* @param {string} kanji The kanji to be treated.
* @return {json} Kanji data from KanjiAPI.
*/
async function getKanjiapiData(kanji) {
  const response = await axios.get(encodeURI('https://kanjiapi.dev/v1/kanji/'+kanji))

  //Fill up infos for the kanji
  let result = {
    "kanji" : kanji,
    "meaning" : response.data.heisig_en,
    "kun_readings" : response.data.kun_readings,
    "on_readings" : response.data.on_readings,
    "romaji_kun" : response.data.kun_readings.map(e => hepburn.fromKana(e).toLowerCase()), //Transform all the kana readings into romaji
    "romaji_on" : response.data.on_readings.map(e => hepburn.fromKana(e).toLowerCase()),
    "strokeCount" : response.data.stroke_count
  }
  //Get the words made up of this kanji
  result["derivatives"] = await getDerivatives(kanji);
  //Number of words found
  //result["numberDerivatives"] = Object.keys(result["derivatives"]).length;
  return result;
}

/**
* Return a JSON object containing all the words that can be made from the kanji in parameter
*
* @param {string} kanji The kanji to be treated.
* @return {json} List of words made from the kanji.
*/
async function getDerivatives(kanji) {
  //API call
  response = await axios.get(encodeURI('https://kanjiapi.dev/v1/words/'+kanji));
  /**
  * KanjiAPI will return a list of words made up from the kanji sent in parameter
  * Each element of the list is one word
  * Each word can be written and pronounced differently, this is stored in variants
  * Each variant does not necessarily have a different meaning, this is stored in meanings
  * If a variant has a different definition, it'll be put in glosses inside meanings
  * glosses usually have multiple examples for the same word
  */

  let result = {}

  for(derivative of response.data) {                                        //Iterate through the list of all words made up from "kanji"
    let variant = derivative.variants[0].written                            //The first variant is the most common way to write a word
    let strippedVariant = stripKanjiFromKana(variant)
    if(strippedVariant.length>1 && strippedVariant[0]===kanji) {
      let listOtherKanjis = Array.from(strippedVariant.substring(1))        //Make a list from the remaining kanjis in the word
      if(listOtherKanjis.every((e) => {return kanjisUniq.includes(e)})) {   //Check if all the other kanjis are part of our kanji set
        //If the world already exists, we update its values
        if(strippedVariant in result) {
          //TODO : CHECK FOR DUPLICATES
          for(variant of derivative.variants) {
            result[strippedVariant].variants.push({
              written:variant.written,
              pronounced:variant.pronounced
            })
          }

          for(definition of derivative.meanings) {
            result[strippedVariant].definitions.push(definition.glosses)
          }
        } else {
          let variants = []
          for(let variant of derivative.variants) {
            variants.push({
              written:variant.written,
              pronounced:variant.pronounced
            })
          }

          let definitions = []
          for(let definition of derivative.meanings) {
            definitions.push(definition.glosses)
          }

          result[strippedVariant] = {
            id: strippedVariant,
            variants: variants,
            definitions: definitions
          }
        }
      }
    }
  }

  return result;
}

/**
* Given a kanji, it will return a string containing only the kanjis making it up, thus removing the kanas
*
* @param {string} kanji The kanji to be treated.
* @return {string} The stripped kanji.
*/
function stripKanjiFromKana(kanji) {
  //Hiragana (3040 - 309f)
  let result = kanji.replaceAll(/[\u3040-\u309F]/g, "")
  //Katakana (30a0 - 30ff)
  result = result.replaceAll(/[\u30A0-\u30FF]/g, "")
  //Full-width roman characters and half-width katakana ( ff00 - ffef)
  result = result.replaceAll(/[\uFF00-\uFFEF]/g, "")
  //Also replace the iteration mark 々々
  for(let i=0; i<result.length; i++) {
    if(result[i] === "々") result = result.replace("々", result[i-1]);
  }

  return result
}


/**
* Return a JSON object with all the data for kanji obtained from Jisho
*
* @param {string} kanji The kanji to be treated.
* @return {json} Kanji data from Jisho.
*/
async function getJishoData(kanji) {
  let response = await jisho.searchForKanji(kanji);

  let result = {
    "jlpt" : response.jlptLevel,
    "strokeGif" : response.strokeOrderGifUri
  }

  return result
}

async function main() {
  try {
    //Read the file containing the list of kanjis
    let kanjis = JSON.parse(fs.readFileSync(process.argv[2]));
    console.log(kanjis["kanjis"])

    //Transform into Set then back into Array to delete duplicates
    kanjisUniq = Array.from(new Set(kanjis["kanjis"]))

    let jsonPromises = []

    //Start counter for time needed to create the db
    var t0 = performance.now()

    for(let kanji of kanjis["kanjis"]) {
      jsonPromises.push(getKanjiInfos(kanji))
    }

    jsonData = await Promise.all(jsonPromises)

    var t1 = performance.now()

    //Turn JSON into String and indent it properly
    let data = JSON.stringify(jsonData, null, 2)
    //Write the output file
    fs.writeFileSync(process.argv[3], data)
    console.log("Database : " + process.argv[3] + " succesfully generated! (took : " + (t1 - t0)/1000 + " seconds)")
  } catch (err) {
    console.error(err)
    process.exit()
  }
}

if(process.argv.length<4) {
  console.log("Invalid arguments")
  console.log("Usage: node buildDatabase.js <kanjiList.json> <outputFileName.json>")
  process.exit(9)
}

main()
