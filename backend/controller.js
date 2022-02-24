//TODO : Catching errors in database

// Injection safe : https://neo4j.com/developer/kb/protecting-against-cypher-injection/

const getAllKanjis = async (req, reply) => {
  console.log('AllKanjis');
  const query = 'MATCH(k:Kanji) RETURN k'
  let queryRes = await req.neoSession.run(query, null);
  reply.type("application/json");
  return Array.from(queryRes.records, node => node.get("k").properties)
}

const getKanji = async (req, reply) => {
  console.log('Kanji : ' + req.params.id);
  const query = 'MATCH(k:Kanji {kanji:$id}) RETURN k'
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  return Array.from(queryRes.records, node => node.get("k").properties)
}

const getAllWords = async (req, reply) => {
  console.log('AllWords');
  const query = 'MATCH(w:Word) RETURN w'
  let queryRes = await req.neoSession.run(query, null);
  reply.type("application/json");
  return Array.from(queryRes.records, node => node.get("w").properties);
}

const getWord = async (req, reply) => {
  console.log('Word : ' + req.params.id);
  const query = 'MATCH(w:Word {word:$id}) RETURN w'
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  return Array.from(queryRes.records, node => node.get("w").properties);
}

const getCountCombinationShop = async (req, reply) => {
  console.log('Get count combination shop with : ' + req.params.id);
  req.params.id = JSON.parse(decodeURIComponent(req.params.id));
  const query = ` WITH $id as kanji_list
                  MATCH (k:Kanji)-[:l2]->(w:Word)<-[:l2]-(k2:Kanji)
                  WHERE k2.kanji IN kanji_list AND NOT k.kanji IN kanji_list
                  RETURN k.kanji, COUNT(DISTINCT w) AS NB
                  UNION
                  WITH $id as kanji_list
                  MATCH (k:Kanji)-[:l3]->(w:Word)<-[:l3]-(k2:Kanji),(w)<-[:l3]-(k3:Kanji)
                  WHERE [k2.kanji, k3.kanji] IN kanji_list AND NOT k.kanji IN kanji_list
                  RETURN k.kanji, COUNT(DISTINCT w) AS NB
                  UNION
                  WITH $id as kanji_list
                  MATCH (k:Kanji)-[:l4]->(w:Word)<-[:l4]-(k2:Kanji),(k3:Kanji)-[:l4]->(w)<-[:l4]-(k4:Kanji)
                  WHERE k2.kanji IN kanji_list AND k3.kanji IN kanji_list AND k4.kanji IN kanji_list AND NOT k.kanji IN kanji_list
                  RETURN k.kanji, COUNT(DISTINCT w) AS NB
                  UNION
                  WITH $id as kanji_list
                  MATCH (k:Kanji)-[:l5]->(w:Word)<-[:l5]-(k2:Kanji),(k3:Kanji)-[:l5]->(w)<-[:l5]-(k4:Kanji), (k5:Kanji)-[:l5]->(w)
                  WHERE k2.kanji IN kanji_list AND k3.kanji IN kanji_list AND k4.kanji IN kanji_list AND k5.kanji IN kanji_list AND NOT k.kanji IN kanji_list
                  RETURN k.kanji, COUNT(DISTINCT w) AS NB
                `
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  let result = {}
  for(let node of queryRes.records) {
    if(node.get("k.kanji") in result) {
      result[node.get("k.kanji")] += node.get("NB")
    } else {
      result[node.get("k.kanji")] = node.get("NB")
    }
  }
  return result;
}

const getTotalUse = async (req, reply) => {
  console.log('Get all words that can be made for all kanjis (all unlocked)');
  const query = 'MATCH (k:Kanji)-->(w:Word) RETURN k.kanji, count(DISTINCT w) AS nb';
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  let result = {}
  for(let node of queryRes.records) {
      result[node.get("k.kanji")] = node.get("nb")
  }
  return result;
}

const getMerge = async (req, reply) => {
  console.log('Get words that can be made from : ' + req.params.id);
  req.params.id = JSON.parse(decodeURIComponent(req.params.id));
  listKanji = req.params.id.join('');

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

async function mergeL2(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l2]->(w:Word)<-[:l2]-(k2:Kanji {kanji:$k2}) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1]});
  return Array.from(queryRes.records, node => node.get("w"));
}

async function mergeL3(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l3]->(w:Word)<-[:l3]-(k2:Kanji {kanji:$k2}), (k3:Kanji {kanji:$k3})-[:l3]->(w) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1], "k3":listKanji[2]});
  return Array.from(queryRes.records, node => node.get("w"));
}

async function mergeL4(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l4]->(w:Word)<-[:l4]-(k2:Kanji {kanji:$k2}), (k3:Kanji {kanji:$k3})-[:l4]->(w)<-[:l4]-(k4:Kanji {kanji:$k4}) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1], "k3":listKanji[2], "k4":listKanji[3]});
  return Array.from(queryRes.records, node => node.get("w"));
}

async function mergeL5(neoSession, listKanji) {
  listKanji = listKanji.split('');
  const query = 'MATCH (k1:Kanji {kanji:$k1})-[:l5]->(w:Word)<-[:l5]-(k2:Kanji {kanji:$k2}), (k3:Kanji {kanji:$k3})-[:l5]->(w)<-[:l5]-(k4:Kanji {kanji:$k4}), (k5:Kanji {kanji:$k5})-[:l5]->(w) RETURN DISTINCT w';
  let queryRes = await neoSession.run(query, {"k1":listKanji[0], "k2":listKanji[1], "k3":listKanji[2], "k4":listKanji[3], "k5":listKanji[4]});
  return Array.from(queryRes.records, node => node.get("w"));
}

module.exports = {
  getAllKanjis,
  getKanji,
  getAllWords,
  getWord,
  getCountCombinationShop,
  getTotalUse,
  getMerge
}
