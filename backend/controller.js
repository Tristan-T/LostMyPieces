const getAllKanjis = async (req, reply) => {
  console.log('AllKanjis');
  const query = 'MATCH(k:Kanji) RETURN k'
  let queryRes = await req.neoSession.run(query, null);
  reply.type("application/json");
  return Array.from(queryRes.records, node => node.get("k").properties)
}

const getKanji = async (req, reply) => {
  console.log('Kanji : ' + req.params.id);
  // TODO : ATTENTION AUX INJECTIONS
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
  // TODO : ATTENTION AUX INJECTIONS
  const query = 'MATCH(w:Word {word:$id}) RETURN w'
  let queryRes = await req.neoSession.run(query, req.params);
  reply.type("application/json");
  return Array.from(queryRes.records, node => node.get("w").properties);
}

module.exports = {
  getAllKanjis,
  getKanji,
  getAllWords,
  getWord
}
