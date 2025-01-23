"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var blocks_1 = require("../../blocks");
var helpers_1 = require("../../helpers");
var inlines_1 = require("../../inlines");
test('isBlock', function () {
    var block = { nodeType: blocks_1.BLOCKS.PARAGRAPH };
    var nonBlock = { nodeType: 'Paragraph' };
    var nonBlock2 = { nodeType: undefined };
    expect((0, helpers_1.isBlock)(block)).toBe(true);
    expect((0, helpers_1.isBlock)(nonBlock)).toBe(false);
    expect((0, helpers_1.isBlock)(nonBlock2)).toBe(false);
});
test('isInline', function () {
    var inline = { nodeType: inlines_1.INLINES.HYPERLINK };
    var noninline = { nodeType: 'Hyperlink' };
    var noninline2 = { nodeType: undefined };
    expect((0, helpers_1.isInline)(inline)).toBe(true);
    expect((0, helpers_1.isInline)(noninline)).toBe(false);
    expect((0, helpers_1.isInline)(noninline2)).toBe(false);
});
//# sourceMappingURL=helpers.test.js.map