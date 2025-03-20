export default {
    name: "SummaryAdmin",
    template: `
      <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
        <h2 class="mb-4 text-center">Summary (Admin)</h2>
        <div class="row">
          <div class="col-md-6 text-center">
            <h5>Subject wise top scores</h5>
            <canvas id="adminSubjectChart" width="400" height="300"></canvas>
          </div>
          <div class="col-md-6 text-center">
            <h5>Subject wise user attempts</h5>
            <canvas id="adminAttemptChart" width="400" height="300"></canvas>
          </div>
        </div>
        <div v-if="stats">
          <p class="mt-3">
            <strong>Global Average Score:</strong> {{ stats.avg_score_global }} <br/>
            <strong>Total Quizzes:</strong> {{ stats.quiz_count }} <br/>
            <strong>Total Users:</strong> {{ stats.user_count }}
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
        fetch("/api/summary/admin", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch admin summary: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          this.stats = data;
          this.buildSubjectChart(data.subject_top_scores);
          this.buildAttemptChart(data.subject_user_attempts);
        })
        .catch(err => {
          console.error("Error fetching admin summary:", err);
        });
      },
      buildSubjectChart(subjectScores) {
        const ctx = document.getElementById("adminSubjectChart");
        if (!ctx) return;
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: Object.keys(subjectScores),
            datasets: [{
              label: "Top Scores",
              data: Object.values(subjectScores),
              backgroundColor: "rgba(255, 99, 132, 0.6)"
            }]
          },
          options: { responsive: true }
        });
      },
      buildAttemptChart(subjectAttempts) {
        const ctx = document.getElementById("adminAttemptChart");
        if (!ctx) return;
        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: Object.keys(subjectAttempts),
            datasets: [{
              label: "Attempts",
              data: Object.values(subjectAttempts),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
            }]
          },
          options: { responsive: true }
        });
      }
    }
  };
  