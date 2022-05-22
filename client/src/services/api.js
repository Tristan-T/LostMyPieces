const API = "https://api.lostmypieces.com"

export function getKanjisList() {
    return fetch(API + "/kanjis")
}

export function getWordsList() {
    return fetch(API + "/words")
}

export function getKanji(kanji) {
    return fetch(API + "/kanjis/" + kanji)
}

export function getWord(word) {
    return fetch(API + "/words/" + word)
}

export function getNumberCombination() {
    return fetch(API + "/getNumberCombination")
}

export function getMerge(input) {
    return fetch(API + "/getMerge", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    })
}

export function getShopCombination(kanjis) {
    return fetch(API + "/getShopCombination", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(kanjis)
    })
}

export function getKanjisUnlocked(kanjis) {
    return fetch(API + "/getKanjisUnlocked", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(kanjis)
    })
}