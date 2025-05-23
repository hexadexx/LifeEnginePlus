const NameList = require('./NameList');

const NameGenerator = {
    getNameComponentCount(cellCount) {
        if (cellCount <= 4) return 1;
        if (cellCount <= 11) return 2;
        return 3;
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
        const wordList = NameList[cellType];
        if (!wordList || wordList.length === 0) {
            return this.getRandomItem(NameList.neutral || ['unknown']);
        }
        return this.getRandomItem(wordList);
    },
    
    getNeutralName() {
        return this.getRandomItem(NameList.neutral || ['unknown']);
    },
    
    createCombinedName(name1, name2) {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        
        let breakPoint1 = Math.ceil(name1.length * 0.6);
        while (breakPoint1 > 1 && vowels.includes(name1[breakPoint1 - 1].toLowerCase())) {
            breakPoint1--;
        }
        
        let breakPoint2 = Math.floor(name2.length * 0.4);
        while (breakPoint2 < name2.length - 1 && !vowels.includes(name2[breakPoint2].toLowerCase())) {
            breakPoint2++;
        }
        
        return name1.substring(0, breakPoint1) + name2.substring(breakPoint2);
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
        
        const nameComponents = [];
        const totalCells = anatomy.cells.length;
        const totalCellTypes = allCellTypes.length;
        
        let topCellCount = Math.min(totalCellTypes, Math.max(2, Math.ceil(totalCellTypes * 0.75)));
        const dominantTypes = allCellTypes.slice(0, topCellCount).map(([type]) => type);
        const remainingTypes = allCellTypes.slice(topCellCount).map(([type]) => type);
        
        const componentCount = this.getNameComponentCount(totalCells);
        const useCombinedNameComponent = Math.random() < this.getCombinedNameProbability(totalCells);
        
        const isLargeOrganism = totalCells >= 5;
        
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
                
                nameComponents.push(this.createCombinedName(
                    this.getNameForCellType(primaryType), 
                    this.getNameForCellType(secondaryType)
                ));
            } else {
                nameComponents.push(this.getNameForCellType(this.getRandomItem(dominantTypes)));
            }
        }
        
        if (isLargeOrganism) {
            if (Math.random() < 0.5) {
                const neutralName = this.getNeutralName();
                
                if (Math.random() < 0.5) {
                    nameComponents.push(neutralName);
                } else {
                    const randomIndex = Math.floor(Math.random() * nameComponents.length);
                    nameComponents[randomIndex] = this.createCombinedName(
                        nameComponents[randomIndex], 
                        'neutral'
                    );
                }
            }
        }
        
        if (ancestor && ancestor.name) {
            const ancestorName = ancestor.name;
            const ancestorParts = ancestorName.split(/[\s-]/);
            
            if (ancestorParts.length === 1) {
                const ancestorWord = ancestorParts[0];
                const extractLength = Math.min(4, Math.round(ancestorWord.length / 0.75));
                const extractedPart = Math.random() < 0.5 
                    ? ancestorWord.substring(0, extractLength)
                    : ancestorWord.substring(ancestorWord.length - extractLength);
                
                if (Math.random() < 0.7) {
                    const randomType = this.getRandomItem(dominantTypes);
                    const randomName = this.getNameForCellType(randomType);
                    
                    if (Math.random() < 0.5) {
                        nameComponents[0] = this.createCombinedName(extractedPart, randomName);
                    } else {
                        nameComponents[0] = this.createCombinedName(randomName, extractedPart);
                    }
                }
                
                if (Math.random() < 0.3) {
                    const neutralName = this.getNeutralName();
                    if (Math.random() < 0.5) {
                        nameComponents[0] = this.createCombinedName(extractedPart, neutralName);
                    } else {
                        nameComponents[0] = this.createCombinedName(neutralName, extractedPart);
                    }
                }
            }
        }
        
        if (nameComponents.length === 0) {
            const randomType = this.getRandomItem(dominantTypes);
            nameComponents.push(this.getNameForCellType(randomType));
        }
        
        const finalComponents = nameComponents.slice(0, 3);
        const finalWord = finalComponents.join(useSpaces ? ' ' : '-');
        
        return finalWord.split(' ')
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