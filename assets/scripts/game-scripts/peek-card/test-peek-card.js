cc.Class({
    extends: cc.Component,

    properties: {
        peekCard: require('peek-card-content'),
        btnReset: cc.Button,
    },

    start() {
        var self = this;

        self.btnReset.node.on('click', self.onBtnResetClick, self);
    },

    onBtnResetClick: function () {
        var self = this;
        self.peekCard.OpenPeekCard(cc.math.randomRangeInt(0, 53));
    },

    onBtnAutoClick: function () {
        var self = this;
        self.peekCard.DisablePeekCard();
    },
});
