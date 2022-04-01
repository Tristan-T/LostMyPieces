//TODO : Catching errors in database

// Injection safe : https://neo4j.com/developer/kb/protecting-against-cypher-injection/

/**
 * Returns a list of all kanjis available in the database with their properties.
 * @return {Array} List of Kanji object.
 */
const getAllKanjis = async (req, reply) => {
  console.log('AllKanjis');
  const query = 'MATCH(k:Kanji) RETURN k'
  let queryRes = await req.neoSession.run(query, null);
  reply.type("application/json");
  req.neoSession.close();
  return Array.from(queryRes.records, node => node.get("k").properties)
}

/**
 * Returns one kanji and its properties
 *
 * @param {String} req.id The kanji to be retrieved
 * @return {JSON} Kanji object.
 */
const getKanji = async (req, reply) => {
  console.log('Kanji : ' + req.params.id);
  const query = 'MATCH(k:Kanji {kanji:$id}) RETURN k'
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  req.neoSession.close()
  return queryRes.records[0].get("k").properties;
}

/**
 * Returns a list of all words available in the database with their properties.
 * @return {Array} List of Word object.
 */
const getAllWords = async (req, reply) => {
  console.log('AllWords');
  const query = 'MATCH(w:Word) RETURN w'
  let queryRes = await req.neoSession.run(query, null);
  reply.type("application/json");
  req.neoSession.close()
  return Array.from(queryRes.records, node => node.get("w").properties);
}

/**
 * Returns one word and its properties, as well as the variants and definitions
 *
 * @param {String} req.id The word to be retrieved
 * @return {JSON} Word object.
 */
const getWord = async (req, reply) => {
  console.log('Word : ' + req.params.id);
  const query = `MATCH (v:Variant)<-[:VARIANT*..]-(w:Word {word:$id})-[:DEFINITION*..]->(d:Definition)
                 RETURN w {.*, definitions: collect(DISTINCT d.def), variants: collect(DISTINCT v {pronounced:v.pronounced, variant: v.variant})}
                `
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  req.neoSession.close()
  return queryRes.records[0].get("w");
}

/**
 * Returns a dictionary with the number of total combinations unlocked by buying each kanjis
 * @param {Array} req.body List of kanjis that the user has unlocked
 * @return {JSON} kanji / integer pair.
 */
const getCountCombinationShop = async (req, reply) => {
  console.log('Get count combination shop with : ' + req.body);
  const query = `WITH $listKanjis as kanji_unlocked
                 MATCH (k:Kanji)
                 WHERE NOT k.kanji IN kanji_unlocked
                 WITH DISTINCT kanji_unlocked, COLLECT(k) AS unlockable
                 UNWIND unlockable AS buyable
                 MATCH (k:Kanji)-->(w:Word)<--(buyable:Kanji)
                 WITH COLLECT(k) AS found_components, kanji_unlocked, w, buyable
                 WHERE ALL(k IN found_components WHERE k.kanji IN kanji_unlocked OR k=buyable)
                 RETURN buyable.kanji, buyable.meaning, COUNT(DISTINCT w) AS NB
                `
  let queryRes = await req.neoSession.run(query, {"listKanjis":req.body});
  reply.type("application/json");
  req.neoSession.close()
  //let result = {}
  //for(let node of queryRes.records) {
  //  result[node.get("buyable.kanji")] = node.get("NB");
  //}
  //return result;
  return queryRes.records.map(k => ({kanji:k.get("buyable.kanji"), uses:k.get("NB"), english:k.get("buyable.meaning")}));
}

/**
 * Returns a dictionary with the number of total combinations available for each kanjis.
 * @return {JSON} Number of combinations for each kanji in the database.
 */
const getTotalUse = async (req, reply) => {
  console.log('Get all words that can be made for all kanjis (all unlocked)');
  const query = 'MATCH (k:Kanji)-->(w:Word) RETURN k.kanji, count(DISTINCT w) AS nb';
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  req.neoSession.close()
  let result = {}
  for(let node of queryRes.records) {
      result[node.get("k.kanji")] = node.get("nb")
  }
  return result;
}

/**
 * Returns a list of words that can be unlocked from the characters passed. (empty if none)
 * The words can be made from any combination of kanjis, regardless of the order
 * @param {Array} req.body List of words or kanjis
 * @return {Array} List of Word
 */
const getMerge = async (req, reply) => {
  console.log('Get words that can be made from : ' + req.body);
  listKanji = req.body.join('');

  reply.type("application/json");

  //TODO : Error handling
  switch (listKanji.length) {
    case 2:
      return await mergeL2(req.neoSession, listKanji);
      break;
    case 3:
      return await mergeL3(req.neoSession, listKanji);
      break;
    case 4:
      return await mergeL4(req.neoSession, listKanji);
      break;
    case 5:
      return await mergeL5(req.neoSession, listKanji);
      break;
    default:
      return {"error": "Outside of range"};
  }
}

const getKanjisUnlocked = async (req, reply) => {
  console.log('Get count combination for unlocked kanjis with : ' + req.body);
  const query = `WITH $listKanjis AS kanji_unlocked
                 MATCH (excluded:Kanji)
                 WHERE NOT excluded.kanji IN kanji_unlocked
                 WITH collect(excluded) AS kanji_locked
                 MATCH (k:Kanji)-->(w:Word)
                 WITH kanji_locked, w, collect(k) AS kanjis
                 WHERE NONE (k IN kanjis WHERE k IN kanji_locked)
                 UNWIND kanjis AS kanjiList
                 RETURN DISTINCT kanjiList, COUNT(DISTINCT w) AS nbCombinations
                `
  let queryRes = await req.neoSession.run(query, {"listKanjis":req.body});
  reply.type("application/json");
  req.neoSession.close()
  return Array.from(queryRes.records, node => Object.assign(node.get("kanjiList").properties, {"nbCombinations":node.get("nbCombinations")}));
}

/**
 * Returns a list of words that can be unlocked from the characters passed. (empty if none)
 * The words can be made from any combination of kanjis, regardless of the order
 * @param {Session} neoSession Session handler for the database
 * @param {Array[2]} listKanji Array of two kanjis
 * @return {Array} List of Word
 */
async function mergeL2(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l2]->(w:Word)<-[:l2]-(k2:Kanji {kanji:$k2}) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1]});
  neoSession.close();
  return Array.from(queryRes.records, node => node.get("w").properties);
}

/**
 * Returns a list of words that can be unlocked from the characters passed. (empty if none)
 * The words can be made from any combination of kanjis, regardless of the order
 * @param {Session} neoSession Session handler for the database
 * @param {Array[3]} listKanji Array of three kanjis
 * @return {Array} List of Word
 */
async function mergeL3(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l3]->(w:Word)<-[:l3]-(k2:Kanji {kanji:$k2}), (k3:Kanji {kanji:$k3})-[:l3]->(w) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1], "k3":listKanji[2]});
  neoSession.close();
  return Array.from(queryRes.records, node => node.get("w").properties);
}

/**
 * Returns a list of words that can be unlocked from the characters passed. (empty if none)
 * The words can be made from any combination of kanjis, regardless of the order
 * @param {Session} neoSession Session handler for the database
 * @param {Array[4]} listKanji Array of four kanjis
 * @return {Array} List of Word
 */
async function mergeL4(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l4]->(w:Word)<-[:l4]-(k2:Kanji {kanji:$k2}), (k3:Kanji {kanji:$k3})-[:l4]->(w)<-[:l4]-(k4:Kanji {kanji:$k4}) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1], "k3":listKanji[2], "k4":listKanji[3]});
  neoSession.close();
  return Array.from(queryRes.records, node => node.get("w").properties);
}

/**
 * Returns a list of words that can be unlocked from the characters passed. (empty if none)
 * The words can be made from any combination of kanjis, regardless of the order
 * @param {Session} neoSession Session handler for the database
 * @param {Array[5]} listKanji Array of five kanjis
 * @return {Array} List of Word
 */
async function mergeL5(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l5]->(w:Word)<-[:l5]-(k2:Kanji {kanji:$k2}), (k3:Kanji {kanji:$k3})-[:l5]->(w)<-[:l5]-(k4:Kanji {kanji:$k4}), (k5:Kanji {kanji:$k5})-[:l5]->(w) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1], "k3":listKanji[2], "k4":listKanji[3], "k5":listKanji[4]});
  neoSession.close();
  return Array.from(queryRes.records, node => node.get("w").properties);
}

module.exports = {
  getAllKanjis,
  getKanji,
  getAllWords,
  getWord,
  getCountCombinationShop,
  getTotalUse,
  getMerge,
  getKanjisUnlocked
}
