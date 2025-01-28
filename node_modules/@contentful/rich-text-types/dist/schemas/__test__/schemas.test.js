"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var blocks_1 = require("../../blocks");
var inlines_1 = require("../../inlines");
var index_1 = require("../index");
var matchesSnapshot = function (nodeType) {
    var jsonSchema = (0, index_1.getSchemaWithNodeType)(nodeType);
    expect(jsonSchema).toMatchSnapshot(nodeType);
};
describe('getSchemaWithNodeType', function () {
    it('returns json schema for each nodeType', function () {
        Object.values(inlines_1.INLINES).forEach(function (nodeType) {
            matchesSnapshot(nodeType);
        });
        Object.values(blocks_1.BLOCKS).forEach(function (nodeType) {
            matchesSnapshot(nodeType);
        });
        matchesSnapshot('text');
    });
    it('throws error if no schema found', function () {
        expect(function () { return (0, index_1.getSchemaWithNodeType)('unknown-node-type'); }).toThrowErrorMatchingSnapshot();
    });
});
//# sourceMappingURL=schemas.test.js.map