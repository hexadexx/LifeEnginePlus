const CarnivoreMouthCell = require("./CarnivoreMouthCell");
const HerbivoreMouthCell = require("./HerbivoreMouthCell");
const ProducerCell = require("./ProducerCell");
const MoverCell = require("./MoverCell");
const LeftRightMoverCell = require("./LeftRightMoverCell");
const UpDownMoverCell = require("./UpDownMoverCell");
const RotationMoverCell = require("./RotationMoverCell");
const KillerCell = require("./KillerCell");
const ArmorCell = require("./ArmorCell");
const EyeCell = require("./EyeCell");
const StorageCell = require("./StorageCell");
const ConverterCell = require("./ConverterCell");
const CellStates = require("../CellStates");

const BodyCellFactory = {
    init: function() {
        var type_map = {};
        type_map[CellStates.carnivoreMouth.name] = CarnivoreMouthCell;
        type_map[CellStates.herbivoreMouth.name] = HerbivoreMouthCell;
        type_map[CellStates.producer.name] = ProducerCell;
        type_map[CellStates.mover.name] = MoverCell;
        type_map[CellStates.leftRightMover.name] = LeftRightMoverCell;
        type_map[CellStates.upDownMover.name] = UpDownMoverCell;
        type_map[CellStates.rotationMover.name] = RotationMoverCell;
        type_map[CellStates.killer.name] = KillerCell;
        type_map[CellStates.armor.name] = ArmorCell;
        type_map[CellStates.eye.name] = EyeCell;
        type_map[CellStates.storage.name] = StorageCell;
        type_map[CellStates.converter.name] = ConverterCell;
        this.type_map = type_map;
    },    

    createInherited: function(org, to_copy) {
        if (!this.type_map[to_copy.state.name]) {
            console.error("Unknown cell type:", to_copy.state.name);
            return null;
        }
        var cell = new this.type_map[to_copy.state.name](org, to_copy.loc_col, to_copy.loc_row);
        cell.initInherit(to_copy);
        return cell;
    },

    createRandom: function(org, state, loc_col, loc_row) {
        if (!this.type_map[state.name]) {
            console.error("Unknown cell type:", state.name);
            return null;
        }
        var cell = new this.type_map[state.name](org, loc_col, loc_row);
        cell.initRandom();
        return cell;
    },

    createDefault: function(org, state, loc_col, loc_row) {
        if (!this.type_map[state.name]) {
            console.error("Unknown cell type:", state.name);
            return null;
        }
        var cell = new this.type_map[state.name](org, loc_col, loc_row);
        cell.initDefault();
        return cell;
    },
}
BodyCellFactory.init();

module.exports = BodyCellFactory;