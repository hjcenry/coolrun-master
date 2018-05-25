cc.Class({
    extends: cc.Component,

    properties: {
        onObstacle: false,
        behindObstacle: false,
        coinPrefab: cc.Prefab,
        baseView: cc.Node,
    },
    onLoad() {
        this.coinPool = new cc.NodePool()
        this.node.onFloor = false
    },
    // 生成金币
    createCoin() {
        let coin = null;
        if (this.coinPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            coin = this.coinPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，就用 cc.instantiate 重新创建
            coin = cc.instantiate(this.coinPrefab);
        }
        let x = this.node.baseView.node.width / 2 + coin.width / 2,
            y = cc.random0To1() * (200 + 130) - 130
        coin.setPosition(cc.p(x, y))
        let move = cc.moveTo(2.48, cc.p(-(this.node.baseView.node.width / 2 + coin.width / 2), y)),
            cb = cc.callFunc(() => {
                this.destoryCoin(coin)
                this.createCoin()
            }),
            seq = cc.sequence(move, cb)
        this.node.baseView.node.addChild(coin)
        coin.runAction(seq)
    },
    // 销毁金币
    destoryCoin(coinNode) {
        coinNode.stopAllActions()
        this.coinPool.put(coinNode)
    },
    // 碰撞开始
    onCollisionEnter(other, self) {
        let selfNode = self.node,
            otherNode = other.node,
            sy = Math.abs((otherNode.y - otherNode.height / 2) - (selfNode.y + selfNode.height / 2)),
            sx = Math.abs((otherNode.x - otherNode.width / 2) - (selfNode.x + selfNode.width / 2))

        // cc.log(sx, sy)
        switch (other.node.group) {
            // 英雄与障碍物碰撞')
            case 'obstacle':
                // cc.log(other, self)
                // this.node.onObstacle = true
                // 碰撞障碍物

                if (sx < 10 && sy > 10) { //碰撞障碍物前面
                    this.behindObstacle = true
                    this.currentObstacle = otherNode
                } else if (sy < 10) { //碰撞障碍物下面

                }
                // cc.log(sx,sy)
                // else if(sy){//碰撞障碍物上面
                //     this.onObstacle = true
                // }
                break
            // 英雄获得金币
            case 'coin':
                this.destoryCoin(other.node)
                this.node.baseView.scoreLabel.string = Number.parseInt(this.node.baseView.scoreLabel.string) + 1
                this.createCoin()
                break
            case 'floor':
                switch (otherNode.name){
                    case 'floor_middle':
                        if (this.node.baseView.jumpState == 0 || this.node.baseView.currentG > 100) {
                            this.node.onFloor = true
                        }
                        break
                    case 'floor_left':
                        if (sy <260) { //碰撞障碍物前面
                            this.behindObstacle = true
                            this.currentObstacle = otherNode
                        }else{
                            this.node.onFloor = true
                        }
                        break
                    case 'floor_right':
                        this.node.onFloor = true
                        break

                }

        }
    },
    // 碰撞结束
    onCollisionExit(other, self) {
        // 碰撞障碍物
        let selfNode = self.node,
            otherNode = other.node,
            sy = Math.abs((otherNode.y - otherNode.height / 2) - (selfNode.y + selfNode.height / 2)),
            sx = Math.abs((otherNode.x - otherNode.width / 2) - (selfNode.x + selfNode.width / 2))
        switch (other.node.group) {
            case 'obstacle':
                // cc.log('英雄与障碍物碰撞结束')
                this.node.onObstacle = false
                this.behindObstacle = false
                break
            case 'floor':
                switch (otherNode.name) {
                    case 'floor_middle':
                        if (sy > 260) {
                            this.node.onFloor = false
                        }
                        break
                    case 'floor_right':
                        if(sx>140&&sy<260){
                            this.node.getComponent(cc.Animation).play(`Hero${Globle.heroIndex + 1}-jumpOnce`)
                            this.node.baseView.jumpState = 1
                            this.node.height = 103
                        }
                        this.node.onFloor = false
                        break
                    case 'floor_left':
                        this.behindObstacle = false
                        break
                }
        }
    },
    run() {
        this.node.getComponent(cc.Animation).play(`Hero${Globle.heroIndex}-run`)
    },
    start() {
        this.createCoin()
        // cc.log(this.node.baseView)
    },

    update(dt) {
        //英雄往前跑，直到跑到屏幕中央
        if (this.node.x <= 0 && !this.behindObstacle) {
            this.node.x += 1
        }
        if (this.behindObstacle) {
            this.node.x = this.currentObstacle.x - this.currentObstacle.width / 2 - this.node.width / 2
        }
    },
});
