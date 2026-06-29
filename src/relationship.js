const relationships = {
    sundaram: { trust: 50, respect: 50, empathy: 50 },
    arjun: { trust: 50, respect: 50, guilt: 50 },
    rekha: { trust: 50, respect: 50, complicity: 50 }
};

export function updateRelationship(character, key, delta) {
    if (relationships[character] && relationships[character][key] !== undefined) {
        relationships[character][key] = Math.max(0, Math.min(100, relationships[character][key] + delta));
    }
}

export function getRelationship(character) {
    return relationships[character] ? { ...relationships[character] } : null;
}

export function getRelationshipSummary() {
    return JSON.parse(JSON.stringify(relationships));
}

export function getRelationshipData() {
    return JSON.parse(JSON.stringify(relationships));
}
