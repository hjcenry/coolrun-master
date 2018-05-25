window.Globle = {
    heroIndex:0
}
cc.Class({
    extends: cc.Component,

    properties: {
        right_btns: [cc.Node],
        bottom_btn_group:cc.Node,
        hero_prefab: [cc.Prefab],
        currentHero: 0,
        coin_count: 0,
        diamond_count: 0,
        coin_label: cc.Label,
        diamond_label: cc.Label,
        back:cc.Node,
        roleView:cc.Node

    },

    onLoad() {
        this.init()
    },
    init() {
        this.initHero(Globle.heroIndex)
        this.initMoney()
        this.changeViewAnimation(null,false)
    },
    initHero(index) {
        this.heroPrefab = cc.instantiate(this.hero_prefab[index])
        this.heroPrefab.setPosition(cc.p(18, 0))
        this.heroPrefab.opacity = 0
        this.node.addChild(this.heroPrefab)
    },
    initMoney(){
        this.coin_label.string = this.coin_count>10000?this.coin_count/10000+'万':this.coin_count
        this.diamond_label.string = this.diamond_count>10000?this.diamond_count/10000+'万':this.diamond_count
    },
    addMoney(e,type){
      switch (type){
          case 'coin':
              this.coin_count+=100
              break
          case 'diamond':
              this.diamond_count+=100
              break
      }
      this.initMoney()
    },
    chooseHero(e,heroIndex){
        this.heroPrefab.destroy()
        heroIndex = Number.parseInt(heroIndex)
        this.currentHero = heroIndex
        this.initHero(heroIndex)
        this.changeViewAnimation(null,0)
        this.fadeAnimation(this.roleView, true)
        Globle.heroIndex = heroIndex
    },
    changeViewAnimation(e, flag) {
        let isOut = flag == 0 ? false : true
        this.fadeAnimation(this.heroPrefab, isOut)
        this.fadeAnimation(this.bottom_btn_group, isOut)
        this.fadeAnimation(this.right_btns[0], isOut)
        this.fadeAnimation(this.right_btns[1], isOut, 0.1)
        this.fadeAnimation(this.right_btns[2], isOut, 0.2)
        this.fadeAnimation(this.back, !isOut)
    },
    toScene(e,scene){
        cc.director.loadScene(scene)
    },
    changeViewTo(e,where){
        switch (where){
            case 'role':
                this.fadeAnimation(this.roleView, false)
                break
        }
        this.currentView = where
    },
    backToHome(){
      switch (this.currentView){
          case 'role':
              this.fadeAnimation(this.roleView, true)
              break
      }
    },
    fadeAnimation(node, isOut, delay = 0, duration = 0.3) {
        if (!isOut) {
            node.active = true
        }
        let delayTime = cc.delayTime(delay),
            move = isOut ? cc.moveBy(duration, cc.p(300, 0)) : cc.moveBy(duration, cc.p(-300, 0)),
            fade = isOut ? cc.fadeOut(duration) : cc.fadeIn(duration),
            cb = cc.callFunc(() => {
                if (isOut) {
                    node.active = false
                }
            }),
            seq1 = cc.sequence([delayTime, move, cb]),
            seq2 = cc.sequence([delayTime, fade, cb])
        node.runAction(seq1)
        node.runAction(seq2)
    }
    // update (dt) {},
});
