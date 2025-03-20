export default {
  name: "SummaryUser",
  template: `
    <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
      <h2 class="mb-4 text-center">Summary (User)</h2>
      <div class="row">
        <div class="col-md-6 text-center">
          <h5>Subject wise no. of quizzes</h5>
          <canvas id="subjectChart" width="400" height="300"></canvas>
        </div>
        <div class="col-md-6 text-center">
          <h5>Month wise no. of quizzes attempted</h5>
          <canvas id="monthChart" width="400" height="300"></canvas>
        </div>
      </div>
      <div v-if="stats">
        <p class="mt-3">
          <strong>Average Score:</strong> {{ stats.avg_score_user }}<br />
          <strong>Total Attempts:</strong> {{ stats.attempts }}
        </p>
      </div>
      <div v-else class="text-muted text-center mt-4">
        Loading summary...
      </div>
    </div>
  `,
  data() {
    return {
      stats: null
    }
  },
  mounted() {
    this.fetchSummary();
  },
  methods: {
    fetchSummary() {
      fetch("/api/summary/user", {   // Note: use /api/summary/user here
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch user summary: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        this.stats = data;
        this.buildSubjectChart(data.subject_wise_attempts);
        this.buildMonthChart(data.month_wise_attempts);
      })
      .catch(err => {
        console.error("Error fetching user summary:", err);
      });
    },
    buildSubjectChart(subjectData) {
      const ctx = document.getElementById("subjectChart");
      if (!ctx) return;
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(subjectData),
          datasets: [{
            label: "Quizzes Attempted",
            data: Object.values(subjectData),
            backgroundColor: "rgba(54, 162, 235, 0.6)"
          }]
        },
        options: { responsive: true }
      });
    },
    buildMonthChart(monthData) {
      const ctx = document.getElementById("monthChart");
      if (!ctx) return;
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(monthData),
          datasets: [{
            label: "Month-wise Attempts",
            data: Object.values(monthData),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
          }]
        },
        options: { responsive: true }
      });
    }
  }
};
