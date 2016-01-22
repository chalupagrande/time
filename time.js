
  //global variables
  var hour,min,second,counter; //setInterval ID to be cleared upon new dialation
  var clock = document.getElementById('clock')
  var slider = document.getElementById('percent')
  var diaVal = document.getElementById('diaVal')
  var mph = document.getElementById('mph')
  slider.value = 0
  dialation = 1
  var onEarth = true

  //constants
  var c  = 670616629 //speed of light in mph
  var em = 240    //distance between earth and moon in X1000 miles
  var ce = 24901     //circumference of earth in miles

  //set global variables
  grabLocalTime()

  //start clock
  writeTime(formatTime())
  runClock(hour,min,second,1)

  //SVG
  var canvas= d3.select('#canvas').attr({
    'background-color':'black',
    width: '100%',
    height:'250px'
  })
  var w = canvas.node().getBoundingClientRect().width
  var h = canvas.node().getBoundingClientRect().height

  var dataset = new Array(300).fill(1).map(function(e,i){return i})
  canvas.append('g').attr('class','stars').selectAll('circle').data(dataset).enter().append('circle').each(function(){
    d3.select(this).attr({
      r:1,
      fill:'gray',
      cx: Math.random()*100+'%',
      cy: Math.random()*100+'%'
    })
  })
  canvas.select('#moon').attr({x:w-30})

  //scales
  var xDistance = d3.scale.linear().domain([0, 240]).range([70,w-30])
  var xPercent = d3.scale.linear().domain([0,100]).range([w*0.03,w-w*0.03])
  var multiplier = 240000/(xDistance(240)-xDistance(0))

  //axis
  var xDistanceAxis = d3.svg.axis()
  var xPercentAxis = d3.svg.axis()

  xPercentAxis.scale(xPercent).orient('top')
  canvas.append('g').attr({
    class:'perc',
    fill: 'white',
    transform: 'translate( 0,'+h+')'
  }).call(xPercentAxis)

  xDistanceAxis.scale(xDistance).orient('bottom')
  canvas.append('g').attr({
    'class':'dist',
    fill:'white'
  }).call(xDistanceAxis)

  //animate the spaceship
  var position = [0]
  var ship = canvas.append('circle')
  ship.data(position).each(function(d,i){
    d3.select(this).attr({
      id:'ship',
      fill:'red',
      cy:'50%',
      cx: xDistance(d),
      r:5,
    })
  })

  //EVENT LISTENERS
  slider.addEventListener('change',function(){
    clearInterval(counter)
    dialation = calculateDialation(slider.value)
    runClock()
    updateStats()
    moveShip(slider.value)
  })

  function moveShip(speed, t){
    var s = speed*0.01*c

    var distanceFromEarth = (ship.attr('cx')-xDistance(0))*multiplier
    var d = onEarth ? 240000 - distanceFromEarth : distanceFromEarth
    var time = (d/s)*60*60*946
    if(onEarth){
      t = ship.transition().duration(time).ease('linear').attr({
        cx:xDistance(240)
      })
    }else{
      t = ship.transition().duration(time).ease('linear').attr({
        cx:xDistance(0)
      })
    }
    t.each('end',function(){
      onEarth = !onEarth
      moveShip(speed);
    })

  }

  /* CLOCK HELPERS
  ~~~~~~~~~~~~~~~~~~*/
  function grabLocalTime(){
    var now = new Date()
    hour = now.getHours()
    minute = now.getMinutes()
    second = now.getSeconds()
  }
  function calculateDialation(value){
    if(value == 0) return 1
    if(value == 100) return 1000000000000000000000 //time stops
    return 1/Math.sqrt(1-Math.pow(c*(value*0.01),2)/Math.pow(c,2))
  }
  function writeTime(time){
    clock.innerHTML = time
  }
  function formatTime(){
    var s = second
    var m = minute
    var h = hour > 12 ? hour%12 : hour
    if(s < 10) s = "0"+s;
    if(m < 10) m = "0"+m
    return h+":"+m+":"+s
  }
  function calcTime(i){
    second+=1
    if(second > 59){
      second = 0
      minute+= 1
    }
    if(minute > 59){
      minute = 0
      hour+=1
    }
    if(hour > 12){
      hour %= 12
    }
  }
  function runClock(){
    counter = setInterval(function(){
       calcTime()
       writeTime(formatTime())
    },995*dialation) //994 because it takes ~5ms for the scripts to run.
  }
  function updateStats(){
    perc.innerHTML = slider.value
    var d = Math.round(dialation * 100000) / 100000
    if(slider.value=="100"){d = 'time stops'}
    diaVal.innerHTML = d
    mph.innerHTML = Math.round(c*slider.value*0.01)
  }