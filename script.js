class Rectangle {
  constructor(l, t, w, h) {
    // left, top, width, height

    this.l = this.ol = l; // left and old left
    this.r = this.or = l + w; // right and old right
    this.t = this.ot = t; // top and old top
    this.b = this.ob = t + h; // bottom and old bottom
    this.w = w; // width
    this.h = h; // height
    this.vx = this.vy = 0; // velocity x and y
  }
}
