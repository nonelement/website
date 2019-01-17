import * as React from "react";
import p5 from "p5";

const PARENT_ID = "background";

interface BarProps {
  name: string,
  x: number, y: number,
  initialX: number,
  nextX: number,
  width: number,
  strokeWeight: number,
  fillColor: Array<number>,
  nextFillColor: Array<number>,
  strokeColor: Array<number>,
  nextStrokecolor: Array<number>,
  ease: number,
  direction: number,
  update?: (hypotenuse: number) => void,
};

class Bar implements BarProps {
  constructor(name, x, y, nextX, width, strokeWeight, ease, direction) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.nextX = nextX;
    this.width = width;
    this.strokeWeight = strokeWeight;
    this.ease = ease;
    this.direction = direction;
  }

  updateColors(initialFill, nextFill, initialStroke, nextStroke) {
    this.currentFillColor = initialFill.slice();
    this.initialFillColor = initialFill;
    this.nextFillColor = nextFill;

    this.currentStrokeColor = initialStroke.slice();
    this.initialStrokeColor = initialStroke;
    this.nextStrokeColor = nextStroke;
    return this;
  }

  addUpdate(updateFn: (hypotenuse: number) => void) {
    this.update = updateFn.bind(this);
    return this;
  }
}

export class Anima extends React.Component {

  componentDidMount() {
    let body = (p: p5) => {
      let canvas;
      let height, width;
      let mark = 0;

      let aspectRatio = 0;
      let deg = 45;
      let hypotenuse;
      let offset;

      let bars: Array<number> = [];

      let drawBar = (bar: Bar) => {
        p.push();
        p.noStroke();
        p.fill(...bar.currentStrokeColor);
        p.rect(bar.x + offset, bar.y, bar.width + 20, 10000);
        p.fill(...bar.currentFillColor);

        // calc values
        let dx, dc;
        if (bar.direction == 1) {
          dx = bar.nextX - bar.x;
          bar.x += dx * bar.ease;
          dc = bar.nextFillColor[0] - bar.currentFillColor[0];
          bar.currentFillColor[0] += dc * bar.ease;
          dc = bar.nextStrokeColor[0] - bar.currentStrokeColor[0];
          bar.currentStrokeColor[0] += dc * bar.ease;
        } else if(bar.direction == -1) {
          dx = bar.x - bar.initialX;
          bar.x -= dx * bar.ease;
          dc = bar.currentFillColor[0] - bar.initialFillColor[0];
          bar.currentFillColor[0] -= dc * bar.ease;
          dc = bar.currentStrokeColor[0] - bar.initialStrokeColor[0];
          bar.currentStrokeColor[0] -= dc * bar.ease;
        }

        if (Math.abs(dx) < 0.1) {
          bar.direction = bar.direction * -1;
        }

        p.rect(bar.x + offset, bar.y, bar.width, 10000);
        p.pop();
      }

      p.windowResized = () => {
        let currentHeight = window.innerHeight,
            currentWidth = window.innerWidth;
        window.canv = canvas;
        if (currentHeight != height || currentWidth != width) {
          height = currentHeight;
          width = currentWidth;
          p.resizeCanvas(width, height);
          canvas.style = `width: ${width}px; height: ${height}px`;

          aspectRatio = width / height;
          hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
          offset = 0 - hypotenuse / 2;
          bars.forEach(b => !!b.update && b.update(hypotenuse));
        }
      };

      p.setup = () => {
        mark = p.frameCount;
        width = window.innerWidth, height = window.innerHeight;
        hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        offset = 0 - hypotenuse / 2;
        let renderer = p.createCanvas(width, height);
        canvas = document.getElementById(renderer.canvas.id);

        // env config
        aspectRatio = width / height;
        p.angleMode(p.DEGREES);
        p.rectMode(p.CENTER);

        // state
        bars = [
          new Bar("1", 30, 0, 60, 20, 8, 0.03, 1)
            .updateColors(
              [115, 15, 152],
              [70, 15, 152],
              [165, 20, 223],
              [125, 20, 223]
            ),
          new Bar("2", 80, 0, 110, 30, 8, 0.031, 1)
            .updateColors(
              [115, 15, 152],
              [70, 15, 152],
              [165, 20, 223],
              [125, 20, 223]
            ),
          new Bar("3", 140, 0, 170, 40, 8, 0.032, 1)
            .updateColors(
              [115, 15, 152],
              [70, 15, 152],
              [165, 20, 223],
              [125, 20, 223]
            ),
          new Bar(
            "4",
            hypotenuse - 80, 0,
            hypotenuse - 110,
            30, 8, 0.032, 1)
            .updateColors(
              [115, 15, 152],
              [70, 15, 152],
              [165, 20, 223],
              [125, 20, 223]
            ).addUpdate(function(h) {
              this.x = h - 80;
              this.initialX = h - 80;
              this.nextX = h - 110;
            }),
        new Bar(
            "5",
            hypotenuse - 30, 0,
            hypotenuse - 60,
            20, 8, 0.032, 1)
            .updateColors(
              [115, 15, 152],
              [70, 15, 152],
              [165, 20, 223],
              [125, 20, 223]
            ).addUpdate(function(h) {
              this.x = h - 30;
              this.initialX = h - 30;
              this.nextX = h - 60;
            }),
        ];
      }

      p.draw = () => {
        p.background("#222");
        p.fill(200);
        p.translate(width/2, height/2);
        // atan(tan t = o/a) = deg offset
        p.rotate(p.atan((height/2)/(width/2)));
        p.stroke("white");
        // p.line(-width, 0, width, 0);
        bars.forEach(b => drawBar(b));
      }
    }
    let instance = new p5(body, PARENT_ID);
  }

  render() {
    return (
      <div className="background full" id={PARENT_ID}></div>
    );
  }
}
