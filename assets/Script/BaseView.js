// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English]
// http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html Learn
// life-cycle callbacks: - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html - [English]
// http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        bgGroup: cc.Node,
        heros: [cc.Prefab],
        // heroAnimation: cc.Animation,
        // hero: cc.Node,
        jumpBtn: cc.Node,
        rollBtn: cc.Node,
        longObstacles: [cc.Prefab],
        floorPrefab: [cc.Prefab],
        gameOverView: cc.Node,
        jumpHeight: 0,
        jumpTwiceHeight: 0,
        jumpDuration: 0,
        jumpState: 0,//0:地面，1:一段跳，2:二段跳
        distanceLabel: cc.Label,
        scoreLabel: cc.Label,
        topView:cc.Node,
        heroGroundY: 0,
        G: 0
    },


    onLoad() {
        this.lockJumpBtn()
        this.lockRollBtn()
        this.initHero()
        this.currentG = this.G
        this.jumpBtn.on('touchstart', this.onJumpBtn, this)
        this.rollBtn.on('touchstart', this.onRollBtn, this)
        this.rollBtn.on('touchend', this.leaveRollBtn, this)
        this.rollBtn.on('touchcancel', this.leaveRollBtn, this)
        this.floorPool = [new cc.NodePool(), new cc.NodePool(), new cc.NodePool(), new cc.NodePool()]
        this.floorArr = []
        this.obstacleArr = []
        this.onRun = false
        // 全局碰撞检测
        let colliderManager = cc.director.getCollisionManager()
        colliderManager.enabled = true
        // colliderManager.enabledDebugDraw = true

        this.createOthers()
    },
    toScene(e, scene) {
        cc.director.loadScene(scene)
        clearInterval(this.floorTimer)
    },
    createOthers() {
        this.createFloorByBlock(14)
        this.floorTimer = setInterval(() => {
            if (this.floorArr.length < 30) {
                this.createFloorByBlock(Number.parseInt(cc.random0To1() * 12 + 10))
            }
        }, 2000)


    },
    createFloorByBlock(num) {
        let random = Number.parseInt(cc.random0To1() * 3 + 5)
        this.createFloor(0)
        for (let i = 0; i < num; i++) {
            if (i == num - 1) {
                this.createFloor(2)
                this.createFloor(3, null, Number.parseInt(cc.random0To1() * 200 + 200))
            } else {
                if (i == random) {
                    this.createObstacle(this.createFloor())
                } else {
                    this.createFloor()
                }
            }

        }
    },
    initHero() {
        this.hero = cc.instantiate(this.heros[Globle.heroIndex])
        this.heroAnimation = this.hero.getComponent(cc.Animation)
        // this.hero.setPosition(cc.p(-540, -120))
        this.hero.setPosition(cc.p(-340, 300))
        this.node.addChild(this.hero)
        this.hero.baseView = this
        let move = cc.moveTo(1, cc.p(-300, this.hero.y))
        let cb = cc.callFunc(() => {
            this.unLockBtn()
        })
        let seq = cc.sequence(move, cb)
        this.hero.runAction(seq)
    },
    // 生成地板
    createFloor(floorIndex = 1, fn = null, width = 120) {// floorIndex=>0:left,1:middle,2:right
        let floor = this.floorPool[floorIndex].size() > 0 ?
            this.floorPool[floorIndex].get() :
            cc.instantiate(this.floorPrefab[floorIndex])
        floor.floorIndex = floorIndex
        if (floorIndex == 3) {
            floor.width = width
        }
        let y = -278
        let x = this.floorArr.length == 0 ? -440 : this.floorArr[this.floorArr.length - 1].x + this.floorArr[this.floorArr.length - 1].width / 2 + floor.width / 2
        floor.setPosition(cc.p(x, y))
        this.floorArr.push(floor)
        this.bgGroup.addChild(floor)
        fn && fn()
        return floor.x
    },
    // 生成障碍物
    //
    createObstacle(x) {
        let randomIndex = Number.parseInt(cc.random0To1() * 3)

        let obstacle = cc.instantiate(this.longObstacles[randomIndex])
        let y = 100
        obstacle.setPosition(cc.p(x, y))
        this.obstacleArr.push(obstacle)
        this.node.addChild(obstacle)
    },
    onJumpBtn() {
        if (!this.jumpBtn.lock) {
            this.hero.onFloor = false
            if (this.jumpState === 0) {
                this.jumpState = 1
            } else if (this.jumpState == 1) {
                this.jumpState = 2
            } else {
                return
            }
            this.onRun = false
            let jumpUp = null,
                jumpCb = null
            //一段跳跃
            if (this.jumpState == 1) {
                this.heroAnimation.play(`Hero${Globle.heroIndex + 1}-jumpOnce`)
                jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut())
                jumpCb = cc.callFunc(() => {
                    this.run()
                })
                this.hero.runAction(jumpUp)
            }
            //二段跳跃
            else if (this.jumpState == 2) {
                this.currentG = this.G
                this.hero.stopAllActions()
                this.heroAnimation.play(`Hero${Globle.heroIndex + 1}-jumpTwice`)
                this.hero.runAction(cc.moveBy(this.jumpDuration, cc.p(0, this.jumpTwiceHeight)).easing(cc.easeCubicActionOut()))

            }
            this.lockRollBtn()
        }
    },
    leaveRollBtn() {
        if (this.hero.height == 70) {
            this.hero.y = this.heroGroundY
            this.hero.height = 103
            this.run()
        }
    },
    onRollBtn() {
        if (!this.rollBtn.lock) {
            this.lockRollBtn()
            this.lockJumpBtn()
            this.hero.height = 70
            this.hero.y -= 17
            this.heroAnimation.play(`Hero${Globle.heroIndex + 1}-roll`)
        }
    },
    run() {
        this.unLockBtn()
        this.jumpState = 0
        this.hero.stopAllActions()
        this.heroAnimation.play(`Hero${Globle.heroIndex + 1}-run`)
        this.onRun = true
    },
    lockJumpBtn() {
        this.jumpBtn.lock = true
    },
    lockRollBtn() {
        this.rollBtn.lock = true
    },
    unLockBtn() {
        this.jumpBtn.lock = false
        this.rollBtn.lock = false
    },
    start() {
        this.distance = 0
        // this.createObstacle()
    },
    gameOver() {
        this.hero.active = false
        this.topView.active = false
        this.gameOverView.active = true

    },
    update(dt) {
        //英雄下落
        // cc.log(this.hero.onFloor, this.jumpState)
        if (!this.hero.onFloor) {
            this.currentG += dt * 1300
            this.hero.y -= dt * this.currentG
        } else if (this.hero.onFloor && !this.onRun) {
            if (this.hero.y > this.heroGroundY) {
                this.hero.y -= dt * this.currentG
            } else {
                this.currentG = this.G
                this.hero.y = this.heroGroundY
                this.run()
            }
        }
        if (this.distance > 2 && !this.canNotGameOver && (this.hero.x < -(this.node.width / 2 + this.hero.width / 2) || this.hero.y < -(this.node.height / 2 + this.hero.height / 2))) {
            this.gameOver()
            this.canNotGameOver = true
        }
        // 距离递增
        this.distance += dt
        this.distanceLabel.string = Number.parseInt(this.distance)

        if (this.floorArr.length > 0) {
            for (let floor of this.floorArr) {
                floor.x -= 6.5
                if (floor.x < -600) {
                    this.floorPool[floor.floorIndex].put(floor)
                    this.floorArr.shift()
                }
            }
        }
        if (this.obstacleArr.length > 0) {
            for (let obstacle of this.obstacleArr) {
                obstacle.x -= 6.5
                if (obstacle.x < -600) {
                    obstacle.destroy()
                    this.obstacleArr.shift()
                }
            }
        }
    },
});
