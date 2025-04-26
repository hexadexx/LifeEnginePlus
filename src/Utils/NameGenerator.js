const NameList = require('./NameList');

const NameGenerator = {
    getNameComponentCount(cellCount) {
        if (cellCount <= 3) return 1;
        if (cellCount <= 8) return 2;
        if (cellCount <= 12) return 3;
        if (cellCount <= 21) return 4;
        if (cellCount <= 34) return 5;
        if (cellCount <= 67) return 6;
        return 7;
    },
    
    getCombinedNameProbability(cellCount) {
        if (cellCount <= 3) return 0.2;
        if (cellCount <= 8) return 0.25;
        if (cellCount <= 12) return 0.28;
        if (cellCount <= 21) return 0.29;
        if (cellCount <= 34) return 0.35;
        if (cellCount <= 52) return 0.68;
        if (cellCount <= 67) return 0.72;
        return 0.8;
    },
    
    getCompoundWordProbability(cellCount, index) {
        let baseProb = 0.5;
        if (cellCount > 8) baseProb = 0.52;
        if (cellCount > 12) baseProb = 0.55;
        if (cellCount > 21) baseProb = 0.58;
        
        if (index > 0) baseProb -= 0.1;
        
        return baseProb;
    },
    
    isVowel(char) {
        return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
    },
    
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    getNameForCellType(cellType) {
        if (Math.random() < 0.05) {
            return this.getNeutralName();
        }
        
        const wordList = NameList[cellType];
        if (!wordList || wordList.length === 0) {
            return this.getRandomItem(NameList.neutral || ['unknown']);
        }
        return this.getRandomItem(wordList);
    },
    
    getNeutralName() {
        return this.getRandomItem(NameList.neutral || ['unknown']);
    },
    
    createCombinedNameFromWords(word1, word2) {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        
        let breakPoint1 = Math.ceil(word1.length * 0.6);
        while (breakPoint1 > 1 && vowels.includes(word1[breakPoint1 - 1].toLowerCase())) {
            breakPoint1--;
        }
        
        let breakPoint2 = Math.floor(word2.length * 0.4);
        while (breakPoint2 < word2.length - 1 && !vowels.includes(word2[breakPoint2].toLowerCase())) {
            breakPoint2++;
        }
        
        return word1.substring(0, breakPoint1) + word2.substring(breakPoint2);
    },
    
    createCombinedName(cellType1, cellType2) {
        const name1 = this.getNameForCellType(cellType1);
        const name2 = this.getNameForCellType(cellType2);
        return this.createCombinedNameFromWords(name1, name2);
    },

    generateName(anatomy, ancestor = null, useSpaces = true) {
        if (!anatomy || !anatomy.cells || anatomy.cells.length === 0) {
            return Math.random().toString(36).substr(2, 10);
        }

        const cellStates = anatomy.cells.map(cell => cell.state.name);
        
        const cellTypeCounts = cellStates.reduce((counts, state) => {
            counts[state] = (counts[state] || 0) + 1;
            return counts;
        }, {});

        const allCellTypes = Object.entries(cellTypeCounts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
        
        if (allCellTypes.length === 0) {
            return Math.random().toString(36).substr(2, 10);
        }
        
        let nameComponents = [];
        const totalCells = anatomy.cells.length;
        const totalCellTypes = allCellTypes.length;
        
        let topCellCount = Math.min(totalCellTypes, Math.max(2, Math.ceil(totalCellTypes * 0.75)));
        const dominantTypes = allCellTypes.slice(0, topCellCount).map(([type]) => type);
        const remainingTypes = allCellTypes.slice(topCellCount).map(([type]) => type);
        
        const componentCount = this.getNameComponentCount(totalCells);
        const useCombinedNameComponent = Math.random() < this.getCombinedNameProbability(totalCells);
        
        if (componentCount === 1) {
            if (dominantTypes.length > 0) {
                const cellType = dominantTypes[0];
                nameComponents.push(this.createCombinedName(cellType, 'neutral'));
            } else {
                nameComponents.push(this.getNeutralName());
            }
        } else {
            for (let i = 0; i < componentCount; i++) {
                if (i === 0 && useCombinedNameComponent && dominantTypes.length > 0) {
                    const primaryType = this.getRandomItem(dominantTypes);
                    
                    let secondaryType;
                    if (remainingTypes.length > 0 && Math.random() > 0.5) {
                        secondaryType = this.getRandomItem(remainingTypes);
                    } else {
                        const otherDominantTypes = dominantTypes.filter(t => t !== primaryType);
                        secondaryType = otherDominantTypes.length > 0 
                            ? this.getRandomItem(otherDominantTypes) 
                            : primaryType;
                    }
                    
                    nameComponents.push(this.createCombinedName(primaryType, secondaryType));
                } else {
                    nameComponents.push(this.getNameForCellType(this.getRandomItem(dominantTypes)));
                }
            }
            
            if (componentCount >= 4) {
                let compoundIndex = Math.floor(Math.random() * (componentCount - 1)) + 1;
                nameComponents[compoundIndex] = this.createCombinedName(
                    this.getRandomItem(dominantTypes), 
                    this.getRandomItem(dominantTypes)
                );
            }
        }
        
        if (ancestor && ancestor.name) {
            const delimiter = useSpaces ? ' ' : '-';
            const ancestorParts = ancestor.name.split(delimiter);
            
            if (!ancestor.name.includes(" ") && componentCount === 1) {
                const newName = this.getNameForCellType(this.getRandomItem(dominantTypes));
                nameComponents[0] = this.createCombinedNameFromWords(ancestorParts[0], newName);
            }
            else {
                if (ancestorParts.length >= 3 && Math.random() < 0.5) {
                    if (ancestorParts.length >= 4 && Math.random() < 0.5) {
                        const partsToKeep = Math.floor(Math.random() * 2) + 2;
                        const inheritedParts = ancestorParts.slice(0, partsToKeep);
                        
                        const newPartsCount = ancestorParts.length - partsToKeep;
                        const newParts = [];
                        for (let i = 0; i < newPartsCount; i++) {
                            newParts.push(this.getNameForCellType(this.getRandomItem(dominantTypes)));
                        }
                        
                        nameComponents = [...inheritedParts, ...newParts];
                    } else {
                        const keepParts = ancestorParts.length - 1;
                        const inheritedParts = ancestorParts.slice(0, keepParts);
                        
                        if (nameComponents.length > 0) {
                            nameComponents = [...inheritedParts, nameComponents[0]];
                        } else {
                            nameComponents = [...inheritedParts, this.getNameForCellType(this.getRandomItem(dominantTypes))];
                        }
                    }
                }
                else if (Math.random() < 0.25) {
                    const keepFirst = Math.random() < 0.85; 
                    if (keepFirst) {
                        nameComponents[0] = ancestorParts[0];
                    } else {
                        nameComponents[0] = ancestorParts[ancestorParts.length - 1];
                    }
                }
                else if (Math.random() < 0.05 && nameComponents.length > 0) {
                    const useFirst = Math.random() < 0.5;
                    const ancestorPart = useFirst ? ancestorParts[0] : ancestorParts[ancestorParts.length - 1];
                    nameComponents[0] = ancestorPart + nameComponents[0];
                }
                else {
                    const position = Math.random() < 0.5 ? 0 : nameComponents.length - 1;
                    const ancestorPosition = Math.random() < 0.5 ? 0 : ancestorParts.length - 1;
                    nameComponents[position] = ancestorParts[ancestorPosition];
                }
            }
        }
        
        if (nameComponents.length === 0) {
            nameComponents.push(this.getNeutralName());
        }
        
        const finalComponents = [];
        for (let i = 0; i < nameComponents.length; i++) {
            if (i === 0) {
                finalComponents.push(nameComponents[i]);
                continue;
            }
            
            const prevWord = finalComponents[finalComponents.length - 1];
            const currentWord = nameComponents[i];
            
            const lastCharPrev = prevWord[prevWord.length - 1];
            const firstCharCurrent = currentWord[0];
            
            if (!this.isVowel(lastCharPrev) && this.isVowel(firstCharCurrent)) {
                if (Math.random() < this.getCompoundWordProbability(totalCells, i - 1)) {
                    finalComponents[finalComponents.length - 1] = prevWord + currentWord;
                } else {
                    finalComponents.push(currentWord);
                }
            } else {
                finalComponents.push(currentWord);
            }
        }
        
        const joinedName = finalComponents.join(useSpaces ? ' ' : '-');
        
        return joinedName.split(' ')
            .map((word, index) => {
                if (index === 0) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                } else {
                    return word.toLowerCase();
                }
            })
            .join(' ');
    }
};

module.exports = NameGenerator;