export default {
    name: "UserScores",
    template: `
      <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
        <h2 class="mb-4 text-center">Quiz Scores</h2>
  
        <table class="table table-striped">
          <thead class="table-primary">
            <tr>
              <th style="width: 60px;">ID</th>
              <th style="width: 120px;">#Questions</th>
              <th style="width: 150px;">Date</th>
              <th style="width: 100px;">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in combinedScores" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.questionsCount }}</td>
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ item.userScore }}</td>
            </tr>
          </tbody>
        </table>
  
        <!-- If no scores found -->
        <div v-if="combinedScores.length === 0" class="text-muted text-center fs-5 mt-4">
          No scores found...
        </div>
      </div>
    `,
  
    data() {
      return {
        scores: [],   // Stores data from /api/scores
        quizzes: []   // Stores data from /api/quizzes
      };
    },
  
    mounted() {
      this.loadScores();
      this.loadQuizzes();
    },
  
    computed: {
      /**
       * Combines each Score with its Quiz info (like #questions).
       */
      combinedScores() {
        return this.scores.map(sc => {
          const quiz = this.quizzes.find(q => q.id === sc.quiz_id);
          return {
            id: sc.id,
            quizId: sc.quiz_id,
            date: sc.time_stamp_of_attempt,     // The date/time the user attempted
            userScore: sc.total_score,
            questionsCount: quiz
              ? quiz.questions.length           // #questions from the embedded array
              : "N/A"
          };
        });
      }
    },
  
    methods: {
      // Load user scores from API
      loadScores() {
        fetch("/api/scores", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Error fetching scores: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          this.scores = data || [];
        })
        .catch(err => console.error("Error loading scores:", err));
      },
  
      // Load quizzes from API
      loadQuizzes() {
        fetch("/api/quizzes", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Error fetching quizzes: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          this.quizzes = data || [];
        })
        .catch(err => console.error("Error loading quizzes:", err));
      },
  
      // Format date to display only YYYY-MM-DD
      formatDate(dateString) {
        if (!dateString) return "N/A";
        return new Date(dateString).toISOString().split("T")[0];
      }
    }
  };
  