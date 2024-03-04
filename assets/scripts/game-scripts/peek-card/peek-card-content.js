var CornerPeeking = require("corner-peeking");
var PeekCardEnums = require("peek-card-enums");
var CardProvider = require("card-provider");

var SUITS = ['Diamond', 'Club', 'Heart', 'Spade',]

cc.Class({
    extends: cc.Component,

    properties: {
        AxisDirection: {
            default: PeekCardEnums.AxisDirection.Vertical,
            type: PeekCardEnums.AxisDirection,
        },
        ArrCorner: {
            default: [],
            type: CornerPeeking,
        },
        CornerAutoPeek: {
            default: null,
            type: CornerPeeking
        },
        StartPointAutoPeek: cc.Node,
        EndPointAutoPeek: cc.Node,
        Container: cc.Node,
        AutoPeekMovingNode: cc.Node,
        CornerContainer: cc.Node,
        NodeFaceCardDrag: cc.Node,
        NodeFaceCardDisplay: cc.Node,
        NodeBackCardDrag: cc.Node,
        NodeBackCardDisplay: cc.Node,
        NodeMaskCard: cc.Node,
        NodeRedBlur: cc.Node,
        NodeBlackBlur: cc.Node,
    },

    onLoad: function () {
        var self = this;

        self.nodeBlur = {};
        cc.director.getCollisionManager().enabled = true;
        self.spriteBackCard = self.NodeBackCardDrag.getComponent(cc.Sprite);
        self.spriteFace = self.NodeFaceCardDisplay.getComponent(cc.Sprite);
        self.spriteFaceDrag = self.NodeFaceCardDrag.getComponent(cc.Sprite);
        self.mask = self.NodeMaskCard.getComponent(cc.Mask);

        self.horizontalAlign = PeekCardEnums.HorizontalAlign.Center;
        self.verticalAlign = PeekCardEnums.VerticalAlign.Center;

        self.defaultAxis = self.AxisDirection;

        self.angleDragging = 0;
        self.angleCoefficient = 1;

        self.isOpened = false;
        self.isAutoPeeking = false;
        self.timelineAutoPeek = new TimelineMax();

        self.NodeBackCardDrag.on(cc.Node.EventType.TOUCH_START, self.handleMouseDown, self);

        self.reset();
    },

    register: function () {
        var self = this;

        self.NodeBackCardDrag.on(cc.Node.EventType.TOUCH_END, self.handleMouseUp, self);
        self.NodeBackCardDrag.on(cc.Node.EventType.TOUCH_CANCEL, self.handleMouseUp, self);
        self.NodeBackCardDrag.on(cc.Node.EventType.TOUCH_MOVE, self.handleMouseMoved, self);
    },

    unregister: function () {
        var self = this;

        self.NodeBackCardDrag.off(cc.Node.EventType.TOUCH_END, self.handleMouseUp, self);
        self.NodeBackCardDrag.off(cc.Node.EventType.TOUCH_CANCEL, self.handleMouseUp, self);
        self.NodeBackCardDrag.off(cc.Node.EventType.TOUCH_MOVE, self.handleMouseMoved, self);
    },

    OpenPeekCard: function (id) {
        var self = this;

        self.nodeBlur = self.getNodeBlur(id);
        var spriteFrame = CardProvider.Instance.GetCard(id);
        self.spriteFace.spriteFrame = spriteFrame;
        self.spriteFaceDrag.spriteFrame = spriteFrame;
        self.spriteFaceDrag.enabled = false;
        self.spriteBackCard.enabled = true;
        self.NodeMaskCard.active = false;
        self.mask.enabled = true;
        self.Container.active = true;
        self.isOpened = false;
        self.isAutoPeeking = false;

        self.timelineDisplay = new TimelineMax();

        self.timelineDisplay.add(TweenMax.to(self.Container, 0.5, {
            x: 0,
        }))

        self.timelineDisplay.addCallback(self.handleMouseUp.bind(self));
    },

    DisablePeekCard: function () {
        var self = this;

        self.handleMouseUp();
        self.CornerContainer.active = false;
    },

    HidePeekCard: function () {
        var self = this;

        self.timelineDisplay.eventCallback("onReverseComplete", self.reset.bind(self));

        self.timelineDisplay.reverse();
    },

    AutoPeek: function () {
        var self = this;

        self.handleMouseUp();

        if (self.isOpened == true) {
            return;
        }

        self.isAutoPeeking = true;
        var startLocation = self.getWorldPosition(self.StartPointAutoPeek);
        var endLocation = self.getWorldPosition(self.EndPointAutoPeek);
        console.log(startLocation);
        self.setCornerData(self.CornerAutoPeek.GetCornerData(null, self.AxisDirection));

        self.handlePointerLocation(startLocation);
        self.timelineAutoPeek = new TimelineMax();
        self.timelineAutoPeek.add(TweenMax.to(startLocation, 0.5, {
            x: endLocation.x,
            y: endLocation.y,
            onUpdate: function () {
                self.handlePointerLocation(startLocation);
            },
        }))

        self.timelineAutoPeek.addCallback(function () {
            self.isAutoPeeking = false;
            self.handlePointerLocation(endLocation);
        })
    },

    getNodeBlur: function (id) {
        var self = this;

        var suit = SUITS[id % 4];
        switch (suit) {
            case 'Diamond':
            case 'Heart':
                self.NodeRedBlur.active = true;
                self.NodeBlackBlur.active = false;
                return self.NodeRedBlur;

            default:
                self.NodeRedBlur.active = false;
                self.NodeBlackBlur.active = true;
                return self.NodeBlackBlur;
        }
    },

    showDisplayCard: function () {
        var self = this;

        self.spriteFaceDrag.spriteFrame = self.spriteFace.spriteFrame;
        self.spriteFaceDrag.enabled = true;
        self.NodeMaskCard.active = false;
        self.CornerContainer.active = false;
        self.nodeBlur.active = false;
        self.isOpened = true;

        self.unregister();
    },

    reset: function () {
        var self = this;

        self.isAutoPeeking = false;
        self.vertexDragging = cc.Vec2.ZERO;
        self.timelineAutoPeek.kill();
        self.isLockedRotation = false;
        self.Container.active = false;
        self.Container.active = false;
        self.CornerContainer.active = false;
        self.nodeBlur.active = false;
        self.spriteFaceDrag.spriteFrame = null;
        self.spriteFaceDrag.enabled = false;
        self.spriteBackCard.enabled = false;
        self.NodeMaskCard.active = false;
        self.mask.enabled = true;
        self.setRotation(self.defaultAxis);
    },

    handleMouseDown: function (event) {
        var self = this;

        var cornerData = null;
        var location = event.getLocation();
        console.log(location);

        for (var index = 0; index < self.ArrCorner.length; index++) {
            var corner = self.ArrCorner[index];
            cornerData = corner.GetCornerData(location, self.AxisDirection);
            if (cornerData != null) {
                break;
            }
        }

        if (cornerData != null) {
            self.setCornerData(cornerData);
            self.register();
            self.handleMouseMoved(event);
        }
    },

    handleMouseUp: function () {
        var self = this;

        self.unregister();
        self.spriteBackCard.enabled = true;
        self.CornerContainer.active = true;
        self.nodeBlur.active = false;
        self.NodeMaskCard.active = false;
    },

    handleMouseMoved: function (event) {
        var self = this;

        var location = event.getLocation();

        if (cc.Intersection.pointInPolygon(location, self.arrPointOfRectCancel)) {
            self.handleMouseUp();
            return;
        }

        self.handlePointerLocation(location);
    },

    setCornerData: function (cornerData) {
        var self = this;

        self.NodeMaskCard.anchorX = cornerData.MaskAnchor.x;
        self.NodeMaskCard.anchorY = cornerData.MaskAnchor.y;

        self.NodeFaceCardDrag.anchorX = cornerData.FaceAnchor.x;
        self.NodeFaceCardDrag.anchorY = cornerData.FaceAnchor.y;

        self.NodeFaceCardDisplay.anchorX = cornerData.FaceAnchor.x;
        self.NodeFaceCardDisplay.anchorY = cornerData.FaceAnchor.y;

        self.horizontalAlign = cornerData.HorizontalAlign;
        self.verticalAlign = cornerData.VerticalAlign;

        self.vertexDragging = cornerData.VertexDragging;
        self.arrPointOfRectPeeking = cornerData.ArrPointOfRectPeeking;
        self.arrPointOfRectCancel = cornerData.ArrPointOfRectCancel;

        self.angleCoefficient = self.horizontalAlign * self.verticalAlign * self.AxisDirection;
        self.angleFinger = Math.atan(self.NodeFaceCardDisplay.width / self.NodeFaceCardDisplay.width) * 180 / Math.PI;

        self.CornerContainer.active = false;
        self.nodeBlur.active = true;
        self.spriteBackCard.enabled = false;
        self.NodeMaskCard.active = true;
    },

    handlePointerLocation: function (location) {
        var self = this;

        console.log(location.x, location.y);
        self.angleDragging = self.calcAngle(location, self.vertexDragging) * self.angleCoefficient;

        if (self.horizontalAlign != PeekCardEnums.HorizontalAlign.Center && self.verticalAlign != PeekCardEnums.VerticalAlign.Center) {
            self.angleDragging -= self.Container.angle;
        }

        self.setFacePosition(location);

        self.setMaskPosition(location);

        self.setWorldPostion(self.NodeBackCardDisplay, self.getWorldPosition(self.NodeBackCardDrag));
        self.NodeBackCardDisplay.angle = -self.NodeMaskCard.angle;

        self.setWorldPostion(self.NodeFaceCardDisplay, self.getWorldPosition(self.NodeFaceCardDrag));
        self.NodeFaceCardDisplay.angle = self.NodeFaceCardDrag.angle - self.NodeMaskCard.angle;

        self.checkAvailableOpen(location);
    },

    setFacePosition: function (location) {
        var self = this;

        self.setWorldPostion(self.NodeFaceCardDrag, location);

        switch (self.horizontalAlign) {
            case PeekCardEnums.HorizontalAlign.Center:
                self.NodeFaceCardDrag.x = self.NodeBackCardDrag.x;
                break;
        }

        switch (self.verticalAlign) {
            case PeekCardEnums.VerticalAlign.Center:
                self.NodeFaceCardDrag.y = self.NodeBackCardDrag.y;
                break;
        }

        self.NodeFaceCardDrag.angle = self.angleDragging * 2;
    },

    setMaskPosition: function (location) {
        var self = this;

        var worldMidPoint = self.calcMidPoint(location, self.vertexDragging);
        self.setWorldPostion(self.NodeMaskCard, worldMidPoint);

        self.NodeMaskCard.angle = self.angleDragging;
    },

    checkAvailableOpen: function (location) {
        var self = this;

        if (!cc.Intersection.pointInPolygon(location, self.arrPointOfRectPeeking)) {
            self.unregister();

            self.timelineAutoPeek.kill();
            self.spriteFaceDrag.spriteFrame = self.spriteFace.spriteFrame;
            self.spriteFaceDrag.enabled = true;
            self.NodeMaskCard.active = false;
            self.CornerContainer.active = false;
            self.nodeBlur.active = false;

            var angle = 0;
            var positionFactor = 1;
            var difference180degrees = Math.abs(180 - self.NodeFaceCardDrag.angle);
            var difference0degrees = Math.abs(self.NodeFaceCardDrag.angle);
            var differenceNegative180degrees = Math.abs(-180 - self.NodeFaceCardDrag.angle);
            var min = Math.min(difference180degrees, difference0degrees, differenceNegative180degrees);

            switch (min) {
                case difference180degrees:
                    positionFactor = -1;
                    angle = 180;
                    break;

                case differenceNegative180degrees:
                    positionFactor = -1;
                    angle = -180;
                    break;

                default:
                    positionFactor = 1;
                    angle = 0;
                    break;
            }

            var timeline = new TimelineMax({
                onComplete: self.showDisplayCard.bind(self)
            });

            var x = positionFactor * self.NodeFaceCardDrag.width * (self.NodeFaceCardDrag.anchorX - 0.5),
                y = positionFactor * self.NodeFaceCardDrag.height * (self.NodeFaceCardDrag.anchorY - 0.5);

            timeline.addLabel('FLIP');

            timeline.add(TweenMax.to(self.NodeFaceCardDrag, 0.15, {
                scale: 1.1,
                repeat: 1,
                yoyo: true,
            }), 'FLIP')

            timeline.add(TweenMax.to(self.NodeFaceCardDrag, 0.3, {
                angle: angle,
                x: x,
                y: y,
            }), 'FLIP')
        }
    },

    rotateContent: function () {
        var self = this;

        if (self.isLockedRotation) {
            return;
        }

        var nextAxisDirection = null;
        switch (self.AxisDirection) {
            case PeekCardEnums.AxisDirection.Horizontal:
                nextAxisDirection = PeekCardEnums.AxisDirection.Vertical;
                break;

            case PeekCardEnums.AxisDirection.Vertical:
                nextAxisDirection = PeekCardEnums.AxisDirection.Horizontal;
                break;
        }

        self.setRotation(nextAxisDirection);
    },

    setRotation: function (axisDirection) {
        var self = this;

        self.AxisDirection = axisDirection;

        switch (self.AxisDirection) {
            case PeekCardEnums.AxisDirection.Horizontal:
                self.Container.angle = 90;
                break;

            case PeekCardEnums.AxisDirection.Vertical:
                self.Container.angle = 0;
                break;
        }
    },

    calcMidPoint: function (pointA, pointB) {
        var position = new cc.Vec2();
        position.x = (pointA.x + pointB.x) / 2;
        position.y = (pointA.y + pointB.y) / 2;

        return position;
    },

    calcAngle: function (pointerLocation, vertexDragging) {
        var hypotenuse = Math.sqrt(Math.pow((pointerLocation.x - vertexDragging.x), 2) + Math.pow((pointerLocation.y - vertexDragging.y), 2));

        var adjacent = Math.abs(pointerLocation.x - vertexDragging.x);

        var cosOfVector = adjacent / hypotenuse;

        var angleOfVectorWithXAxis = Math.acos(cosOfVector) * 180 / Math.PI;

        var result = 90 - angleOfVectorWithXAxis;

        var cocosAngle = 90 - result;

        return cocosAngle;
    },

    getWorldPosition: function (node) {
        if (node.parent == null) {
            return node.position;
        }

        return node.parent.convertToWorldSpaceAR(node.position);
    },

    setWorldPostion: function (node, position) {
        if (node.parent == null) {
            node.position = position;
        }
        node.position = node.parent.convertToNodeSpaceAR(position);
    },
});
