var AxisDirection = cc.Enum({
    Horizontal: -1,
    Vertical: 1
});

var HorizontalAlign = cc.Enum({
    Left: -1,
    Center: 0,
    Right: 1,
});

var VerticalAlign = cc.Enum({
    Bottom: -1,
    Center: 0,
    Top: 1,
});

var PeekCardID = {
    PeekCard: "PeekCard",
    PeekCardSuccess: "PeekCardSuccess",
    PeekCardHideComplete: "PeekCardHideComplete",
    PeekCardCountDown: "PeekCardCountDown",
    PeekCardTimeOut: "PeekCardTimeOut",
    PeekCardNotifyTimeOut: "PeekCardNotifyTimeOut",
};

module.exports = {
    PeekCardID: PeekCardID,
    AxisDirection: AxisDirection,
    HorizontalAlign: HorizontalAlign,
    VerticalAlign: VerticalAlign,
}
