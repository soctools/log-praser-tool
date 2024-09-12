const canvas = document.getElementById("starsCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const starsArray = [];
const numberOfStars = 150;

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 1;
        this.dy = Math.random() * 0.5 + 0.5; // Falling speed
        this.dx = Math.random() * 0.5 - 0.25; // Horizontal movement
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.fill();
    }

    update() {
        this.y += this.dy;
        this.x += this.dx;

        // If star goes out of screen, reset its position
        if (this.y > canvas.height) {
            this.y = -this.radius;
            this.x = Math.random() * canvas.width;
        }
        this.draw();
    }
}

// Create stars and push to array
for (let i = 0; i < numberOfStars; i++) {
    starsArray.push(new Star());
}

// Animate stars
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    starsArray.forEach(star => star.update());
    requestAnimationFrame(animate);
}

animate();
