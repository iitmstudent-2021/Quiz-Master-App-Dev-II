export default {
  name: "UserDashboard",
  template: `
    <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
      <h2 class="mb-4 text-center">User Dashboard</h2>

      <table class="table table-striped">
        <thead class="table-primary">
          <tr>
            <th style="width: 60px;">ID</th>
            <th style="width: 120px;">#Questions</th>
            <th style="width: 150px;">Date</th>
            <th style="width: 100px;">Duration</th>
            <th style="width: 120px;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quiz in quizzes" :key="quiz.id">
            <td>{{ quiz.id }}</td>
            <td>{{ quiz.questions.length }}</td>
            <td>{{ formatDate(quiz.quiz_date) }}</td>
            <td>{{ formatDuration(quiz.duration_time) }}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" @click="viewQuiz(quiz.id)">View</button>
              <button class="btn btn-sm btn-primary" @click="startQuiz(quiz.id)">Start</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- If no quizzes found -->
      <div v-if="quizzes.length === 0" class="text-muted text-center fs-5 mt-4">
        No upcoming quizzes found...
      </div>
    </div>
  `,

  data() {
    return {
      quizzes: [],
      authToken: localStorage.getItem("auth_token") || null
    };
  },

  mounted() {
    this.loadQuizzes();
  },

  methods: {
    // Fetch quizzes from API
    loadQuizzes() {
      if (!this.authToken) {
        console.error("No authentication token found. Redirecting to login.");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";  // Redirect to login
        return;
      }

      fetch("/api/quizzes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": this.authToken
        }
      })
      .then((res) => {
        if (res.status === 403) {
          throw new Error("Forbidden: You do not have permission to view quizzes.");
        }
        if (!res.ok) {
          throw new Error(`Error fetching quizzes: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        this.quizzes = data || [];
      })
      .catch((err) => {
        console.error("Error loading quizzes:", err);
        alert(err.message);
      });
    },

    // Navigate to quiz details page
    viewQuiz(quizId) {
      this.$router.push({ name: "view-quiz", params: { quizId } });
    },

    // Navigate to attempt quiz page
    startQuiz(quizId) {
      this.$router.push({ name: "attempt-quiz", params: { quizId } });
    },

    // Format date to display only YYYY-MM-DD
    formatDate(dateString) {
      if (!dateString) return "N/A";
      return new Date(dateString).toISOString().split("T")[0];
    },

    // Format duration if available
    formatDuration(durationStr) {
      return durationStr || "N/A";
    }
  }
};
