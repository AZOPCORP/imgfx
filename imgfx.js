(function ($)
{

  $.fn.imgfx = function (params)
  {
    ///Input parameters
    params = $.extend(
    {
      mode: "tv",//DIFFERENT MODES : "tv","glitch","zoom","rotozoom","pixelate","kaleid","bumpingrect","crazyrect",
      
      canvassize:2,//DEVIDE SIZE TO IMPROVE CANVAS PERFORMANCES The more you reduce the size the more you gain perf but you get bigger pixels

     
      blendMode: "difference",//DEFINE A globalCompositeOperation BLEND MODE FOR FX THAT USE IT
      
      crossOrigin:"Anonymous", //Define CORS param

      //TV SIMULATOR SPECIFIC CONTROLS
      noise: true,//ENNABLE NOISE LAYER
      grainsize: 1,//NOISE GRAIN SIZE
      desyncspeed: 5,//SYNC DISPLACEMENT SPEED
      syncup: true,//TRUE IMAGE MOVE UP FALSE IMAGE MOVE DOWN
      scanspacing: 22,//SPACE BETWEEN SCANLINES
      scanheight: 4,//SIZE OF SCANLINES
      scanspeed: 1,//SCANLINE DISPLACEMENT SPEED DEFAULT MOVE DOWN, NEGATIVE INT MOVE UP
      flickerseed: 10,//FLICKERING LESS THE NUMBER MORE IT FLICKERS    
      latunsync: 0,//DISPLACE IMAGE RANDOMLY ON X AXIS
      sidenoise: "left", // DRAW LATERAL NOISE LAYER options:"left","right","both","none" 
      sidenoiseforce: 8,//MAX FORCE OF SIDENOISE
      Themecolor: "#f00",//DEFINE A COLOR OF TV

      //BASE64GLITCH SPECIFIC CONTROLS
      base64glitchforce:0,//BASE64 DESTROY
      base64glitchInterval:300,//

      //LATERAL GLITCH SPECIFIC CONTROLS 
      glichforce: 80,
      glitchclear: true,
      glitchdisplayimage: true,

      //PIXELLATE SPECIFIC CONTROLS
      pixelsize: 100,//MAX SIZE 
      squared: true,//SQUARED PIXELS pixel width = pixel height
      smooth: false,//ENNABLE SOOTHING
      
      //BOUNCING RECT SPECIFIC CONTROLS
      //THIS FX USE THE blendMode PARAMETER
      rectNum: 4,//HOW MANY BOUNCING SQUARES
      rectSquare: false,//SQUARES OR RECTANGLES
      rectSpeed: 6,//DISPLACEMENT SPEED
      rectClear: true,//CLEAR SCREEN EVERY FRAME?


      ///ZOOM SPECIFIC CONTROLS
      zoomRotationSpeed:1,
      zoomSpeed:0.05,
      zoomMinScale:0.001,
      zoomMaxScale:15,
      zoomXframe:30,


     //ROTOZOOM SPECIFIC CONTROLS
      rotozoomSpeed:0.01,//ZOOMING SPEED 
      rotozoomRotateSpeed:0.2,//ROTATION SPEED [use max as 0.9999...]
      rotozoomMaxScale:5,//MAX ZOOM
      rotozoomMinScale:0.001,//MAX DE-ZOOM

     
     //KALEIDOSCOPE SPECIFIC CONTROLS
     thetaAngle:360,
     thetaDiv:30,

     //RANDOMRECT SPECIFIC CONTROLS
     rdmMaxRect:20,///MAX NUMBER OF RECTANGLES
     rdmClearBeforeDraw:true///clear canvas every frame


    }, params);



 this.each(function ()
    {


      //First of all get's our image elements from DOM
      var $t = $(this);

      //Retreive the image source URL
      var url = $t.attr('src');

      //Get size of image
      var H = $t.height();
      var W = $t.width();
    
      //Divide this size with our parameter
      H= Math.floor(H/params.canvassize);
      W= Math.floor(W/params.canvassize);


      ///CREATE OUR CANVAS OUTPUT 
      var output = document.createElement("canvas");
      var outctx = output.getContext('2d');
      //Give this canvas a size
      output.height = H;
      output.width = W;
      
      ///CREATE ANOTHER CANVAS USE IN OUR FX  WE WILL PRINT THE IMAGE LATER USING THE smartLoad() FUNCTION
      var imgcanvas = document.createElement("canvas");
      var imgctx = imgcanvas.getContext('2d');
      //Give this canvas same size as output
      imgcanvas.height=H;
      imgcanvas.width=W;

      //setting up some responsive properties to our output canvas
       output.style.display="block";
       output.style.width="100%";
       output.style.height="auto";



       
      // $t.insertBefore(output);
       //$t.hide();

      //REPLACE <IMG /> ELEMENT BY OUR OUTPUT CANVAS
       $t.replaceWith(output);

       //LET'S USE A BIG SWITCH TO CHOOSE OUR FX :)
       switch(params.mode) {
    case "tv":
   

        smartLoad(url,W,H,function(i,w,h){
        imgctx.drawImage(i,0,0,w,h);
        var x = 0;
        var min = 0 - H;
        var step = params.desyncspeed;

        var scanindex = 0;

        

        var fx = document.createElement("canvas");
        var fxctx = fx.getContext('2d');

        
        drawTv();

          function drawfx(ctx)
  {

    if (params.sidenoise == "none")
    {

    }
    else
    {
      fx.height = H;
      fx.width = W;
      fxctx.clearRect(0, 0, W, H);
      for (i = 0; i < H; i++)
      {

        fxctx.fillStyle = params.Themecolor;

        //ctx.globalCompositeOperation = "multiply";
        if (params.sidenoise == "left" || params.sidenoise == "both")
        {
          fxctx.fillRect(0, i, randInt(0, params.sidenoiseforce), randInt(0, 10));
        }
        if (params.sidenoise == "right" || params.sidenoise == "both")
        {
          fxctx.fillRect(W, i, -randInt(0, params.sidenoiseforce), randInt(0, 10));
        }

      }
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(fx, 0, 0);
    }
  }


//4-CREATE SOME SCANLINES
  function scanlines(ctx)
  {

    for (i = 0; i < H; i += params.scanspacing)
    {

      ctx.fillStyle = params.Themecolor;

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "overlay";
      ctx.fillRect(0, i + scanindex, W, params.scanheight);

    }
    scanindex += params.scanspeed;

    if (scanindex >= params.scanspacing)
    {
      scanindex = 0;
    }

  }

          function drawTv()
  {
    var g = randInt(0, params.flickerseed);
    output.height = H;
    output.width = W;


      if (params.noise)
    {
      var nz = document.createElement('canvas');
      var nzctx = nz.getContext('2d');
      nz.height = H / params.grainsize;
      nz.width = W / params.grainsize;
      var w = W / params.grainsize,
        h = H/ params.grainsize,
        idata = outctx.createImageData(w, h),
        buffer32 = new Uint32Array(idata.data.buffer),
        len = buffer32.length,
        i = 0;

      for (; i < len;)
        buffer32[i++] = ((255 * Math.random()) | 50) << 24;

      nzctx.putImageData(idata, 0, 0);

    }
   nzctx.fillStyle=params.Themecolor;
   nzctx.globalCompositeOperation="multiply";
   nzctx.globalAlpha="0.4";
   nzctx.fillRect(0,0,W,H); 
   outctx.globalCompositeOperation = params.blendMode;
   outctx.drawImage(nz,0,0,W,H);
    scanlines(outctx);


    





    if (params.syncup)
    {
      outctx.drawImage(imgcanvas, randInt(-params.latunsync, params.latunsync), x);
      outctx.drawImage(imgcanvas, randInt(-params.latunsync, params.latunsync), x + H);
      x -= step;
      if (x < min)
      {
        x = 0;
      }


    }
    else
    {

      outctx.drawImage(imgcanvas, randInt(-params.latunsync, params.latunsync), x);
      outctx.drawImage(imgcanvas, randInt(-params.latunsync, params.latunsync), x - H);
      x += step;
      if (x > H)
      {
        x = 0;
      }
    }




    if (g >= params.flickerseed-1)
    {


      outctx.fillStyle = "#fff";
      outctx.globalCompositeOperation = "multiply";
      outctx.fillRect(0, 0, W, H);
      outctx.fillStyle = params.Themecolor;
      outctx.globalAlpha = 0.5;
      outctx.globalCompositeOperation = "multiply";
      outctx.fillRect(0, 0, W, H);

    }
    drawfx(outctx);
    console.log('im here!');
   // output = null;
    //outctx = null;
  
    window.requestAnimationFrame(drawTv);

  }


     

        });


        break;
    case "glitch":
        
smartLoad(url,W,H,function(i,w,h){

  imgctx.drawImage(i,0,0,w,h);
glitchanim();
});

        
        break;
    case "zoom":   
    smartLoad(url,W,H,function(i,w,h){
       // imgctx.drawImage(i,0,0,w,h);
          var scale = params.zoomRotationSpeed;
        var interval = params.zoomSpeed;
        var cx = W / 2;
        var cy = H / 2;
        var clearindex=0;
        zoom();
        function zoom()
        {
           if(clearindex == params.zoomXframe-1){
            //outctx.clearRect(0,0,W,H);
            imgctx.clearRect(0,0,W,H);
           // console.log("clear");
          }

         // console.log(clearindex);
          imgctx.translate(w / 2, w / 2);


          imgctx.rotate(Math.PI / 180);

          imgctx.translate(-w / 2, -w / 2);
          imgctx.save();
          imgctx.translate(cx, cy);

          imgctx.scale(scale, scale);
          imgctx.globalCompositeOperation = params.blendMode;
          imgctx.drawImage(i, -w / 2, -w / 2);





          imgctx.restore();
          outctx.drawImage(i, 0, 0, w, h);

          outctx.drawImage(imgcanvas, 0, 0, W, H);

          scale += interval;
          if (scale < params.zoomMinScale || scale > params.zoomMaxScale)
          {
            interval *= -1;
          }
          clearindex++;
          if(clearindex>=params.zoomXframe){clearindex=0}
          requestAnimationFrame(zoom);
        }
});


        break;
   
    case "rotozoom": 
        H = W = 256;

        var alpha = 0;
        var alphainc = params.rotozoomRotateSpeed * Math.PI / 180;
        var zoom = 1;
        var zoominc = params.rotozoomSpeed;



        var datasource;
        var pixelssource;



        var datatarget = outctx.createImageData(W, H);
        var pixelstarget = datatarget.data;

          smartLoad(url,W,H,function(i,w,h){
          
          imgcanvas.height = output.height = h;
          imgcanvas.width = output.width = w;

          imgctx.drawImage(i, 0, 0, w, h);

          outctx.drawImage(imgcanvas, 0, 0);

          datasource = imgctx.getImageData(0, 0, w, h);
          pixelssource = datasource.data;
          redraw();
          function redraw()
        {

          alpha += alphainc;

          zoom += zoominc;

          if (zoom < params.rotozoomMinScale || zoom > params.rotozoomMaxScale) zoominc = -zoominc;


          cosa = Math.cos(alpha) * zoom;
          sina = Math.sin(alpha) * zoom;

          for (var y = 0; y < 256; y++)
          {

            cosy = cosa * (y - 128);

            siny = sina * (y - 128);
            for (var x = 0; x < 256; x++)
            {

              cosx = cosa * (x - 128);

              sinx = sina * (x - 128);

              xsrc = parseInt(cosx - siny - 128) & 255;
              ysrc = parseInt(sinx + cosy - 128) & 255;

              var offsetsource = (ysrc << 10) + (xsrc << 2);

              var offsettarget = (y << 10) + (x << 2);

              for (var k = 0; k < 4; k++) pixelstarget[offsettarget + k] = pixelssource[offsetsource + k];
            }
          }

          outctx.putImageData(datatarget, 0, 0);
          window.requestAnimationFrame(redraw);

        }

});
         break;
      case "pixelate":
        smartLoad(url,W,H,function(i,w,h){
              imgctx.drawImage(i,0,0,w,h);
              pixelate();
 });
         break;  
       case "base64":
        smartLoad(url,W,H,function(i,w,h){
              imgctx.drawImage(i,0,0,w,h);
               var dataurl = imgcanvas.toDataURL("image/jpeg");
               var input = dataurl.replace('data:image/jpeg;base64,','');
         base64glitcher(input,outctx);
         setInterval( function() { base64glitcher(input,outctx); }, params.base64glitchInterval );
 });
    function base64glitcher(input,outputctx)
    {
      var chars1 = ["0",")","<",">",".","*","&","£","%","~","#","+","a","!","|","-"];
      var chars2 = ["a","b","c","d","e","f","z","x","v","n","m","o","i","y","q","w"];
      if( Math.floor((Math.random()*2)+1) == 2 ) 
        { var chars = chars2; } 
      else 
        { var chars = chars1; }
      var glitch_levels = ["64","128","256","1024","2048"];
      var optionVal = params.base64glitchforce;
      var splitNum = glitch_levels[optionVal];
      var newdata;
      try {
        var t = input;
        newdata = atob(t);
          }
      catch(err) {
      var t = input;
       newdata = t;
      }
      var chunkLength = parseInt( (newdata.length - 1) / splitNum);
      var chunks = [];
      for (var i = 0, charsLength = newdata.length; i < charsLength; i += chunkLength) {
        chunks.push(newdata.substring(i, i + chunkLength));
      }
      for(var i=2;i<=splitNum;i++) {        
        var glitchRand = Math.floor((Math.random()*100)+1);         
        if(optionVal == 4) {
        glitchRand = 1;
        }
        var char1Rand = Math.floor((Math.random()*chars.length)); 
        var char2Rand = Math.floor((Math.random()*chars.length)); 
        if (char2Rand == char1Rand) {
          char2Rand = "9";
        }
        if(glitchRand % 2 != 0) {        
          chunks[i] = chunks[i].replace(chars[char1Rand],chars[char2Rand]);      
          }     
      } 
      newdata = chunks.join('');
      var base64data = btoa(newdata); 
      glitched_img = new Image();
      glitched_img.src = 'data:image/jpeg;base64,' + base64data;
      glitched_img.onload = function() {
      outctx.drawImage(glitched_img, 0, 0); 
      
      }

    }



         break;  
    case "bumpingrect":
     
         var canvas = document.createElement('canvas'),
          con = canvas.getContext('2d'),
          ptrn = document.createElement('canvas'),
      
          ptrnctx = ptrn.getContext('2d'),
          cwidth = canvas.width = output.width= W,
          cheight = canvas.height =output.height =H,
          pat,
          play = true,
          Shape = function (x, y, width, height)
          {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.dx = false;
            this.dy = false;
          },
          shapes = new Array();
       
        for (var i = 0; i < params.rectNum; i++)
        {
          var x = Math.random() * 250,
            y = Math.random() * 250;
          if (params.rectSquare)
          {
            var width = Math.random() * (cwidth / 2);
            var height = width;
          }
          width = Math.random() * (cwidth);
          height = Math.random() * (cwidth);

          shapes.push(new Shape(x, y, width, height));
        }

              smartLoad(url,W,H,function(i,w,h){
           imgctx.drawImage(i,0,0,w,h);
          pat = ptrnctx.createPattern(imgcanvas, "repeat")
          animate();
           });  
         

        function animate()
        {
          if (params.rectClear)
          {
            con.clearRect(0, 0, cwidth, cheight);
            con.drawImage(imgcanvas, 0, 0, cwidth, cheight);
           
          }
          for (var i = 0; i < shapes.length; i++)
          {
            var tmp = shapes[i];

            if (!tmp.dx)
            {
              tmp.x += params.rectSpeed;
            }
            else
            {
              tmp.x -= params.rectSpeed;
            }
            if (!tmp.dy)
            {
              tmp.y += params.rectSpeed;
            }
            else
            {
              tmp.y -= params.rectSpeed;
            }
            con.globalCompositeOperation = params.blendMode;
            con.fillStyle = pat;
            con.fillRect(tmp.x, tmp.y, tmp.width, tmp.height);

            if (tmp.x < 0)
            {
              tmp.dx = false;
            }
            else if (tmp.x + tmp.width > cwidth)
            {
              tmp.dx = true;
            }

            if (tmp.y < 0)
            {
              tmp.dy = false;
            }
            else if (tmp.y + tmp.height > cheight)
            {
              tmp.dy = true;
            }
          }

          if (play)
          {
             outctx.drawImage(canvas,0,0,W,H);
            window.requestAnimationFrame(animate);
          }
        }
 //

         break; 
      case "kaleidoscope":
        var c = document.createElement("canvas");
        var Kctx = c.getContext("2d");
      
          output.height = c.height = H;
          output.width = c.width = W;
          smartLoad(url,W,H,function(i,w,h){
          Kctx.drawImage(i, 0, 0, w, h);
        
        var imageWidth = W;

       

        var frameCount = 0;
        var totalFrames = 10000;

        var map;

        var imageData;
        var translatedImage;
        var translatedImageData;

        var running = true;
        var reversing = false;
        startAnimation();
        createMap();
          function nextFrame()
  {
    if (!running)
    {
      return;
    }
    var i, j;
    for (var i = 0; i < W; i++)
    {
      for (var j = 0; j < W; j++)
      {
        var sourceY = (map[i][j][0] + frameCount) % H;
        var sourceX = map[i][j][1];
        translatedImageData[4 * i * W + 4 * j] = imageData[4 * sourceY * imageWidth + 4 * sourceX];
        translatedImageData[4 * i * W + 4 * j + 1] = imageData[4 * sourceY * imageWidth + 4 * sourceX + 1];
        translatedImageData[4 * i * W + 4 * j + 2] = imageData[4 * sourceY * imageWidth + 4 * sourceX + 2];
        translatedImageData[4 * i * W + 4 * j + 3] = imageData[4 * sourceY * imageWidth + 4 * sourceX + 3];
      }
    }
    Kctx.putImageData(translatedImage, 0, 0);

    outctx.drawImage(imgcanvas, 0, 0, W, H);

    outctx.drawImage(c, 0, 0, W, H);

    if (frameCount >= H * 3 / 4)
    {
      reversing = true;
    }
    if (frameCount <= 0)
    {
      reversing = false;
    }
    frameCount += (reversing ? -1 : 1);
    if (frameCount <= totalFrames && running)
    {
      setTimeout(nextFrame, 101);
    }
  }

  function createMap()
  {
    map = [];
    var i, j;
    var maxRadius = Math.sqrt(2) * W / 2;
    for (i = 0; i < W; i++)
    {
      map[i] = [];
      for (j = 0; j < W; j++)
      {
        var theta = Math.atan((W / 2 - i) / (W / 2 - j));
        if (j == W / 2)
        {
          theta = Math.PI / 2;
        }
        var radius = Math.sqrt((i - W / 2) * (i - W / 2) + (j - W / 2) * (j - W / 2));
        radius *= imageWidth
        radius /= maxRadius;
        theta += 2 * Math.PI;
        theta /= 2 * Math.PI;
        theta *= params.thetaAngle;
        theta %= params.thetaDiv;
        theta = Math.floor(15 - Math.abs(15 - theta));
        radius = Math.floor(radius);
        map[i][j] = [theta, radius];
      }
    }
    setTimeout(begin, 1000);
  }
         function begin()
  {

    i.height = H;
    i.width = W;
    Kctx.drawImage(output, 0, 0, W, H);

    imageData = Kctx.getImageData(0, 0, W, H)
      .data;
    translatedImage = Kctx.createImageData(W, H);
    translatedImageData = translatedImage.data;


    Kctx.fillStyle = "#000000";
    Kctx.fillRect(0, 0, W, H);

    setTimeout(nextFrame, 100);
  }
   function startAnimation()
  {
    running = true;
    begin();
  }
        
    });

         break;
    case "randomrect":
        smartLoad(url,W,H,function(i,w,h){
            imgctx.drawImage(i,0,0,w,h);
          var c=document.createElement('canvas');
          var ctx=c.getContext('2d');
          c.height=h;
          c.width=w;

           drwrdmrec();
           function drwrdmrec(){
            
            var maxrdm = params.rdmMaxRect;
            var pattern;
            if(params.rdmClearBeforeDraw){
            outctx.clearRect(0,0,W,H);}

            for(x=0;x<=maxrdm;x++){
          
               outctx.globalCompositeOperation=params.blendMode;
            
               outctx.drawImage(imgcanvas,randInt(-W*2,W*2),randInt(-H*2,H*2),randInt(-W*4,W*2),randInt(-H*4,H*4));
              
             

            

            }

           window.requestAnimationFrame(drwrdmrec);
           }
          });

         break;     
 
} ///THE SWITCH ENDS HERE



///// OK NOW LETS PRINT OUR USEFUL FUNCTIONS////


//1-SMART IMAGE LOADER
function smartLoad(url, W, H, callback)
{
  var img = new Image();
  img.crossOrigin = params.crossOrigin;

  img.onload = function ()
  {
    img.width = W;
    img.height = H;

    callback(img, W, H);

  }
  img.src = url;

}
//2-WE NEED LOTS RANDOM INTEGERS 
function randInt(a, b)
{
  return Math.random() * (b - a) + a;
}





///those functions dont need to be scoped, so I putted them here...
  function latglitch(ctx, canvas)
  { //glitch effect

    var latseed = randInt(-params.glichforce, params.glichforce);
    for (var i = 0; i < latseed; i++)
    {
      var x = Math.random() * W;
      var y = Math.random() * H;
      var SW = W - x;
      var SH = randInt(5, H / 4);
      ctx.drawImage(canvas, 0, y, SW, SH, x, y, SW, SH);
      ctx.drawImage(canvas, SW, y, x, SH, 0, y, x, SH);
    }

  }

  function glitchanim()
  {
    if (params.glitchclear)
    {
      outctx.clearRect(0, 0, W, H);
    }
    if (params.glitchdisplayimage)
    {
      outctx.drawImage(imgcanvas, 0, 0);
    }
    outctx.globalCompositeOperation = params.blendMode;
    latglitch(outctx, imgcanvas);



    window.requestAnimationFrame(glitchanim)
  }

  function pixelate()
  {

    var Img = new Image();

    Img.onload = function ()
    {
      Img.height = H;
      Img.width = W;
      var canv = document.createElement('canvas');
      canv.width = W;
      canv.height = H;
      var ctx = canv.getContext('2d');

      ctx.mozImageSmoothingEnabled = params.smooth;
      ctx.webkitImageSmoothingEnabled = params.smooth;
      ctx.imageSmoothingEnabled = params.smooth;
      outctx.mozImageSmoothingEnabled = params.smooth;
      outctx.webkitImageSmoothingEnabled = params.smooth;
      outctx.imageSmoothingEnabled = params.smooth;
      if (params.squared)
      {
        var x = ((Math.random() * params.pixelsize) / 100);
        var width = W * x,
          height = H * x;

      }
      var width = W * ((Math.random() * params.pixelsize) / 100),
        height = H * ((Math.random() * params.pixelsize) / 100);
      ctx.drawImage(Img, 0, 0, width, height);
      outctx.drawImage(canv, 0, 0, width, height, 0, 0, canv.width, canv.height);


    };
    Img.src = url;

    window.requestAnimationFrame(pixelate)
  }

    });

    return this;
  };

})(jQuery);





