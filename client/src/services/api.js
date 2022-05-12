export function getKanjisList() {
    return fetch("https://api.lostmypieces.com/kanjis")
}

export function getWordsList() {
    return fetch("https://api.lostmypieces.com/words")
}

export function getKanji(kanji) {
    return fetch("https://api.lostmypieces.com/kanjis/" + kanji)
}

export function getWord(word) {
    return fetch("https://api.lostmypieces.com/words/" + word)
}

export function getNumberCombination() {
    return fetch("https://api.lostmypieces.com/getNumberCombination")
}

export function getMerge(input) {
    return fetch("https://api.lostmypieces.com/getMerge", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    })
}

export function getShopCombination(kanjis) {
    return fetch("https://api.lostmypieces.com/getShopCombination", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(kanjis)
    })
}

export function getKanjisUnlocked(kanjis) {
    return fetch("https://api.lostmypieces.com/getKanjisUnlocked", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(kanjis)
    })
}