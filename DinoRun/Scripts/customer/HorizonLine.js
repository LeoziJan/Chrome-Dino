

HorizonLine.dimensions = {
	WIDTH: 600,    //宽600
	HEIGHT: 12,    //高12像素
	YPOS: 127    //在canvas中的位置
};
var spriteDefinition = {
	HORIZON: { x: 2, y: 54}//地面在雪碧图中的位置
 };
// /**
//* canvas 地面将绘制到此画布上
//* spritePos 地面在雪碧图中的坐标
//*/
 function HorizonLine(canvas, spritePos) {
		this.spritePos = spritePos;
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.dimensions = HorizonLine.dimensions;	
		//在雪碧图中坐标为2和602处分别为不同的地形
		this.sourceXPos = [this.spritePos.x, this.spritePos.x + this.dimensions.WIDTH];	
		this.xPos = []; //地面在画布中的x坐标
		this.yPos = 0;  //地面在画布中的y坐标	
		this.bumpThreshold = 0.5;    //随机地形系数	
		this.setSourceDimesions();
		this.draw();
};

HorizonLine.prototype = {
	setSourceDimesions: function () {
	//地面在画布上的位置
	this.xPos = [0, this.dimensions.WIDTH];//0,600
	this.yPos = this.dimensions.YPOS;	
	},//随机地形
      getRandomType: function () {
	//返回第一段地形或者第二段地形
	return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
		
	},draw: function() {
		//使用9参数的drawImage方法
		this.ctx.drawImage(imgSprite,
				this.sourceXPos[0], this.spritePos.y,
				this.dimensions.WIDTH, this.dimensions.HEIGHT,
				this.xPos[0], this.yPos,
				this.dimensions.WIDTH, this.dimensions.HEIGHT);
		
		this.ctx.drawImage(imgSprite,
					this.sourceXPos[1], this.spritePos.y,
					this.dimensions.WIDTH, this.dimensions.HEIGHT,
					this.xPos[1], this.yPos,
					this.dimensions.WIDTH, this.dimensions.HEIGHT);
		
	},updateXPos: function(pos, increment) {
			var line1 = pos,
			line2 = pos === 0 ? 1 : 0;
		
			this.xPos[line1] -= increment;
			this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;
		
			//若第一段地面完全移出canvas外
			if (this.xPos[line1] <= -this.dimensions.WIDTH) {
			//则将其移动至canvas外右侧
			this.xPos[line1] += this.dimensions.WIDTH * 2;
			//同时将第二段地面移动至canvas内
			this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
			
			//选择随机地形
			this.sourceXPos[line1] = this.getRandomType() + this.spritePos.x;
		 }		
	},update: function(deltaTime, speed) {
		var increment = Math.floor(speed * (FPS / 1000) * deltaTime);		
		if (this.xPos[0] <= 0) {//交换地面一和二
			this.updateXPos(0, increment);			
		} else {
			this.updateXPos(1, increment);			
		}
		this.draw();		
		},
		reset: function() {
		this.xPos[0] = 0;
		this.xPos[1] = this.dimensions.WIDTH;		
	}
};