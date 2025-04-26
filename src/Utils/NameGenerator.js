const NameList = require('./NameList');

const NameGenerator = {
    getNameComponentCount(cellCount) {
        if (cellCount <= 3) return 1;
        if (cellCount <= 8) return 2;
        if (cellCount <= 12) return 3;
        if (cellCount <= 21) return 4;
        return 5;
    },
    
    getCombinedNameProbability(cellCount) {
        if (cellCount <= 3) return 0.2;
        if (cellCount <= 8) return 0.25;
        if (cellCount <= 12) return 0.28;
        if (cellCount <= 21) return 0.29;
        return 0.3;
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
    
    createCombinedName(cellType1, cellType2) {
        const name1 = this.getNameForCellType(cellType1);
        const name2 = this.getNameForCellType(cellType2);
        
        const halfPoint1 = Math.floor(name1.length / 2);
        const halfPoint2 = Math.floor(name2.length / 2);
        
        return name1.substring(0, halfPoint1) + name2.substring(halfPoint2);
    },
    
    generateName(anatomy, ancestor = null, useSpaces = true) {
        // if the anatomy is undefined or null, return a random name
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
        
        const totalCellTypes = allCellTypes.length;
        let topCellCount = Math.min(totalCellTypes, Math.max(2, Math.ceil(totalCellTypes * 0.75)));
        
        const dominantTypes = allCellTypes.slice(0, topCellCount).map(([type]) => type);
        const remainingTypes = allCellTypes.slice(topCellCount).map(([type]) => type);
        
        const totalCells = anatomy.cells.length;
        const componentCount = this.getNameComponentCount(totalCells);
        const nameComponents = [];
        
        const useCombinedNameComponent = Math.random() < this.getCombinedNameProbability(totalCells);
        
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
        
        if (ancestor && ancestor.name && Math.random() > 0.6) {
            const ancestorName = ancestor.name;
            const ancestorParts = ancestorName.split(useSpaces ? ' ' : '');
            
            if (ancestorParts.length > 0) {
                const randomPart = this.getRandomItem(ancestorParts);
                
                if (Math.random() > 0.5) {
                    nameComponents.push(randomPart);
                } else {
                    nameComponents.unshift(randomPart);
                }
            }
        }
        
        return nameComponents.join(useSpaces ? ' ' : '');
    }
};

module.exports = NameGenerator;