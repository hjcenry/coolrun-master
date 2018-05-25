cc.Class({
    extends: cc.Component,

    properties: {
        bg1_1: cc.Node,
        bg1_2: cc.Node,
        bg2_1: cc.Node,
        bg2_2: cc.Node,
        bg3_1: cc.Node,
        bg3_2: cc.Node,
        bg4_1: cc.Node,
        bg4_2: cc.Node,
        bg5_1: cc.Node,
        bg5_2: cc.Node,
        bgDuration:0
    },

    onLoad () {
        this.backgroundMove(this.bg1_1,this.bg1_2,this.bgDuration*25, -980,0,1015,0)
        this.backgroundMove(this.bg2_1,this.bg2_2,this.bgDuration*16,-1000,0,1000,0)
        this.backgroundMove(this.bg3_1,this.bg3_2,this.bgDuration*12,-980,-194,1015,-194)
        this.backgroundMove(this.bg4_1,this.bg4_2,this.bgDuration*10,-1000,0,1000,0,10)
        this.backgroundMove(this.bg5_1,this.bg5_2,this.bgDuration*8,-980,-282,1015,-282,15)
        // this.backgroundMove(this.floor1,this.floor2,this.bgDuration*3,-980,0,1015,0,20)
    },
    backgroundMove (node1,node2,duration,moveX,moveY,setX,setY,minus=5) {
        let firstMove = cc.moveTo(duration, cc.p(moveX, moveY))
        let firstCb = cc.callFunc(()=>{
            node1.setPosition(cc.p(node2.x+node2.width-minus,setY))
            node1.runAction(this.backgroundMoveForever(node1,duration*2,moveX,moveY,node2.x+node2.width-minus,setY))
        })
        node1.runAction(cc.sequence(firstMove, firstCb))
        node2.runAction(this.backgroundMoveForever(node2,duration*2,moveX,moveY,node1.x+node1.width-minus,setY))
    },
    backgroundMoveForever (node,duration,moveX,moveY,setX,setY) {
        let move = cc.moveTo(duration,cc.p(moveX,moveY))
        let cb = cc.callFunc(()=>{
            node.setPosition(cc.p(setX,setY))
            node.runAction(this.backgroundMoveForever(node,duration,moveX,moveY,setX,setY))
        })
        return cc.sequence(move,cb)
    },

    // update (dt) {},
});
