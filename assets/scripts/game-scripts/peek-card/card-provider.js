
var SUITS = ['Diamond', 'Club', 'Heart', 'Spade' ]

var SpriteFrameConfig = {
    Card: '%s_%s',
    CardMini: '%s_%s_mini',
}

var CardProvider = cc.Class({
    extends: cc.Component,

    properties: {
        spriteFrames: {
            default: [],
            type: cc.SpriteFrame,
        },
    },

    statics: {
        Instance: null,
    },

    ctor: function () {
        var self = this;

        CardProvider.Instance = self;
        self.dictSpriteFrame = {};
    },

    onLoad: function () {
        var self = this;

        for (var frameIndex = 0; frameIndex < self.spriteFrames.length; frameIndex++) {
            var spriteFrame = self.spriteFrames[frameIndex];
            self.dictSpriteFrame[self.getKey(spriteFrame.name)] = spriteFrame;
        }
    },

    getKey: function (name) {
        return name.toLowerCase().replace(new RegExp('-', 'g'), '');
    },

    GetCard: function (id) {
        var self = this;

        if (id == null) {
            cc.warn('Get sprite frame with invalid id:', id);
            return null;
        }

        var value = Math.floor(id / 4) + 1;
        var suit = SUITS[id % 4];
        var cardName = cc.js.formatStr(SpriteFrameConfig.Card, suit, value < 10 ? '0' + value : value);

        return self.dictSpriteFrame[self.getKey(cardName)];
    },

    GetCardMini: function (id) {
        var self = this;

        if (id == null) {
            cc.warn('Get sprite frame with invalid id:', id);
            return null;
        }

        var value = Math.floor(id / 4) + 1;
        var suit = SUITS[id % 4];
        var cardName = cc.js.formatStr(SpriteFrameConfig.CardMini, suit, value < 10 ? '0' + value : value);

        return self.dictSpriteFrame[self.getKey(cardName)];
    },

    GetCardValue: function (id) {
        if (id == null) {
            cc.warn('Get value with invalid id:', id);
            return null;
        }

        return Math.floor(id / 4) + 1;
    },
})
