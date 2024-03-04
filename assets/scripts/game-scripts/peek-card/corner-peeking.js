var PeekCardEnums = require("peek-card-enums");

cc.Class({
    extends: cc.Component,

    properties: {
        NodeVertex: cc.Node,
        NodeAreaPeeking: cc.Node,
        NodeAreaCorner: cc.Node,
        NodeAreaCancel: cc.Node,
        MaskAnchorHorizontal: cc.Vec2,
        MaskAnchorVerticle: cc.Vec2,
        FaceAnchor: cc.Vec2,
        HorizontalAlign: {
            default: PeekCardEnums.HorizontalAlign.Left,
            type: PeekCardEnums.HorizontalAlign,
        },
        VerticalAlign: {
            default: PeekCardEnums.VerticalAlign.Top,
            type: PeekCardEnums.VerticalAlign,
        },
    },

    GetCornerData: function (location, axisDirection) {
        var self = this;

        if (self.node.activeInHierarchy == false) {
            return null;
        }

        if (location == null || cc.Intersection.pointInPolygon(location, self.getArrPointFromNode(self.NodeAreaCorner))) {
            var vertexDragging = self.NodeVertex.parent.convertToWorldSpaceAR(self.NodeVertex.position);

            return {
                MaskAnchor: axisDirection == PeekCardEnums.AxisDirection.Horizontal ? self.MaskAnchorHorizontal : self.MaskAnchorVerticle,
                FaceAnchor: self.FaceAnchor,
                HorizontalAlign: self.HorizontalAlign,
                VerticalAlign: self.VerticalAlign,
                VertexDragging: vertexDragging,
                ArrPointOfRectPeeking: self.getArrPointFromNode(self.NodeAreaPeeking),
                ArrPointOfRectCancel: self.getArrPointFromNode(self.NodeAreaCancel),
            };
        }

        return null;
    },

    getArrPointFromNode: function (node) {
        var arrPoint = [];

        if (node == null) {
            return arrPoint;
        }
        
        var collider = node.getComponent(cc.Collider);
        if (collider != null) {
            arrPoint = collider.world.points;
        } else {
            var rect = node.getBoundingBoxToWorld();
            arrPoint.push(new cc.Vec2(rect.x, rect.y));
            arrPoint.push(new cc.Vec2(rect.x, rect.yMax));
            arrPoint.push(new cc.Vec2(rect.xMax, rect.yMax));
            arrPoint.push(new cc.Vec2(rect.xMax, rect.y));
        }

        return arrPoint;
    }
})