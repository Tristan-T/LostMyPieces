CALL apoc.load.json("https://lostmypieces.com/databaseKanjiBig.json")
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
