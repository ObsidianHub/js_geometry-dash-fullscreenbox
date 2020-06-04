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

  /* We can do calculations when we are setting the current position because the current position is new. Avoiding rounding errors isn't as important here. It is important when saving the current position to the old position, however, because the values must not change for the sake of accuracy. */
  setBottom(b) {
    this.b = b;
    this.t = b - this.h;
  }
  setLeft(l) {
    this.l = l;
    this.r = l + this.w;
  }
  setRight(r) {
    this.r = r;
    this.l = r - this.w;
  }
  setTop(t) {
    this.t = t;
    this.b = t + this.h;
  }
}

class Platform extends Rectangle {
  constructor(l, t, w, h) {
    super(l, t, w, h);

    this.d = Math.random() * Math.PI * 2; // initial movement direction
    this.rotation = Math.random() * Math.PI * 2; // rotation for sine wave movement

    this.frozen = false;
  }

  collideBoundaries(l, r, t, b) {
    if (this.l < l) {
      this.d = Math.atan2(Math.sin(this.d), Math.cos(this.d) * -1);
      this.vx *= -1;
      this.setLeft(l);
    } else if (this.r > r) {
      this.d = Math.atan2(Math.sin(this.d), Math.cos(this.d) * -1);
      this.vx *= -1;
      this.setRight(r);
    }

    if (this.t <= t) {
      this.d = Math.atan2(Math.sin(this.d) * -1, Math.cos(this.d));
      this.vy *= -1;
      this.setTop(t);
    } else if (this.b > b) {
      this.d = Math.atan2(Math.sin(this.d) * -1, Math.cos(this.d));
      this.vy *= -1;
      this.setBottom(b);
    }
  }

  update() {
    if (!this.frozen) {
      this.vx = Math.cos(this.d); // move in direction
      this.vy = Math.sin(this.d);

      this.rotation += 0.05;
      this.vy += Math.sin(this.rotation); // sine wave motion
    }

    this.ob = this.b; // update the old positions to the current positions
    this.ol = this.l;
    this.or = this.r;
    this.ot = this.t;

    this.l += this.vx; // update the current positions to the new positions
    this.t += this.vy;
    this.r = this.l + this.w;
    this.b = this.t + this.h;
  }
}

class Player extends Rectangle {
  constructor(l, t, w, h) {
    super(l, t, w, h);

    this.jumping = true;
  }

  collideRectangle(rectangle) {
    if (
      this.b < rectangle.t ||
      this.t > rectangle.b ||
      this.l > rectangle.r ||
      this.r < rectangle.l
    )
      return;

    /* You can only collide with one side at a time, so "else if" is just fine. You don't need to separate the checks for x and y. Only one check can be true, so only one needs to be done. Once it's found, the other's don't need to be done. */
    if (this.b >= rectangle.t && this.ob < rectangle.ot) {
      this.setBottom(rectangle.t - 0.1);
      this.vy = rectangle.vy; // the platform moves the player with it after collision...
      this.jumping = false;
    } else if (this.t <= rectangle.b && this.ot > rectangle.ob) {
      this.setTop(rectangle.b + 0.1);
      this.vy = rectangle.vy; // ... regardless of what side the player collides with
    } else if (this.r >= rectangle.l && this.or < rectangle.ol) {
      this.setRight(rectangle.l - 0.1);
      this.vx = rectangle.vx;
    } else if (this.l <= rectangle.r && this.ol > rectangle.or) {
      this.setLeft(rectangle.r + 0.1);
      this.vx = rectangle.vx;
    }
  }

  update(g, f) {
    // gravity and friction

    this.vy += g; // you can make updates to velocity before or after the position update

    this.vx *= f; // I choose before so there isn't one frame of inactivity on the first cycle
    this.vy *= f;

    this.ob = this.b; // update the old positions to the current positions
    this.ol = this.l;
    this.or = this.r;
    this.ot = this.t;

    this.l += this.vx; // update the current positions to the new positions
    this.t += this.vy;
    this.r = this.l + this.w;
    this.b = this.t + this.h;
  }
}

var context = document.querySelector("canvas").getContext("2d");

var gravity = 1;
var friction = 0.9;

var player = new Player(context.canvas.width * 0.25, 0, 32, 32, "#0080f0");
var platforms = [];

var pointer = { x: player.l, down: false };

function getFloor() {
  return context.canvas.height * 0.9;
}

function collideFloor(player) {
  var floor = getFloor();

  if (player.b > floor) {
    player.setBottom(floor);
    player.vy = 0;
    player.jumping = false;
  }
}

function loop(time_stamp) {
  update();
  render();

  window.requestAnimationFrame(loop);
}

function render() {
  context.fillStyle = "#f0d8c0";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  context.fillStyle = "#202830";
  context.fillRect(0, getFloor(), context.canvas.width, 8);

  context.fillStyle = "#0080f0";
  context.fillRect(player.l, player.t, player.w, player.h);

  context.font = "20px Arial";

  for (let index = platforms.length - 1; index > -1; --index) {
    let platform = platforms[index];

    context.fillStyle = "#f08000";
    context.fillRect(platform.l, platform.t, platform.w, platform.h);
  }
}

function update() {
  player.vx += (pointer.x - player.l - player.w * 0.5) * 0.01;

  if (pointer.down && !player.jumping) {
    player.jumping = true;
    player.vy -= player.h + 1;
    pointer.down = false;
  }

  player.update(gravity, friction);

  collideFloor(player);

  for (let index = platforms.length - 1; index > -1; --index) {
    let platform = platforms[index];

    platform.update();

    platform.collideBoundaries(0, context.canvas.width, 0, getFloor());

    player.collideRectangle(platform);
  }
}

//// EVENT LISTENERS ////
function mouseDownUp(event) {
  event.preventDefault();

  pointer.down = event.type == "mousedown" ? true : false;
}

function mouseMove(event) {
  event.preventDefault();

  pointer.x = event.clientX - context.canvas.getBoundingClientRect().left;
}

function touchEndStart(event) {
  event.preventDefault();

  pointer.down = event.type == "touchstart" ? true : false;

  if (pointer.down)
    pointer.x =
      event.targetTouches[0].clientX -
      context.canvas.getBoundingClientRect().left;
}

function touchMove(event) {
  event.preventDefault();

  pointer.x =
    event.targetTouches[0].clientX -
    context.canvas.getBoundingClientRect().left;
}

function resize(event) {
  context.canvas.height = document.documentElement.clientHeight - 32;
  context.canvas.width = document.documentElement.clientWidth - 32;
}

//// INITIALIZE ////
resize();

// consolidate event listeners that use the same event handler (probably overkill)
["mousedown", "mouseup"].map((type) =>
  window.addEventListener(type, mouseDownUp)
);
["touchend", "touchstart"].map((type) =>
  window.addEventListener(type, touchEndStart)
);

window.addEventListener("mousemove", mouseMove);
window.addEventListener("touchmove", touchMove);
window.addEventListener("resize", resize);
window.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

["click", "touchstart"].map((type) =>
  document.querySelector("a").addEventListener(type, (event) => {
    event.preventDefault();

    for (let index = platforms.length - 1; index > -1; --index) {
      let platform = platforms[index];

      platform.frozen = !platform.frozen;

      if (platform.frozen) platform.vx = platform.vy = 0;
    }
  })
);
