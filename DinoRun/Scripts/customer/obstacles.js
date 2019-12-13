
Obstacle.MAX_GAP_COEFFICIENT = 1.5;
//每组障碍物的最大数量
Obstacle.MAX_OBSTACLE_LENGTH = 3;
//相邻的障碍物类型的最大重复数
Obstacle.MAX_OBSTACLE_DUPLICATION = 2;

Obstacle.types = [
	    {
		      type: 'CACTUS_SMALL', //小仙人掌
		       width: 17,  //宽
		      height: 35, //高
		  yPos: 105,  //在画布上的y坐标
		    multipleSpeed: 4,
		       minGap: 120,    //最小间距
		        minSpeed: 0    //最低速度
	},
	  {
		       type: 'CACTUS_LARGE',   //大仙人掌
		        width: 25,
		        height: 50,
		         yPos: 90,
		       multipleSpeed: 7,
		        minGap: 120,
		         minSpeed: 0
	},
	     {
		        type: 'PTERODACTYL',    //翼龙
		        width: 46,
		         height: 40,
		       yPos: [100, 75, 50], //有高、中、低三种高度
		         multipleSpeed: 999,
	        minSpeed: 8.5,
	       minGap: 150,
	       numFrames: 2,   //有两个动画帧
		        frameRate: 1000/6,  / / 动画帧的切换速率，这里为一秒6帧
         speedOffset: .8 //速度修正
     }
];

/**
  2  * 绘制障碍物构造函数
  3  * @param canvas
  4  * @param type 障碍物的类型
  5  * @param spriteImgPos 雪碧图坐标
  6  * @param dimensions 屏幕尺寸
  7  * @param gapCoefficient 障碍物间隙
  8  * @param speed 障碍物移动速度
  9  * @param opt_xOffset 障碍物水平偏移量
 10  * @constructor
 11  */
12 function Obstacle(canvas, type, spriteImgPos, dimensions, gapCoefficient, speed, opt_xOffset) {
	13     this.ctx = canvas.getContext('2d');
	14     this.spritePos = spriteImgPos;
	15     //障碍物类型(仙人掌、翼龙)
	16     this.typeConfig = type;
	17     this.gapCoefficient = gapCoefficient;
	18     //每个障碍物的数量(1~3)
	19     this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
	20     this.dimensions = dimensions;
	21     //表示该障碍物是否可以被移除
	22     this.remove = false;
	23     //水平坐标
	24     this.xPos = dimensions.WIDTH + (opt_xOffset || 0);
	25     this.yPos = 0;
	26     this.width = 0;
	27     this.gap = 0;
	28     this.speedOffset = 0;   //速度修正
	29
	30     //障碍物的动画帧
	31     this.currentFrame = 0;
	32     //动画帧切换的计时器
	33     this.timer = 0;
	34
	35     this.init(speed);
	36
}
37 ```
 38 
 39 实例方法：
 40 ```javascript
41 Obstacle.prototype = {
	42     init: function(speed) {
		43         //如果随机障碍物是翼龙，则只出现一只
		44         //翼龙的multipleSpeed是999，远大于speed
		45         if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
			46             this.size = 1;
			47
		}
		48         //障碍物的总宽度等于单个障碍物的宽度乘以个数
		49         this.width = this.typeConfig.width * this.size;
		50
		51         //若障碍物的纵坐标是一个数组
		52         //则随机选取一个
		53         if (Array.isArray(this.typeConfig.yPos)) {
			54             var yPosConfig = this.typeConfig.yPos;
			55             this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)];
			56
		} else {
			57             this.yPos = this.typeConfig.yPos;
			58
		}
		59
		60         this.draw();
		61
		62         //对翼龙的速度进行修正，让它看起来有的飞得快一些，有些飞得慢一些
		63         if (this.typeConfig.speedOffset) {
			64             this.speedOffset = Math.random() > 0.5 ? this.typeConfig.speedOffset :
				65 - this.typeConfig.speedOffset;
			66
		}
		67
		68         //障碍物之间的间隙，与游戏速度有关
		69         this.gap = this.getGap(this.gapCoefficient, speed);
		70
	},
	71     //障碍物之间的间隔，gapCoefficient为间隔系数
 72     getGap: function (gapCoefficient, speed) {
		73         var minGap = Math.round(this.width * speed +
			74             this.typeConfig.minGap * gapCoefficient);
		75         var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
		76         return getRandomNum(minGap, maxGap);
		77
	},
	78     //判断障碍物是否移出屏幕外
 79     isVisible: function () {
		80         return this.xPos + this.width > 0;
		81
	},
	82     draw: function() {
		83         //障碍物宽高
		84         var sourceWidth = this.typeConfig.width;
		85         var sourceHeight = this.typeConfig.height;
		86
		87         //根据障碍物数量计算障碍物在雪碧图上的x坐标
		88         //this.size的取值范围是1~3
		89         var sourceX = (sourceWidth * this.size) * (0.5 * (this.size - 1)) +
			90             this.spritePos.x;
		91
		92         // 如果当前动画帧大于0，说明障碍物类型是翼龙
		93         // 更新翼龙的雪碧图x坐标使其匹配第二帧动画
		94         if (this.currentFrame > 0) {
			95             sourceX += sourceWidth * this.currentFrame;
			96
		}
		97         this.ctx.drawImage(imgSprite,
			98             sourceX, this.spritePos.y,
			99             sourceWidth * this.size, sourceHeight,
			100             this.xPos, this.yPos,
			101             sourceWidth * this.size, sourceHeight);
		102
	},
	103     //单个障碍物的移动
104     update: function (deltaTime, speed) {
		105         //如果障碍物还没有移出屏幕外
		106         if (!this.remove) {
			107             //如果有速度修正则修正速度
			108             if (this.typeConfig.speedOffset) {
				109                 speed += this.speedOffset;
				110
			}
			111             //更新x坐标
			112             this.xPos -= Math.floor((speed * FPS / 1000) * deltaTime);
			113
			114             // Update frame
			115             if (this.typeConfig.numFrames) {
				116                 this.timer += deltaTime;
				117                 if (this.timer >= this.typeConfig.frameRate) {
					118                     //在两个动画帧之间来回切换以达到动画效果
					119                     this.currentFrame =
						120                         this.currentFrame == this.typeConfig.numFrames - 1 ?
							121                             0 : this.currentFrame + 1;
					122                     this.timer = 0;
					123
				}
				124
			}
			125             this.draw();
			126
			127             if (!this.isVisible()) {
				128                 this.remove = true;
				129
			}
			130
		}
		131
	},
	132     //管理多个障碍物移动
133     updateObstacles: function (deltaTime, currentSpeed) {
		134         //保存一个障碍物列表的副本
		135         var updatedObstacles = Obstacle.obstacles.slice(0);
		136
		137         for (var i = 0; i < Obstacle.obstacles.length; i++) {
			138             var obstacle = Obstacle.obstacles[i];
			139             obstacle.update(deltaTime, currentSpeed);
			140
			141             //移除被标记为删除的障碍物
			142             if (obstacle.remove) {
				143                 updatedObstacles.shift();
				144
			}
			145
		}
		146         Obstacle.obstacles = updatedObstacles;
		147
		148         if (Obstacle.obstacles.length > 0) {
			149             //获取障碍物列表中的最后一个障碍物
			150             var lastObstacle = Obstacle.obstacles[Obstacle.obstacles.length - 1];
			151
			152             //若满足条件则添加障碍物
			153             if (lastObstacle &&
				154                 lastObstacle.isVisible() &&
					155(lastObstacle.xPos + lastObstacle.width + lastObstacle.gap) <
					156                 this.dimensions.WIDTH) {
				                 this.addNewObstacle(currentSpeed);
				
			}
			
		} else {//若障碍物列表中没有障碍物则立即添加
			            this.addNewObstacle(currentSpeed);
			
		}
		
	},
	     //随机添加障碍
   addNewObstacle: function (currentSpeed) {
		        //随机选取一种类型的障碍
		         var obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
		        var obstacleType = Obstacle.types[obstacleTypeIndex];
		
		        //检查随机取到的障碍物类型是否与前两个重复
		         //或者检查其速度是否合法，这样可以保证游戏在低速时不出现翼龙
		         //如果检查不通过，则重新再选一次直到通过为止
		        if (this.duplicateObstacleCheck(obstacleType.type) || currentSpeed < obstacleType.minSpeed) {
			            this.addNewObstacle(currentSpeed);
		
		} else {
			            //检查通过后，获取其雪碧图中的坐标
			             var obstacleSpritePos = this.spritePos[obstacleType.type];
			           //生成新的障碍物并存入数组
			            Obstacle.obstacles.push(new Obstacle(c, obstacleType, obstacleSpritePos, this.dimensions,
				                this.gapCoefficient, currentSpeed, obstacleType.width));
			            //同时将障碍物的类型存入history数组
			             Obstacle.obstacleHistory.unshift(obstacleType.type);
			
		}
	
		         //若history数组的长度大于1，则清空最前面的两个
		         if (Obstacle.obstacleHistory.length > 1) {
			             Obstacle.obstacleHistory.splice(Obstacle.MAX_OBSTACLE_DUPLICATION);
		
		}

	},
    //检查障碍物是否超过允许的最大重复数
    duplicateObstacleCheck: function (nextObstacleType) {
		         var duplicateCount = 0;
		        //与history数组中的障碍物类型比较，最大只允许重得两次
		         for (var i = 0; i < Obstacle.obstacleHistory.length; i++) {
			             duplicateCount = Obstacle.obstacleHistory[i] === nextObstacleType ? duplicateCount + 1 : 0;
			
		}
		        return duplicateCount >= Obstacle.MAX_OBSTACLE_DUPLICATION;
		
	}
};