import { GameSettings } from '../types';

export function generatePythonSnakeCode(settings: GameSettings): string {
  const speedDelay = (settings.initialSpeed / 1000).toFixed(2);
  const wallMsg = settings.solidWalls
    ? "# Border Collisions (Reset Game)"
    : "# Pass-Through Screen Boundaries";

  return `# =========================================================
#  SNAKE GAME USING PYTHON TURTLE MODULE
#  Generated from Python Turtle Snake Game App
# =========================================================
import turtle
import time
import random

delay = ${speedDelay}  # Game loop delay speed in seconds

# Scores
score = 0
high_score = 0

# Set up the window screen
wn = turtle.Screen()
wn.title("Python Turtle Snake Game")
wn.bgcolor("${settings.backgroundColor}")
wn.setup(width=${settings.screenSize}, height=${settings.screenSize})
wn.tracer(0)  # Turns off screen updates for smooth rendering

# Snake head
head = turtle.Turtle()
head.speed(0)
head.shape("square")
head.color("${settings.headColor}")
head.penup()
head.goto(0, 0)
head.direction = "stop"

# Snake Food
food = turtle.Turtle()
food.speed(0)
food.shape("${settings.foodShape}")
food.color("${settings.foodColor}")
food.penup()
food.goto(0, 100)

segments = []

# Scoreboard Pen
pen = turtle.Turtle()
pen.speed(0)
pen.shape("square")
pen.color("white")
pen.penup()
pen.hideturtle()
pen.goto(0, ${settings.screenSize / 2 - 40})
pen.write("Score: 0  High Score: 0", align="center", font=("Courier", 24, "bold"))

# Movement Functions
def go_up():
    if head.direction != "down":
        head.direction = "up"

def go_down():
    if head.direction != "up":
        head.direction = "down"

def go_left():
    if head.direction != "right":
        head.direction = "left"

def go_right():
    if head.direction != "left":
        head.direction = "right"

def move():
    if head.direction == "up":
        y = head.ycor()
        head.sety(y + ${settings.gridSize})

    if head.direction == "down":
        y = head.ycor()
        head.sety(y - ${settings.gridSize})

    if head.direction == "left":
        x = head.xcor()
        head.setx(x - ${settings.gridSize})

    if head.direction == "right":
        x = head.xcor()
        head.setx(x + ${settings.gridSize})

# Keyboard Bindings
wn.listen()
wn.onkeypress(go_up, "Up")
wn.onkeypress(go_down, "Down")
wn.onkeypress(go_left, "Left")
wn.onkeypress(go_right, "Right")

wn.onkeypress(go_up, "w")
wn.onkeypress(go_down, "s")
wn.onkeypress(go_left, "a")
wn.onkeypress(go_right, "d")

def reset_game():
    global score, delay
    time.sleep(0.5)
    head.goto(0, 0)
    head.direction = "stop"

    # Hide segments
    for segment in segments:
        segment.goto(1000, 1000)
    segments.clear()

    score = 0
    delay = ${speedDelay}
    pen.clear()
    pen.write(f"Score: {score}  High Score: {high_score}", align="center", font=("Courier", 24, "bold"))

# Main Game Loop
while True:
    wn.update()

    ${wallMsg}
    limit = ${settings.screenSize / 2 - 10}
    if ${settings.solidWalls}:
        if head.xcor() > limit or head.xcor() < -limit or head.ycor() > limit or head.ycor() < -limit:
            reset_game()
    else:
        # Wrap around screen edges
        if head.xcor() > limit:
            head.setx(-limit)
        elif head.xcor() < -limit:
            head.setx(limit)
        if head.ycor() > limit:
            head.sety(-limit)
        elif head.ycor() < -limit:
            head.sety(limit)

    # Check for collision with food
    if head.distance(food) < 20:
        # Move food to random spot on grid
        x = random.randint(-${Math.floor((settings.screenSize / 2 - 30) / settings.gridSize)}, ${Math.floor((settings.screenSize / 2 - 30) / settings.gridSize)}) * ${settings.gridSize}
        y = random.randint(-${Math.floor((settings.screenSize / 2 - 30) / settings.gridSize)}, ${Math.floor((settings.screenSize / 2 - 30) / settings.gridSize)}) * ${settings.gridSize}
        food.goto(x, y)

        # Add a body segment
        new_segment = turtle.Turtle()
        new_segment.speed(0)
        new_segment.shape("square")
        new_segment.color("${settings.bodyColor}")
        new_segment.penup()
        segments.append(new_segment)

        # Increase Score
        score += 10
        if score > high_score:
            high_score = score

        pen.clear()
        pen.write(f"Score: {score}  High Score: {high_score}", align="center", font=("Courier", 24, "bold"))

    # Move body segments in reverse order
    for index in range(len(segments) - 1, 0, -1):
        x = segments[index - 1].xcor()
        y = segments[index - 1].ycor()
        segments[index].goto(x, y)

    # Move segment 0 to head position
    if len(segments) > 0:
        x = head.xcor()
        y = head.ycor()
        segments[0].goto(x, y)

    move()

    # Check for head collision with body segments
    for segment in segments:
        if segment.distance(head) < 10:
            reset_game()

    time.sleep(delay)

wn.mainloop()
`;
}
