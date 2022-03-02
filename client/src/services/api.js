export function getKanjisList() {
    return fetch("http://lostmypieces.com:3000/kanjis")
}

export function getWordsList() {
    return fetch("http://lostmypieces.com:3000/words")
}

export function getKanji(kanji) {
    return fetch("http://lostmypieces.com:3000/kanjis/" + kanji)
}

export function getWord(word) {
    return fetch("http://lostmypieces.com:3000/words/" + word)
}

export function getNumberCombination() {
    return fetch("http://lostmypieces.com:3000/getNumberCombination")
}

export function getMerge(input) {
    return fetch("http://lostmypieces.com:3000/getMerge", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    })
}

export function getShopCombination(kanjis) {
    return fetch("http://lostmypieces.com:3000/getShopCombination", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(kanjis)
    })
}

export function getKanjisUnlocked(kanjis) {
    return fetch("http://lostmypieces.com:3000/getKanjisUnlocked", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(kanjis)
    })
}