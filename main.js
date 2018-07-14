(function(window) {

  var DIR = 'images/';
  var ASSETS = {
    image: {
      isi: DIR + 'isi.png',
      isi_nageru: DIR + 'isi_nageru.png',
      sarada: DIR + 'sarada.png',
      sarada_suki: DIR + 'sarada_suki.png',
      tikin: DIR + 'tikin.png',
      tikin_suki: DIR + 'tikin_suki.png',
      sarada_mazu: DIR + 'sarada_mazu.png',
      tikin_mazu: DIR + 'tikin_mazu.png',
      tensi: DIR + 'dottimo_suki.png',
      isi_suki: DIR + 'oni.png',
      life: DIR + 'life.png',
    },
  };
  phina.globalize();
  var _BASE_WIDTH = 640;
  var _BASE_HEIGHT = 960;
  var DPR = window.devicePixelRatio || 1;
  var SCREEN_WIDTH = _BASE_WIDTH * DPR;
  var SCREEN_HEIGHT = _BASE_HEIGHT * DPR;
  var CENTER_X = SCREEN_WIDTH / 2;
  var CENTER_Y = SCREEN_HEIGHT / 2;



  var px = function(v) {
    return v * DPR;
  };

  var gx = Grid({
    width: SCREEN_WIDTH,
    columns: 100,
  });

  var gy = Grid({
    width: SCREEN_HEIGHT,
    columns: 100,
  });

  var xs = function(v) {
    return gx.span(v);
  };
  var xc = function(v) {
    return gx.center(v);
  };
  var ys = function(v) {
    return gy.span(v);
  };
  var yc = function(v) {
    return gy.center(v);
  };

  Number.prototype.getter('p', function() {
    return this * DPR;
  });

  Number.prototype.getter('x', function() {
    return xs(this);
  });

  Number.prototype.getter('xc', function() {
    return xc(this);
  });

  Number.prototype.getter('y', function() {
    return ys(this);
  });

  Number.prototype.getter('yc', function() {
    return yc(this);
  });
  var RM_LEFT = -200..p;
  var RM_TOP = -200..p;
  var RM_RIGHT = 800..p;
  var RM_BOTTOM = 1100..p;
  var PLAYER_TOP = 100..p;
  var PLAYER_BOTTOM = 80..y;

  var TITLE = 'サラダが好きな人にサラダとか投げつける人';

  phina.define('TitleScene', {
    superClass: DisplayScene,
    init: function(options) {
      this.superInit(options);
      var self = this;
      LabelArea({
        text: TITLE,
        width: 85..x,
        lineHeight: 1.5,
        height: 500..p,
        fontSize: 75..p,
        fill: 'white',
        stroke: 'green',
        strokeWidth: 15..p,
        x: CENTER_X,
        y: 10..y,
        verticalAlign: 'top',
        baseline: 'top',
      }).addChildTo(this).setOrigin(0.5, 0);

      Label({
        text: 'スタート!',
        fontSize: 80..p,
        stroke: 'black',
        fill: 'white',
        strokeWidth: 20..p,
        x: CENTER_X,
        y: 65..y,
      }).addChildTo(this).tweener.to({
        alpha: 0.1,
      }, 500).to({
        alpha: 1,
      }, 500).setLoop(true);

      this.one('pointend', function() {
        this.exit();
      });
    }
  });

  phina.define('MainScene', {
    superClass: 'DisplayScene',

    init: function(options) {
      this.superInit(options);
      var self = this;
      this.player = Sprite('isi_nageru').$extend({
        x: CENTER_X,
        y: 80..y,
        width: 150..p,
        height: 150..p,
      }).addChildTo(this);
      this.player.muteki = 0;
      this.player.update = function(app) {
        if (--this.muteki > 0) {
          this.alpha = this.alpha ? 0 : 1;
        }
        else {
          this.alpha = 1;
        }
      };
      this.data = {
        tikin: 0,
        sarada: 0,
        isi: 0,
        time: 0,
      };
      // 時間切れまでの時間
      this.time = 1800;
      // スコア
      this.score = 0;

      this.player.hitTester = DisplayElement().setSize(10..p, 10..p);
      this.player.hitTester.position = this.player.position;
      // ライフ
      this.player.life = 5;

      this.layers = [];
      var shotLayer = this.shotLayer = DisplayElement().addChildTo(this);

      var enemyLayer = this.enemyLayer = DisplayElement().addChildTo(this);
      var oniLayer = this.oniLayer = DisplayElement().addChildTo(this);

      var effectLayer = this.effectLayer = DisplayElement().addChildTo(this);

      var uiLayer = this.uiLayer = DisplayElement().addChildTo(this);
      var lifeLayer = this.lifeLayer = DisplayElement().addChildTo(this);

      this.scoreLabel = Label({
        text: '0',
        fill: 'black',
        fontSize: 40..p,
        x: 2..x,
        y: 1..y,
        align: 'left',
        baseline: 'top',
      }).addChildTo(uiLayer);

      this.timeLabel = Label({
        text: '0',
        fill: 'black',
        fontSize: 40..p,
        x: (100 - 2).x,
        y: 1..y,
        align: 'right',
        baseline: 'top',
      }).addChildTo(uiLayer);

      this.player.life.times(function(i) {
        var life = Sprite('life').addChildTo(lifeLayer);
        life.setSize(90..p, 90..p);
        life.x = 58..x + (i + 0.5) / self.player.life * 40..x;
        life.y = 95..y;

        life.tweener.to({
          scaleX: 0.8,
          scaleY: 0.8,
        }, 350, 'swing').wait(200).to({
          scaleX: 1,
          scaleY: 1,
        }, 250, 'swing').setLoop(true);
      });

      Label({
        text: '残りライフ',
        fontSize: 28..p,
        x: (78).x,
        y: 89..y,
        fill: 'black',
      }).addChildTo(uiLayer);

      this.layers.push(shotLayer, effectLayer, enemyLayer, oniLayer, uiLayer, lifeLayer);
      if (!phina.isMobile()) {
        this.tutoriLabel = Label({
          text: 'ドラッグで操作\nキーボードZ,X,Cで\n投げつける',
          fontSize: 50..p,
          strokeWidth: 10..p,
          x: CENTER_X,
          y: CENTER_Y,
        }).addChildTo(uiLayer).on('enterframe', function() {
          self.isMoved && this.remove();
        });
      }
      var R = 5..y;
      var S = R * 2;
      var saradaButton = DisplayElement().addChildTo(uiLayer);
      CircleShape({
        radius: R,
        stroke: 'green',
        fill: false,
        padding: 8..p,
        strokeWidth: 8..p,
      }).addChildTo(saradaButton);
      Sprite('sarada').setSize(S * 0.9, S * 0.9).addChildTo(saradaButton);
      saradaButton.setBoundingType('circle');
      saradaButton.radius = R;
      saradaButton.interactive = true;
      saradaButton.setPosition(12..x, 93..y);

      if (!phina.isMobile()) Label({
        text: 'Z',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 10..p,
        fontSize: 30..p,
        y: R * 0.8,
      }).addChildTo(saradaButton);

      saradaButton.onpointstart = function() {
        self.shotType = 'Sarada';
      };
      saradaButton.onpointend = function() {
        self.shotType = null;
      };

      var tikinButton = DisplayElement().addChildTo(uiLayer);
      CircleShape({
        radius: R,
        stroke: 'red',
        fill: false,
        padding: 8..p,
        strokeWidth: 8..p,
      }).addChildTo(tikinButton);
      Sprite('tikin').setSize(S * 0.9, S * 0.9).addChildTo(tikinButton);
      tikinButton.setBoundingType('circle');
      tikinButton.interactive = true;
      tikinButton.radius = R;
      tikinButton.setPosition(30..x, 93..y);

      if (!phina.isMobile()) Label({
        text: 'X',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 10..p,
        fontSize: 30..p,
        y: R * 0.8,
      }).addChildTo(tikinButton);

      tikinButton.onpointstart = function() {
        self.shotType = 'Tikin';
      };
      tikinButton.onpointend = function() {
        self.shotType = null;
      };

      var isiButton = DisplayElement().addChildTo(uiLayer);
      CircleShape({
        radius: R,
        stroke: 'gray',
        fill: false,
        padding: 8..p,
        strokeWidth: 8..p,
      }).addChildTo(isiButton);
      Sprite('isi').setSize(S * 0.9, S * 0.9).addChildTo(isiButton);
      isiButton.setBoundingType('circle');
      isiButton.interactive = true;
      isiButton.radius = R;
      isiButton.setPosition(48..x, 93..y);

      isiButton.onpointstart = function() {
        self.shotType = 'Isi';
      };
      isiButton.onpointend = function() {
        self.shotType = null;
      };

      if (!phina.isMobile()) Label({
        text: 'C',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 10..p,
        fontSize: 30..p,
        y: R * 0.8,
      }).addChildTo(isiButton);

      // ショット
      this.shotTask = TaskAccessory(this).setWaitTime(4).addTask(function() {
        if (self.isGameOver) {
          return;
        }
        if (!self.shotType) {
          this.setCount(0);
          return;
        }
        var deg = 270;
        var p = self.player;
        var k = window[self.shotType]({
          x: p.x,
          y: p.y,
          radius: 45..p,
        }).addChildTo(shotLayer);
        var map = {
          'Sarada': 'オラァ!',
          'Tikin': '喰らえ!',
          'Isi': 'オラァ!!!!'
        };
        self.data[self.shotType.toLowerCase()]++;
        Label({
          text: map[self.shotType],
          fontSize: 30..p,
          fill: 'black',
          x: -60..p,
        }).addChildTo(p).tweener.to({
          y: -100,
        }, 300).call(function() {
          this.target.remove();
        });

        k.movable = DegreeMovable(k)
          .setSpeed(50..p)
          .setDegree(deg);
      }).enableAuto();


      // てき
      this.enemyTask = TaskAccessory(this).setWaitTime(60).addTask(function() {
        var s = window[['SaradaSuki', 'TikinSuki'].pickup()]().addChildTo(enemyLayer);
        s.x = Math.randint(0, SCREEN_WIDTH);
        s.movable = DegreeMovable(s)
          .setSpeed(10..p)
          .setDegree(90 + Math.randint(-45, 45));
      }).enableAuto();

      // おに
      this.oniTask = TaskAccessory(this).setWaitTime(240).setCount(240).addTask(function() {
        var s = Oni().addChildTo(oniLayer);
        s.x = Math.randint(0, SCREEN_WIDTH);
        s.movable = DegreeMovable(s)
          .setSpeed(15..p)
          .setDegree(90 + Math.randint(-70, 70));
      }).enableAuto();

      // てんし
      this.tensiTask = TaskAccessory(this).setWaitTime(360).setCount(360).addTask(function() {
        var s = Tensi().addChildTo(enemyLayer);
        s.x = 70..x;
        s.movable = MovePattern2(s).setSpeed(30);
      }).enableAuto();

    },

    testShotEnemy: function(app) {
      var shots = this.shotLayer.children;
      var effectLayer = this.effectLayer;
      var self = this;
      this.enemyLayer.children.concat(this.oniLayer.children.slice(0)).forEach(function(e) {
        shots.slice(0).forEach(function(s) {
          if (e._destroy) {
            return;
          }
          if (s.hitTestElement(e)) {
            e.hit && e.hit(s, self);
            s.remove();
            Fire({
              x: s.x,
              y: s.y,
              radius: 100,
            }).addChildTo(effectLayer).tweener.to({
              alpha: 0.5,
              scaleX: 0,
              scaleY: 0,
            }, 300, 'swing').call(function() { this.target.remove(); });
          }
        })
      })
    },

    testOniPlayer: function(app) {
      var p = this.player;
      if (p.muteki > 0) {
        return;
      }
      var self = this;
      var layer = this.oniLayer;
      var arr = layer.children.slice(0);
      arr.some(function(oni) {
        if (oni._destroy) {
          return;
        }
        if (p.hitTester.hitTestElement(oni)) {
          Label({
            text: 'フハハハハ',
            fontSize: 50..p,
          }).addChildTo(oni).tweener.to({
            y: -100,
          }, 1000).call(function() {
            this.target.remove();
          })
          p.muteki = app.fps * 2;
          self.damage(1);
          return true;
        }
      });
    },

    move: function(app) {
      var ps = app.pointers;
      var player = this.player;
      var MOVE_RATE = 1.5;
      this.isMoved = false;
      if (ps && ps.length > 0) {
        var p = ps[0];
        if (p.now) {
          if (p instanceof phina.input.Mouse && p.start) {
            // 一度話してからもう一度クリックした場合ワープする対策
          }
          else if (p.id === this.pid) {
            player.x += (p.x - this.prevx) * MOVE_RATE;
            player.y += (p.y - this.prevy) * MOVE_RATE;
          }
          else {
            this.pid = p.id;
          }
          this.prevx = p.x;
          this.prevy = p.y;
          this.isMoved = true;
        }
      }

    },

    onkeydown: function(e) {
      var Z = 90;
      var X = 88;
      var C = 67;
      if (e.keyCode === Z) {
        this.shotType = 'Sarada';
      }
      else if (e.keyCode === X) {
        this.shotType = 'Tikin';
      }
      else if (e.keyCode === C) {
        this.shotType = 'Isi';
      }
    },

    onkeyup: function(e) {
      var Z = 90;
      var X = 88;
      var C = 67;

      if (e.keyCode === Z && this.shotType === 'Sarada') {
        this.shotType = null;
      }
      if (e.keyCode === X && this.shotType === 'Tikin') {
        this.shotType = null;
      }
      if (e.keyCode === C && this.shotType === 'Isi') {
        this.shotType = null;
      }
    },

    toLighter: function(o) {
      (function f(o) {
        o.blendMode = 'lighter';
        o.children.forEach(f);
      })(o);
      return o;
    },

    checkPlayerPosition: function() {
      var p = this.player;
      if (p.x > SCREEN_WIDTH) p.x = SCREEN_WIDTH;
      if (p.x < 0) p.x = 0;
      if (p.y > PLAYER_BOTTOM) p.y = PLAYER_BOTTOM;
      if (p.y < PLAYER_TOP) p.y = PLAYER_TOP;
    },

    checkOniPosition: function() {
      this.oniLayer.children.forEach(function(oni) {
        if (oni.y > SCREEN_HEIGHT) {
          oni.y = SCREEN_HEIGHT;
          oni._destroy = true;
          oni.alpha = 0.1;
          oni.tweener.clear().to({
            y: 0,
            alpha: 1,
          }, 1000, 'swing').play().call(function() {
            oni._destroy = false;
          });
        }
      })
    },

    updateScoreLabel: function() {
      this.scoreLabel.text = this.score + '点';
    },

    addScore: function(score) {
      this.score += score;
      var isP = score >= 0;
      Label({
        text: isP ? ('+' + score) : score,
        fill: isP ? 'yellow' : 'red',
        fontSize: 40..p,
        x: isP ? 20..x : 30..x,
        y: isP ? 5..y : 0,
        align: 'left',
        baseline: 'top',
      }).addChildTo(this.uiLayer).tweener.to({
        y: isP ? 0 : 5..y,
      }, 500, 'swing').call(function() {
        this.target.remove();
      });
    },

    updateTimeLabel: function() {
      this.timeLabel.text = '残り' + (Math.max(this.time, 0) / 30).toFixed(1) + '秒';
    },

    damage: function(d) {
      var lifep = this.player.life -= d || 1;
      if (lifep < 0) {
        this.player.muteki = 0;
        this.lifeLayer.children.forEach(function(life) {
          life.tweener.clear().to({
            alpha: 0,
          }, 1000, 'swing').play();
        })
      }
      else {
        this.lifeLayer.children.forEach(function(life, i) {
          if (i >= lifep) {
            life.tweener.clear().to({
              alpha: 0,
            }, 1000, 'swing').play();
          }
        })
      }

    },

    addTime: function(time) {
      this.time += time;
      var score = (time / 30).toFixed(1) + '秒';
      var isP = time >= 0;
      Label({
        text: isP ? ('+' + score) : score,
        fill: isP ? 'yellow' : 'red',
        fontSize: 40..p,
        x: isP ? 70..x : 60..x,
        y: isP ? 5..y : 0,
        align: 'right',
        baseline: 'top',
      }).addChildTo(this.uiLayer).tweener.to({
        y: isP ? 0 : 5..y,
      }, 500, 'swing').call(function() {
        this.target.remove();
      });
    },

    update: function(app) {
      var self = this;
      if (this.isGameOver) {
        return;
      }
      this.move(app);
      this.checkPlayerPosition();
      this.testShotEnemy(app);
      this.testOniPlayer(app);
      this.checkOniPosition();
      this.layers.forEach(function(layer) {
        layer.children.slice(0).forEach(function(c) {
          if (c.x < RM_LEFT || c.x > RM_RIGHT || c.y < RM_TOP || c.y > RM_BOTTOM) c.remove();
        });
      });

      this.updateScoreLabel();
      this.updateTimeLabel();
      this.time--;
      this.data.time++;
      // var MAX_FRAME = 180;
      var MAX_FRAME = 4800;
      var MAX_ENEMY = 15;
      var MAX_ONI = 50;
      var ENEMY_RATE = 40 - MAX_ENEMY;
      var ONI_RATE = 240 - MAX_ONI;
      var rate = Math.min(app.frame, MAX_FRAME) / MAX_FRAME;
      this.enemyTask.waitTime = 40 - ENEMY_RATE * rate | 0;
      this.oniTask.waitTime = 240 - ONI_RATE * rate | 0;
      this.tensiTask.waitTime = (240 - ONI_RATE * rate) * 1.8 | 0;


      if (this.time <= 0) {
        this.isTimeOver = true;
        this.isGameOver = true;

        Label({
          text: 'タイムオーバー',
          fontSize: 80..p,
          x: CENTER_X,
          y: CENTER_Y,
          fill: 'blue',
          stroke: 'black',
          strokeWidth: 20..p,
        }).addChildTo(this).tweener.set({
          alpha: 0.5,
          scaleY: 0.1,
        }).to({
          alpha: 1,
          scaleY: 1,
        }, 1000, 'swing').call(function() {
          self.on('enterframe', function f(e) {
            if (e.app.frame % 20 !== 0) {
              return;
            }
            if (self.player.life > 0) {
              self.damage(1);
              self.addScore(200);
              self.updateScoreLabel();
            }
            else {
              self.gotoGameOverScene();
              self.off('enterframe', f);
            }
          });
        });
      }
      if (this.player.life <= -1) {
        this.isDeath = true;
        this.player.tweener.clear().to({
          rotation: 90,
        }, 200, 'swing').play();
        this.isGameOver = true;

        Label({
          text: 'ゲームオーバー',
          fontSize: 80..p,
          x: CENTER_X,
          y: CENTER_Y,
          fill: 'red',
          stroke: 'black',
          strokeWidth: 20..p,
        }).addChildTo(this).tweener.set({
          alpha: 0.5,
          scaleY: 0.1,
        }).to({
          alpha: 1,
          scaleY: 1,
        }, 1000, 'swing').call(function() {
          self.on('enterframe', function f(e) {
            if (e.app.frame % 3 !== 0) {
              return;
            }
            if (self.time > 0) {
              self.time -= 30;
              self.addScore(10);
              self.updateScoreLabel();
              self.updateTimeLabel();
            }
            else {
              self.gotoGameOverScene();
              self.off('enterframe', f);
            }
          });
        });
      }
    },
    gotoGameOverScene: function() {
      var self = this;
      this.scoreLabel.align = 'center';
      this.scoreLabel.tweener.to({
        x: CENTER_X,
        y: 30..y,
        fontSize: 100..p,
      }, 400, 'swing');

      Button({
        text: 'もう一回やる',
        width: 250..p,
        height: 60..p,
        fontSize: 30..p,
        fill: 'green',
        textColor: 'white',
        x: -250..p,
        y: 65..y,
      }).addChildTo(this).one('push', function() {
        self.exit({
          nextLabel: 'main',
        });
      }).tweener.to({
        x: 25..x,
      }, 400, 'swing');

      Button({
        text: 'ツイート',
        width: 250..p,
        height: 60..p,
        fontSize: 30..p,
        fill: '#1DA1F2',
        textColor: 'white',
        x: SCREEN_WIDTH + 250..p,
        y: 65..y,
      }).addChildTo(this).one('click', function() {
        var time = (self.data.time / 30).toFixed(1) + '秒';
        var text = [
          TITLE + '\n「' + self.score + '点」',
          time + '粘った!',
          '投げつけたもの↓',
          'サラダ: ' + self.data.sarada + '個',
          'サラダチキン: ' + self.data.tikin + '個',
          '石: ' + self.data.isi + '個',
        ].join('\n') + '\n';
        open(Twitter.createURL({
          text: text,
          hashtags: 'ahoge,phina_js,サラダとか投げつける人'
        }), '_blank', 'width=640,height=320');
      }).tweener.to({
        x: 75..x,
      }, 400, 'swing');

    },
  });

  phina.define('Sarada', {
    superClass: DisplayElement,

    init: function(o) {
      this.superInit(o);
      this.type = 'sarada';
      this.setBoundingType('circle');
      this.image = Sprite(this.type).addChildTo(this).setSize(this.radius * 3, this.radius * 3)
    },
    _static: {
    }
  });
  phina.define('Tikin', {
    superClass: DisplayElement,

    init: function(o) {
      this.superInit(o);
      this.type = 'tikin';
      this.setBoundingType('circle');
      this.image = Sprite(this.type).addChildTo(this).setSize(this.radius * 3, this.radius * 3)
    },
    _static: {
    }
  });

  phina.define('Isi', {
    superClass: DisplayElement,

    init: function(o) {
      this.superInit(o);
      this.type = 'isi';
      this.setBoundingType('circle');
      this.image = Sprite(this.type).addChildTo(this).setSize(this.radius * 3, this.radius * 3)
      this.tweener.by({
        rotation: [360, -360].pickup(),
      }, 360).setLoop(true);
    },
    _static: {
    }
  });



  phina.define('Enemy', {
    superClass: DisplayElement,

    init: function(o) {
      this.superInit(o);
      this.radius = o.radius || 50..p;
      this.setBoundingType('circle');
      this.suki = o.suki;
      this.image = Sprite(this.getSukiImage()).addChildTo(this).setSize(this.radius * 2, this.radius * 2);
      this.addSukiImages();

      this.umaiText = o.umaiText || 'うまい!';
      this.mazuiText = o.mazuiText || 'まずい...';
    },

    addSukiImages: function() {
      this.sukiImage = Sprite(this.suki).addChildTo(this).setSize(this.radius, this.radius);
      this.sukiImage.y = -this.radius * 1.5;
    },

    getSukiImage: function() {
      return this.suki + '_suki'
    },
    update: function() {
      var s = this;
      if (this._destroy) {
        return;
      }
      if (s.x < 0) {
        s.x = 0;
        s.movable.setDegree(90 + (s.movable.degree - 90) * -1);
      }
      else if (s.x > SCREEN_WIDTH) {
        s.x = SCREEN_WIDTH;
        s.movable.setDegree(90 + (s.movable.degree - 90) * -1);
      }
    },
    toMazu: function() {
      this.image.setImage(this.suki + '_mazu');
      this.image.setSize(this.radius * 2, this.radius * 2);
    },
    toSuki: function() {
      this.image.setImage(this.suki + '_suki');
      this.image.setSize(this.radius * 2, this.radius * 2);
    },

    isSuki: function(shot) {
      return shot.type === this.suki;
    },

    hit: function(shot, scene) {
      this._destroy = true;
      var isSuki = this.isSuki(shot);
      this.flare('hit', {
        shot: shot,
        scene: scene,
        suki: isSuki,
      });
      var l = Label({
        text: this.umaiText,
        fill: 'white',
        fontSize: 60..p,
        fill: 'navy'
      }).addChildTo(this);
      l.tweener.to({
        y: -200,
      }, 500).call(function() {
        this.target.remove();
      });
      if (isSuki) {
        this.flare('suki', {
          shot: shot
        });
      }
      else {
        l.text = this.mazuiText;
        l.fill = 'red'
        this.flare('mazu', {
          shot: shot
        });
      }

    },
    _static: {
    }
  });

  phina.define('SaradaSuki', {
    superClass: Enemy,

    init: function(o) {
      this.superInit({
        suki: 'sarada',
      });
      this.on('hit', function(e) {

        if (e.suki) {
          var isLine = this.y < CENTER_Y;
          e.scene.addScore(isLine ? 20 : 10);
          e.scene.addTime(15);
          this.tweener.to({
            scaleX: 1.2,
            scaleY: 1.2,
            rotation: [360, -360].pickup(),
          }, 300, 'swing').to({
            y: -300,
          }, 200, 'easeInBack').call(function() {
            this.target.remove();
          });
        }
        else {
          if (e.shot.type === 'isi') {
            e.scene.addScore(-10);
          }
          this.toMazu();

          this.movable.remove();
          this.movable = MovePattern4(this);
        }

      });
    },
  });


  phina.define('TikinSuki', {
    superClass: Enemy,

    init: function(o) {
      this.superInit({
        suki: 'tikin',
        umaiText: 'うめえ！！',
        mazuiText: 'まじ〜',
      });
      this.on('hit', function(e) {
        if (e.suki) {
          var isLine = this.y < CENTER_Y;
          e.scene.addScore(isLine ? 20 : 10);
          e.scene.addTime(15);
          this.tweener.to({
            scaleX: 1.2,
            scaleY: 1.2,
            rotation: [360, -360].pickup(),
          }, 300, 'easeOutBack').to({
            y: -300,
          }, 200, 'easeInBack').call(function() {
            this.target.remove();
          });
        }
        else {
          if (e.shot.type === 'isi') {
            e.scene.addScore(-10);
          }
          this.toMazu();
          this.movable.remove();
          this.movable = MovePattern4(this);
        }

      });
    },
  });

  phina.define('Oni', {
    superClass: Enemy,

    init: function(o) {
      this.superInit({
        suki: 'isi',
        umaiText: 'いてぇ！もうむり!',
        mazuiText: 'その程度か',
        radius: 80..p,
      });
      this.on('hit', function(e) {
        if (e.suki) {
          var isLine = this.y < CENTER_Y;
          e.scene.addScore(isLine ? 30 : 15);
          e.scene.addTime(20);
          // this.movable.remove();
          this.tweener.clear().to({
            scaleX: 0.8,
            scaleY: 0.8,
          }, 100, 'easeInBack').to({
            y: -300,
            x: Math.randint(- SCREEN_WIDTH, SCREEN_WIDTH * 2),
          }, 200, 'swing').call(function() {
            this.target.remove();
          });
        }
        else {
          e.scene.addScore(-5);
          this._destroy = false;
        }

      });
    },
  });

  phina.define('Tensi', {
    superClass: Enemy,

    init: function(o) {
      this.superInit({
        umaiText: '美味...',
        mazuiText: 'ぐふ...',
        radius: 80..p,
      });
      this.on('hit', function(e) {

        if (e.suki) {
          e.scene.addScore(this.y < CENTER_Y ? 40 : 20);
          e.scene.addTime(60);
          this.movable.setSpeed(0);
          this.alpha = 0.5;
          this.tweener.clear().to({
            y: -300,
          }, 2000).call(function() {
            this.target.remove();
          });
        }
        else {
          e.scene.addScore(-15);
          this.tweener.wait(200).to({
            alpha: 0,
            scaleX: 0.3,
          }, 500, 'swing').call(function() {
            this.target.remove();
          });
        }

      });
    },

    addSukiImages: function() {
      var self = this;
      ['sarada', 'tikin'].forEach(function(e, x) {
        var i = Sprite(e).addChildTo(self).setSize(self.radius, self.radius);
        i.y = -self.radius * 1.5;
        i.x = (x + 0.5) / 2 * self.radius * 2 - self.radius;
      });
    },

    getSukiImage: function() {
      return 'tensi';
    },

    isSuki: function(shot) {
      return ['sarada', 'tikin'].indexOf(shot.type) !== -1;
    }
  });

  phina.define('Fire', {
    superClass: DisplayElement,

    init: function(o) {
      this.superInit(o);
      this.setBoundingType('circle');
      this.image = Sprite(Fire.image).addChildTo(this).setSize(this.radius * 3, this.radius * 3)
    },
    _static: {
      image: (function() {
        return Label({
          fontSize: 50,
          text: '🔥',
        }).flare('enterframe').canvas
      }())
    }
  });

  phina.main(function() {
    var app = GameApp({
      // startLabel: 'main',
      startLabel: 'title',
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      backgroundColor: 'skyblue',
      assets: ASSETS,
    });
    app.domElement.addEventListener('touchend', function dummy() {
      var s = phina.asset.Sound();
      s.loadFromBuffer();
      s.play().stop();
      app.domElement.removeEventListener('touchend', dummy);
    });
    app.run();
  });


  // 時間経過でタスクイベントを発火するようにする
  phina.define('TaskAccessory', {
    superClass: Accessory,
    hasTask: false,
    waitTime: 0,
    count: 0,
    // task イベント発火時に自動的に消化したことにする
    auto: false,

    tasks: null,

    init: function(target) {
      this.superInit(target);
      if (target) {
        this.attachTo(target);
      }
      this.tasks = [];

      this._initDefaultEventListener();
    },

    // 継承先でinitで追加したいイベントを追加
    // 継承によるイベントリスナーの汚染を防ぐ
    _initDefaultEventListener: function() {
    },

    addTask: function(task, self) {
      this.tasks.push(task.bind(self || this));
      return this;
    },

    done: function() {
      this.hasTask = false;
      this.fire({
        type: 'done'
      });
      return this;
    },

    enableAuto: function() {
      this.auto = true;
      return this;
    },

    disableAuto: function() {
      this.auto = false;
      return this;
    },

    setWaitTime: function(time) {
      this.waitTime = time;
      return this;
    },

    setCount: function(c) {
      this.count = c;
      return this;
    },
    _update: function(app) {
      // 継承して使う
    },
    update: function(app) {
      this._update(app);
      if (!this.hasTask) {
        this.count -= 1;
        if (this.count <= 0) {
          this.hasTask = true;
        }
      }
      if (this.hasTask) {
        this.target.fire({
          type: 'task',
          task: this,
          app: app,
        });
        this.count = this.waitTime;
        if (this.auto) {
          this.callTask(app)
        }
      }
    },
    callTask: function(app, done) {
      if (!this.hasTask) return false;
      var self = this;
      this.tasks.forEach(function(f) {
        f(app);
      });
      if (typeof done === 'undefined' || done) {
        this.done();
      }
      else {
        this.hasTask = false;
      }
      return true;
    },

  });

  // タスクが発生するたびに角度が変わる(消化した後に)
  phina.define('DegreeTask', {
    superClass: 'TaskAccessory',
    speed: 1,
    degree: 0,
    degreeStart: 0,
    degreeEnd: 360,
    adjust: true,
    init: function(target) {
      this.superInit(target);
    },

    setDegree: function(d) {
      this.degree = d;
      return this;
    },

    setDegreeEnd: function(d) {
      this.degreeEnd = d;
      return this;
    },

    setDegreeRange: function(start, end, degree) {
      this.degree = degree || start;
      this.degreeStart = start;
      this.degreeEnd = end;
      return this;
    },

    setDegreeStart: function(d) {
      this.degreeStart = d;
      return this;
    },

    setSpeed: function(s) {
      this.speed = s;
      return this;
    },

    _initDefaultEventListener: function() {
      this.on('done', this._addDegreeTask);
    },

    _addDegreeTask: function(e) {
      this.degree += this.speed;
      while (this.degreeStart > this.degree) {
        if (this.adjust) {
          this.degree = this.degreeEnd;
        }
        else {
          this.degree = this.degreeEnd - this.degreeStart + this.degree;
        }
      }
      while (this.degreeEnd < this.degree) {
        if (this.adjust) {
          this.degree = this.degreeStart;
        }
        else {
          this.degree = this.degree - this.degreeEnd + this.degreeStart;
        }
      }
    },


  });

  phina.define('ReversibleDegreeTask', {
    superClass: DegreeTask,
    rev: 1,
    init: function(target) {
      this.superInit(target);
    },
    _addDegreeTask: function(e) {
      this.degree += this.rev * this.speed;
      if (this.degree <= this.degreeStart) {
        this.degree = this.degreeStart;
        this.rev *= -1;
      }
      if (this.degree >= this.degreeEnd) {
        this.degree = this.degreeEnd;
        this.rev *= -1;
      }
    }
  });

  // abstract
  phina.define('FactoryElement', {
    superClass: DisplayElement,
    init: function() {
      this.superInit();
    },
    createElement: function() {
      return [];
    }

  });

  // target を円形でランダム生成する
  phina.define('CircleRangeFactory', {
    superClass: FactoryElement,
    target: null,
    init: function(target) {
      this.superInit();
      this.num = 1;
      this.target = target;
      this.setBoundingType('circle')
    },
    setNum: function(n) {
      this.num = n;
      return this;
    },

    // ここではいったん radius の範囲にランダムで、 num の数生成
    createElement: function() {
      if (!this.target) return [];

      var self = this;
      var r = this.radius;
      var x = this.x;
      var y = this.y;
      var elms = [];
      this.num.times(function(i) {
        var rad = Math.randfloat(0, Math.PI * 2);
        var len = Math.randfloat(0, r);
        elms.push(self.target({
          x: x + Math.cos(rad) * len,
          y: y + Math.sin(rad) * len,
        }));
      });

      return elms;
    },
  });


  phina.define('WayFactory', {
    superClass: FactoryElement,
    distance: 1,
    way: 1,
    target: null,

    step: 1,

    degree: 0,

    init: function(target) {
      this.superInit();
      this.target = target;
    },
    setWay: function(n) {
      this.way = n;
      return this;
    },

    setDistance: function(n) {
      this.distance = n;
      return this;
    },
    setTarget: function(target) {
      this.target = target;
      return this;
    },

    setStep: function(v) {
      this.step = v;
      return this;
    },

    setDegree: function(v) {
      this.degree = v;
      return this;
    },

    createElement: function(target) {
      var target = this.target || target;
      if (!target) return [];

      var self = this;
      var x = this.x;
      var y = this.y;
      var elms = [];
      var way = this.way;
      var deg = this.degree;
      var step = this.step;

      var distance = this.distance;
      if (way % 2 === 0) {
        deg += step / 2;
      }
      deg -= (way / 2 | 0) * step;
      for (var i = 0; i < way; ++i) {
        var rad = deg.toRadian();
        elms.push(target({
          x: x + Math.cos(rad) * distance,
          y: y + Math.sin(rad) * distance,
          degree: deg,
        }));
        deg += step;
      }


      return elms;
    },
  });

  phina.define('MovePattern4', {
    superClass: 'DegreeMovable',

    init: function(target) {
      this.superInit(target);
      this.speed = 50;
      this.degree = -90;

      this.addAccessory(Tweener(this).to({
        speed: 0
      }, 120).to({
        speed: -50
      }, 1500, 'easeOutSine'))
    }
  });

  phina.define('MovePattern3', {
    superClass: 'DegreeMovable',

    init: function(target) {
      this.superInit(target);
      this.speed = 80;
      this.addAccessory(Tweener(this).wait(30).set({
        degree: 180,
      }).wait(60).set({
        degree: 0
      }).wait(60).set({
        degree: 180
      }).wait(80).set({
        degree: 0
      }).wait(80).set({
        degree: 180
      }));

      this.addAccessory(Tweener(this).to({
        speed: 5
      }, 800, 'swing'))
    }
  });

  phina.define('MovePattern2', {
    superClass: 'DegreeMovable',

    init: function(target) {
      this.superInit(target);
      this.speed = 15;
      this.addAccessory(Tweener(this).to({
        degree: 360 * 4 + 90 + 30
      }, 1500, 'easeOutCirc'));
    }
  });

  phina.define('MovePattern1', {
    superClass: 'DegreeMovable',

    init: function(target) {
      this.superInit(target);
      this.addAccessory(Tweener(this).to({
        degree: 180
      }, 250).to({
        degree: 0
      }, 250).to({
        degree: 180
      }, 250).to({
        degree: 0
      }, 250).to({
        degree: 270,
      }, 500, 'easeInBack')
        .wait(500)
        .to({
          degree: 90
        }, 1500, 'easeOutElastic'));
    }
  });

  phina.define('DegreeMovable', {
    superClass: Accessory,
    _degree: 0,
    _radian: 0,
    _cos: 0,
    _sin: 0,
    speed: 10,
    isPlaying: false,
    rotationEnabled: false,
    originRotation: 0,

    init: function(target) {
      this.superInit(target);
      if (target) {
        this.attachTo(target);
      }
      this.degree = 0;
      this.accessories = [];
    },

    addAccessory: function(a) {
      this.accessories.push(a);
    },

    enableRotation: function() {
      this.rotationEnabled = true;
      return this;
    },

    disableRotation: function() {
      this.rotationEnabled = false;
      return this;
    },

    setOriginRotation: function(r) {
      this.originRotation = r;
      return this;
    },

    setDegree: function(deg) {
      this.degree = deg;
      return this;
    },

    setSpeed: function(sp) {
      this.speed = sp;
      return this;
    },

    play: function() {
      this.isPlaying = true;
      return this;
    },

    stop: function() {
      this.isPlaying = false;
      return this;
    },

    update: function(app) {
      var self = this;
      // this.fire({type: 'enterframe', app: app});
      this.accessories.forEach(function(a) {
        a.update(app);
      });
      this.target.position.add({
        x: this.speed * this._cos,
        y: this.speed * this._sin,
      });

      if (this.rotationEnabled) {
        this.target.rotation = this.originRotation + this._degree;
      }
    },

    _accessor: {
      degree: {
        get: function() {
          return this._degree;
        },

        set: function(v) {
          this._degree = v;
          var rad = this._radian = v * Math.PI / 180;
          this._cos = Math.cos(rad);
          this._sin = Math.sin(rad);
        }
      }
    }
  });

})(window);