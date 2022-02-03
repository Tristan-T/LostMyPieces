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
  // jsonTotal[kanji]["derivatives"] = await getDerivatives(kanji);
  //Number of words found
  // jsonTotal[kanji]["numberDerivatives"] = Object.keys(jsonTotal[kanji]["derivatives"]).length;
  return result;
}

async function getDerivatives(kanji) {

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
    let kanjisUniq = Array.from(new Set(kanjis["kanjis"]))

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
