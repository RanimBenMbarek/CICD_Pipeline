const express = require('express');
const bodyParser = require('body-parser');
const client = require('prom-client');
const app = express();

// Create a registry for metrics
const register = new client.Registry();

// Register default metrics
client.collectDefaultMetrics({ register });

// Counter to track the total number of requests
const requestCounter = new client.Counter({
  name: 'node_request_operations_total',
  help: 'The total number of processed requests',
  labelNames: ['method', 'endpoint', 'status'], // Add labels for method, endpoint, and status
});
register.registerMetric(requestCounter);

// Histogram to track request duration
const requestDurationHistogram = new client.Histogram({
  name: 'node_request_duration_seconds',
  help: 'Histogram of request duration in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5], // Adjust buckets as needed
});
register.registerMetric(requestDurationHistogram);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  const start = new Date();

  // Simulate some processing time
  setTimeout(() => {
    const end = new Date() - start;

    // Increment request counter and observe duration
    requestCounter.inc({ method: req.method, endpoint: '/', status: res.statusCode });
    requestDurationHistogram.observe({ method: req.method, endpoint: '/' }, end / 1000);
  }, Math.random() * 1000); // Simulate random processing time up to 1 second

  // Send HTML response
  res.send(`
    <html>
      <head>
        <title>Sample App</title>
      </head>
      <body>
        <h1>Welcome to the Sample App</h1>
        <form action="/store-goal" method="POST">
          <div class="form-control">
            <label>Course Goal</label>
            <input type="text" name="goal">
          </div>
          <button>Set Course Goal</button>
        </form>
        <form action="/store-name" method="POST">
          <div class="form-control">
            <label>Your Name</label>
            <input type="text" name="name">
          </div>
          <button>Set Your Name</button>
        </form>
      </body>
    </html>
  `);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await register.metrics());
});



app.post('/store-goal', (req, res) => {
  const enteredGoal = req.body.goal;
  console.log(enteredGoal);
  userGoal = enteredGoal;
  res.redirect('/');
});

app.post('/store-name', (req, res) => {
  const enteredName = req.body.name;
  console.log(enteredName);
  userName = enteredName;
  res.redirect('/');
});
// Start server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

