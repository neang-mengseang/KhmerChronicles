"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaWithNodeType = getSchemaWithNodeType;
function getSchemaWithNodeType(nodeType) {
    try {
        return require("./generated/".concat(nodeType, ".json"));
    }
    catch (error) {
        throw new Error("Schema for nodeType \"".concat(nodeType, "\" was not found."));
    }
}
//# sourceMappingURL=index.js.map