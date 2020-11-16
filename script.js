// A page is an array of strokes
// A stroke is an object containing two properties (thickness and color) as well as a an array of points
// A point is a object with an x and a y property
let pages = [[], []];
let pageIndex = 1;
let currentStroke = {colour: 'black', thickness: 2, points: []};
let tool = 'pen';
let r = 0.01;
let touch = false;
let num = 0;

function drawPage(s, pageIndex) {
  pages[pageIndex].forEach(stroke => {
    s.stroke(stroke.colour);
    s.strokeWeight(stroke.thickness);
    s.beginShape();
    stroke.points.forEach(point => {
      s.curveVertex(point.x, point.y);
    });
    if (stroke == currentStroke){
      s.curveVertex(s.mouseX, s.mouseY);
      s.curveVertex(s.mouseX, s.mouseY);
    }
    s.endShape();
  });
}

function mouseDragged(s, pageIndex) {
  if (0 < s.mouseX  && s.mouseX < s.width && 0 < s.mouseY && s.mouseY < s.height) {
    if (tool == 'pen') {
      if (currentStroke.points.length > 0) {
        currentStroke.points.push({x: s.mouseX, y: s.mouseY});
      }
    } if (tool == 'erasor') {
      let mouse = {x: s.mouseX, y: s.mouseY}; // where the mouse is now
      let pmouse = {x: s.pmouseX, y: s.pmouseY}; // previous mouse position
  
      pages[pageIndex] = pages[pageIndex].filter(stroke => {
        // returns true or false
        // if it returns true, it will keep the stroke
        // if it return false, it will remove the stroke
        for (let i = 0; i < stroke.points.length-1; i++) {
          let p1 = stroke.points[i];
          let p2 = stroke.points[i+1];
          if (intersect(p1,p2,mouse,pmouse)){
            return false;
          }
        }

        for (let i = 0; i < stroke.points.length; i++) {
          let point = stroke.points[i];
          if (s.dist(point.x, point.y, s.mouseX, s.mouseY) < r * s.width) {
            return false;
          }
        }
        return true;
      });
    }
  }
}

function mousePressed(s, pageIndex) {
  if (0 < s.mouseX  && s.mouseX < s.width && 0 < s.mouseY && s.mouseY < s.height) { 
    if (tool == 'pen') {
      currentStroke.points.push({x: s.mouseX, y: s.mouseY});
      currentStroke.points.push({x: s.floor(s.mouseX), y: s.floor(s.mouseY)});
      pages[pageIndex].push(currentStroke);
    }
  }
}

function mouseReleased(s, pageIndex) {
  if (0 < s.mouseX  && s.mouseX < s.width && 0 < s.mouseY && s.mouseY < s.height) { 
    if (tool == 'pen') {
      currentStroke.points.push({x: s.mouseX, y: s.mouseY});
      currentStroke.points.push({x: s.mouseX, y: s.mouseY});
      currentStroke = {...currentStroke, points: []};
    }
  }
}

function nextPage() {
  // do we need to add a new page?
  // if so, add a new page which is empty
  // consider the length of the pages array
  // hint: at the start, the pages array has length 2
  // lenght or array a: a.length
  // you need to update the variables: pageIndex, leftPage, rightPage
  pageIndex += 1;
  if (pages.length <= pageIndex){ // this is true, but this is not the general case
    let newPage = [];
    pages.push(newPage);
  }
}

function previousPage() {
  if (pageIndex > 1){
    pageIndex -= 1; 
  }
 
}

function newColour(colourName) {
  currentStroke.colour = colourName;
}

function ccw(a,b,c){
  return (c.y-a.y) * (b.x-a.x) > (b.y-a.y)* (c.x-a.x);
}

function intersect(p1,p2,q1,q2){
  return ccw(p1,q1,q2) != ccw(p2,q1,q2) && ccw(p1,p2,q1) != ccw(p1,p2,q2);
}

function newTool(toolName) { // toolName = 'pen' or 'erasor'
  tool = toolName;
}


let divs = ['left-canvas', 'right-canvas'];
for (let div of divs) {
  let leftPage = () => pageIndex - 1;
  let rightPage = () => pageIndex;
  let currentPageIndex;
  if (div == 'left-canvas'){
    currentPageIndex = leftPage;
  } else {
    currentPageIndex = rightPage;
  }

  let p5Obj = new p5(s => {
    s.setup = function() {
      let r = 1.2941
      let side = Math.min(window.innerWidth / 2 - 50, (window.innerHeight - 100) / r);
      s.createCanvas(s.floor(side), s.floor(side * r));
      s.noFill();
      s.frameRate(20);
    }

    s.draw = function() {
      s.background(220);
      drawPage(s, currentPageIndex());
      //s.text(pages[currentPageIndex()].length, s.width / 2, s.height / 2);
      //s.text(num, 0, s.height / 2);
    }
    
    s.mouseDragged = function() {
      if (!touch) {
        mouseDragged(s, currentPageIndex());
      }
      return false;
    }

    s.touchMoved = function() {
      mouseDragged(s, currentPageIndex());
      return false;
    }

    s.mousePressed = function() {
      if (!touch) {
        mousePressed(s, currentPageIndex());
      }
    }

    s.touchStarted = function() {
      mousePressed(s, currentPageIndex());
      touch = true;
      num++;
    }

    s.mouseReleased = function() {
      if (!touch) {
        mouseReleased(s, currentPageIndex());
      }
    }

    s.touchEnded = function() {
      mouseReleased(s, currentPageIndex());
      touch = false;
    }

    s.windowResized = function() {
      let r = 1.2941
      let side = Math.min(window.innerWidth / 2 - 50, (window.innerHeight - 100) / r);
      s.resizeCanvas(s.floor(side), s.floor(side * r));
    }
  }, div);
}
  
  window.onload = () => {
  document.querySelector('#next-button').onclick = nextPage;
  document.querySelector('#previous-button').onclick = previousPage;

  let colourRadioButtons = ['black', 'red', 'blue'];
  for (let radioButton of colourRadioButtons) {
    document.querySelector(`#${radioButton}`).onclick = () => newColour(radioButton);
  }

  let toolRadioButtons = ['pen', 'erasor'];
  for (let radioButton of toolRadioButtons) {
    document.querySelector(`#${radioButton}`).onclick = () => newTool(radioButton);
  }
};